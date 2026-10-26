import { API_BASE_URL, API_ENDPOINTS } from '@/global/globalApi';
import { AuthToken } from '@/global/globalAuth';

export interface AttendanceRow {
  work_date: string;
  scan_times: string[];
}

export interface AttendanceParams {
  date_from: string;
  date_to: string;
}

export interface AttendanceResponse {
  check_time: boolean;
  full_name: string;
  dept_name: string;
  data: AttendanceRow[];
}

function authHeader() {
  return { Authorization: `Bearer ${AuthToken.getToken()}` };
}

export async function fetchMyAttendance(params: AttendanceParams): Promise<AttendanceResponse> {
  const q = new URLSearchParams();
  q.set('date_from', params.date_from);
  q.set('date_to', params.date_to);

  const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USER.ATTENDANCE}?${q}`, { headers: authHeader() });
  if (!res.ok) throw new Error('ดึงข้อมูลไม่สำเร็จ');
  return res.json();
}
