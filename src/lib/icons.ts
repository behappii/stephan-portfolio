export const STACK_ICONS = ['web', 'mobile', 'desktop', 'infra', 'design', 'ai'] as const;
export type StackIcon = (typeof STACK_ICONS)[number];

export const STACK_ICON_LABELS: Record<StackIcon, string> = {
	web: 'Веб',
	mobile: 'Мобайл',
	desktop: 'Десктоп',
	infra: 'Инфраструктура',
	design: 'Дизайн',
	ai: 'Нейросети'
};
