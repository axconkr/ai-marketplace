'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * MarkdownPreview component
 * Simple markdown preview with basic formatting
 * For production, consider using a library like react-markdown or marked
 */

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    // Simple markdown to HTML conversion
    // For production, use a proper markdown parser like marked or remark
    const parsed = parseMarkdown(content);
    setHtml(parsed);
  }, [content]);

  return (
    <div
      className={cn(
        'prose prose-sm max-w-none',
        'prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg',
        'prose-p:text-muted-foreground prose-p:leading-relaxed',
        'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
        'prose-strong:text-foreground prose-strong:font-semibold',
        'prose-ul:list-disc prose-ul:pl-4',
        'prose-ol:list-decimal prose-ol:pl-4',
        'prose-li:text-muted-foreground',
        'prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded',
        'prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto',
        'prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic',
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * Basic markdown parser
 * NOTE: This is a simplified parser for demonstration.
 * For production, use a proper library like marked, remark, or react-markdown
 */
function parseMarkdown(markdown: string): string {
  if (!markdown) return '';

  let html = markdown;

  // Escape HTML
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headers (must come before other formatting)
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Code blocks (triple backticks)
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

  // Inline code
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');

  // Links
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Blockquotes
  html = html.replace(/^&gt; (.+$)/gim, '<blockquote>$1</blockquote>');

  // Unordered lists
  html = html.replace(/^\* (.+$)/gim, '<ul><li>$1</li></ul>');
  html = html.replace(/^- (.+$)/gim, '<ul><li>$1</li></ul>');

  // Ordered lists
  html = html.replace(/^\d+\. (.+$)/gim, '<ol><li>$1</li></ol>');

  // Merge consecutive list items
  html = html.replace(/<\/ul>\s*<ul>/g, '');
  html = html.replace(/<\/ol>\s*<ol>/g, '');

  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr />');
  html = html.replace(/^\*\*\*$/gim, '<hr />');

  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br />');

  // Wrap in paragraph tags
  html = '<p>' + html + '</p>';

  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p>\s*<\/p>/g, '');

  return html;
}

/**
 * MarkdownEditor component
 * Textarea with markdown preview side-by-side
 */

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  maxLength?: number;
  minLength?: number;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = '마크다운을 사용하여 작성해주세요...',
  error,
  maxLength = 5000,
  minLength,
}: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const charCount = value.length;
  const isOverMin = !minLength || charCount >= minLength;
  const isUnderMax = charCount <= maxLength;

  return (
    <div className="space-y-2">
      {/* Editor Tabs */}
      <div className="flex items-center justify-between border-b">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowPreview(false)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              !showPreview
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            작성
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              showPreview
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            미리보기
          </button>
        </div>

        {/* Character Count */}
        <div
          className={cn(
            'text-xs px-3 py-1',
            !isOverMin && 'text-destructive',
            !isUnderMax && 'text-destructive',
            isOverMin && isUnderMax && 'text-muted-foreground'
          )}
        >
          {charCount} / {maxLength}
          {minLength && charCount < minLength && ` (최소 ${minLength}자)`}
        </div>
      </div>

      {/* Content */}
      {!showPreview ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={cn(
            'w-full min-h-[300px] p-4 rounded-lg border bg-background',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'resize-y font-mono text-sm',
            error && 'border-destructive'
          )}
        />
      ) : (
        <div className="min-h-[300px] p-4 rounded-lg border bg-muted">
          {value ? (
            <MarkdownPreview content={value} />
          ) : (
            <p className="text-muted-foreground text-sm">미리보기 내용이 없습니다</p>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Helper Text */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>마크다운 문법 지원:</p>
        <ul className="list-disc list-inside space-y-0.5 ml-2">
          <li># 제목 (H1), ## 제목 (H2), ### 제목 (H3)</li>
          <li>**굵게**, *기울임*, `코드`</li>
          <li>[링크](URL), - 목록, 1. 번호 목록</li>
          <li>```코드 블록```, &gt; 인용문</li>
        </ul>
      </div>
    </div>
  );
}
