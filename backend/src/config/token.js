import crypto from 'crypto';

const SECRET_KEY = process.env.JWT_SECRET || 'edumanage_pro_super_secret_key_12345';

// Sign a payload
export const signToken = (payload) => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 24 * 60 * 60 * 1000 })).toString('base64url');
  
  const hmac = crypto.createHmac('sha256', SECRET_KEY);
  hmac.update(`${header}.${body}`);
  const signature = hmac.digest('base64url');
  
  return `${header}.${body}.${signature}`;
};

// Verify a token
export const verifyToken = (token) => {
  try {
    const [header, body, signature] = token.split('.');
    if (!header || !body || !signature) return null;
    
    // Verify signature
    const hmac = crypto.createHmac('sha256', SECRET_KEY);
    hmac.update(`${header}.${body}`);
    const expectedSignature = hmac.digest('base64url');
    
    if (signature !== expectedSignature) return null;
    
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) {
      return null; // Expired
    }
    
    return payload;
  } catch (error) {
    return null;
  }
};
