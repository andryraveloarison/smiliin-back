// src/utils/getToken.ts

export function getTokenByPageId(pageId: string): string | null {
    const key = `TOKEN_${pageId.toUpperCase()}`; // ex: TOKEN_Page123
    return process.env[key] || null;
  }
  

export function getTokenAdmin(): string | null {
  const key = `ADMIN_META_TOKEN`; // ex: TOKEN_Page123
  return process.env[key] || null;
}