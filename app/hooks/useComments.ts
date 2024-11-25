import { useState, useEffect } from "react";
import { getDatabase } from "../lib/database";
import type { Comment, UseCommentsReturn } from "../types/comment";
import type { RxCollection } from "rxdb";

export const useComments = (): UseCommentsReturn => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [collection, setCollection] = useState<RxCollection<Comment> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const db = await getDatabase();
      setCollection(db.comments);
      setIsLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (!collection) return;

    const sub = collection.find().$.subscribe((docs) => {
      const commentMap = new Map<string, Comment>(
        docs.map((doc) => {
          const comment: Comment = {
            ...doc.toJSON(),
            replies: [],
          };
          return [comment.id, comment];
        })
      );

      const rootComments = Array.from(commentMap.values()).reduce<Comment[]>(
        (acc, comment) => {
          if (comment.parentId) {
            const parent = commentMap.get(comment.parentId);
            if (parent) {
              if (!parent.replies) parent.replies = [];
              parent.replies.push(comment);
            }
          } else {
            acc.push(comment);
          }
          return acc;
        },
        []
      );

      const sortRecursively = (items: Comment[]): Comment[] => {
        items.sort((a, b) => a.createdAt - b.createdAt);
        items.forEach(
          (item) => item.replies?.length && sortRecursively(item.replies)
        );
        return items;
      };

      setComments(sortRecursively(rootComments));
    });

    return () => sub.unsubscribe();
  }, [collection]);

  const addComment = async (
    content: string,
    parentId: string | null = null
  ) => {
    if (!collection) return;
    await collection.insert({
      id: `comment_${Date.now()}`,
      content,
      parentId,
      createdAt: Date.now(),
    });
  };

  const removeComment = async (commentId: string) => {
    if (!collection) return;

    const getAllReplyIds = async (parentId: string): Promise<string[]> => {
      const replies = await collection.find({ selector: { parentId } }).exec();
      const childIds = await Promise.all(
        replies.map((r) => getAllReplyIds(r.id))
      );
      return [...replies.map((r) => r.id), ...childIds.flat()];
    };

    const idsToRemove = [commentId, ...(await getAllReplyIds(commentId))];
    await collection
      .find({
        selector: { id: { $in: idsToRemove } },
      })
      .remove();
  };

  const clearComments = async (): Promise<void> => {
    if (!collection) return;
    await collection.find().remove();
  };

  return { comments, addComment, removeComment, clearComments, isLoading };
};
