import type { Db } from './client';
import { approachSteps, links, projects, settings, stackItems } from './schema';

const PROJECT_TEXT = '[Одно предложение: что это, для кого и какую задачу решает]';

export function seedIfEmpty(db: Db): boolean {
	if (db.select().from(settings).get()) return false;

	db.transaction((tx) => {
		tx.insert(settings)
			.values({
				id: 1,
				name: 'Степан',
				city: '[город]',
				heroTitle: 'Ваша идея —',
				heroTitleAccent: 'моя задача',
				heroText:
					'Меня зовут Степан, веб-разработчик, студент ПГУ имени Шолом-Алейхема, обучаюсь по специальности информационные системы и технологии. Прототипирую интерфейсы с помощью нейросетей, пишу веб на SvelteKit и Next.js, мобильные приложения — на React Native и Flutter.',
				heroCtaPrimary: 'Обсудить проект',
				heroCtaSecondary: 'Смотреть проекты',
				stackEyebrow: 'стек',
				stackTitle: 'Работает везде',
				stackSubtitle: 'Подбираю инструмент под задачу, а не задачу под инструмент.',
				projectsEyebrow: 'проекты',
				projectsTitle: 'Избранные работы',
				approachEyebrow: 'подход',
				approachTitle: 'Сайт под ключ, исходники — ваши',
				contactEyebrow: 'контакты',
				contactTitle: 'Есть идея? Давайте соберём её',
				email: '[you@email.com]',
				footerYear: '[год]',
				seoTitle: 'behappii — веб-разработчик Степан',
				seoDescription:
					'Портфолио веб-разработчика: сайты, мобильные и десктопные приложения под ключ.'
			})
			.run();

		tx.insert(stackItems)
			.values([
				{
					sort: 0,
					icon: 'web',
					title: 'Веб',
					description: 'Быстрые сайты и веб-приложения.',
					tags: ['SvelteKit', 'Next.js', 'WordPress']
				},
				{
					sort: 1,
					icon: 'mobile',
					title: 'Мобайл',
					description: 'Приложения для iOS и Android из одной кодовой базы.',
					tags: ['React Native', 'Flutter']
				},
				{
					sort: 2,
					icon: 'desktop',
					title: 'Десктоп',
					description: 'Лёгкие приложения для macOS, Windows и Linux.',
					tags: ['Tauri']
				},
				{
					sort: 3,
					icon: 'infra',
					title: 'Инфра­структура',
					description: 'CI/CD, контейнеры и деплой в облако.',
					tags: ['Docker', 'CI/CD']
				},
				{
					sort: 4,
					icon: 'ai',
					title: 'Нейросети',
					description: 'Прототипы за часы и разработка без рутины.',
					tags: ['Claude']
				}
			])
			.run();

		tx.insert(projects)
			.values([
				{
					sort: 0,
					title: '[Название проекта]',
					category: 'Веб',
					year: '[год]',
					description: PROJECT_TEXT,
					tags: ['SvelteKit', 'Docker']
				},
				{
					sort: 1,
					title: '[Название проекта]',
					category: 'Мобайл',
					year: '[год]',
					description: PROJECT_TEXT,
					tags: ['React Native']
				},
				{
					sort: 2,
					title: '[Название проекта]',
					category: 'Десктоп',
					year: '[год]',
					description: PROJECT_TEXT,
					tags: ['Tauri', 'SvelteKit']
				},
				{
					sort: 3,
					title: '[Название проекта]',
					category: 'Мобайл',
					year: '[год]',
					description: PROJECT_TEXT,
					tags: ['Flutter', 'Next.js']
				}
			])
			.run();

		tx.insert(approachSteps)
			.values([
				{
					sort: 0,
					title: 'Прототип',
					description:
						'Собираю прототип с помощью нейросетей и согласовываю интерфейс до начала разработки.',
					tags: ['Claude']
				},
				{
					sort: 1,
					title: 'Разработка',
					description:
						'Выбираю платформу под задачу: веб, мобильное или десктопное приложение — или всё сразу.',
					tags: ['SvelteKit', 'Next.js', 'React Native', 'Flutter', 'Tauri']
				},
				{
					sort: 2,
					title: 'Запуск',
					description:
						'Настраиваю CI/CD и упаковываю в Docker, чтобы проект одинаково работал у вас, у меня и на сервере, — и передаю все исходники и доступы.',
					tags: ['Docker', 'CI/CD']
				},
				{
					sort: 3,
					title: 'Поддержка',
					description:
						'По желанию размещаю и сопровождаю сервис на своей стороне: облачный хостинг, обновления, мониторинг. За отдельную плату.',
					tags: ['Облако']
				}
			])
			.run();

		tx.insert(links)
			.values([
				{ sort: 0, label: 'GitHub', url: 'https://github.com/' },
				{ sort: 1, label: 'Telegram', url: 'https://t.me/' },
				{ sort: 2, label: 'LinkedIn', url: 'https://www.linkedin.com/' }
			])
			.run();
	});
	return true;
}
