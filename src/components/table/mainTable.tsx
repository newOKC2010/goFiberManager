'use client';

import { ReactNode } from 'react';
import TableLoading from './component/TableLoading';
import TableEmpty from './component/TableEmpty';
import TableDesktop from './component/TableDesktop';
import TableMobile from './component/TableMobile';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onPrint?: (item: T) => void;
  onToggleStatus?: (item: T) => void;
  getItemId: (item: T) => string | number;
  getItemStatus?: (item: T) => boolean;
  statusButtonText?: string;
  activeStatusText?: string;
  inactiveStatusText?: string;
  toggleBothWays?: boolean;
}

export default function Table<T>({
  columns,
  data,
  loading = false,
  onEdit,
  onDelete,
  onPrint,
  onToggleStatus,
  getItemId,
  getItemStatus,
  statusButtonText,
  activeStatusText,
  inactiveStatusText,
  toggleBothWays,
}: TableProps<T>) {
  if (loading) return <TableLoading />;
  if (data.length === 0) return <TableEmpty />;

  return (
    <>
      <TableDesktop
        columns={columns} data={data} onEdit={onEdit} onDelete={onDelete} onPrint={onPrint}
        onToggleStatus={onToggleStatus} getItemId={getItemId} getItemStatus={getItemStatus}
        statusButtonText={statusButtonText} activeStatusText={activeStatusText}
        inactiveStatusText={inactiveStatusText} toggleBothWays={toggleBothWays}
      />
      <TableMobile
        columns={columns} data={data} onEdit={onEdit} onDelete={onDelete} onPrint={onPrint}
        onToggleStatus={onToggleStatus} getItemId={getItemId} getItemStatus={getItemStatus}
        statusButtonText={statusButtonText} activeStatusText={activeStatusText}
        inactiveStatusText={inactiveStatusText} toggleBothWays={toggleBothWays}
      />
    </>
  );
}
