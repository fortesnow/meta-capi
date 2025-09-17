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
  if (ALLOWED_ORIGIN !== "*" && !origin.startsWith(ALLOWED_ORIGIN)) {
    return res.status(403).json({ error: "forbidden_origin" });
  }

  try {
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

    const ip = client_ip || (req.headers["x-forwarded-for"] || "").split(",")[0] || req.socket.remoteAddress;
    const ua = client_ua || req.headers["user-agent"] || "";

    const user_data = {
      em: user?.email ? [sha256Normalize(user.email)] : undefined,
      ph: user?.phone ? [sha256Normalize(user.phone)] : undefined,
      fbp: user?.fbp,
      fbc: user?.fbc,
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
    const fbRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await fbRes.json();

    res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    return res.status(fbRes.ok ? 200 : 400).json(json);
  } catch (e) {
    res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    return res.status(500).json({ error: "server_error", detail: String(e) });
  }
}
