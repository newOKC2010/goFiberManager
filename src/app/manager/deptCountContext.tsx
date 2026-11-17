'use client';

import { createContext, useContext } from 'react';

interface DeptCountContextType {
  unassignedCount: number;
  refreshCount: () => void;
}

export const DeptCountContext = createContext<DeptCountContextType>({
  unassignedCount: 0,
  refreshCount: () => {},
});

export const useDeptCount = () => useContext(DeptCountContext);
