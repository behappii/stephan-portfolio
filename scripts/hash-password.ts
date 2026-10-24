import { hash } from '@node-rs/argon2';
import { createInterface } from 'node:readline/promises';

const rl = createInterface({ input: process.stdin, output: process.stdout });
const password = await rl.question('Пароль для админки: ');
rl.close();

if (password.length < 12) {
	console.error('Пароль короче 12 символов — выберите длиннее.');
	process.exit(1);
}

// Одинарные кавычки не дают docker compose подставлять переменные вместо символов $.
console.log(`ADMIN_PASSWORD_HASH='${await hash(password)}'`);
