import connectToDatabase from '@/app/common/database';
import UserModel from '@/app/common/database/models/User';
import bcrypt from 'bcryptjs';
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: 'Username', type: 'text' },
                password: { label: 'Password', type: 'password' },
                remember: { label: 'Remember', type: 'checkbox' } // Added to match previous frontend schema
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    throw new Error('Username and password are required');
                }

                await connectToDatabase();

                const user = await UserModel.findOne({ username: credentials.username }).select('+password').lean();
                
                if (!user) {
                    throw new Error('Invalid credentials');
                }

                const isValid = await bcrypt.compare(credentials.password, user.password || '');
                
                if (!isValid) {
                    throw new Error('Invalid credentials');
                }

                // Any object returned will be saved in `user` property of the JWT
                return {
                    id: user._id.toString(),
                    name: user.name,
                    username: user.username,
                    role: user.role,
                    avatarUrl: user.avatarUrl,
                } as any;
            }
        })
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            // Initial sign in
            if (user) {
                token.id = user.id;
                token.username = (user as any).username;
                token.role = (user as any).role;
                token.avatarUrl = (user as any).avatarUrl;
            }

            // Client side session update
            if (trigger === "update" && session !== null) {
                // If you update user details client side
            }

            return token;
        },
        async session({ session, token }) {
            // Send properties to the client
            if (token && session.user) {
                (session.user as any).id = token.id;
                (session.user as any).username = token.username;
                (session.user as any).role = token.role;
                (session.user as any).avatarUrl = token.avatarUrl;
            }
            return session;
        }
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET || process.env.JWT_ACCESS_TOKEN_SECRET || 'fallback-secret-here-12345',
};
