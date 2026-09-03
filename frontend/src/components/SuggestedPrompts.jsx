import React from "react";
import { SUGGESTIONS } from "../lib/riwi-data.js";

export function SuggestedPrompts({ onSelect, disabled }) {
  return (
    <div className="mb-2 flex flex-wrap gap-2">
      {SUGGESTIONS.map((s, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(s.prompt)}
          disabled={disabled}
          className="cursor-pointer rounded-lg border border-border bg-background px-3 py-1.5 text-[12px] font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

