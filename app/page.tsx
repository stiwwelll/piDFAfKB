"use client";

import { Comments } from "./components/Comments";
import { useComments } from "./hooks/useComments";

const Home = () => {
  const { comments, clearComments, isLoading } = useComments();
  if (isLoading) return null;

  return (
    <>
      <main className="bg-white dark:bg-gray-900 py-8 lg:py-16 antialiased">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">
              Kommentare ({comments.length})
            </h2>
            <button
              onClick={() => clearComments()}
              className="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-primary-700 rounded-lg focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 hover:bg-primary-800 cursor-pointer"
            >
              Kommentare löschen
            </button>
          </div>
          <Comments />
        </div>
      </main>
    </>
  );
};

export default Home;
