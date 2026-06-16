import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MainContent } from "../main-content";

// Stub out the heavy child components so the test focuses purely on the
// Preview/Code toggle wiring.
vi.mock("@/components/chat/ChatInterface", () => ({
  ChatInterface: () => <div>chat</div>,
}));
vi.mock("@/components/editor/FileTree", () => ({
  FileTree: () => <div data-testid="file-tree">file-tree</div>,
}));
vi.mock("@/components/editor/CodeEditor", () => ({
  CodeEditor: () => <div data-testid="code-editor">code-editor</div>,
}));
vi.mock("@/components/preview/PreviewFrame", () => ({
  PreviewFrame: () => <div data-testid="preview-frame">preview-frame</div>,
}));
vi.mock("@/components/HeaderActions", () => ({
  HeaderActions: () => <div>header-actions</div>,
}));

afterEach(() => cleanup());

describe("Preview/Code toggle", () => {
  it("shows the preview by default", () => {
    render(<MainContent />);
    expect(screen.getByTestId("preview-frame")).toBeDefined();
    expect(screen.queryByTestId("code-editor")).toBeNull();
  });

  it("switches to code when the Code tab is clicked, and back", async () => {
    const user = userEvent.setup();
    render(<MainContent />);

    await user.click(screen.getByRole("tab", { name: "Code" }));
    expect(screen.getByTestId("code-editor")).toBeDefined();
    expect(screen.queryByTestId("preview-frame")).toBeNull();

    await user.click(screen.getByRole("tab", { name: "Preview" }));
    expect(screen.getByTestId("preview-frame")).toBeDefined();
    expect(screen.queryByTestId("code-editor")).toBeNull();
  });
});
