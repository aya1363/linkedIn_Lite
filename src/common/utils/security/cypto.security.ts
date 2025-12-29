import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

let KEY: Buffer;

async function getKey(): Promise<Buffer> {
  if (!KEY) {
    const PASSWORD = process.env.PHONE_SECRET_KEY;
    if (!PASSWORD) throw new Error('PHONE_SECRET_KEY is missing in .env');

    KEY = (await promisify(scrypt)(PASSWORD, 'salt', 32)) as Buffer;
  }
  return KEY;
}

export async function encrypt(text: string): Promise<string> {
  const key = await getKey();
  const iv = randomBytes(16);

  const cipher = createCipheriv('aes-256-ctr', key, iv);
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ]);

  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export async function decrypt(payload: string): Promise<string> {
  const key = await getKey();

  const [ivHex, encryptedHex] = payload.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encryptedText = Buffer.from(encryptedHex, 'hex');

  const decipher = createDecipheriv('aes-256-ctr', key, iv);
  const decrypted = Buffer.concat([
    decipher.update(encryptedText),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}
