

import { createRxDatabase, RxDatabase, RxCollection } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import type { DatabaseCollections } from "../types/comment";

const commentSchema = {
  title: "comment schema",
  version: 0,
  type: "object",
  primaryKey: "id",
  properties: {
    id: {
      type: "string",
      maxLength: 100,
    },
    content: {
      type: "string",
    },
    parentId: {
      type: ["string", "null"],
      default: null,
    },
    createdAt: {
      type: "number",
    },
  },
  required: ["id", "content", "createdAt"] as const,
} as const;

let dbPromise: Promise<RxDatabase<DatabaseCollections>> | null = null;

export const getDatabase = async (): Promise<RxDatabase<DatabaseCollections>> => {
  if (dbPromise) return dbPromise;

  dbPromise = createRxDatabase<DatabaseCollections>({
    name: "commentsdb",
    storage: getRxStorageDexie(),
  });

  const db = await dbPromise;
  await db.addCollections({
    comments: {
      schema: commentSchema,
    },
  });

  return db;
}
