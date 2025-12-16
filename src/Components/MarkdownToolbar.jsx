import React from "react";

export default function MarkdownToolbar({ onCommand }) {
  return (
    <div className="toolbar">
      <button type="button" onClick={() => onCommand("bold")}>B</button>
      <button type="button" onClick={() => onCommand("italic")}>I</button>
      <button type="button" onClick={() => onCommand("heading")}>H</button>
      <button type="button" onClick={() => onCommand("ulist")}>UL</button>
      <button type="button" onClick={() => onCommand("olist")}>OL</button>
      <button type="button" onClick={() => onCommand("code")}>Code</button>
      <button type="button" onClick={() => onCommand("table")}>Table</button>
    </div>
  );
}
