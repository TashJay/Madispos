import express from 'express';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(express.json({ limit: '1mb' }));

const PORT = parseInt(process.env.PORT || '5001', 10);

const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

const MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash'];

async function callGemini(systemInstruction: string, history: any[], message: string): Promise<string> {
  let lastErr: any;
  for (const model of MODELS) {
    try {
      const chat = ai.chats.create({
        model,
        config: systemInstruction ? { systemInstruction } : {},
        history: history || [],
      });
      const result = await chat.sendMessage({ message });
      return result.text || '';
    } catch (err: any) {
      console.error(`Model ${model} failed:`, err?.message || err);
      lastErr = err;
    }
  }
  throw lastErr;
}

app.post('/api/ai/chat', async (req, res) => {
  try {
    const { systemInstruction, history, message } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });
    const text = await callGemini(systemInstruction || '', history || [], message);
    return res.json({ text });
  } catch (err: any) {
    console.error('AI chat error:', err?.message || err);
    return res.status(500).json({ error: 'AI request failed', detail: err?.message });
  }
});

// ── M-Pesa Daraja helpers ──────────────────────────────────────────────────

function mpesaBase() {
  return process.env.MPESA_ENV === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';
}

async function getMpesaToken(): Promise<string> {
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  if (!key || !secret) throw new Error('M-Pesa credentials not configured');
  const auth = Buffer.from(`${key}:${secret}`).toString('base64');
  const r = await fetch(`${mpesaBase()}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  if (!r.ok) throw new Error(`M-Pesa token failed: ${r.status}`);
  const data = await r.json() as any;
  return data.access_token;
}

function mpesaTimestamp() {
  return new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
}

function mpesaPassword(shortCode: string, passkey: string, timestamp: string) {
  return Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');
}

function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('254')) return digits;
  if (digits.startsWith('0')) return '254' + digits.slice(1);
  return '254' + digits;
}

// STK Push — initiates M-Pesa payment prompt on customer's phone
app.post('/api/mpesa/stk-push', async (req, res) => {
  const { phone } = req.body;
  const shortCode = process.env.MPESA_SHORT_CODE;
  const passkey = process.env.MPESA_PASSKEY;
  const callbackUrl = process.env.MPESA_CALLBACK_URL ||
    `https://${process.env.REPLIT_DEV_DOMAIN || 'localhost'}/api/mpesa/callback`;

  if (!shortCode || !passkey) {
    return res.status(503).json({ error: 'M-Pesa is not configured on this server. Please contact support.' });
  }

  try {
    const token = await getMpesaToken();
    const msisdn = formatPhone(phone);
    const ts = mpesaTimestamp();
    const pwd = mpesaPassword(shortCode, passkey, ts);

    const r = await fetch(`${mpesaBase()}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        BusinessShortCode: shortCode,
        Password: pwd,
        Timestamp: ts,
        TransactionType: 'CustomerPayBillOnline',
        Amount: 1300,
        PartyA: msisdn,
        PartyB: shortCode,
        PhoneNumber: msisdn,
        CallBackURL: callbackUrl,
        AccountReference: 'MADIS',
        TransactionDesc: 'MADIS Annual Subscription $10',
      }),
    });

    const data = await r.json() as any;
    if (data.ResponseCode === '0') {
      return res.json({ success: true, checkoutRequestId: data.CheckoutRequestID });
    }
    const errMsg = data.ResponseDescription || data.errorMessage || 'STK push failed';
    return res.status(400).json({ error: errMsg });
  } catch (err: any) {
    console.error('STK push error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// STK Query — check if customer confirmed the payment
app.post('/api/mpesa/stk-query', async (req, res) => {
  const { checkoutRequestId } = req.body;
  const shortCode = process.env.MPESA_SHORT_CODE;
  const passkey = process.env.MPESA_PASSKEY;

  if (!shortCode || !passkey) {
    return res.status(503).json({ error: 'M-Pesa not configured' });
  }

  try {
    const token = await getMpesaToken();
    const ts = mpesaTimestamp();
    const pwd = mpesaPassword(shortCode, passkey, ts);

    const r = await fetch(`${mpesaBase()}/mpesa/stkpushquery/v1/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        BusinessShortCode: shortCode,
        Password: pwd,
        Timestamp: ts,
        CheckoutRequestID: checkoutRequestId,
      }),
    });

    const data = await r.json() as any;
    // ResultCode 0 = success, 1032 = user cancelled, 1037 = timeout, others = pending
    return res.json({
      resultCode: data.ResultCode,
      resultDesc: data.ResultDesc || data.errorMessage,
    });
  } catch (err: any) {
    console.error('STK query error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// M-Pesa callback (Daraja calls this after payment)
app.post('/api/mpesa/callback', (req, res) => {
  console.log('M-Pesa callback:', JSON.stringify(req.body));
  res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

// ── PayPal helpers ─────────────────────────────────────────────────────────

function paypalBase() {
  return process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

async function getPayPalToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) throw new Error('PayPal credentials not configured');
  const auth = Buffer.from(`${clientId}:${secret}`).toString('base64');
  const r = await fetch(`${paypalBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  if (!r.ok) throw new Error(`PayPal token failed: ${r.status}`);
  const data = await r.json() as any;
  return data.access_token;
}

// Create PayPal order
app.post('/api/paypal/create-order', async (_req, res) => {
  try {
    const token = await getPayPalToken();
    const r = await fetch(`${paypalBase()}/v2/checkout/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: { currency_code: 'USD', value: '10.00' },
          description: 'MADIS Annual Subscription',
        }],
      }),
    });
    const data = await r.json() as any;
    return res.json({ id: data.id });
  } catch (err: any) {
    console.error('PayPal create-order error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Capture PayPal order after customer approves
app.post('/api/paypal/capture-order', async (req, res) => {
  const { orderId } = req.body;
  try {
    const token = await getPayPalToken();
    const r = await fetch(`${paypalBase()}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    const data = await r.json() as any;
    if (data.status === 'COMPLETED') {
      return res.json({ success: true });
    }
    return res.status(400).json({ error: 'Payment not completed', status: data.status });
  } catch (err: any) {
    console.error('PayPal capture error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server listening on port ${PORT}`);
});
