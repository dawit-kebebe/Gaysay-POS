import { NavBarLink } from '@/app/common/types/navbar';
import { type RoleType, Role } from '@/app/common/types/role';

export function roleToNav(role: RoleType): Array<NavBarLink> {
    switch (role) {
        case Role.ADMIN:
        case Role.MANAGER:
            return [
                {
                    label: 'Dashboard',
                    href: '/dashboard',
                    isActive: true
                },
                {
                    label: 'Menu',
                    href: '/dashboard/menu',
                    isActive: false,
                },
                {
                    label: 'Income',
                    href: '/dashboard/income',
                    isActive: false
                },
                {
                    label: 'Expense',
                    href: '/dashboard/expense',
                    isActive: false
                },
                {
                    label: 'Report',
                    href: '/dashboard/report',
                    isActive: false
                },
                {
                    label: 'Users',
                    href: '/dashboard/users',
                    isActive: false
                }
            ]

        case Role.ACCOUNTANT:
            return [
                {
                    label: 'Dashboard',
                    href: '/dashboard',
                    isActive: true
                },
                {
                    label: 'Income',
                    href: '/dashboard/income',
                    isActive: false
                },
                {
                    label: 'Expense',
                    href: '/dashboard/expense',
                    isActive: false
                }
            ];
        case Role.EMPLOYEE:
            return [
                {
                    label: 'Salery',
                    href: '/dashboard/salery',
                    isActive: true
                }
            ];
    }
}