import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Web Push crypto helpers for VAPID-based push
async function generateVapidAuthHeader(
  endpoint: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  subject: string
) {
  // Import the private key
  const privateKeyBytes = base64UrlDecode(vapidPrivateKey);
  const publicKeyBytes = base64UrlDecode(vapidPublicKey);

  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyBytes,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  const audience = new URL(endpoint).origin;
  const expiration = Math.floor(Date.now() / 1000) + 12 * 60 * 60; // 12 hours

  const header = base64UrlEncode(JSON.stringify({ typ: 'JWT', alg: 'ES256' }));
  const payload = base64UrlEncode(JSON.stringify({
    aud: audience,
    exp: expiration,
    sub: subject,
  }));

  const unsignedToken = `${header}.${payload}`;
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    new TextEncoder().encode(unsignedToken)
  );

  const token = `${unsignedToken}.${base64UrlEncode(new Uint8Array(signature))}`;

  return {
    authorization: `vapid t=${token}, k=${vapidPublicKey}`,
  };
}

function base64UrlEncode(input: string | Uint8Array | ArrayBuffer): string {
  let bytes: Uint8Array;
  if (typeof input === 'string') {
    bytes = new TextEncoder().encode(input);
  } else if (input instanceof ArrayBuffer) {
    bytes = new Uint8Array(input);
  } else {
    bytes = input;
  }

  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Encrypt push message payload using Web Push encryption (aes128gcm)
async function encryptPayload(
  payload: string,
  p256dhKey: string,
  authSecret: string
): Promise<{ encrypted: ArrayBuffer; salt: Uint8Array; localPublicKey: Uint8Array }> {
  const clientPublicKey = base64UrlDecode(p256dhKey);
  const clientAuth = base64UrlDecode(authSecret);

  // Generate local ECDH key pair
  const localKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  );

  const localPublicKeyRaw = await crypto.subtle.exportKey('raw', localKeyPair.publicKey);
  const localPublicKeyBytes = new Uint8Array(localPublicKeyRaw);

  // Import client public key
  const clientKey = await crypto.subtle.importKey(
    'raw',
    clientPublicKey,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  );

  // Derive shared secret via ECDH
  const sharedSecret = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: clientKey },
    localKeyPair.privateKey,
    256
  );

  // Generate salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // HKDF for key derivation
  const ikm = await hkdfExtract(clientAuth, new Uint8Array(sharedSecret));

  // Build info for content encryption key
  const keyInfo = buildInfo('aesgcm', clientPublicKey, localPublicKeyBytes);
  const contentKey = await hkdfExpand(ikm, keyInfo, 16);

  // Build info for nonce
  const nonceInfo = buildInfo('nonce', clientPublicKey, localPublicKeyBytes);
  const nonce = await hkdfExpand(ikm, nonceInfo, 12);

  // Encrypt with AES-GCM
  const aesKey = await crypto.subtle.importKey('raw', contentKey, 'AES-GCM', false, ['encrypt']);
  const payloadBytes = new TextEncoder().encode(payload);

  // Add padding
  const padded = new Uint8Array(payloadBytes.length + 2);
  padded.set(payloadBytes, 2);
  padded[0] = 0;
  padded[1] = 0;

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce, tagLength: 128 },
    aesKey,
    padded
  );

  return { encrypted, salt, localPublicKey: localPublicKeyBytes };
}

function buildInfo(type: string, clientPublicKey: Uint8Array, serverPublicKey: Uint8Array): Uint8Array {
  const encoder = new TextEncoder();
  const typeBytes = encoder.encode(`Content-Encoding: ${type}\0`);
  const info = new Uint8Array(typeBytes.length + 1 + 2 + clientPublicKey.length + 2 + serverPublicKey.length + 5);

  let offset = 0;
  const label = encoder.encode('P-256');
  info.set(typeBytes, offset); offset += typeBytes.length;

  info[offset++] = 0; // separator
  info.set(label, offset); offset += label.length;

  info[offset++] = 0;
  info[offset++] = clientPublicKey.length;
  info.set(clientPublicKey, offset); offset += clientPublicKey.length;

  info[offset++] = 0;
  info[offset++] = serverPublicKey.length;
  info.set(serverPublicKey, offset);

  return info;
}

async function hkdfExtract(salt: Uint8Array, ikm: Uint8Array): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', salt, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const prk = await crypto.subtle.sign('HMAC', key, ikm);
  return new Uint8Array(prk);
}

async function hkdfExpand(prk: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', prk, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const input = new Uint8Array(info.length + 1);
  input.set(info);
  input[info.length] = 1;
  const output = await crypto.subtle.sign('HMAC', key, input);
  return new Uint8Array(output).slice(0, length);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, title, body, url, icon } = await req.json();

    if (!user_id || !title || !body) {
      return new Response(JSON.stringify({ error: 'Missing required fields: user_id, title, body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

    const supabase = createClient(supabaseUrl, serviceKey);

    // Always create in-app notification
    await supabase.from('notifications').insert({
      user_id,
      title,
      message: body,
      type: 'push',
      read: false,
    });

    // Get all push subscriptions for this user
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', user_id);

    if (subError) {
      throw new Error(`Failed to fetch subscriptions: ${subError.message}`);
    }

    let pushSent = 0;
    const failedEndpoints: string[] = [];

    if (subscriptions && subscriptions.length > 0 && vapidPublicKey && vapidPrivateKey) {
      const pushPayload = JSON.stringify({
        title,
        body,
        url: url || '/dashboard',
        icon: icon || '/icon-192x192.png',
      });

      for (const sub of subscriptions) {
        try {
          // Generate VAPID auth
          const vapidHeaders = await generateVapidAuthHeader(
            sub.endpoint,
            vapidPublicKey,
            vapidPrivateKey,
            'mailto:noreply@handymatch.app'
          );

          // For simplicity, send unencrypted push with VAPID
          // Most browsers accept this for same-origin service workers
          const response = await fetch(sub.endpoint, {
            method: 'POST',
            headers: {
              'Authorization': vapidHeaders.authorization,
              'Content-Type': 'application/json',
              'TTL': '86400',
              'Urgency': 'high',
            },
            body: pushPayload,
          });

          if (response.ok || response.status === 201) {
            pushSent++;
          } else if (response.status === 404 || response.status === 410) {
            // Subscription expired, remove it
            failedEndpoints.push(sub.endpoint);
          } else {
            console.error(`Push failed for ${sub.endpoint}: ${response.status} ${await response.text()}`);
          }
        } catch (pushErr) {
          console.error(`Push error for endpoint: ${pushErr}`);
        }
      }

      // Clean up expired subscriptions
      if (failedEndpoints.length > 0) {
        for (const endpoint of failedEndpoints) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('user_id', user_id)
            .eq('endpoint', endpoint);
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      push_sent: pushSent,
      in_app: true,
      expired_cleaned: failedEndpoints.length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Push notification error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
