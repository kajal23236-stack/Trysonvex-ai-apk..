import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Parse code blocks vs regular markdown
  const parts = content.split(/(```[\s\S]*?```)/g);

  let codeBlockCounter = 0;

  return (
    <div className="space-y-3 leading-relaxed text-sm sm:text-[15px] text-slate-200">
      {parts.map((part, idx) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const codeIndex = codeBlockCounter++;
          const lines = part.slice(3, -3).trim().split('\n');
          const language = lines[0].trim() || 'code';
          const codeText = lines.slice(language && !lines[0].includes(' ') ? 1 : 0).join('\n');

          return (
            <div 
              key={idx} 
              className="my-3 rounded-xl overflow-hidden border border-white/10 bg-[#06080F] shadow-lg"
            >
              <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900/80 border-b border-white/5 text-xs text-slate-400 font-mono">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="uppercase text-[11px] font-semibold text-cyan-300">{language}</span>
                </div>
                <button
                  onClick={() => handleCopyCode(codeText, codeIndex)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Copy code"
                >
                  {copiedIndex === codeIndex ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-[11px] text-emerald-400 font-sans">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-400" />
                      <span className="text-[11px] font-sans">Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono text-cyan-100 bg-[#06080F]/90">
                <code>{codeText}</code>
              </pre>
            </div>
          );
        }

        // Render formatted text blocks
        return (
          <div key={idx} className="whitespace-pre-wrap break-words">
            {renderFormattedText(part)}
          </div>
        );
      })}
    </div>
  );
};

// Helper to format inline markdown elements (headers, bold, bullets)
function renderFormattedText(text: string) {
  const paragraphs = text.split('\n');

  return paragraphs.map((line, lineIdx) => {
    // Heading 1
    if (line.startsWith('# ')) {
      return (
        <h1 key={lineIdx} className="text-xl sm:text-2xl font-bold text-white mt-4 mb-2 tracking-tight">
          {line.replace('# ', '')}
        </h1>
      );
    }
    // Heading 2
    if (line.startsWith('## ')) {
      return (
        <h2 key={lineIdx} className="text-lg sm:text-xl font-bold text-cyan-200 mt-3 mb-1.5 tracking-tight border-b border-white/5 pb-1">
          {line.replace('## ', '')}
        </h2>
      );
    }
    // Heading 3
    if (line.startsWith('### ')) {
      return (
        <h3 key={lineIdx} className="text-base sm:text-lg font-semibold text-slate-100 mt-2 mb-1">
          {line.replace('### ', '')}
        </h3>
      );
    }
    // Bullet point
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      const bulletContent = line.trim().slice(2);
      return (
        <div key={lineIdx} className="flex items-start gap-2.5 my-1 pl-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0"></span>
          <span className="flex-1">{renderInlineStyles(bulletContent)}</span>
        </div>
      );
    }
    // Numbered list item
    const numMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      return (
        <div key={lineIdx} className="flex items-start gap-2.5 my-1 pl-2">
          <span className="text-xs font-mono font-bold text-cyan-400 mt-0.5">{numMatch[1]}.</span>
          <span className="flex-1">{renderInlineStyles(numMatch[2])}</span>
        </div>
      );
    }

    if (!line.trim()) {
      return <div key={lineIdx} className="h-1.5" />;
    }

    return (
      <p key={lineIdx} className="my-1 text-slate-200">
        {renderInlineStyles(line)}
      </p>
    );
  });
}

function renderInlineStyles(text: string) {
  // Bold **word**
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={i} className="italic text-slate-300">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-mono text-xs">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
