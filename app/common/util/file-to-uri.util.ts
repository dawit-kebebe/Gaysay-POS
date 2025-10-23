export default function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') resolve(reader.result);
            else reject(new Error('Failed to convert file'));
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
