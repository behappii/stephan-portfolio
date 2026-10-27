/** Заглушки из макета вида «[город]» в разметку для поисковиков не попадают. */
const isPlaceholder = (value: string) => /^\[.*\]$/.test(value.trim());
const filled = (value: string) => value.trim() !== '' && !isPlaceholder(value);

export interface PersonInput {
	origin: string;
	name: string;
	city: string;
	email: string;
	description: string;
	links: { label: string; url: string }[];
}

/** Карточка человека (schema.org/Person) для структурированных данных главной. */
export function personJsonLd(p: PersonInput): Record<string, unknown> {
	const sameAs = p.links.map((l) => l.url).filter((url) => /^https?:\/\//.test(url));
	return {
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: p.name,
		jobTitle: 'Веб-разработчик',
		...(filled(p.description) && { description: p.description }),
		url: `${p.origin}/`,
		...(filled(p.email) && { email: `mailto:${p.email}` }),
		...(filled(p.city) && {
			address: { '@type': 'PostalAddress', addressLocality: p.city }
		}),
		...(sameAs.length && { sameAs })
	};
}

/** Тег script с JSON-LD; «<» экранируется, чтобы данные не могли закрыть тег. */
export function jsonLdScript(data: unknown): string {
	const json = JSON.stringify(data).replace(/</g, '\\u003c');
	return `<script type="application/ld+json">${json}</script>`;
}
