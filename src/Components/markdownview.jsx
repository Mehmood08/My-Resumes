import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";

function MarkdownView({ content }) {
  return (
    <div style={{
      padding: "10px",
      background: "#d9f3f8ff",
      borderRadius: "6px",
      height: "300px",
      overflowY: "auto"
    }}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownView;
