import Head from 'next/head'
import Image from 'next/image'
import { useEffect } from 'react'

export default function Home() {
  // CAPI送信関数
  const sendToConversionAPI = async (eventData) => {
    try {
      const response = await fetch('/api/capi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
      });
      
      const result = await response.json();
      console.log('CAPI Response:', result);
      return result;
    } catch (error) {
      console.error('CAPI Error:', error);
    }
  };

  // ページビューイベントを送信
  useEffect(() => {
    // ページロード時にPageViewイベントを送信
    const sendPageView = async () => {
      const eventData = {
        event_name: 'PageView',
        event_time: Math.floor(Date.now() / 1000),
        event_id: `pageview_${Date.now()}_${Math.random()}`,
        action_source: 'website',
        user: {
          fbp: getCookie('_fbp'), // Facebook Browser ID
          fbc: getCookie('_fbc')  // Facebook Click ID
        },
        custom_data: {
          page_title: document.title,
          page_url: window.location.href
        }
      };
      
      await sendToConversionAPI(eventData);
    };

    sendPageView();
  }, []);

  // Cookieを取得する関数
  const getCookie = (name) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  // テストボタン用のコンバージョンイベント
  const handleTestConversion = async () => {
    const eventData = {
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      event_id: `test_purchase_${Date.now()}_${Math.random()}`,
      action_source: 'website',
      user: {
        fbp: getCookie('_fbp'),
        fbc: getCookie('_fbc')
      },
      custom_data: {
        currency: 'JPY',
        value: 1000,
        content_type: 'product',
        content_ids: ['test_product_123']
      }
    };
    
    await sendToConversionAPI(eventData);
    alert('テストコンバージョンイベントを送信しました！');
  };

  return (
    <div>
      <Head>
        <title>Meta Pixel App</title>
        <meta name="description" content="Meta Pixel Application" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Meta Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '283351931508832');
              fbq('track', 'PageView');
            `
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=283351931508832&ev=PageView&noscript=1"
          />
        </noscript>
      </Head>

      <main style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '1rem' }}>
          Meta Pixel Application
        </h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>
          Welcome to your Meta Pixel tracking application
        </p>
        
        {/* テストボタン */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <button
            onClick={handleTestConversion}
            style={{
              backgroundColor: '#1877f2',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(24, 119, 242, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#166fe5'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#1877f2'}
          >
            🛒 テスト購入イベント送信
          </button>
        </div>
        
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
