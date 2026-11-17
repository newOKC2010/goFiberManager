import { redirect } from 'next/navigation';

export default function ManagerPage() {
  const showUpload = process.env.NEXT_PUBLIC_OPEN_MENU_UPLOAD_EXCEL !== 'false';
  redirect(showUpload ? '/manager/upload' : '/manager/emp');
}
