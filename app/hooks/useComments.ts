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
    }
    init();
  }, []);

  useEffect(() => {
    if (!collection) return;

    const sub = collection.find().$.subscribe((docs) => {
      const commentMap = new Map<string, Comment>();

      docs.forEach((doc) => {
        const commentData = doc.toJSON();
        commentMap.set(commentData.id, {
          ...commentData,
          replies: [],
        });
      });

      const rootComments: Comment[] = [];

      commentMap.forEach((comment) => {
        let parentComment = null;
        !comment.parentId
          ? rootComments.push(comment)
          : (parentComment = commentMap.get(comment.parentId));
        parentComment && parentComment.replies?.push(comment);
      });

      const sortComments = (commentsToSort: Comment[]) => {
        commentsToSort.sort((a, b) => a.createdAt - b.createdAt);
        commentsToSort.forEach((comment) => {
          if (comment.replies && comment.replies.length > 0) {
            sortComments(comment.replies);
          }
        });
        return commentsToSort;
      };

      const sortedComments = sortComments(rootComments);
      setComments(sortedComments);
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

      try {
        const getAllReplyIds = async (parentId: string): Promise<string[]> => {
          const replies = await collection
            .find({
              selector: {
                parentId,
              },
            })
            .exec();

          const replyIds = replies.map((reply) => reply.id);

          const nestedReplyIds = await Promise.all(
            replyIds.map((replyId) => getAllReplyIds(replyId))
          );

          return [...replyIds, ...nestedReplyIds.flat()];
        };

        const replyIds = await getAllReplyIds(commentId);

        const idsToRemove = [commentId, ...replyIds];

        await collection
          .find({
            selector: {
              id: {
                $in: idsToRemove,
              },
            },
          })
          .remove();
      } catch (error) {
        console.error("Error removing comment:", error);
        throw error;
      }
    };


  const clearComments = async () => {
    if (!collection) return;
    await collection.find().remove();
  };

  return { comments, addComment, removeComment, clearComments, isLoading };
};
