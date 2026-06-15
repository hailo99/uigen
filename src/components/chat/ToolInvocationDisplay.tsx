"use client";

import { ToolInvocation } from "ai";
import { Loader2 } from "lucide-react";

function getLabel(toolName: string, args: Record<string, any>): string {
  if (toolName === "str_replace_editor") {
    const path = args.path ?? "file";
    switch (args.command) {
      case "create":   return `Creating ${path}`;
      case "str_replace":
      case "insert":   return `Editing ${path}`;
      case "view":     return `Viewing ${path}`;
      default:         return `Editing ${path}`;
    }
  }
  if (toolName === "file_manager") {
    const path = args.path ?? "file";
    switch (args.command) {
      case "rename": return `Renaming ${path} → ${args.new_path ?? ""}`;
      case "delete": return `Deleting ${path}`;
      default:       return `Managing ${path}`;
    }
  }
  return toolName;
}

interface ToolInvocationDisplayProps {
  toolInvocation: ToolInvocation;
}

export function ToolInvocationDisplay({ toolInvocation }: ToolInvocationDisplayProps) {
  const { toolName, args, state } = toolInvocation;
  const label = getLabel(toolName, args as Record<string, any>);
  const isDone = state === "result";

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" aria-hidden="true" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}

export { getLabel };
