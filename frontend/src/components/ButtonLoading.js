import React from 'react';

function ButtonLoading({ size = '16px', color = '#fff' }) {
  const spinnerStyle = {
    width: size,
    height: size,
    border: `2px solid rgba(255, 255, 255, 0.3)`,
    borderTop: `2px solid ${color}`,
    borderRadius: '50%',
    animation: 'buttonSpin 0.8s linear infinite',
    display: 'inline-block',
    marginRight: '8px'
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes buttonSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
      }} />
      <div style={spinnerStyle}></div>
    </>
  );
}

export default ButtonLoading;