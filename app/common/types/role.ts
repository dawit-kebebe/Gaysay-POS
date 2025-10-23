export const Role = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    ACCOUNTANT: 'accountant',
    EMPLOYEE: 'employee'
} as const;

export type RoleType = typeof Role[keyof typeof Role];