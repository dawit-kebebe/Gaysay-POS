import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { cookies } from "next/headers";

export default async function pageGuard() {
    const cookieStore = await cookies();

    if (!cookieStore) {
        throw new Error("Unauthorized");
    }

    const accessToken = cookieStore.get('accessToken');
    const refreshToken = cookieStore.get('refreshToken');

    if (!accessToken || !refreshToken) throw new Error("Unauthorized");

    try {
        const payload = jwt.verify(accessToken.value, process.env.JWT_ACCESS_TOKEN_SECRET || 'default_access_token_secret')
        if (typeof payload === 'object') return payload;
        else return false;
    } catch (err) {
        if (err instanceof TokenExpiredError) {
            const refreshPayload = jwt.verify(refreshToken.value, process.env.JWT_REFRESH_TOKEN_SECRET || 'default_refresh_token_secret')
            if (typeof refreshPayload === 'object') {
                cookieStore.set('accessToken', jwt.sign(
                    { ...refreshPayload },
                    process.env.JWT_ACCESS_TOKEN_SECRET || 'default_secret',
                    { expiresIn: '1h' }
                ))
                return refreshPayload;
            } else {
                return false;
            }
        }
    }
}