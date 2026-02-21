import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface LatexRendererProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

const extractDisplaylines = (content: string): string => {
  const keyword = '\\displaylines{';
  let result = content;
  let searchFrom = 0;

  while (true) {
    const idx = result.indexOf(keyword, searchFrom);
    if (idx === -1) break;

    const openBrace = idx + keyword.length - 1;
    let depth = 0;
    let closeIdx = -1;

    for (let i = openBrace; i < result.length; i++) {
      if (result[i] === '{') depth++;
      else if (result[i] === '}') {
        depth--;
        if (depth === 0) {
          closeIdx = i;
          break;
        }
      }
    }

    if (closeIdx === -1) break;

    // Check if \displaylines is wrapped in $ ... $ and strip those too
    const before = result.slice(0, idx);
    const after = result.slice(closeIdx + 1);
    const beforeMatch = before.match(/^([\s\S]*?)(\$\$?)\s*$/);
    const afterMatch = after.match(/^\s*(\$\$?)([\s\S]*)$/);

    let prefix = before;
    let suffix = after;

    if (beforeMatch && afterMatch && beforeMatch[2] === afterMatch[1]) {
      // Strip the matching $ or $$ wrappers
      prefix = beforeMatch[1];
      suffix = afterMatch[2];
    }

    const inner = result.slice(openBrace + 1, closeIdx);
    const lines = inner.split(/\\\\/).map(l => l.trim()).join(' \\\\ ');
    const replacement = `$$\\begin{aligned}${lines}\\end{aligned}$$`;

    result = prefix + replacement + suffix;
    searchFrom = prefix.length + replacement.length;
  }

  return result;
};

const LatexRenderer: React.FC<LatexRendererProps> = ({ content, className, style }) => {
  const tokens = useMemo(() => {
    if (!content.trim()) return [];

    const processedContent = extractDisplaylines(content);
    const regex = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g;
    const rawTokens = processedContent.split(regex).filter(Boolean);

    return rawTokens.map((token, index) => {
      if (token.startsWith('$$') && token.endsWith('$$')) {
        const latex = token.slice(2, -2).trim();
        try {
          const html = katex.renderToString(latex, { displayMode: true, throwOnError: false });
          return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
        } catch {
          return <span key={index} style={{ color: '#ef4444' }}>{token}</span>;
        }
      }

      if (token.startsWith('$') && token.endsWith('$') && token.length > 1) {
        const latex = token.slice(1, -1).trim();
        if (!latex) return <React.Fragment key={index}>{token}</React.Fragment>;
        try {
          const html = katex.renderToString(latex, { displayMode: false, throwOnError: false });
          return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
        } catch {
          return <span key={index} style={{ color: '#ef4444' }}>{token}</span>;
        }
      }

      return <React.Fragment key={index}>{token}</React.Fragment>;
    });
  }, [content]);

  return (
    <span className={`latex-renderer ${className ?? ''}`} style={style}>
      {tokens}
    </span>
  );
};

export default LatexRenderer;