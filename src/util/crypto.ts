import { createDecipheriv } from 'crypto';

const ivLength = 12;
const tagLength = 16;

const key = Buffer.from(process.env.DEVSINCRYPTO_DB_AES_KEY as string, 'hex');

/**
 * Decrypt a symmetrically-encrypted ciphertext.
 *
 * @param input - The ciphertext.
 */
export function decrypt(input: string): string {
	const inputBuffer = Buffer.from(input, 'base64');
	const iv = Buffer.allocUnsafe(ivLength);
	const tag = Buffer.allocUnsafe(tagLength);
	const data = Buffer.alloc(inputBuffer.length - ivLength - tagLength, 0);

	inputBuffer.copy(iv, 0, 0, ivLength);
	inputBuffer.copy(tag, 0, inputBuffer.length - tagLength);
	inputBuffer.copy(data, 0, ivLength);

	const decipher = createDecipheriv('aes-256-gcm', key, iv);
	decipher.setAuthTag(tag);

	let dec = decipher.update(data, undefined, 'utf8');
	dec += decipher.final('utf8');

	return dec;
}
