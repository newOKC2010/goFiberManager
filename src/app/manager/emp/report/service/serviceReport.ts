import { API_BASE_URL, API_ENDPOINTS } from '@/global/globalApi';
import { AuthToken } from '@/global/globalAuth';

export type { Department } from '@/app/manager/emp/service/serviceEmp';

export interface DateRecord {
  date: string;
  scan_times: string[];
}

export interface ReportRow {
  hr_emp_id: string;
  full_name: string;
  dept_name: string;
  dates: DateRecord[];
}

export interface ReportParams {
  date_from: string;
  date_to: string;
  name?: string;
  dept_id?: number;
  page: number;
  limit: number;
}

export interface ReportResponse {
  total_count: number;
  total_pages: number;
  current_page: number;
  data: ReportRow[];
}

function authHeader() {
  return { Authorization: `Bearer ${AuthToken.getToken()}` };
}

export async function fetchReport(params: ReportParams): Promise<ReportResponse> {
  const q = new URLSearchParams();
  q.set('date_from', params.date_from);
  q.set('date_to', params.date_to);
  q.set('page', String(params.page));
  q.set('limit', String(params.limit));
  if (params.name) q.set('name', params.name);
  if (params.dept_id) q.set('dept_id', String(params.dept_id));

  const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EMP.REPORT}?${q}`, { headers: authHeader() });
  if (!res.ok) throw new Error('ดึงข้อมูลไม่สำเร็จ');
  return res.json();
}
