<script lang="ts">
	import { enhance } from '$app/forms';
	import Field from '#lib/admin/Field.svelte';
	import SaveBar from '#lib/admin/SaveBar.svelte';
	import type { SettingsInput } from '#lib/schemas.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	type F = { name: keyof SettingsInput; label: string; type?: 'textarea'; hint?: string };
	const GROUPS: { title: string; fields: F[] }[] = [
		{
			title: 'Общее',
			fields: [
				{ name: 'name', label: 'Имя', hint: 'В плашке первого экрана и в футере' },
				{ name: 'city', label: 'Город' },
				{ name: 'email', label: 'Почта', hint: 'Адрес или заглушка в [скобках]' },
				{ name: 'footerYear', label: 'Год в футере' }
			]
		},
		{
			title: 'Первый экран',
			fields: [
				{ name: 'heroTitle', label: 'Заголовок' },
				{
					name: 'heroTitleAccent',
					label: 'Акцентная часть заголовка',
					hint: 'Выводится градиентом после заголовка'
				},
				{ name: 'heroText', label: 'Текст', type: 'textarea' },
				{ name: 'heroCtaPrimary', label: 'Главная кнопка' },
				{ name: 'heroCtaSecondary', label: 'Вторая кнопка' }
			]
		},
		{
			title: 'Разделы',
			fields: [
				{ name: 'stackEyebrow', label: 'Стек: метка', hint: 'Номер «01 ·» добавляется сам' },
				{ name: 'stackTitle', label: 'Стек: заголовок' },
				{ name: 'stackSubtitle', label: 'Стек: подзаголовок' },
				{ name: 'projectsEyebrow', label: 'Проекты: метка' },
				{ name: 'projectsTitle', label: 'Проекты: заголовок' },
				{ name: 'approachEyebrow', label: 'Подход: метка' },
				{ name: 'approachTitle', label: 'Подход: заголовок' },
				{ name: 'contactEyebrow', label: 'Контакты: метка' },
				{ name: 'contactTitle', label: 'Контакты: заголовок' }
			]
		},
		{
			title: 'SEO',
			fields: [
				{ name: 'seoTitle', label: 'Заголовок вкладки' },
				{ name: 'seoDescription', label: 'Описание для поисковиков', type: 'textarea' }
			]
		}
	];

	const value = (name: keyof SettingsInput) => form?.values?.[name] ?? String(data.settings[name]);
</script>

<svelte:head><title>Тексты — админка</title></svelte:head>

<h1 class="admin-h1">Тексты</h1>

<form
	method="POST"
	use:enhance={() =>
		async ({ update }) =>
			update({ reset: false })}
	class="flex flex-col gap-6"
>
	{#each GROUPS as group (group.title)}
		<fieldset class="admin-panel flex flex-col gap-4">
			<legend class="admin-h2 px-2">{group.title}</legend>
			{#each group.fields as f (f.name)}
				<Field
					name={f.name}
					label={f.label}
					type={f.type}
					hint={f.hint}
					value={value(f.name)}
					error={form?.errors?.[f.name]}
				/>
			{/each}
		</fieldset>
	{/each}
	<SaveBar saved={!!form?.saved} />
</form>
