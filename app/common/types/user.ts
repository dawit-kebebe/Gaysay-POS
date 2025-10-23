interface User {
    id?: string;
    name: string;
    username: string;
    password?: string;
    role: 'admin' | 'manager' | 'accountant' | 'employee';
    avatarUrl?: string;
}

// Define the roles
export const UserRole = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    ACCOUNTANT: 'accountant',
    EMPLOYEE: 'employee',
} as const;
export type UserRoleType = typeof UserRole[keyof typeof UserRole];

export type CreateUserPayload = Omit<User, 'id'>;

// Payload for updating a user's details
export type UpdateUserPayload = Omit<User, 'password'> & { password?: string };

// Payload for updating only the password
export type UpdatePasswordPayload = {
    id: string;
    newPassword: string;
    // Add oldPassword if required by backend logic
};

export type { User };