interface TableActionsProps<T> {
  item: T;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onPrint?: (item: T) => void;
  onToggleStatus?: (item: T) => void;
  getItemStatus?: (item: T) => boolean;
  statusButtonText?: string;
  activeStatusText?: string;
  inactiveStatusText?: string;
  toggleBothWays?: boolean;
}

export default function TableActions<T>({
  item,
  onEdit,
  onDelete,
  onPrint,
  onToggleStatus,
  getItemStatus,
  statusButtonText = 'อนุมัติรายการ',
  activeStatusText,
  inactiveStatusText,
  toggleBothWays = false,
}: TableActionsProps<T>) {
  const isActive = getItemStatus?.(item);

  const label = toggleBothWays
    ? isActive ? (activeStatusText ?? 'ปลดออก') : (inactiveStatusText ?? 'กลับเข้างาน')
    : isActive ? 'ยืนยันแล้ว' : statusButtonText;

  const btnClass = toggleBothWays
    ? isActive
      ? 'bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer'
      : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200 cursor-pointer'
    : isActive
      ? 'bg-green-100 text-green-700 opacity-60 cursor-not-allowed'
      : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 cursor-pointer';

  return (
    <div className="flex items-center justify-center gap-2">
      {onToggleStatus && (
        <button
          onClick={() => (toggleBothWays || !isActive) && onToggleStatus(item)}
          disabled={!toggleBothWays && !!isActive}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${btnClass}`}
        >
          {label}
        </button>
      )}
      {onEdit && (
        <button
          onClick={() => onEdit(item)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
          title="แก้ไข"
        >
          <span className="material-symbols-outlined text-xl">edit</span>
        </button>
      )}
      {onPrint && (
        <button
          onClick={() => onPrint(item)}
          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
          title="พิมพ์"
        >
          <span className="material-symbols-outlined text-xl">print</span>
        </button>
      )}
      {onDelete && (
        <button
          onClick={() => onDelete(item)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          title="ลบ"
        >
          <span className="material-symbols-outlined text-xl">delete</span>
        </button>
      )}
    </div>
  );
}
