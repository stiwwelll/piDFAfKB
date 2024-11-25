import { renderHook, act } from "@testing-library/react";
import { useComments } from "../../hooks/useComments";
import { getDatabase } from "../../lib/database";
import type { Comment } from "../../types/comment";

jest.mock("../../lib/database", () => ({
  getDatabase: jest.fn(),
}));

describe("useComments", () => {
  const mockComments: Comment[] = [
    {
      id: "comment1",
      content: "Parent comment",
      parentId: null,
      createdAt: 1000,
    },
    {
      id: "comment2",
      content: "Reply to parent",
      parentId: "comment1",
      createdAt: 2000,
    },
    {
      id: "comment3",
      content: "Another parent",
      parentId: null,
      createdAt: 3000,
    },
  ];

  const mockUnsubscribe = jest.fn();
  const mockSubscribe = jest.fn().mockImplementation((callback) => {
    callback(
      mockComments.map((comment) => ({
        toJSON: () => comment,
      }))
    );
    return { unsubscribe: mockUnsubscribe };
  });

  const mockCollection = {
    find: jest.fn(),
    insert: jest.fn(),
    remove: jest.fn(),
  };

  const mockDb = {
    comments: mockCollection,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCollection.find.mockReturnValue({
      $: { subscribe: mockSubscribe },
      exec: jest.fn().mockResolvedValue([]),
      remove: jest.fn().mockResolvedValue(undefined),
    });
    mockCollection.insert.mockImplementation(async (doc: Comment) => doc);
    (getDatabase as jest.Mock).mockResolvedValue(mockDb);
  });

  it("should properly clean up subscriptions", async () => {
    const { result, unmount } = renderHook(() => useComments());

    await act(async () => {
      await (getDatabase as jest.Mock).mock.results[0].value;
    });

    expect(mockSubscribe).toHaveBeenCalled();

    act(() => {
      unmount();
    });

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it("should load and structure comments correctly", async () => {
    const { result } = renderHook(() => useComments());

    await act(async () => {
      await (getDatabase as jest.Mock).mock.results[0].value;
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.comments).toHaveLength(2);
    expect(result.current.comments[0].replies).toHaveLength(1);
  });

  it("should add a new root comment", async () => {
    const { result } = renderHook(() => useComments());

    await act(async () => {
      await (getDatabase as jest.Mock).mock.results[0].value;
    });

    const newComment = { content: "New comment" };
    await act(async () => {
      await result.current.addComment(newComment.content);
    });

    expect(mockCollection.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        content: newComment.content,
        parentId: null,
      })
    );
  });

  it("should add a reply to an existing comment", async () => {
    const { result } = renderHook(() => useComments());

    await act(async () => {
      await (getDatabase as jest.Mock).mock.results[0].value;
    });

    const parentId = "comment1";
    const replyContent = "New reply";

    await act(async () => {
      await result.current.addComment(replyContent, parentId);
    });

    expect(mockCollection.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        content: replyContent,
        parentId,
      })
    );
  });

  it("should remove a comment and its nested replies", async () => {
    const nestedReplies = [
      { id: "reply1", parentId: "comment1" },
      { id: "reply2", parentId: "reply1" },
    ];

    mockCollection.find.mockImplementation((query) => {
      if (!query) {
        return {
          $: { subscribe: mockSubscribe },
          exec: jest.fn().mockResolvedValue([]),
          remove: jest.fn().mockResolvedValue(undefined),
        };
      }

      if (query.selector?.parentId === "comment1") {
        return {
          exec: jest.fn().mockResolvedValue([nestedReplies[0]]),
          remove: jest.fn().mockResolvedValue(undefined),
          $: { subscribe: mockSubscribe },
        };
      }
      if (query.selector?.parentId === "reply1") {
        return {
          exec: jest.fn().mockResolvedValue([nestedReplies[1]]),
          remove: jest.fn().mockResolvedValue(undefined),
          $: { subscribe: mockSubscribe },
        };
      }

      return {
        exec: jest.fn().mockResolvedValue([]),
        remove: jest.fn().mockResolvedValue(undefined),
        $: { subscribe: mockSubscribe },
      };
    });

    const { result } = renderHook(() => useComments());

    await act(async () => {
      await (getDatabase as jest.Mock).mock.results[0].value;
    });

    await act(async () => {
      await result.current.removeComment("comment1");
    });

    expect(mockCollection.find).toHaveBeenCalledWith(
      expect.objectContaining({
        selector: {
          id: {
            $in: expect.arrayContaining(["comment1", "reply1", "reply2"]),
          },
        },
      })
    );
  });
});
