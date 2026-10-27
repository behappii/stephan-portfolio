import { describe, expect, it } from 'vitest';
import { jsonLdScript, personJsonLd } from './seo';

describe('personJsonLd', () => {
	it('собирает карточку человека из настроек и ссылок', () => {
		const data = personJsonLd({
			origin: 'https://behappii.ru',
			name: 'Степан',
			city: 'Биробиджан',
			email: 'me@example.com',
			description: 'Портфолио',
			links: [
				{ label: 'GitHub', url: 'https://github.com/me' },
				{ label: 'Почта', url: 'mailto:me@example.com' }
			]
		});
		expect(data).toEqual({
			'@context': 'https://schema.org',
			'@type': 'Person',
			name: 'Степан',
			jobTitle: 'Веб-разработчик',
			description: 'Портфолио',
			url: 'https://behappii.ru/',
			email: 'mailto:me@example.com',
			address: { '@type': 'PostalAddress', addressLocality: 'Биробиджан' },
			sameAs: ['https://github.com/me']
		});
	});

	it('не выдаёт заглушки из макета и пустые поля', () => {
		const data = personJsonLd({
			origin: 'https://behappii.ru',
			name: 'Степан',
			city: '[город]',
			email: '[you@email.com]',
			description: '',
			links: []
		});
		expect(data).not.toHaveProperty('address');
		expect(data).not.toHaveProperty('email');
		expect(data).not.toHaveProperty('description');
		expect(data).not.toHaveProperty('sameAs');
	});
});

describe('jsonLdScript', () => {
	it('не даёт закрыть тег script изнутри данных', () => {
		const html = jsonLdScript({ name: '</script><script>alert(1)</script>' });
		expect(html.startsWith('<script type="application/ld+json">')).toBe(true);
		expect(html.match(/<\/script>/g)).toHaveLength(1);
	});
});
