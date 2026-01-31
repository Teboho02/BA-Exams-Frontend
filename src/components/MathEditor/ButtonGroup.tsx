//ButtonGroup.tsx
import React from "react";

interface ButtonItem {
  latex?: string;
  title: string;
  label: string;
  placeholder?: boolean;
  type?: string;
  action?: string;
  className?: string;
}

interface ButtonGroupProps {
  buttons: ButtonItem[];
  onInsert: (latex: string) => void;
  onInsertWithPlaceholder: (latex: string) => void;
  onInsertText?: () => void;
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({
  buttons,
  onInsert,
  onInsertWithPlaceholder,
  onInsertText,
}) => {
  const handleClick = (button: ButtonItem) => {
    if (button.type === 'custom' && button.action === 'insertText') {
      onInsertText?.();
    } else if (button.latex) {
      if (button.placeholder) {
        onInsertWithPlaceholder(button.latex);
      } else {
        onInsert(button.latex);
      }
    }
  };

  return (
    <div className="buttons">
      {buttons.map((button, index) => (
        <button
          key={index}
          onClick={() => handleClick(button)}
          title={button.title}
          className={button.className}
        >
          {button.label}
        </button>
      ))}
    </div>
  );
};

export default ButtonGroup;