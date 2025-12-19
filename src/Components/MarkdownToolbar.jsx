import React from "react";
import {
  FiBold,
  FiItalic,
  FiHash,
  FiList,
  FiCode,
  FiLayout
} from "react-icons/fi";
import { MdFormatListNumbered } from "react-icons/md";

// Using a mix of icons for best representation
export default function MarkdownToolbar({ onCommand }) {
  return (
    <div className="markdown-toolbar">
      <button type="button" onClick={() => onCommand("bold")} title="Bold">
        <FiBold />
      </button>
      <button type="button" onClick={() => onCommand("italic")} title="Italic">
        <FiItalic />
      </button>
      <button type="button" onClick={() => onCommand("heading")} title="Heading">
        <FiHash />
      </button>
      <button type="button" onClick={() => onCommand("ulist")} title="Bulleted List">
        <FiList />
      </button>
      <button type="button" onClick={() => onCommand("olist")} title="Numbered List">
        <MdFormatListNumbered size={18} />
      </button>
      <button type="button" onClick={() => onCommand("code")} title="Code Block">
        <FiCode />
      </button>
      <button type="button" onClick={() => onCommand("table")} title="Table">
        <FiLayout />
      </button>
    </div>
  );
}
