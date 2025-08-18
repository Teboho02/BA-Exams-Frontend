// Symbol data interface (defined locally to avoid import issues)
interface SymbolData {
  symbol: string;
  latex?: string;
  content?: string;
  name: string;
}

// Comprehensive symbol set for Grade 12 Mathematics and Physical Sciences
export const ESSENTIAL_SYMBOLS: SymbolData[] = [
  // Basic Math Operations
  { symbol: '√', latex: '\\sqrt{}', name: 'Square Root' },
  { symbol: '∛', latex: '\\sqrt[3]{}', name: 'Cube Root' },
  { symbol: 'x²', latex: 'x^{2}', name: 'Superscript' },
  { symbol: 'x³', latex: 'x^{3}', name: 'Cube' },
  { symbol: 'xⁿ', latex: 'x^{n}', name: 'Power' },
  { symbol: 'x₁', latex: 'x_{1}', name: 'Subscript' },
  { symbol: '½', latex: '\\frac{1}{2}', name: 'Fraction' },
  { symbol: '¼', latex: '\\frac{1}{4}', name: 'Quarter' },
  { symbol: '¾', latex: '\\frac{3}{4}', name: 'Three Quarters' },
  
  // Summation and Products
  { symbol: '∑', latex: '\\sum', name: 'Sum' },
  { symbol: '∏', latex: '\\prod', name: 'Product' },
  { symbol: '∫', latex: '\\int', name: 'Integral' },
  { symbol: '∂', latex: '\\partial', name: 'Partial Derivative' },
  
  // Comparisons
  { symbol: '<', latex: '<', name: 'Less Than' },
  { symbol: '>', latex: '>', name: 'Greater Than' },
  { symbol: '≤', latex: '\\leq', name: 'Less Than or Equal' },
  { symbol: '≥', latex: '\\geq', name: 'Greater Than or Equal' },
  { symbol: '≠', latex: '\\neq', name: 'Not Equal' },
  { symbol: '≈', latex: '\\approx', name: 'Approximately' },
  { symbol: '≡', latex: '\\equiv', name: 'Identical To' },
  { symbol: '∝', latex: '\\propto', name: 'Proportional To' },
  
  // Special Numbers and Constants
  { symbol: '∞', latex: '\\infty', name: 'Infinity' },
  { symbol: 'π', latex: '\\pi', name: 'Pi' },
  { symbol: 'e', latex: 'e', name: 'Euler\'s Number' },
  { symbol: 'i', latex: 'i', name: 'Imaginary Unit' },
  
  // Operations
  { symbol: '±', latex: '\\pm', name: 'Plus/Minus' },
  { symbol: '∓', latex: '\\mp', name: 'Minus/Plus' },
  { symbol: '×', latex: '\\times', name: 'Multiply' },
  { symbol: '÷', latex: '\\div', name: 'Divide' },
  { symbol: '·', latex: '\\cdot', name: 'Dot Product' },
  { symbol: '=', latex: '=', name: 'Equals' },
  { symbol: '+', latex: '+', name: 'Plus' },
  { symbol: '−', latex: '-', name: 'Minus' },
  
  // Units and Measurements
  { symbol: '°', latex: '^\\circ', name: 'Degree' },
  { symbol: '°C', latex: '^\\circ C', name: 'Celsius' },
  { symbol: '°F', latex: '^\\circ F', name: 'Fahrenheit' },
  { symbol: 'K', latex: 'K', name: 'Kelvin' },
  { symbol: '%', latex: '\\%', name: 'Percent' },
  { symbol: '‰', latex: '\\permille', name: 'Per Mille' },
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