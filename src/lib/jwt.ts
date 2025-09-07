import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be set and >= 32 chars");
}
const secretKey = new TextEncoder().encode(JWT_SECRET);

export type AppJwtPayload = {
  sub: string;          // Google user id
  email: string;        // Google email
  name?: string;
  picture?: string;
};

export async function signAppJwt(payload: AppJwtPayload, expiresIn: string = "7d") {
  // 7d expiry by default
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretKey);

  return token;
}

export async function verifyAppJwt(token: string) {
  const { payload } = await jwtVerify(token, secretKey);
  return payload as unknown as AppJwtPayload & { exp: number; iat: number };
}
