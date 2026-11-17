import { API_BASE_URL, API_ENDPOINTS } from '@/global/globalApi';
import { AuthToken } from '@/global/globalAuth';

export interface EmpDept {
  hr_emp_id: string;
  full_name: string;
  dept_name: string | null;
}

export interface EmpDeptListResponse {
  total_count: number;
  total_pages: number;
  current_page: number;
  data: EmpDept[];
}

function authHeader() {
  return { Authorization: `Bearer ${AuthToken.getToken()}` };
}

export async function fetchEmpByDept(
  page = 1,
  limit = 10,
  hrEmpID = '',
  deptFilter = ''
): Promise<EmpDeptListResponse> {
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (hrEmpID) q.set('hr_emp_id', hrEmpID);
  if (deptFilter) q.set('dept_filter', deptFilter);
  const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DEPT.EMPLOYEES}?${q}`, { headers: authHeader() });
  if (!res.ok) throw new Error('ดึงข้อมูลไม่สำเร็จ');
  return res.json();
}

export async function assignDept(hrEmpID: string, deptID: number, fullName: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DEPT.ASSIGN}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ hr_emp_id: hrEmpID, dept_id: deptID, full_name: fullName }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message ?? 'กำหนดแผนกไม่สำเร็จ');
  }
}
