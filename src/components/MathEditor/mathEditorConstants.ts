// mathEditorConstants.ts

export interface Tab {
  label: string;
  title: string;
}

export interface ButtonConfig {
  onClick: string | (() => void);
  title: string;
  label: string;
  className?: string;
}

export const tabs: Tab[] = [
  { label: "±×÷", title: "Basic Operations" },
  { label: "≈≤≥", title: "Relations & Comparison" },
  { label: "→←↔", title: "Arrows" },
  { label: "αβγ", title: "Greek (lowercase)" },
  { label: "ΓΔΘ", title: "Greek (uppercase)" },
  { label: "∈⊂∪", title: "Set Theory & Logic" },
  { label: "∫∑∏", title: "Calculus" },
  { label: "√^₂", title: "Structures" },
  { label: "( )[ ]", title: "Brackets" },
  { label: "sin cos", title: "Trig & Functions" },
  { label: "∠⊥∥", title: "Misc" },
  { label: "Abc", title: "Text" },
];

// Basic Operations
export const basicOperations = [
  { latex: '+', title: "Plus", label: "+" },
  { latex: '-', title: "Minus", label: "−" },
  { latex: '\\times', title: "Multiply", label: "×" },
  { latex: '\\div', title: "Divide", label: "÷" },
  { latex: '\\cdot', title: "Dot", label: "·" },
  { latex: '/', title: "Slash", label: "/" },
  { latex: '\\pm', title: "Plus-minus", label: "±" },
  { latex: '\\mp', title: "Minus-plus", label: "∓" },
  { latex: '\\ast', title: "Asterisk", label: "∗" },
  { latex: '\\circ', title: "Circle", label: "∘" },
];

// Relations
export const relations = [
  { latex: '=', title: "Equals", label: "=" },
  { latex: '\\equiv', title: "Equivalent", label: "≡" },
  { latex: '\\approx', title: "Approximately", label: "≈" },
  { latex: '\\cong', title: "Congruent", label: "≅" },
  { latex: '\\sim', title: "Similar", label: "∼" },
  { latex: '\\simeq', title: "Similar equal", label: "≃" },
  { latex: '\\neq', title: "Not equal", label: "≠" },
  { latex: '\\nequiv', title: "Not equivalent", label: "≢" },
  { latex: '\\propto', title: "Proportional", label: "∝" },
  { latex: '<', title: "Less than", label: "<" },
  { latex: '>', title: "Greater than", label: ">" },
  { latex: '\\leq', title: "Less or equal", label: "≤" },
  { latex: '\\geq', title: "Greater or equal", label: "≥" },
  { latex: '\\ll', title: "Much less", label: "≪" },
  { latex: '\\gg', title: "Much greater", label: "≫" },
  { latex: '\\prec', title: "Precedes", label: "≺" },
  { latex: '\\succ', title: "Succeeds", label: "≻" },
  { latex: '\\preceq', title: "Precedes or equals", label: "⪯" },
  { latex: '\\succeq', title: "Succeeds or equals", label: "⪰" },
];

// Arrows
export const arrows = [
  { latex: '\\leftarrow', title: "Left arrow", label: "←", placeholder: false },
  { latex: '\\rightarrow', title: "Right arrow", label: "→", placeholder: false },
  { latex: '\\leftrightarrow', title: "Left-right arrow", label: "↔", placeholder: false },
  { latex: '\\Leftarrow', title: "Double left arrow", label: "⇐", placeholder: false },
  { latex: '\\Rightarrow', title: "Double right arrow", label: "⇒", placeholder: false },
  { latex: '\\Leftrightarrow', title: "Double left-right arrow", label: "⇔", placeholder: false },
  { latex: '\\uparrow', title: "Up arrow", label: "↑", placeholder: false },
  { latex: '\\downarrow', title: "Down arrow", label: "↓", placeholder: false },
  { latex: '\\updownarrow', title: "Up-down arrow", label: "↕", placeholder: false },
  { latex: '\\nearrow', title: "NE arrow", label: "↗", placeholder: false },
  { latex: '\\searrow', title: "SE arrow", label: "↘", placeholder: false },
  { latex: '\\swarrow', title: "SW arrow", label: "↙", placeholder: false },
  { latex: '\\nwarrow', title: "NW arrow", label: "↖", placeholder: false },
  { latex: '\\mapsto', title: "Maps to", label: "↦", placeholder: false },
  { latex: '\\xrightarrow{#0}', title: "Right arrow with text above", label: "→͞", placeholder: true },
  { latex: '\\xleftarrow{#0}', title: "Left arrow with text above", label: "←͞", placeholder: true },
  { latex: '\\xrightarrow[#0]{}', title: "Right arrow with text below", label: "→̲", placeholder: true },
  { latex: '\\xleftarrow[#0]{}', title: "Left arrow with text below", label: "←̲", placeholder: true },
  { latex: '\\xrightarrow[#0]{#0}', title: "Right arrow with text above and below", label: "→̿", placeholder: true },
  { latex: '\\xleftarrow[#0]{#0}', title: "Left arrow with text above and below", label: "←̿", placeholder: true },
];

// Greek lowercase
export const greekLowercase = [
  { latex: '\\alpha', title: "Alpha", label: "α" },
  { latex: '\\beta', title: "Beta", label: "β" },
  { latex: '\\gamma', title: "Gamma", label: "γ" },
  { latex: '\\delta', title: "Delta", label: "δ" },
  { latex: '\\epsilon', title: "Epsilon", label: "ε" },
  { latex: '\\zeta', title: "Zeta", label: "ζ" },
  { latex: '\\eta', title: "Eta", label: "η" },
  { latex: '\\theta', title: "Theta", label: "θ" },
  { latex: '\\iota', title: "Iota", label: "ι" },
  { latex: '\\kappa', title: "Kappa", label: "κ" },
  { latex: '\\lambda', title: "Lambda", label: "λ" },
  { latex: '\\mu', title: "Mu", label: "μ" },
  { latex: '\\nu', title: "Nu", label: "ν" },
  { latex: '\\xi', title: "Xi", label: "ξ" },
  { latex: '\\omicron', title: "Omicron", label: "ο" },
  { latex: '\\pi', title: "Pi", label: "π" },
  { latex: '\\rho', title: "Rho", label: "ρ" },
  { latex: '\\sigma', title: "Sigma", label: "σ" },
  { latex: '\\tau', title: "Tau", label: "τ" },
  { latex: '\\upsilon', title: "Upsilon", label: "υ" },
  { latex: '\\phi', title: "Phi", label: "φ" },
  { latex: '\\varphi', title: "Var phi", label: "ϕ" },
  { latex: '\\chi', title: "Chi", label: "χ" },
  { latex: '\\psi', title: "Psi", label: "ψ" },
  { latex: '\\omega', title: "Omega", label: "ω" },
];

// Greek uppercase
export const greekUppercase = [
  { latex: '\\Gamma', title: "Gamma", label: "Γ" },
  { latex: '\\Delta', title: "Delta", label: "Δ" },
  { latex: '\\Theta', title: "Theta", label: "Θ" },
  { latex: '\\Lambda', title: "Lambda", label: "Λ" },
  { latex: '\\Xi', title: "Xi", label: "Ξ" },
  { latex: '\\Pi', title: "Pi", label: "Π" },
  { latex: '\\Sigma', title: "Sigma", label: "Σ" },
  { latex: '\\Upsilon', title: "Upsilon", label: "Υ" },
  { latex: '\\Phi', title: "Phi", label: "Φ" },
  { latex: '\\Psi', title: "Psi", label: "Ψ" },
  { latex: '\\Omega', title: "Omega", label: "Ω" },
];

// Set Theory
export const setTheory = [
  { latex: '\\in', title: "Element of", label: "∈" },
  { latex: '\\notin', title: "Not element of", label: "∉" },
  { latex: '\\ni', title: "Contains", label: "∋" },
  { latex: '\\subset', title: "Subset", label: "⊂" },
  { latex: '\\supset', title: "Superset", label: "⊃" },
  { latex: '\\subseteq', title: "Subset or equal", label: "⊆" },
  { latex: '\\supseteq', title: "Superset or equal", label: "⊇" },
  { latex: '\\cup', title: "Union", label: "∪" },
  { latex: '\\cap', title: "Intersection", label: "∩" },
  { latex: '\\emptyset', title: "Empty set", label: "∅" },
  { latex: '\\varnothing', title: "Empty set (var)", label: "⌀" },
  { latex: '\\forall', title: "For all", label: "∀" },
  { latex: '\\exists', title: "Exists", label: "∃" },
  { latex: '\\nexists', title: "Not exists", label: "∄" },
  { latex: '\\neg', title: "Not", label: "¬" },
  { latex: '\\wedge', title: "And", label: "∧" },
  { latex: '\\vee', title: "Or", label: "∨" },
];

// Calculus
export const calculus = [
  { latex: '\\infty', title: "Infinity", label: "∞", placeholder: false },
  { latex: '\\partial', title: "Partial", label: "∂", placeholder: false },
  { latex: '\\nabla', title: "Nabla", label: "∇", placeholder: false },
  { latex: '\\int_{#0}^{#0}#0', title: "Integral", label: "∫", placeholder: true },
  { latex: '\\iint', title: "Double integral", label: "∬", placeholder: true },
  { latex: '\\iiint', title: "Triple integral", label: "∭", placeholder: true },
  { latex: '\\oint', title: "Contour integral", label: "∮", placeholder: true },
  { latex: '\\sum_{#0}^{#0}#0', title: "Sum", label: "∑", placeholder: true },
  { latex: '\\prod_{#0}^{#0}#0', title: "Product", label: "∏", placeholder: true },
  { latex: '\\lim_{#0}', title: "Limit", label: "lim", placeholder: true },
  { latex: '\\to', title: "To", label: "→", placeholder: false },
];

// Structures
export const structures = [
  { latex: '\\frac{#0}{#0}', title: "Fraction", label: "a/b", placeholder: true },
  { latex: '\\sqrt{#0}', title: "Square root", label: "√", placeholder: true },
  { latex: '\\sqrt[3]{#0}', title: "Cube root", label: "∛", placeholder: true },
  { latex: '\\sqrt[#0]{#0}', title: "Nth root", label: "ⁿ√", placeholder: true },
  { latex: '^{#0}', title: "Superscript", label: "x²", placeholder: true },
  { latex: '_{#0}', title: "Subscript", label: "x₁", placeholder: true },
  { latex: '\\binom{#0}{#0}', title: "Binomial", label: "(ⁿₖ)", placeholder: true },
  { latex: '^\\circ', title: "Degree", label: "°", placeholder: false },
  { latex: '\\overline{#0}', title: "Overline", label: "x̄", placeholder: true },
  { latex: '\\underline{#0}', title: "Underline", label: "x̲", placeholder: true },
  { latex: '\\hat{#0}', title: "Hat", label: "x̂", placeholder: true },
  { latex: '\\vec{#0}', title: "Vector", label: "x⃗", placeholder: true },
  { latex: '\\dot{#0}', title: "Dot", label: "ẋ", placeholder: true },
  { latex: '\\ddot{#0}', title: "Double dot", label: "ẍ", placeholder: true },
];

// Brackets
export const brackets = [
  { latex: '()', title: "Parentheses", label: "( )", placeholder: false },
  { latex: '[]', title: "Brackets", label: "[ ]", placeholder: false },
  { latex: '\\{\\}', title: "Braces", label: "{ }", placeholder: false },
  { latex: '\\langle\\rangle', title: "Angle brackets", label: "⟨ ⟩", placeholder: false },
  { latex: '|', title: "Vertical bar", label: "|", placeholder: false },
  { latex: '\\|', title: "Double bar", label: "‖", placeholder: false },
  { latex: '\\left(#0\\right)', title: "Auto-sized parentheses", label: "(  )", placeholder: true },
  { latex: '\\left[#0\\right]', title: "Auto-sized brackets", label: "[  ]", placeholder: true },
  { latex: '\\left\\{#0\\right\\}', title: "Auto-sized braces", label: "{  }", placeholder: true },
];

// Trig Functions
export const trigFunctions = [
  { latex: '\\sin(#0)', title: "Sine", label: "sin", placeholder: true },
  { latex: '\\cos(#0)', title: "Cosine", label: "cos", placeholder: true },
  { latex: '\\tan(#0)', title: "Tangent", label: "tan", placeholder: true },
  { latex: '\\cot(#0)', title: "Cotangent", label: "cot", placeholder: true },
  { latex: '\\sec(#0)', title: "Secant", label: "sec", placeholder: true },
  { latex: '\\csc(#0)', title: "Cosecant", label: "csc", placeholder: true },
  { latex: '\\arcsin(#0)', title: "Arcsine", label: "arcsin", placeholder: true },
  { latex: '\\arccos(#0)', title: "Arccosine", label: "arccos", placeholder: true },
  { latex: '\\arctan(#0)', title: "Arctangent", label: "arctan", placeholder: true },
  { latex: '\\sinh(#0)', title: "Hyperbolic sine", label: "sinh", placeholder: true },
  { latex: '\\cosh(#0)', title: "Hyperbolic cosine", label: "cosh", placeholder: true },
  { latex: '\\tanh(#0)', title: "Hyperbolic tangent", label: "tanh", placeholder: true },
  { latex: '\\log(#0)', title: "Logarithm", label: "log", placeholder: true },
  { latex: '\\log_{#0}(#0)', title: "Log base", label: "log_b", placeholder: true },
  { latex: '\\ln(#0)', title: "Natural log", label: "ln", placeholder: true },
  { latex: '\\exp(#0)', title: "Exponential", label: "exp", placeholder: true },
];

// Misc
export const misc = [
  { latex: '\\therefore', title: "Therefore", label: "∴" },
  { latex: '\\because', title: "Because", label: "∵" },
  { latex: '\\angle', title: "Angle", label: "∠" },
  { latex: '\\measuredangle', title: "Measured angle", label: "∡" },
  { latex: '\\perp', title: "Perpendicular", label: "⊥" },
  { latex: '\\parallel', title: "Parallel", label: "∥" },
  { latex: '\\triangle', title: "Triangle", label: "△" },
  { latex: '\\square', title: "Square", label: "□" },
  { latex: '\\blacksquare', title: "Black square", label: "■" },
  { latex: '\\circ', title: "Circle", label: "○" },
  { latex: '\\bullet', title: "Bullet", label: "•" },
  { latex: '\\cdots', title: "Center dots", label: "⋯" },
  { latex: '\\ldots', title: "Lower dots", label: "…" },
  { latex: '\\vdots', title: "Vertical dots", label: "⋮" },
  { latex: '\\ddots', title: "Diagonal dots", label: "⋱" },
  { latex: '\\aleph', title: "Aleph", label: "ℵ" },
  { latex: '\\hbar', title: "H-bar", label: "ℏ" },
  { latex: '\\ell', title: "Script l", label: "ℓ" },
];

// Text operations - these are special and need custom handlers
export const textOperations = [
  { type: 'custom', action: 'insertText', title: "Insert text", label: "Insert Text", className: "btn-text" },
  { latex: '\\\\', title: "New line", label: "New Line", className: "btn-text", placeholder: false },
  { latex: '\\quad', title: "Space", label: "Space", className: "btn-text", placeholder: false },
  { latex: '\\qquad', title: "Double space", label: "2× Space", className: "btn-text", placeholder: false },
];

// Array of all button groups for easy iteration
export const allButtonGroups = [
  basicOperations,
  relations,
  arrows,
  greekLowercase,
  greekUppercase,
  setTheory,
  calculus,
  structures,
  brackets,
  trigFunctions,
  misc,
  textOperations,
];