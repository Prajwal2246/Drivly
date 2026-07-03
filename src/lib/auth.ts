import crypto from "crypto";

/**
 * Signs a JSON payload into a standard HS256 JWT token.
 */
export function signJwt(payload: object, secret: string): string {
  const header = { alg: "HS256", typ: "JWT" };
  
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(`${encodedHeader}.${encodedPayload}`);
  const signature = hmac.digest("base64url");
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verifies and decodes a standard HS256 JWT token.
 * Returns the decoded payload if valid, otherwise returns null.
 */
export function verifyJwt(token: string | undefined, secret: string): any | null {
  if (!token) return null;
  
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    
    const [encodedHeader, encodedPayload, signature] = parts;
    
    // Verify signature integrity
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(`${encodedHeader}.${encodedPayload}`);
    const expectedSignature = hmac.digest("base64url");
    
    if (signature !== expectedSignature) {
      return null;
    }
    
    // Decode payload
    const payloadStr = Buffer.from(encodedPayload, "base64url").toString("utf8");
    const payload = JSON.parse(payloadStr);
    
    // Verify expiration time (standard 'exp' claim is in seconds or milliseconds, we will store in milliseconds)
    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}
