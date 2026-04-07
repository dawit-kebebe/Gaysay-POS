import { authOptions } from '@/app/common/auth/options';
import { getServerSession } from 'next-auth';
import { NavBar } from '@/app/components/navbar'
import { redirect } from 'next/navigation'
import React from 'react'

interface LoginLayoutProps {
    children: React.ReactNode
}

const LoginLayout = async ({ children }: LoginLayoutProps) => {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user) redirect('/dashboard');
    } catch (err) {
        if (process.env.NODE_ENV === 'development') {
            console.log('Error: ', err)
        }
    }

    return (
        <div className='w-full min-h-screen'>
            <NavBar />
            {children}
        </div>
    )
}

export default LoginLayout