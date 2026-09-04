import { ImageResponse } from 'next/og';

export const alt = 'SlashSaaS — Something New Is Coming';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000000',
          backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(140, 224, 74, 0.18), transparent 70%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
          padding: '60px',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <svg
            width="64"
            height="64"
            viewBox="0 0 100 100"
            fill="none"
          >
            <path
              d="M32 20 C32 38 18 50 4 50 C18 50 32 62 32 80 C32 62 46 50 60 50 C46 50 32 38 32 20 Z"
              fill="#8ce04a"
            />
            <path
              d="M68 20 C68 38 54 50 40 50 C54 50 68 62 68 80 C68 62 82 50 96 50 C82 50 68 38 68 20 Z"
              fill="#a3e635"
            />
          </svg>
          <span
            style={{
              fontSize: '44px',
              fontWeight: 900,
              letterSpacing: '-1px',
            }}
          >
            SlashSaaS
          </span>
        </div>

        <div
          style={{
            fontSize: '56px',
            fontWeight: 800,
            textAlign: 'center',
            maxWidth: '1000px',
            lineHeight: 1.15,
            letterSpacing: '-1.5px',
            marginBottom: '24px',
          }}
        >
          Something New Is Coming.
        </div>

        <div
          style={{
            fontSize: '24px',
            color: '#a1a1aa',
            textAlign: 'center',
            maxWidth: '850px',
            marginBottom: '40px',
          }}
        >
          Engineered for modern teams. Lightning-fast multi-tenant architecture.
        </div>

        <div
          style={{
            display: 'flex',
            gap: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '9999px',
              padding: '10px 24px',
              fontSize: '18px',
              fontWeight: 600,
              color: '#f4f4f5',
            }}
          >
            Multi-Tenant Platform
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(140, 224, 74, 0.12)',
              border: '1px solid rgba(140, 224, 74, 0.3)',
              borderRadius: '9999px',
              padding: '10px 24px',
              fontSize: '18px',
              fontWeight: 700,
              color: '#8ce04a',
            }}
          >
            Early Access
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
