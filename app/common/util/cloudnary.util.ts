import { v2 as cloudinary } from 'cloudinary';

export function getCloudnary() {
    cloudinary.config({
        cloud_name: process.env.CLOUDNARY_CLOUD_NAME || 'dlpomgzit',
        api_key: process.env.CLOUDNARY_API_KEY || '588476959529311', // Click 'View API Keys' above to copy your API key
        api_secret: process.env.CLOUDNARY_API_SECRET || '744ADGJrW_CxBaDape2t4-ZJcrU' // Click 'View API Keys' above to copy your API secret
    });

    return cloudinary;
}