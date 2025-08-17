import React from 'react';
import { customInputStyle, sectionTitleStyle } from './styles';

interface CustomLatexProps {
  customLatex: string;
  setCustomLatex: React.Dispatch<React.SetStateAction<string>>;
  onKeyDown: (e: React.KeyboardEvent) => void;
  customInputRef: React.RefObject<HTMLInputElement | null>;
}

const CustomLatex: React.FC<CustomLatexProps> = ({
  customLatex,
  setCustomLatex,
  onKeyDown,
  customInputRef,
}) => {
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px' }}>
        <input
          ref={customInputRef}
          type="text"
          placeholder="Enter LaTeX (e.g., x^2 + \\sqrt{10})"
          value={customLatex}
          onChange={(e) => setCustomLatex(e.target.value)}
          onKeyDown={onKeyDown}
          style={customInputStyle}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ ...sectionTitleStyle, marginBottom: '8px' }}>Examples:</h4>
        <ul style={{ fontSize: '12px', color: '#333', margin: 0, paddingLeft: '20px' }}>
          <li>
            <code style={{ color: 'black', backgroundColor: '#f5f5f5', padding: '2px 4px', borderRadius: '3px' }}>
              x^2 + \sqrt&#123;10&#125;
            </code>
          </li>
          <li>
            <code style={{ color: 'black', backgroundColor: '#f5f5f5', padding: '2px 4px', borderRadius: '3px' }}>
              \frac&#123;1&#125;&#123;2&#125;
            </code>
          </li>
          <li>
            <code style={{ color: 'black', backgroundColor: '#f5f5f5', padding: '2px 4px', borderRadius: '3px' }}>
              \frac&#123;-b \pm \sqrt&#123;b^2 - 4ac&#125;&#125;&#123;2a&#125;
            </code>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CustomLatex;