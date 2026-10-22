import { API_BASE_URL, API_ENDPOINTS } from '@/global/globalApi';
import { AuthToken } from '@/global/globalAuth';

export interface EmpManage {
  hr_emp_id: string;
  full_name: string;
  dept_name: string | null;
  status: boolean;
}

export interface ManageListResponse {
  total_count: number;
  total_pages: number;
  current_page: number;
  data: EmpManage[];
}

function authHeader() {
  return { Authorization: `Bearer ${AuthToken.getToken()}` };
}

export async function fetchManageList(params: {
  page: number; limit: number; name?: string; dept_id?: number; status?: string;
}): Promise<ManageListResponse> {
  const q = new URLSearchParams();
  q.set('page', String(params.page));
  q.set('limit', String(params.limit));
  if (params.name) q.set('name', params.name);
  if (params.dept_id) q.set('dept_id', String(params.dept_id));
  if (params.status) q.set('status', params.status);

  const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EMP.MANAGE_LIST}?${q}`, { headers: authHeader() });
  if (!res.ok) throw new Error('ดึงข้อมูลไม่สำเร็จ');
  return res.json();
}

export async function toggleEmpStatus(hrEmpID: string): Promise<{ status: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EMP.MANAGE_TOGGLE}`, {
    method: 'PATCH',
    headers: { ...authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ hr_emp_id: hrEmpID }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'อัพเดทไม่สำเร็จ');
  return data;
}
