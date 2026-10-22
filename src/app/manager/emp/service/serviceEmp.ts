import { API_BASE_URL, API_ENDPOINTS } from '@/global/globalApi';
import { AuthToken } from '@/global/globalAuth';

export interface EmpUser {
  hr_emp_id: string;
  full_name: string;
  dept_name: string | null;
  cid: string | null;
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

  const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EMP.LIST}?${q}`, { headers: authHeader() });
  if (!res.ok) throw new Error('ดึงข้อมูลไม่สำเร็จ');
  return res.json();
}

export async function fetchDepartments(): Promise<Department[]> {
  const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EMP.DEPARTMENTS}`, { headers: authHeader() });
  if (!res.ok) throw new Error('ดึงแผนกไม่สำเร็จ');
  const data = await res.json();
  return data.data ?? [];
}
