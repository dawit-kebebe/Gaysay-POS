import pageGuard from '@/app/common/guards/page.guard';
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
        const isAuth = await pageGuard();
        if (isAuth && isAuth.role) {
            navLinks = roleToNav(isAuth.role);
            user = {
                name: isAuth.name,
                username: isAuth.username,
                role: isAuth.role,
                avatarUrl: isAuth.avatarUrl
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