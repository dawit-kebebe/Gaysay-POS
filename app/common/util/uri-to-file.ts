export function dataUrlToFileBuffer(dataUrl: string): { buffer: Buffer; mime: string } {
    const base64Data = dataUrl.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    return { buffer, mime: 'image/*' };
}
