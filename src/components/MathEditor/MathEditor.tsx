//@ts-nocheck
import React, { useRef, useEffect, useState } from "react";
import ButtonGroup from "./ButtonGroup";
import { tabs, allButtonGroups } from "./mathEditorConstants";
import './MathEditor.css'
// Helper function to convert old $...$ format to MathLive format
const convertDollarSignsToLatex = (text: string): string => {
  if (!text) return '';
  
  // First, replace $\newline$ with LaTeX line breaks
  let converted = text.replace(/\$\\newline\$/g, '\\\\');
  
  // Remove $ delimiters - MathLive's smart mode will handle math vs text
  // This converts $expression$ to just expression
  converted = converted.replace(/\$/g, '');
  
  // Clean up any double backslashes that might cause issues
  converted = converted.replace(/\\\\\s*\n/g, '\\\\ ');
  
  return converted.trim();
};

// 1. Manually define the MathFieldElement interface 
interface MathFieldElement extends HTMLElement {
  executeCommand: (command: string, ...args: any[]) => void;
  getValue: (format?: string) => string;
  setValue: (value: string) => void;
  focus: () => void;
  defaultMode: string;
  smartMode: boolean;
  setOptions: (options: any) => void;
}

// 2. Register the <math-field> tag in the JSX namespace
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': React.DetailedHTMLProps<React.HTMLAttributes<MathFieldElement>, MathFieldElement> & {
        'default-mode'?: string;
        'virtual-keyboard-mode'?: string;
      };
    }
  }
}

interface MathEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  defaultMode?: 'math' | 'text';
  showToolbar?: boolean;
  compact?: boolean; // New prop for compact mode
}

function MathEditorV2({ 
  value, 
  onChange, 
  placeholder = '',
  defaultMode = 'text',
  showToolbar = true,
  compact = false 
}: MathEditorProps) {
  // Handle undefined or null values
  const safeValue = value ?? '';
  const mfRef = useRef<MathFieldElement>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const isControlledRef = useRef(false);

  // Initialize the math field with the value prop
  useEffect(() => {
    const mf = mfRef.current;
    if (mf) {
      const currentValue = mf.getValue();
      // Clean the incoming value
      let cleanValue = safeValue;
      if (cleanValue === '""' || cleanValue === "''") {
        cleanValue = '';
      }
      
      // Convert old $...$ format to MathLive format
      cleanValue = convertDollarSignsToLatex(cleanValue);
      
      if (currentValue !== cleanValue) {
        mf.setValue(cleanValue);
        isControlledRef.current = true;
      }
    }
  }, [safeValue]);

  useEffect(() => {
    const mf = mfRef.current;
    if (mf) {
      // Set default mode to text
      mf.defaultMode = defaultMode;
      
      // Enable smart mode for automatic switching between text and math
      mf.smartMode = true;
      
      // Configure options
      mf.setOptions({
        smartMode: true,
        smartFence: true,
        smartSuperscript: true,
        // Disable virtual keyboard completely
        mathVirtualKeyboardPolicy: 'manual',
      });

      const handleInput = (e: Event) => {
        let newValue = (e.target as MathFieldElement).getValue();
        
        // Clean up the value - remove surrounding quotes if they exist
        if (newValue === '""' || newValue === "''") {
          newValue = '';
        }
        
        if (onChange && !isControlledRef.current) {
          onChange(newValue);
        }
        isControlledRef.current = false;
      };

      mf.addEventListener("input", handleInput);
      return () => mf.removeEventListener("input", handleInput);
    }
  }, [onChange, defaultMode]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!mfRef.current || document.activeElement !== mfRef.current) return;

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        mfRef.current.executeCommand("insert", "\\\\");
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'f') {
          e.preventDefault();
          insertWithPlaceholder('\\frac{#0}{#0}');
        } else if (e.key === 'r') {
          e.preventDefault();
          insertWithPlaceholder('\\sqrt{#0}');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const refocus = () => {
    if (mfRef.current) mfRef.current.focus();
  };

  const insert = (latexStr: string) => {
    if (mfRef.current) {
      mfRef.current.executeCommand("insert", latexStr);
      refocus();
    }
  };

  const insertWithPlaceholder = (latexStr: string) => {
    if (mfRef.current) {
      mfRef.current.executeCommand("insert", latexStr);
      refocus();
    }
  };

  const insertText = () => {
    const text = prompt("Enter text to insert:");
    if (text && mfRef.current) {
      mfRef.current.executeCommand("insert", `\\text{${text}}`);
      refocus();
    }
  };

  const toggleToolbar = () => {
    setToolbarVisible(!toolbarVisible);
  };

  return (
    <div className={`math-editor-container ${compact ? 'compact' : ''}`}>
      {!compact && (
        <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
      
          {showToolbar && (
            <button 
              type="button"
              onClick={toggleToolbar}
              className="toolbar-toggle"
              title={toolbarVisible ? 'Hide toolbar' : 'Show toolbar'}
            >
              {toolbarVisible ? '▲ Hide Symbols' : '▼ Show Symbols'}
            </button>
          )}
      
        </div>
      )}

      <math-field 
        ref={mfRef} 
        default-mode={defaultMode}
        placeholder={placeholder}
      />

      {showToolbar && !compact && (
        <div className={`toolbar ${toolbarVisible ? '' : 'collapsed'}`}>
          <div className="tabs">
            {tabs.map((tab, index) => (
              <div
                key={index}
                className={`tab ${activeTab === index ? 'active' : ''}`}
                onClick={() => setActiveTab(index)}
                title={tab.title}
              >
                {tab.label}
              </div>
            ))}
          </div>

          {allButtonGroups.map((buttonGroup, index) => (
            <div
              key={index}
              className={`tab-content ${activeTab === index ? 'active' : ''}`}
            >
              <ButtonGroup
                buttons={buttonGroup}
                onInsert={insert}
                onInsertWithPlaceholder={insertWithPlaceholder}
                onInsertText={insertText}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MathEditorV2;