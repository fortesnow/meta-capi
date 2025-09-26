// pages/api/capi.js
import crypto from "crypto";

const PIXEL_ID = process.env.META_PIXEL_ID;
const TOKEN = process.env.META_ACCESS_TOKEN;
const API_VER = process.env.META_API_VERSION || "v21.0";
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

function sha256Normalize(v) {
  if (!v) return undefined;
  const norm = String(v).trim().toLowerCase();
  return crypto.createHash("sha256").update(norm).digest("hex");
}

function getCookie(name, cookieString) {
  if (!cookieString) return null;
  const value = `; ${cookieString}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

export default async function handler(req, res) {
  // CORS
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const origin = req.headers.origin || "";
  const referer = req.headers.referer || "";
  
  // CORS チェック（複数オリジン対応）
  const allowedOrigins = [
    "https://iedukuri-soudan.jp",
    "https://www.iedukuri-soudan.jp", 
    "https://studio.iedukuri-soudan.jp"  // studio用
  ];
  
  const isAllowedOrigin = ALLOWED_ORIGIN === "*" || 
    allowedOrigins.some(allowed => origin.startsWith(allowed) || referer.startsWith(allowed));
  
  if (!isAllowedOrigin) {
    console.log('CORS Error:', { origin, referer, allowedOrigins });
    return res.status(403).json({ 
      error: "forbidden_origin", 
      debug: { origin, referer, allowedOrigins }
    });
  }

  try {
    // 環境変数の確認
    if (!PIXEL_ID || !TOKEN) {
      console.error('Missing environment variables:', { PIXEL_ID: !!PIXEL_ID, TOKEN: !!TOKEN });
      return res.status(500).json({ 
        error: "missing_config", 
        debug: { hasPixelId: !!PIXEL_ID, hasToken: !!TOKEN }
      });
    }

    const {
      event_name,
      event_time,
      event_id,        // ⇦ Pixel側と同じIDを必ず受け取る
      action_source,   // 'website' 固定でOK
      user,            // { email?, phone?, fbp?, fbc? }
      custom_data,     // { currency?, value? ... }
      client_ip,       // フロントで未指定でもOK（ヘッダから拾う）
      client_ua,       // 同上
      test_event_code  // Test Events用（開発時のみ付与）
    } = req.body || {};

    console.log('CAPI Request received:', { 
      event_name, 
      event_id, 
      action_source, 
      hasUser: !!user,
      pixelId: PIXEL_ID,
      body: req.body 
    });

    const ip = client_ip || (req.headers["x-forwarded-for"] || "").split(",")[0] || req.socket.remoteAddress;
    const ua = client_ua || req.headers["user-agent"] || "";
    
    // Studio側のペイロード形式に対応
    const normalizedUser = user || {};
    const cookieString = req.headers.cookie || '';
    const fbp = normalizedUser.fbp || getCookie('_fbp', cookieString) || null;
    const fbc = normalizedUser.fbc || getCookie('_fbc', cookieString) || null;

    const user_data = {
      em: normalizedUser?.email ? [sha256Normalize(normalizedUser.email)] : undefined,
      ph: normalizedUser?.phone ? [sha256Normalize(normalizedUser.phone)] : undefined,
      fbp: fbp,
      fbc: fbc,
      client_ip_address: ip,
      client_user_agent: ua,
    };

    const payload = {
      data: [{
        event_name: event_name || "CompleteRegistration",
        event_time: event_time || Math.floor(Date.now() / 1000),
        event_id, // ⇦ 重複排除の肝
        action_source: action_source || "website",
        user_data,
        custom_data: custom_data || {},
        ...(test_event_code ? { test_event_code } : {})
      }]
    };

    const url = `https://graph.facebook.com/${API_VER}/${PIXEL_ID}/events?access_token=${TOKEN}`;
    
    console.log('Sending to Meta API:', {
      url: url.replace(TOKEN, 'TOKEN_HIDDEN'),
      payload: JSON.stringify(payload, null, 2)
    });

    const fbRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await fbRes.json();

    console.log('Meta API Response:', {
      status: fbRes.status,
      ok: fbRes.ok,
      response: json
    });

    res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    return res.status(fbRes.ok ? 200 : 400).json(json);
  } catch (e) {
    console.error('CAPI Server Error:', e);
    res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    return res.status(500).json({ 
      error: "server_error", 
      detail: String(e),
      debug: process.env.NODE_ENV === 'development' ? e.stack : undefined
    });
  }
}
