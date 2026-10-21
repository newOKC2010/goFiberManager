import { API_BASE_URL, API_ENDPOINTS } from '@/global/globalApi';
import { AuthToken } from '@/global/globalAuth';

export interface UploadResult {
  success: boolean;
  message: string;
  data?: {
    file_name: string;
    total_rows: number;
    processed: number;
    errors: number;
    status: string;
  };
}

export async function uploadExcel(file: File): Promise<UploadResult> {
  const token = AuthToken.getToken();
  if (!token) return { success: false, message: 'ไม่พบ token' };

  const form = new FormData();
  form.append('file', file);

  try {
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.UPLOAD.EXCEL}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });

    const data = await res.json();
    if (!res.ok) return { success: false, message: data.message || 'อัพโหลดไม่สำเร็จ' };
    return { success: true, message: data.message || 'สำเร็จ', data: data.log };
  } catch {
    return { success: false, message: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์' };
  }
}
