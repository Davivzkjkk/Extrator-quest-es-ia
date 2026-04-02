"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface RichTextProps {
  content: string;
  className?: string;
}

function normalizeLatexForDisplay(input: string): string {
  let text = input;

  // Fix common OCR/LLM issues in math commands before markdown parsing.
  text = text.replace(/\\\\([A-Za-z])/g, '\\$1');
  text = text.replace(/(^|[^\\])left\s*([\(\[\{\|])/g, '$1\\left$2');
  text = text.replace(/(^|[^\\])right\s*([\)\]\}\|])/g, '$1\\right$2');
  text = text.replace(/\\overline\s*([A-Za-z]{1,4})\b/g, '\\overline{$1}');
  text = text.replace(/\\sqrt\s*([0-9A-Za-z]+)\b/g, '\\sqrt{$1}');
  text = text.replace(/\\frac\s*(\d{2,})(\d)\b/g, '\\frac{$1}{$2}');

  return text;
}

export function RichText({ content, className }: RichTextProps) {
  const normalizedContent = normalizeLatexForDisplay(content || '');

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      className={className}
      components={{
        p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 mb-3 last:mb-0">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 mb-3 last:mb-0">{children}</ol>,
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        table: ({ children }) => (
          <div className="overflow-x-auto my-3">
            <table className="w-full border-collapse text-xs">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
        th: ({ children }) => (
          <th className="border px-2 py-1 text-left font-semibold align-top">{children}</th>
        ),
        td: ({ children }) => <td className="border px-2 py-1 align-top">{children}</td>,
        code: ({ children }) => <code className="px-1 py-0.5 rounded bg-muted text-[0.85em]">{children}</code>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 pl-3 italic text-muted-foreground my-3">{children}</blockquote>
        ),
      }}
    >
      {normalizedContent}
    </ReactMarkdown>
  );
}
