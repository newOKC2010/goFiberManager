'use client';

import { useState } from 'react';
import { Modal } from '@/components/modal/mainModal';
import { Button } from '@/components/buttonClick/mainButton';
import { InputText } from '@/components/input/text/mainInputText';
import { RegisterModalProps, RegisterErrors } from '@/app/auth/component/register/utils/types';
import { onCidChange, onNameChange, onEmailChange, handleRegisterSubmit } from '@/app/auth/component/register/handler/handlerRegister';

export const RegisterModal = ({ isOpen, onClose }: RegisterModalProps) => {
  const [cid, setCid] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<RegisterErrors>({ cid: '', fullName: '', email: '' });
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setCid('');
    setFullName('');
    setEmail('');
    setErrors({ cid: '', fullName: '', email: '' });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleRegisterSubmit(cid, fullName, email, setErrors, setLoading, handleClose);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="สมัครใช้งาน"
      contentClassName="!bg-white"
      icon={
        <span
          className="material-symbols-outlined text-emerald-500"
          style={{ fontVariationSettings: "'wght' 700", fontSize: 'clamp(2rem, 5vw, 3rem)' }}
        >
          person_add
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-700 ml-1">เลขบัตรประชาชน</label>
          <InputText
            type="text"
            value={cid}
            onChange={(e) => onCidChange(e.target.value, setCid, setErrors)}
            placeholder="เลขบัตรประชาชน 13 หลัก"
            inputMode="numeric"
            maxLength={13}
            disabled={loading}
            icon="badge"
            error={errors.cid}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-700 ml-1">ชื่อ-นามสกุล</label>
          <InputText
            type="text"
            value={fullName}
            onChange={(e) => onNameChange(e.target.value, setFullName, setErrors)}
            placeholder="ชื่อ นามสกุล (ภาษาไทยเท่านั้น)"
            disabled={loading}
            icon="person"
            error={errors.fullName}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-700 ml-1">อีเมล</label>
          <InputText
            type="text"
            value={email}
            onChange={(e) => onEmailChange(e.target.value, setEmail, setErrors)}
            placeholder="name@example.com"
            disabled={loading}
            icon="mail"
            error={errors.email}
          />
        </div>

        <div className="flex justify-center pt-2">
          <Button
            type="submit"
            variant="pastel"
            customWidth={200}
            loading={loading}
            disabled={loading}
            className="rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white"
            icon="how_to_reg"
          >
            ลงทะเบียน
          </Button>
        </div>
      </form>
    </Modal>
  );
};
