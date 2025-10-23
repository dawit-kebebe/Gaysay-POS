import pageGuard from '@/app/common/guards/page.guard'
import { NavBar } from '@/app/components/navbar'
import { redirect } from 'next/navigation'
import React from 'react'

interface LoginLayoutProps {
    children: React.ReactNode
}

const LoginLayout = async ({ children }: LoginLayoutProps) => {
    try {
        const isAuth = await pageGuard();
        if (isAuth) redirect('/dashboard');
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