import Head from 'next/head'
import Image from 'next/image'

export default function Home() {
  return (
    <div>
      <Head>
        <title>Meta Pixel App</title>
        <meta name="description" content="Meta Pixel Application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '1rem' }}>
          Meta Pixel Application
        </h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>
          Welcome to your Meta Pixel tracking application
        </p>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{
            position: 'relative',
            width: '400px',
            height: '600px',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}>
            <Image
              src="/images/hero.jpg"
              alt="Meta Pixel Hero Image"
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
        </div>

      </main>
    </div>
  )
}
