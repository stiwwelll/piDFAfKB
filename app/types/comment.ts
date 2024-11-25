import type { RxCollection } from "rxdb";

export interface Comment {
  id: string;
  content: string;
  parentId: string | null;
  createdAt: number;
  replies?: Comment[];
}

export interface RxDBComment {
  id: string;
  content: string;
  parentId: string | null;
  createdAt: number;
  toJSON: () => Comment;
}

export interface CommentProps {
  comment: Comment;
  onReply: (commentId: string) => void;
  removeComment: (commentId: string) => void;
}

export interface UseCommentsReturn {
  comments: Comment[];
  addComment: (content: string, parentId?: string | null) => Promise<void>;
  clearComments: () => Promise<void>;
  removeComment: (commentId: string) => Promise<void>;
  isLoading: boolean;
}

export interface DatabaseCollections {
  comments: RxCollection<Comment>;
}
