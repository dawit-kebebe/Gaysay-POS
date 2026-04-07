import { withAuth } from 'next-auth/middleware';

// NextAuth middleware to protect routes
export default withAuth(
    function middleware(req) {
        // You can add custom logic here if you want side-effects or advanced route blocking based on roles
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token, // Requires token to be present
        },
        secret: process.env.NEXTAUTH_SECRET || process.env.JWT_ACCESS_TOKEN_SECRET || 'fallback-secret-here-12345',
    }
);

// Protect the dashboard and API routes
export const config = {
    matcher: [
        '/dashboard/:path*', 
        // Note: Do NOT match '/api/auth' or '/login'
    ],
};
