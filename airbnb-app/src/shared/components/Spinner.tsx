// Simple animated spinner shown while listings are loading
export function Spinner() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 0',
      gap: 16,
    }}>
      {/* The spinning ring */}
      <div style={{
        width: 48,
        height: 48,
        border: '4px solid #f0f0f0',
        borderTop: '4px solid #ff5722',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: '#888', fontSize: 14, margin: 0 }}>
        Loading listings…
      </p>

      {/* Keyframe injected inline — no extra CSS file needed */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
