'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { UserInfo } from '@/global/globalAuth';
import { handleLogout, handleMenuClick } from '@/components/sidebar/handler/sidebarHandler';
import MobileToggle from '@/components/sidebar/component/MobileToggle';
import SidebarBackdrop from '@/components/sidebar/component/SidebarBackdrop';
import SidebarHeader from '@/components/sidebar/component/SidebarHeader';
import SidebarMenu from '@/components/sidebar/component/SidebarMenu';
import SidebarFooter from '@/components/sidebar/component/SidebarFooter';

const SHOW_UPLOAD_EXCEL = process.env.NEXT_PUBLIC_OPEN_MENU_UPLOAD_EXCEL !== 'false';

const ADMIN_MENUS = [
  ...(SHOW_UPLOAD_EXCEL ? [{
    name: 'ข้อมูลการเข้างาน',
    icon: 'schedule',
    children: [
      { name: 'อัพโหลด Excel', path: '/manager/upload', icon: 'upload_file' },
    ]
  }] : []),
  {
    name: 'จัดการพนักงาน',
    icon: 'badge',
    children: [
      { name: 'รายชื่อพนักงาน', path: '/manager/emp', icon: 'group' },
      { name: 'ตรวจสอบการเข้างาน', path: '/manager/emp/report', icon: 'fact_check' },
      { name: 'จัดการสถานะ', path: '/manager/emp/manage', icon: 'manage_accounts' },
      { name: 'จัดการแผนก', path: '/manager/dept', icon: 'business' },
      { name: 'กำหนดแผนกพนักงาน', path: '/manager/dept/unassigned', icon: 'person_add' },
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
  unassignedCount?: number;
}

export default function Sidebar({ user, role, unassignedCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const closeSidebar = () => setIsOpen(false);
  const toggleSidebar = () => setIsOpen(true);

  // inject badge เข้า menu "กำหนดแผนกพนักงาน"
  const adminMenusWithBadge = ADMIN_MENUS.map(group => ({
    ...group,
    children: group.children?.map(item =>
      item.path === '/manager/dept/unassigned'
        ? { ...item, badge: unassignedCount }
        : item
    ),
  }));

  const filteredMenus = role === 'user' ? USER_MENUS : adminMenusWithBadge;

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
