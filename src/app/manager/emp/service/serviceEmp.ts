import { API_BASE_URL, API_ENDPOINTS } from '@/global/globalApi';
import { AuthToken } from '@/global/globalAuth';

export interface EmpUser {
  hr_emp_id: string;
  full_name: string;
  dept_name: string | null;
  cid: string | null;
  work_date: string | null;
  scan_times: string[];
}

export interface Department {
  id: number;
  name: string;
}

export interface EmpListParams {
  page: number;
  limit: number;
  name?: string;
  dept_id?: number;
  has_cid?: string;
  date_from?: string;
  date_to?: string;
}

export interface EmpListResponse {
  total_count: number;
  total_pages: number;
  current_page: number;
  data: EmpUser[];
}

function authHeader() {
  return { Authorization: `Bearer ${AuthToken.getToken()}` };
}

export async function fetchEmpList(params: EmpListParams): Promise<EmpListResponse> {
  const q = new URLSearchParams();
  q.set('page', String(params.page));
  q.set('limit', String(params.limit));
  if (params.name) q.set('name', params.name);
  if (params.dept_id) q.set('dept_id', String(params.dept_id));
  if (params.has_cid) q.set('has_cid', params.has_cid);
  if (params.date_from) q.set('date_from', params.date_from);
  if (params.date_to) q.set('date_to', params.date_to);

  const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EMP.LIST}?${q}`, { headers: authHeader() });
  if (!res.ok) throw new Error('ดึงข้อมูลไม่สำเร็จ');
  return res.json();
}

export interface AttendanceRecord {
  hr_emp_id: string;
  full_name: string;
  dept_name: string | null;
  work_date: string;
  scan_times: string[];
}

export interface AttendanceListResponse {
  total_count: number;
  total_pages: number;
  current_page: number;
  data: AttendanceRecord[];
}

export interface AttendanceParams {
  page: number;
  limit: number;
  name?: string;
  dept_id?: number;
  date_from?: string;
  date_to?: string;
}

export async function fetchAttendanceList(params: AttendanceParams): Promise<AttendanceListResponse> {
  const q = new URLSearchParams();
  q.set('page', String(params.page));
  q.set('limit', String(params.limit));
  if (params.name) q.set('name', params.name);
  if (params.dept_id) q.set('dept_id', String(params.dept_id));
  if (params.date_from) q.set('date_from', params.date_from);
  if (params.date_to) q.set('date_to', params.date_to);

  const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EMP.ATTENDANCE}?${q}`, { headers: authHeader() });
  if (!res.ok) throw new Error('ดึงข้อมูลไม่สำเร็จ');
  return res.json();
}

export async function updateEmpCID(hrEmpID: string, cid: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EMP.UPDATE_CID}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ hr_emp_id: hrEmpID, cid }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message ?? 'อัพเดท CID ไม่สำเร็จ');
  }
}

export async function fetchDepartments(): Promise<Department[]> {
  const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EMP.DEPARTMENTS}`, { headers: authHeader() });
  if (!res.ok) throw new Error('ดึงแผนกไม่สำเร็จ');
  const data = await res.json();
  return data.data ?? [];
}
