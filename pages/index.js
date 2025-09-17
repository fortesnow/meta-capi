import Head from 'next/head'

export default function Home() {
  return (
    <div>
      <Head>
        <title>Meta Pixel App</title>
        <meta name="description" content="Meta Pixel Application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', color: '#333' }}>
          Meta Pixel Application
        </h1>
        <p style={{ textAlign: 'center', color: '#666' }}>
          Welcome to your Meta Pixel tracking application
        </p>
      </main>
    </div>
  )
}
