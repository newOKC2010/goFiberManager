'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { UserInfo, USER_ROLES } from '@/global/globalAuth';
import { handleLogout, handleMenuClick } from '@/components/sidebar/handler/sidebarHandler';
import MobileToggle from '@/components/sidebar/component/MobileToggle';
import SidebarBackdrop from '@/components/sidebar/component/SidebarBackdrop';
import SidebarHeader from '@/components/sidebar/component/SidebarHeader';
import SidebarMenu from '@/components/sidebar/component/SidebarMenu';
import SidebarFooter from '@/components/sidebar/component/SidebarFooter';

interface SidebarProps {
  user: UserInfo | null;
}

const ADMIN_MENUS = [
  {
    name: 'ข้อมูลการเข้างาน',
    icon: 'schedule',
    children: [
      { name: 'อัพโหลด Excel', path: '/manager/upload', icon: 'upload_file' },
    ]
  },
  {
    name: 'จัดการพนักงาน',
    icon: 'badge',
    children: [
      { name: 'รายชื่อพนักงาน', path: '/manager/emp', icon: 'group' },
      { name: 'ตรวจสอบการเข้างาน', path: '/manager/emp/report', icon: 'fact_check' },
      { name: 'จัดการสถานะ', path: '/manager/emp/manage', icon: 'manage_accounts' },
    ]
  },
];

const USER_MENUS = [
  {
    name: 'ข้อมูลของฉัน',
    icon: 'person',
    children: [
      { name: 'รายการ Scan', path: '/user/attendance', icon: 'schedule' },
    ]
  },
];

interface SidebarProps {
  user: UserInfo | null;
  role?: string;
}

export default function Sidebar({ user, role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const closeSidebar = () => setIsOpen(false);
  const toggleSidebar = () => setIsOpen(true);

  const filteredMenus = role === 'user' ? USER_MENUS : ADMIN_MENUS;

  return (
    <>
      <MobileToggle isOpen={isOpen} onToggle={toggleSidebar} />
      <SidebarBackdrop isOpen={isOpen} onClose={closeSidebar} />

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-white border-r border-gray-200 flex flex-col h-screen
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <SidebarHeader user={user} onClose={closeSidebar} />
        <SidebarMenu 
          menus={filteredMenus} 
          currentPath={pathname} 
          onMenuClick={(path) => handleMenuClick(path, router, closeSidebar)} 
        />
        <SidebarFooter onLogout={() => handleLogout(router)} />
      </aside>
    </>
  );
}
