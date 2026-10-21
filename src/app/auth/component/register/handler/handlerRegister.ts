import { showAlert } from '@/global/globalSwal';
import { registerService } from '@/app/auth/component/register/service/serviceRegister';

const THAI_NAME_REGEX = /^[ก-๙.\s]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface RegisterErrors {
  cid: string;
  fullName: string;
  email: string;
}

export const onCidChange = (
  value: string,
  setCid: (v: string) => void,
  setErrors: React.Dispatch<React.SetStateAction<RegisterErrors>>
) => {
  const val = value.replace(/\D/g, '').slice(0, 13);
  setCid(val);
  setErrors((prev) => ({ ...prev, cid: '' }));
};

export const onNameChange = (
  value: string,
  setFullName: (v: string) => void,
  setErrors: React.Dispatch<React.SetStateAction<RegisterErrors>>
) => {
  const val = value.replace(/[^ก-๙.\s]/g, '');
  setFullName(val);
  setErrors((prev) => ({ ...prev, fullName: '' }));
};

export const onEmailChange = (
  value: string,
  setEmail: (v: string) => void,
  setErrors: React.Dispatch<React.SetStateAction<RegisterErrors>>
) => {
  setEmail(value);
  setErrors((prev) => ({ ...prev, email: '' }));
};

export const validate = (
  cid: string,
  fullName: string,
  email: string,
  setErrors: React.Dispatch<React.SetStateAction<RegisterErrors>>
): boolean => {
  const newErrors: RegisterErrors = { cid: '', fullName: '', email: '' };

  if (!cid) newErrors.cid = 'กรุณากรอกเลขบัตรประชาชน';
  else if (cid.length !== 13) newErrors.cid = 'เลขบัตรประชาชนต้องมี 13 หลัก';

  if (!fullName.trim()) newErrors.fullName = 'กรุณากรอกชื่อ-นามสกุล';
  else if (!THAI_NAME_REGEX.test(fullName.trim())) newErrors.fullName = 'ใส่ได้เฉพาะภาษาไทยและ .';

  if (!email.trim()) newErrors.email = 'กรุณากรอกอีเมล';
  else if (!EMAIL_REGEX.test(email.trim())) newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';

  setErrors(newErrors);
  return !newErrors.cid && !newErrors.fullName && !newErrors.email;
};

export const handleRegisterSubmit = async (
  cid: string,
  fullName: string,
  email: string,
  setErrors: React.Dispatch<React.SetStateAction<RegisterErrors>>,
  setLoading: (v: boolean) => void,
  onSuccess: () => void
) => {
  if (!validate(cid, fullName, email, setErrors)) return;

  setLoading(true);
  try {
    const data = await registerService({ cid, full_name: fullName.trim(), email: email.trim() });
    showAlert('สำเร็จ', data.message, 'success');
    onSuccess();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'ไม่สามารถลงทะเบียนได้';
    showAlert('เกิดข้อผิดพลาด', message, 'error');
  } finally {
    setLoading(false);
  }
};
