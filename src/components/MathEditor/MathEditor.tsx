//@ts-nocheck
import React, { useRef, useEffect, useState } from "react";
import ButtonGroup from "./ButtonGroup";
import { tabs, allButtonGroups } from "./mathEditorConstants";
import './MathEditor.css'

const convertDollarSignsToLatex = (text: string): string => {
  if (!text) return '';
  let converted = text.replace(/\$\\newline\$/g, '\\\\');
  converted = converted.replace(/\$/g, '');
  converted = converted.replace(/\\\\\s*\n/g, '\\\\ ');
  converted = converted.replace(/<(?!\\)/g, '\\lt ').replace(/>(?!\\)/g, '\\gt ');
  return converted.trim();
};

interface MathFieldElement extends HTMLElement {
  executeCommand: (command: string | string[], ...args: any[]) => void;
  getValue: (format?: string) => string;
  setValue: (value: string) => void;
  focus: () => void;
  defaultMode: string;
  smartMode: boolean;
  smartFence: boolean;
  smartSuperscript: boolean;
  mathVirtualKeyboardPolicy: string;
  autoOperatorNames?: string[];
  autoCommands?: string[];
  inlineShortcuts?: any;
  mode?: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': React.DetailedHTMLProps<React.HTMLAttributes<MathFieldElement>, MathFieldElement> & {
        'default-mode'?: string;
        'virtual-keyboard-mode'?: string;
        'smart-mode'?: string;
        'smart-fence'?: string;
        'smart-superscript'?: string;
        'auto-operator-names'?: string;
        'auto-commands'?: string;
        'inline-shortcuts'?: string;
        onKeyDown?: React.KeyboardEventHandler<MathFieldElement>;
      };
    }
  }
}

interface MathEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  showToolbar?: boolean;
  compact?: boolean;
  defaultMode?: 'text' | 'math';
}

function MathEditorV2({ 
  value, 
  onChange, 
  placeholder = '',
  showToolbar = true,
  compact = false,
  defaultMode = 'text'
}: MathEditorProps) {
  const safeValue = value ?? '';
  const mfRef = useRef<MathFieldElement>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const isControlledRef = useRef(false);
  const isFocusedRef = useRef(false);

  // Stable ref for onChange — always points to latest, never triggers re-registration
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const [currentMode, setCurrentMode] = useState<'text' | 'math'>(defaultMode);

  const syncMode = () => {
    const mf = mfRef.current;
    if (!mf) return;
    const live = (mf.mode as string) ?? 'text';
    const normalized: 'text' | 'math' = live === 'math' ? 'math' : 'text';
    setCurrentMode(prev => prev !== normalized ? normalized : prev);
  };

  const applyMode = (mode: 'text' | 'math') => {
    const mf = mfRef.current;
    if (!mf) return;
    mf.defaultMode = mode;
    try {
      mf.executeCommand(['switchMode', mode]);
    } catch (_) {}
    setCurrentMode(mode);
    mf.focus();
  };

  const toggleMode = () => {
    applyMode(currentMode === 'text' ? 'math' : 'text');
  };

  // Value sync — skips update while the user is actively focused to prevent stomping mid-type
  useEffect(() => {
    const mf = mfRef.current;
    if (!mf) return;

    // Don't overwrite what the user is actively typing
    if (isFocusedRef.current) return;

    const currentValue = mf.getValue('latex');
    let cleanValue = safeValue;
    if (cleanValue === '""' || cleanValue === "''") cleanValue = '';
    cleanValue = convertDollarSignsToLatex(cleanValue);

    if (currentValue !== cleanValue) {
      mf.setValue(cleanValue);
      isControlledRef.current = true;
    }
  }, [safeValue]);

  // Initialize math-field — empty deps so it only ever runs once
  useEffect(() => {
    const mf = mfRef.current;
    if (!mf) return;

    mf.defaultMode = defaultMode;
    mf.smartMode = false;
    mf.smartFence = false;
    mf.smartSuperscript = false;
    mf.mathVirtualKeyboardPolicy = 'manual';
    mf.autoOperatorNames = [];
    mf.autoCommands = [];
    mf.inlineShortcuts = {};

    const handleInput = (e: Event) => {
      let newValue = (e.target as MathFieldElement).getValue('latex');
      if (newValue === '""' || newValue === "''") newValue = '';
      // Normalize \lt / \gt back to < / > for clean storage
      newValue = newValue.replace(/\\lt\s?/g, '<').replace(/\\gt\s?/g, '>');
      if (onChangeRef.current && !isControlledRef.current) {
        onChangeRef.current(newValue);
      }
      isControlledRef.current = false;
    };

    const handleFocus = () => {
      isFocusedRef.current = true;
    };

    const handleBlur = () => {
      isFocusedRef.current = false;
    };

    mf.addEventListener('input', handleInput);
    mf.addEventListener('focus', handleFocus);
    mf.addEventListener('blur', handleBlur);
    mf.addEventListener('mode-change', syncMode);

    return () => {
      mf.removeEventListener('input', handleInput);
      mf.removeEventListener('focus', handleFocus);
      mf.removeEventListener('blur', handleBlur);
      mf.removeEventListener('mode-change', syncMode);
    };
  }, []); // ← empty: register once, never re-register

  const handleKeyDown = (e: React.KeyboardEvent<MathFieldElement>) => {
    if (!mfRef.current) return;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      mfRef.current.executeCommand('insert', '\\\\');
      applyMode(currentMode);
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

  const refocus = () => mfRef.current?.focus();

  const insert = (latexStr: string) => {
    mfRef.current?.executeCommand('insert', latexStr);
    refocus();
  };

  const insertWithPlaceholder = (latexStr: string) => {
    mfRef.current?.executeCommand('insert', latexStr);
    refocus();
  };

  const insertText = () => {
    const text = prompt('Enter text to insert:');
    if (text && mfRef.current) {
      mfRef.current.executeCommand('insert', `\\text{${text}}`);
      applyMode(currentMode);
      refocus();
    }
  };

  const toggleToolbar = () => setToolbarVisible(!toolbarVisible);

  const isMath = currentMode === 'math';

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

          <button
            type="button"
            onClick={toggleMode}
            className="mode-toggle"
            title={isMath ? 'Switch to text mode' : 'Switch to math mode'}
            style={{
              background: isMath ? '#4a90e2' : 'white',
              color: isMath ? 'white' : '#333',
              borderColor: isMath ? '#4a90e2' : '#ddd',
            }}
          >
            {isMath ? '∑ Math Mode' : 'Aa Text Mode'}
          </button>
        </div>
      )}

      <math-field
        ref={mfRef}
        default-mode={defaultMode}
        placeholder={placeholder}
        smart-mode="false"
        smart-fence="false"
        smart-superscript="false"
        virtual-keyboard-mode="manual"
        auto-operator-names=""
        auto-commands=""
        inline-shortcuts=""
        onKeyDown={handleKeyDown}
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