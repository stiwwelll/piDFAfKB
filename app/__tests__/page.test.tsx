import { render, screen } from "@testing-library/react";
import Home from "../page";
import { useComments } from "../hooks/useComments";

jest.mock("../hooks/useComments", () => ({
  useComments: jest.fn(),
}));

jest.mock("../components/Comments", () => ({
  Comments: () => <div>Comments Component</div>,
}));

describe("Home", () => {
  const mockComments = [
    { id: "1", content: "Comment 1", parentId: null, createdAt: Date.now() },
    { id: "2", content: "Comment 2", parentId: null, createdAt: Date.now() },
  ];

  beforeEach(() => {
    (useComments as jest.Mock).mockReturnValue({
      comments: mockComments,
      clearComments: jest.fn(),
      isLoading: false,
    });
  });

  it("should render comments count correctly", () => {
    render(<Home />);
    expect(screen.getByText("Kommentare (2)")).toBeInTheDocument();
  });
});
