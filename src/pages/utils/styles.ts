import type { CSSProperties } from 'react';

// Modal and Layout Styles
export const modalOverlayStyle: CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 50,
};

export const modalContentStyle: CSSProperties = {
  backgroundColor: 'white',
  color: 'black',
  borderRadius: '8px',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  maxWidth: '900px',
  width: '95%',
  maxHeight: '90vh',
  overflowY: 'auto',
};

export const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px',
  borderBottom: '1px solid #e5e5e5',
};

export const headerTitleStyle: CSSProperties = {
  fontSize: '20px',
  fontWeight: '600',
  margin: 0,
  color: 'black',
};

export const closeButtonStyle: CSSProperties = {
  padding: '4px',
  border: 'none',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  borderRadius: '4px',
};

// Tab Styles
export const tabContainerStyle: CSSProperties = {
  display: 'flex',
  borderBottom: '1px solid #e5e5e5',
  backgroundColor: '#f9f9f9',
};

export const tabButtonStyle = (isActive: boolean): CSSProperties => ({
  padding: '12px 16px',
  border: 'none',
  backgroundColor: isActive ? 'white' : 'transparent',
  borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent',
  cursor: 'pointer',
  color: 'black',
});

// Input Styles
export const searchInputStyle: CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  fontSize: '14px',
  color: 'black',
};

export const customInputStyle: CSSProperties = {
  width: '100%',
  padding: '12px',
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  fontSize: '14px',
  fontFamily: 'Monaco, Consolas, monospace',
  color: 'black',
};

// Grid Styles
export const symbolGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
  gap: '12px',
};

export const quickSymbolGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
  gap: '6px',
  maxHeight: '120px',
  overflowY: 'auto',
  padding: '8px',
  backgroundColor: 'white',
  border: '1px solid #e5e5e5',
  borderRadius: '6px',
};

export const componentGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
  gap: '8px',
};

// Button Styles
export const symbolButtonStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '12px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  backgroundColor: 'white',
  color: 'black',
  cursor: 'pointer',
  textAlign: 'center',
  transition: 'all 0.2s',
};

export const quickSymbolButtonStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '6px 4px',
  border: '1px solid #e5e5e5',
  borderRadius: '4px',
  backgroundColor: 'white',
  cursor: 'pointer',
  color: 'black',
  fontSize: '12px',
  minHeight: '45px',
  justifyContent: 'center',
  transition: 'all 0.2s',
};

export const componentButtonStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '10px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  backgroundColor: 'white',
  cursor: 'pointer',
  color: 'black',
  transition: 'all 0.2s',
};

export const templateButtonStyle: CSSProperties = {
  padding: '8px 12px',
  border: '1px solid #10b981',
  borderRadius: '6px',
  backgroundColor: '#f0fdf4',
  cursor: 'pointer',
  color: '#065f46',
  fontSize: '12px',
  fontWeight: '500',
};

export const clearButtonStyle: CSSProperties = {
  padding: '8px 12px',
  border: '1px solid #ef4444',
  borderRadius: '6px',
  backgroundColor: '#fef2f2',
  cursor: 'pointer',
  color: '#dc2626',
  fontSize: '12px',
  fontWeight: '500',
};

// Node Styles
export const nodeContainerStyle = (isSelected: boolean, isEditingContext: boolean): CSSProperties => ({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  margin: '4px',
  padding: '8px',
  border: isSelected ? '3px solid #3b82f6' : '2px solid #e5e5e5',
  borderRadius: '6px',
  background: isEditingContext ? '#e0f2fe' : 'white',
  boxShadow: isSelected ? '0 0 0 3px rgba(59, 130, 246, 0.2)' : 'none',
  minWidth: '60px',
  minHeight: '50px',
});

export const removeButtonStyle = (visible: boolean): CSSProperties => ({
  position: 'absolute',
  top: '-10px',
  right: '-10px',
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  background: '#ef4444',
  color: 'white',
  border: 'none',
  fontSize: '12px',
  lineHeight: '1',
  cursor: 'pointer',
  display: visible ? 'block' : 'none',
  fontWeight: 'bold',
});

export const contextButtonStyle: CSSProperties = {
  padding: '4px 8px',
  fontSize: '12px',
  margin: '2px',
  background: '#dbeafe',
  border: '1px solid #93c5fd',
  borderRadius: '4px',
  cursor: 'pointer',
  color: '#1e40af',
  fontWeight: 'bold',
};

export const textInputStyle = (width: number): CSSProperties => ({
  border: 'none',
  outline: 'none',
  background: 'transparent',
  minWidth: '60px',
  width: `${width}px`,
  fontSize: '16px',
  color: 'black',
  textAlign: 'center',
  padding: '4px',
});

// Fraction Styles
export const fractionPartStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  minWidth: '80px',
  minHeight: '40px',
  padding: '4px 8px',
  justifyContent: 'center',
  background: '#f8f9fa',
  border: '1px solid #dee2e6',
  borderRadius: '4px',
};

export const fractionLineStyle: CSSProperties = {
  width: '100%',
  minWidth: '80px',
  height: '3px',
  background: '#000',
  margin: '2px 0',
};

// Square Root Styles
export const sqrtSymbolStyle: CSSProperties = {
  fontSize: '32px',
  fontWeight: 'bold',
  marginRight: '4px',
  color: 'black',
  lineHeight: '1',
  display: 'inline-block',
  height: '1em',        // trims vertical tail
  overflow: 'hidden',   // hides the part below baseline
  position: 'relative',
  top: '0.05em',        // fine-tune vertical alignment
};


export const sqrtContentStyle: CSSProperties = {
  borderTop: '3px solid #000',
  padding: '8px 12px 4px 12px',
  minWidth: '60px',
  minHeight: '40px',
  display: 'flex',
  alignItems: 'center',
  background: '#f8f9fa',
  borderLeft: '1px solid #dee2e6',
  borderRight: '1px solid #dee2e6',
  borderBottom: '1px solid #dee2e6',
  borderRadius: '0 0 4px 4px',
};

// Power and Subscript Styles
export const exponentStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  fontSize: '14px',
  minHeight: '30px',
  minWidth: '60px',
  padding: '4px 8px',
  background: '#fff3cd',
  border: '1px solid #ffeaa7',
  borderRadius: '4px',
  marginBottom: '4px',
};

export const baseStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  fontSize: '16px',
  minHeight: '35px',
  minWidth: '60px',
  padding: '4px 8px',
  background: '#f8f9fa',
  border: '1px solid #dee2e6',
  borderRadius: '4px',
};

export const subscriptStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  fontSize: '14px',
  minHeight: '30px',
  minWidth: '60px',
  padding: '4px 8px',
  background: '#e3f2fd',
  border: '1px solid #90caf9',
  borderRadius: '4px',
};

// Sum Styles
export const sumSymbolStyle: CSSProperties = {
  fontSize: '36px',
  fontWeight: 'bold',
  color: 'black',
  lineHeight: '1',
  margin: '4px 0',
};

export const sumLimitStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  fontSize: '12px',
  minWidth: '60px',
  minHeight: '25px',
  padding: '4px 8px',
  background: '#fff3cd',
  border: '1px solid #ffeaa7',
  borderRadius: '4px',
};

export const sumLowerLimitStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  fontSize: '12px',
  minWidth: '60px',
  minHeight: '25px',
  padding: '4px 8px',
  background: '#e3f2fd',
  border: '1px solid #90caf9',
  borderRadius: '4px',
};

export const sumIntegrandStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  minWidth: '80px',
  minHeight: '40px',
  padding: '8px 12px',
  background: '#f8f9fa',
  border: '1px solid #dee2e6',
  borderRadius: '4px',
};

// Section Styles
export const sectionStyle: CSSProperties = {
  padding: '16px',
  borderBottom: '1px solid #e5e5e5',
  backgroundColor: '#f9f9f9',
};

export const sectionTitleStyle: CSSProperties = {
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 8px 0',
  color: 'black',
};

export const expressionBuilderStyle: CSSProperties = {
  minHeight: '200px',
  border: '2px dashed #d1d5db',
  borderRadius: '8px',
  padding: '20px',
  backgroundColor: '#f9f9f9',
};

export const expressionContainerStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '12px',
};

export const emptyStateStyle: CSSProperties = {
  color: '#666',
  fontStyle: 'italic',
  textAlign: 'center',
  width: '100%',
  padding: '40px',
};

export const latexPreviewStyle: CSSProperties = {
  backgroundColor: '#1f2937',
  padding: '12px',
  borderRadius: '6px',
  fontFamily: 'Monaco, Consolas, monospace',
  fontSize: '14px',
  wordBreak: 'break-all',
  color: '#f3f4f6',
  border: '1px solid #374151',
};

export const editingContextStyle: CSSProperties = {
  padding: '10px',
  backgroundColor: '#dbeafe',
  borderRadius: '6px',
  border: '1px solid #93c5fd',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

export const editingContextTextStyle: CSSProperties = {
  fontSize: '14px',
  color: '#1e40af',
  fontWeight: '500',
};

export const exitContextButtonStyle: CSSProperties = {
  padding: '4px 8px',
  background: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px',
};

// Footer Styles
export const footerStyle: CSSProperties = {
  padding: '16px',
  borderTop: '1px solid #e5e5e5',
  backgroundColor: '#f9f9f9',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

export const footerTextStyle: CSSProperties = {
  fontSize: '14px',
  color: '#666',
  margin: 0,
};

export const footerButtonContainerStyle: CSSProperties = {
  display: 'flex',
  gap: '8px',
};

export const cancelButtonStyle: CSSProperties = {
  padding: '8px 16px',
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  backgroundColor: 'white',
  cursor: 'pointer',
  color: 'black',
};

export const insertButtonStyle = (disabled: boolean): CSSProperties => ({
  padding: '8px 16px',
  backgroundColor: disabled ? '#9ca3af' : '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: disabled ? 'not-allowed' : 'pointer',
});