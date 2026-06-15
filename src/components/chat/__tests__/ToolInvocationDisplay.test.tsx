import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ToolInvocationDisplay, getLabel } from "../ToolInvocationDisplay";
import type { ToolInvocation } from "ai";

// --- getLabel unit tests ---

describe("getLabel", () => {
  describe("str_replace_editor", () => {
    it("returns 'Creating <path>' for create command", () => {
      expect(getLabel("str_replace_editor", { command: "create", path: "/App.jsx" })).toBe("Creating /App.jsx");
    });

    it("returns 'Editing <path>' for str_replace command", () => {
      expect(getLabel("str_replace_editor", { command: "str_replace", path: "/components/Button.jsx" })).toBe("Editing /components/Button.jsx");
    });

    it("returns 'Editing <path>' for insert command", () => {
      expect(getLabel("str_replace_editor", { command: "insert", path: "/utils/helpers.ts" })).toBe("Editing /utils/helpers.ts");
    });

    it("returns 'Viewing <path>' for view command", () => {
      expect(getLabel("str_replace_editor", { command: "view", path: "/App.jsx" })).toBe("Viewing /App.jsx");
    });

    it("falls back to 'Editing <path>' for unknown command", () => {
      expect(getLabel("str_replace_editor", { command: "unknown", path: "/App.jsx" })).toBe("Editing /App.jsx");
    });

    it("uses 'file' when path is missing", () => {
      expect(getLabel("str_replace_editor", { command: "create" })).toBe("Creating file");
    });
  });

  describe("file_manager", () => {
    it("returns 'Renaming <path> → <new_path>' for rename command", () => {
      expect(getLabel("file_manager", { command: "rename", path: "/old.jsx", new_path: "/new.jsx" })).toBe("Renaming /old.jsx → /new.jsx");
    });

    it("returns 'Deleting <path>' for delete command", () => {
      expect(getLabel("file_manager", { command: "delete", path: "/components/Old.jsx" })).toBe("Deleting /components/Old.jsx");
    });

    it("falls back to 'Managing <path>' for unknown command", () => {
      expect(getLabel("file_manager", { command: "unknown", path: "/App.jsx" })).toBe("Managing /App.jsx");
    });
  });

  it("returns the raw toolName for unknown tools", () => {
    expect(getLabel("some_unknown_tool", { command: "do_something" })).toBe("some_unknown_tool");
  });
});

// --- ToolInvocationDisplay rendering tests ---

function makeInvocation(overrides: Partial<ToolInvocation> & { toolName: string; args: any; state: ToolInvocation["state"] }): ToolInvocation {
  return { toolCallId: "test-id", ...overrides } as ToolInvocation;
}

describe("ToolInvocationDisplay", () => {
  it("shows 'Creating /App.jsx' while the tool is in progress", () => {
    const inv = makeInvocation({ toolName: "str_replace_editor", args: { command: "create", path: "/App.jsx" }, state: "call" });
    render(<ToolInvocationDisplay toolInvocation={inv} />);
    expect(screen.getByText("Creating /App.jsx")).toBeDefined();
  });

  it("shows 'Editing /components/Button.jsx' for str_replace", () => {
    const inv = makeInvocation({ toolName: "str_replace_editor", args: { command: "str_replace", path: "/components/Button.jsx" }, state: "call" });
    render(<ToolInvocationDisplay toolInvocation={inv} />);
    expect(screen.getByText("Editing /components/Button.jsx")).toBeDefined();
  });

  it("shows a spinner while the tool call is pending", () => {
    const inv = makeInvocation({ toolName: "str_replace_editor", args: { command: "create", path: "/App.jsx" }, state: "call" });
    const { container } = render(<ToolInvocationDisplay toolInvocation={inv} />);
    expect(container.querySelector(".animate-spin")).toBeTruthy();
  });

  it("shows the green dot and no spinner when the tool has a result", () => {
    const inv = makeInvocation({ toolName: "str_replace_editor", args: { command: "create", path: "/App.jsx" }, state: "result", result: "ok" } as any);
    const { container } = render(<ToolInvocationDisplay toolInvocation={inv} />);
    expect(container.querySelector(".animate-spin")).toBeFalsy();
    expect(container.querySelector(".bg-emerald-500")).toBeTruthy();
  });

  it("shows 'Renaming /old.jsx → /new.jsx' for file_manager rename", () => {
    const inv = makeInvocation({ toolName: "file_manager", args: { command: "rename", path: "/old.jsx", new_path: "/new.jsx" }, state: "call" });
    render(<ToolInvocationDisplay toolInvocation={inv} />);
    expect(screen.getByText("Renaming /old.jsx → /new.jsx")).toBeDefined();
  });

  it("shows 'Deleting /App.jsx' for file_manager delete", () => {
    const inv = makeInvocation({ toolName: "file_manager", args: { command: "delete", path: "/App.jsx" }, state: "call" });
    render(<ToolInvocationDisplay toolInvocation={inv} />);
    expect(screen.getByText("Deleting /App.jsx")).toBeDefined();
  });

  it("falls back to raw tool name for unknown tools", () => {
    const inv = makeInvocation({ toolName: "some_unknown_tool", args: {}, state: "call" });
    render(<ToolInvocationDisplay toolInvocation={inv} />);
    expect(screen.getByText("some_unknown_tool")).toBeDefined();
  });
});
