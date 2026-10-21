export interface RegisterRequest {
  cid: string;
  full_name: string;
  email: string;
}

export interface RegisterErrors {
  cid: string;
  fullName: string;
  email: string;
}

export interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}
