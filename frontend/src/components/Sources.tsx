// Sources.tsx
import React from 'react';

type SourceChunk = {
  source: string;
  content: string;
};

type SourcesProps = {
  sources: SourceChunk[];
  expandedSources: Set<number>;
  setExpandedSources: React.Dispatch<React.SetStateAction<Set<number>>>;
};

const getPreviewLines = (text: string, lines: number = 3) =>
  text
    .split('\n')
    .filter(line => line.trim() !== '')
    .slice(0, lines)
    .join('\n');

const Sources: React.FC<SourcesProps> = ({ sources, expandedSources, setExpandedSources }) => {
  if (sources.length === 0) return null;

  return (
    <div className="sources-container">
      <strong>📄 Sources:</strong>
      <ul className="sources-list">
        {sources.map((src, idx) => {
          const isExpanded = expandedSources.has(idx);
          const displayText = isExpanded
            ? src.content
            : getPreviewLines(src.content);

          return (
            <li key={idx} className="source-item">
              <div><strong>{src.source}</strong></div>
              <div className="source-content">{displayText}</div>
              <button
                className="toggle-button"
                onClick={() => {
                  const newSet = new Set(expandedSources);
                  if (isExpanded) newSet.delete(idx);
                  else newSet.add(idx);
                  setExpandedSources(newSet);
                }}
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Sources;
