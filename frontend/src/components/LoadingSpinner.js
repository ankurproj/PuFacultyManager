import React from 'react';

function LoadingSpinner({
  size = '40px',
  color = '#667eea',
  backgroundColor = 'rgba(255, 255, 255, 0.9)',
  message = 'Loading...',
  overlay = true
}) {
  const spinnerStyle = {
    width: size,
    height: size,
    border: `4px solid rgba(102, 126, 234, 0.1)`,
    borderTop: `4px solid ${color}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '20px auto'
  };

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: backgroundColor,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(2px)'
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px'
  };

  const messageStyle = {
    marginTop: '15px',
    fontSize: '1.1rem',
    fontWeight: 500,
    color: '#374151',
    textAlign: 'center'
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .loading-pulse {
            animation: pulse 2s infinite;
          }

          @keyframes pulse {
            0% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0.6; }
          }
        `
      }} />

      {overlay ? (
        <div style={overlayStyle}>
          <div style={containerStyle}>
            <div style={spinnerStyle}></div>
            <div style={messageStyle} className="loading-pulse">
              {message}
            </div>
          </div>
        </div>
      ) : (
        <div style={containerStyle}>
          <div style={spinnerStyle}></div>
          <div style={messageStyle} className="loading-pulse">
            {message}
          </div>
        </div>
      )}
    </>
  );
}

export default LoadingSpinner;