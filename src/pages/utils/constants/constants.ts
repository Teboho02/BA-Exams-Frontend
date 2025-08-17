// Symbol data interface (defined locally to avoid import issues)
interface SymbolData {
  symbol: string;
  latex?: string;
  content?: string;
  name: string;
}

// Simplified symbol set focused on essential math operations
export const ESSENTIAL_SYMBOLS: SymbolData[] = [
  { symbol: '√', latex: '\\sqrt{}', name: 'Square Root' },
  { symbol: 'x²', latex: 'x^{2}', name: 'Superscript' },
  { symbol: 'x₁', latex: 'x_{1}', name: 'Subscript' },
  { symbol: '½', latex: '\\frac{1}{2}', name: 'Fraction' },
  { symbol: '∑', latex: '\\sum', name: 'Sum' },
  { symbol: '<', latex: '<', name: 'Less Than' },
  { symbol: '>', latex: '>', name: 'Greater Than' },
  { symbol: '≈', latex: '\\approx', name: 'Approximately' },
  { symbol: '∞', latex: '\\infty', name: 'Infinity' },
  { symbol: '±', latex: '\\pm', name: 'Plus/Minus' },
  { symbol: '=', latex: '=', name: 'Equals' },
  { symbol: '+', latex: '+', name: 'Plus' },
  { symbol: '−', latex: '-', name: 'Minus' },
];

// Quick symbols for the visual builder
export const QUICK_SYMBOLS: SymbolData[] = [
  { symbol: '±', content: '±', name: 'Plus/Minus' },
  { symbol: '=', content: '=', name: 'Equals' },
  { symbol: '+', content: '+', name: 'Plus' },
  { symbol: '−', content: '−', name: 'Minus' },
  { symbol: '×', content: '×', name: 'Multiply' },
  { symbol: '÷', content: '÷', name: 'Divide' },
  { symbol: '≤', content: '≤', name: 'Less/Equal' },
  { symbol: '≥', content: '≥', name: 'Greater/Equal' },
  { symbol: '≠', content: '≠', name: 'Not Equal' },
  { symbol: '∞', content: '∞', name: 'Infinity' },
  { symbol: 'π', content: 'π', name: 'Pi' },
  { symbol: 'α', content: 'α', name: 'Alpha' },
  { symbol: 'β', content: 'β', name: 'Beta' },
  { symbol: 'θ', content: 'θ', name: 'Theta' },
  { symbol: 'Δ', content: 'Δ', name: 'Delta' },
  { symbol: '∈', content: '∈', name: 'Element of' },
];