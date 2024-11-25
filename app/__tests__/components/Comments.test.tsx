import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Comments } from "../../components/Comments";
import { useComments } from "../../hooks/useComments";

jest.mock("../../hooks/useComments", () => ({
  useComments: jest.fn(),
}));

describe("Comments", () => {
  const mockComments = [
    {
      id: "comment1",
      content: "Hauptkommentar",
      parentId: null,
      createdAt: new Date("2024-01-01").getTime(),
      replies: [
        {
          id: "reply1",
          content: "Antwortkommentar",
          parentId: "comment1",
          createdAt: new Date("2024-01-02").getTime(),
          replies: [],
        },
      ],
    },
  ];

  const mockHook = {
    comments: mockComments,
    addComment: jest.fn(),
    removeComment: jest.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useComments as jest.Mock).mockReturnValue(mockHook);
  });

  it("should render comments with timestamps", () => {
    render(<Comments />);

    const parentComment = screen.getByTestId("comment-content-comment1");
    expect(parentComment).toHaveTextContent("Hauptkommentar");

    const dates = screen.getAllByRole("time");
    expect(dates[0]).toHaveTextContent("1.1.2024");
    expect(dates[1]).toHaveTextContent("2.1.2024");
  });

  it("should add a new root comment", async () => {
    const user = userEvent.setup();
    render(<Comments />);

    const textarea = screen.getByTestId("comment-input");
    const submitButton = screen.getByTestId("submit-button");

    await user.type(textarea, "New comment");
    await user.click(submitButton);

    expect(mockHook.addComment).toHaveBeenCalledWith("New comment", null);
    expect(textarea).toHaveValue("");
  });

  it("should reply to a comment", async () => {
    const user = userEvent.setup();
    render(<Comments />);

    const replyButton = screen.getByTestId("reply-button-comment1");
    await user.click(replyButton);

    const textarea = screen.getByTestId("comment-input");
    const submitButton = screen.getByTestId("submit-button");

    await user.type(textarea, "New reply");
    await user.click(submitButton);

    expect(mockHook.addComment).toHaveBeenCalledWith("New reply", "comment1");
  });

  it("should cancel reply mode", async () => {
    const user = userEvent.setup();
    render(<Comments />);

    await user.click(screen.getByTestId("reply-button-comment1"));
    await user.click(screen.getByTestId("cancel-button"));

    const textarea = screen.getByTestId("comment-input");
    expect(textarea).toHaveAttribute(
      "placeholder",
      "Schreiben Sie einen Kommentar..."
    );
  });

  it("should delete a comment", async () => {
    const user = userEvent.setup();
    render(<Comments />);

    await user.click(screen.getByTestId("delete-button-comment1"));
    expect(mockHook.removeComment).toHaveBeenCalledWith("comment1");
  });

  it("should disable submit button when comment is empty", async () => {
    const user = userEvent.setup();
    render(<Comments />);

    const submitButton = screen.getByTestId("submit-button");
    const textarea = screen.getByTestId("comment-input");

    expect(submitButton).toBeDisabled();

    await user.type(textarea, "New comment");
    expect(submitButton).toBeEnabled();

    await user.clear(textarea);
    expect(submitButton).toBeDisabled();
  });

  it("should structure nested comments correctly", () => {
    render(<Comments />);

    const parentComment = screen.getByText("Hauptkommentar");
    const replyComment = screen.getByText("Antwortkommentar");

    const replyContainer = replyComment.closest("div.ml-4");
    expect(replyContainer).toBeInTheDocument();

    expect(parentComment.closest("div.ml-4")).not.toBeInTheDocument();
  });
});
