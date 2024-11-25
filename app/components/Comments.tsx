"use client";

import { useState } from "react";
import { useComments } from "../hooks/useComments";
import type { Comment, CommentProps } from "../types/comment";

const CommentComponent = ({
  comment,
  onReply,
  removeComment,
}: CommentProps) => {
  return (
    <div className="mb-2">
      <article className="p-6 text-base bg-white rounded-lg dark:bg-gray-900 border-2">
        <footer className="flex flex-col">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <time
              dateTime={new Date(comment.createdAt).toLocaleString()}
              title={new Date(comment.createdAt).toLocaleString()}
            >
              {new Date(comment.createdAt).toLocaleString()}
            </time>
          </p>
          <p className="text-gray-500 dark:text-gray-400">{comment.content}</p>
          <div className="flex gap-4 mt-6">
            <button
              type="button"
              className="flex items-center text-sm text-gray-500 hover:underline dark:text-gray-400 font-medium"
              onClick={() => onReply(comment.id)}
            >
              <svg
                className="mr-1.5 w-3.5 h-3.5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 18"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 5h5M5 8h2m6-3h2m-5 3h6m2-7H2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3v5l5-5h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1Z"
                />
              </svg>
              Antworten
            </button>
            <button
              type="button"
              className="flex items-center text-sm text-gray-500 hover:underline dark:text-gray-400 font-medium"
              onClick={() => removeComment(comment.id)}
            >
              <svg
                className="w-3.5 h-3.5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 7h14m-9 3v6m4-6v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2"
                />
              </svg>
              Löschen
            </button>
          </div>
        </footer>
      </article>
      {comment.replies?.map((reply: Comment) => (
        <div key={reply.id} className="ml-4 my-4">
          <CommentComponent
            key={reply.id}
            comment={reply}
            onReply={onReply}
            removeComment={removeComment}
          />
        </div>
      ))}
    </div>
  );
};

export const Comments = () => {
  const { comments, addComment, removeComment, isLoading } = useComments();
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addComment(newComment, replyTo);
    setNewComment("");
    setReplyTo(null);
  };

  if (isLoading) {
    return <div>Loading comments...</div>;
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="mb-8">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-2 border rounded text-black"
          placeholder={
            replyTo
              ? "Schreiben Sie eine Antwort..."
              : "Schreiben Sie einen Kommentar..."
          }
        />
        <div className="flex gap-2 mt-2">
          <button
            type="submit"
            className="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-primary-700 rounded-lg focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 hover:bg-primary-800 cursor-pointer"
            disabled={!newComment.trim()}
          >
            {replyTo ? "Antworten" : "Kommentieren"}
          </button>
          {replyTo && (
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-primary-700 rounded-lg focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 hover:bg-primary-800 cursor-pointer"
            >
              Abbrechen
            </button>
          )}
        </div>
      </form>

      <div className="space-4">
        {comments.map((comment: Comment) => (
          <CommentComponent
            key={comment.id}
            comment={comment}
            onReply={setReplyTo}
            removeComment={removeComment}
          />
        ))}
      </div>
    </>
  );
};
