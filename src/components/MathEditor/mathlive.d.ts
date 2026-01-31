// mathlive.d.ts
interface MathFieldElement extends HTMLElement {
  executeCommand: (command: string, ...args: string[]) => void;
  getValue(): string;
  setValue(value: string): void;
  focus(): void; // Add focus method
  defaultMode: 'math' | 'text' | 'inline-math';
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': React.DetailedHTMLProps<
        React.HTMLAttributes<MathFieldElement> & {
          ref?: React.Ref<MathFieldElement>;
          'default-mode'?: 'math' | 'text' | 'inline-math';
          'virtual-keyboard-mode'?: 'manual' | 'onfocus' | 'off'; // Add this
        },
        MathFieldElement
      >;
    }
  }
}
export {};