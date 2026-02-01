import Image from "next/image";
import Scanner from "./components/Scanner";
import SavedLibrary from "./components/SavedLibrary";

export default function Home() {
  return (
    <main className="container" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
      <div style={{ textAlign: 'center', marginBottom: '80px', position: 'relative' }}>
        {/* Ambient Glow */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '200px',
          height: '100px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        <h1 style={{
          fontSize: '4rem',
          fontWeight: 800,
          background: 'linear-gradient(180deg, #fff 0%, #a1a1aa 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: '0 0 24px 0',
          letterSpacing: '-0.04em',
          position: 'relative',
          zIndex: 1,
          filter: 'drop-shadow(0 2px 20px rgba(255,255,255,0.2))'
        }}>
          PromptScanner
        </h1>

        <div style={{
          display: 'inline-block',
          padding: '12px 32px',
          borderRadius: '999px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          position: 'relative',
          zIndex: 1
        }}>
          <p style={{
            fontSize: '1.05rem',
            color: 'var(--text-secondary)',
            margin: 0,
            letterSpacing: '0.01em',
            lineHeight: '1.5'
          }}>
            Instantly extract potential AI prompts from any image.<br />
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Capture, Edit, Save, and Share.</span>
          </p>
        </div>
      </div>

      <Scanner />
      <SavedLibrary />
    </main>
  );
}
