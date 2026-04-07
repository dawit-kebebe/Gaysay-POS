import { authOptions } from '@/app/common/auth/options';
import { getServerSession } from 'next-auth';
import { roleToNav } from '@/app/common/guards/role.guard';
import { NavBarLink } from '@/app/common/types/navbar';
import { User } from '@/app/common/types/user';
import { NavBar } from '@/app/components/navbar';
import { redirect } from 'next/navigation';

interface DashboardLayoutProps {
    children: React.ReactNode
}

const DashboardLayout = async ({ children }: DashboardLayoutProps) => {
    let navLinks: Array<NavBarLink> | undefined;
    let user: User | undefined;

    try {
        const session = await getServerSession(authOptions);
        if (session?.user && (session.user as any).role) {
            navLinks = roleToNav((session.user as any).role);
            user = {
                name: (session.user as any).name,
                username: (session.user as any).username,
                role: (session.user as any).role,
                avatarUrl: (session.user as any).avatarUrl || undefined
            }
        } else {
            throw new Error('Unauthorized');
        }
    } catch (_) {
        redirect('/login');
    }

    return (
        <div className='w-full min-h-screen'>
            <NavBar
                navbarLinks={navLinks}
                user={user}
            />
            {children}
        </div>
    )
}

export default DashboardLayout