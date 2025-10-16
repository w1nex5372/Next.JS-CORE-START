import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getSupabaseClient, type TelegramUserRow } from '../../../../lib/supabase';

export const runtime = 'nodejs';

type Method = 'GET' | 'POST';

function parseInitDataFromRequest(method: Method, request: Request): Promise<string | null> {
  if (method === 'GET') {
    const url = new URL(request.url);
    return Promise.resolve(url.searchParams.get('initData') ?? url.searchParams.get('init_data'));
  }
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return request.json().then((json: any) => json?.initData ?? json?.init_data ?? null);
  }
  if (contentType.includes('application/x-www-form-urlencoded')) {
    return request.text().then((txt) => {
      const params = new URLSearchParams(txt);
      return params.get('initData') ?? params.get('init_data');
    });
  }
  return Promise.resolve(null);
}

function buildDataCheckString(params: URLSearchParams): string {
  const entries: string[] = [];
  const filtered = Array.from(params.entries()).filter(([key]) => key !== 'hash');
  filtered.sort(([a], [b]) => a.localeCompare(b)).forEach(([k, v]) => {
    entries.push(`${k}=${v}`);
  });
  return entries.join('\n');
}

function verifyInitData(initData: string, botToken: string): boolean {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash') || '';
  const dataCheckString = buildDataCheckString(params);

  // Web Apps: secret = HMAC_SHA256("WebAppData", bot_token)
  const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calcHex = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');

  const a = Buffer.from(calcHex, 'hex');
  const b = Buffer.from(hash, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function userFromInitData(initData: string): TelegramUserRow {
  const params = new URLSearchParams(initData);
  const userJson = params.get('user');
  if (!userJson) {
    throw new Error('Missing user field in initData');
  }
  const u = JSON.parse(userJson);
  return {
    id: Number(u.id),
    first_name: u.first_name ?? null,
    last_name: u.last_name ?? null,
    username: u.username ?? null,
    photo_url: u.photo_url ?? null,
  };
}

async function handle(request: Request, method: Method) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json(
      { ok: false, error: 'Server not configured: TELEGRAM_BOT_TOKEN is missing.' },
      { status: 500 }
    );
  }

  const initData = await parseInitDataFromRequest(method, request);
  if (!initData) {
    return NextResponse.json(
      { ok: false, error: 'Missing initData in request (body or query).' },
      { status: 400 }
    );
  }

  const valid = verifyInitData(initData, botToken);
  if (!valid) {
    return NextResponse.json({ ok: false, error: 'Invalid initData signature.' }, { status: 401 });
  }

  const user = userFromInitData(initData);
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('telegram_users')
    .upsert(
      {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        photo_url: user.photo_url,
        updated_at: now,
      },
      { onConflict: 'id' }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, user: data as TelegramUserRow }, { status: 200 });
}

export async function GET(request: Request) {
  return handle(request, 'GET');
}

export async function POST(request: Request) {
  return handle(request, 'POST');
}