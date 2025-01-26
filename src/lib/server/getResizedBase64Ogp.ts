import sharp from 'sharp';

export async function getResizedBase64Ogp(imageUrl: string): Promise<string> {
  try {
    // 外部URLから画像データを取得
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    // ArrayBufferをBufferに変換
    const arrayBuffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // sharpでリサイズ＆エンコード
    const resizedBuffer = await sharp(imageBuffer)
      .resize(1200, 630, {
        fit: 'cover',
        position: 'entropy',
      })
      .jpeg()
      .toBuffer();

    // Base64形式の文字列を生成
    return `data:image/jpeg;base64,${resizedBuffer.toString('base64')}`;
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to process image');
  }
}
