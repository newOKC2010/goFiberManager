export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export const API_ENDPOINTS = {
  AUTH: {
    REQUEST_OTP: '/auth/req',
    VERIFY_OTP: '/auth/verify',
    REGISTER: '/auth/register',
    STATUS: '/auth/status',
  },
  UPLOAD: {
    EXCEL: '/upload/excel',
  },
  USER: {
    ATTENDANCE: '/user/attendance',
  },
  EMP: {
    LIST: '/emp/list',
    ATTENDANCE: '/emp/attendance',
    DEPARTMENTS: '/emp/departments',
    UPDATE_CID: '/emp/cid',
    MANAGE_LIST: '/emp/manage/list',
    MANAGE_TOGGLE: '/emp/manage/toggle',
  },
}
