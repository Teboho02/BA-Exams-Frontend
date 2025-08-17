import React from 'react';
import { ESSENTIAL_SYMBOLS } from './constants/constants';
import { searchInputStyle, symbolGridStyle, symbolButtonStyle } from './styles';

interface SymbolPickerProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  onSymbolClick: (symbol: string, latex: string) => void;
}

const SymbolPicker: React.FC<SymbolPickerProps> = ({
  searchTerm,
  setSearchTerm,
  onSymbolClick,
}) => {
  // Filter symbols based on search
  const getFilteredSymbols = () => {
    if (!searchTerm) return ESSENTIAL_SYMBOLS;
    const term = searchTerm.toLowerCase();
    return ESSENTIAL_SYMBOLS.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.symbol.toLowerCase().includes(term) ||
        s.latex?.toLowerCase().includes(term)
    );
  };

  const symbols = getFilteredSymbols();

  return (
    <>
      {/* Search */}
      <div style={{ padding: '16px' }}>
        <input
          type="text"
          placeholder="Search symbols..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={searchInputStyle}
          autoFocus
        />
      </div>

      {/* Symbols Grid */}
      <div style={{ padding: '16px' }}>
        {symbols.length > 0 ? (
          <div style={symbolGridStyle}>
            {symbols.map((item, index) => (
              <button
                key={`${item.symbol}-${index}`}
                onClick={() => onSymbolClick(item.symbol, item.latex || item.symbol)}
                style={symbolButtonStyle}
                title={`${item.name} (LaTeX: ${item.latex || item.symbol})`}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <span style={{ fontSize: '20px', marginBottom: '6px', color: 'black' }}>{item.symbol}</span>
                <span style={{ fontSize: '11px', color: '#666', fontWeight: '500' }}>{item.name}</span>
              </button>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
            No symbols found matching "{searchTerm}"
          </div>
        )}
      </div>
    </>
  );
};

export default SymbolPicker;