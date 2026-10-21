import { API_BASE_URL, API_ENDPOINTS } from '@/global/globalApi';

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

export interface UserInfo {
  id: number;
  cid: string;
  full_name: string;
  email: string;
  role: string;
}

function parseTimeToSeconds(time: string): number {
  const value = parseInt(time);
  const unit = time.slice(-1);
  if (unit === 'm') return value * 60;
  if (unit === 'h') return value * 3600;
  if (unit === 'd') return value * 86400;
  return 86400;
}

export class AuthToken {
  private static key = 'auth_token';
  private static getMaxAge = () => parseTimeToSeconds(process.env.NEXT_PUBLIC_TOKEN_EXPIRE || '7d');

  static storeToken = (token: string) => {
    document.cookie = `${this.key}=${token}; path=/; max-age=${this.getMaxAge()}`;
  };

  static getToken = () => {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith(`${this.key}=`))
      ?.split('=')[1];
  };

  static removeToken = () => {
    document.cookie = `${this.key}=; path=/; max-age=0`;
  };
}

export async function checkAuth(): Promise<{ success: boolean; user?: UserInfo; message?: string }> {
  const token = AuthToken.getToken();
  if (!token) return { success: false, message: 'ไม่พบ token' };

  try {
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.STATUS}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
      AuthToken.removeToken();
      const data = await res.json();
      return { success: false, message: data.message || 'ไม่ได้รับอนุญาต' };
    }

    const data = await res.json();
    return { success: true, user: data.user };
  } catch {
    return { success: false, message: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์' };
  }
}
