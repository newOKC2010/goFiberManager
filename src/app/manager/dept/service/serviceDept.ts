import { API_BASE_URL, API_ENDPOINTS } from '@/global/globalApi';
import { AuthToken } from '@/global/globalAuth';

export interface Department {
  id: number;
  name: string;
  emp_count: number;
}

export interface DeptListResponse {
  total_count: number;
  total_pages: number;
  current_page: number;
  data: Department[];
}

function authHeader() {
  return { Authorization: `Bearer ${AuthToken.getToken()}` };
}

export async function fetchDepartments(page = 1, limit = 10): Promise<DeptListResponse> {
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DEPT.LIST}?${q}`, { headers: authHeader() });
  if (!res.ok) throw new Error('ดึงข้อมูลแผนกไม่สำเร็จ');
  return res.json();
}

export async function createDepartment(name: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DEPT.CREATE}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message ?? 'เพิ่มแผนกไม่สำเร็จ');
  }
}

export async function updateDepartment(id: number, name: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DEPT.UPDATE}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ id, name }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message ?? 'แก้ไขแผนกไม่สำเร็จ');
  }
}
