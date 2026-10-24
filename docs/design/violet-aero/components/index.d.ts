import type * as React from 'react';

export type IconName = 'web' | 'mobile' | 'desktop' | 'infra' | 'design' | 'arrow-right' | 'arrow-up-right';

/** Глянцевая кнопка. violet — главное действие, pearl — второстепенное. Есть href — рендерится ссылкой. */
export interface GlossButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'violet' | 'pearl';
  size?: 'md' | 'lg';
  href?: string;
  icon?: IconName;
  children?: React.ReactNode;
}
export declare function GlossButton(props: GlossButtonProps): React.ReactElement;

/** Тег технологии (pearl) или бейдж платформы (violet). */
export interface TagProps { tone?: 'pearl' | 'violet'; className?: string; children?: React.ReactNode }
export declare function Tag(props: TagProps): React.ReactElement;

/** Метка раздела над заголовком: «02 · проекты». */
export interface EyebrowProps { tone?: 'sky' | 'dusk'; className?: string; children?: React.ReactNode }
export declare function Eyebrow(props: EyebrowProps): React.ReactElement;

/** Линейная иконка 24×24, обводка currentColor. Без label — декоративная. */
export interface IconProps { name: IconName; size?: number; strokeWidth?: number; label?: string; className?: string }
export declare function Icon(props: IconProps): React.ReactElement;

/** Глянцевая плитка 56×56 с иконкой. */
export interface IconTileProps { icon?: IconName; label?: string; className?: string; children?: React.ReactNode }
export declare function IconTile(props: IconTileProps): React.ReactElement;

/** Глянцевый шар: номер шага (md, 64px) или логотип (sm, 44px). */
export interface OrbProps { size?: 'sm' | 'md'; decorative?: boolean; className?: string; children?: React.ReactNode }
export declare function Orb(props: OrbProps): React.ReactElement;

/** Декоративный мыльный пузырь, всегда aria-hidden. */
export interface BubbleProps { size?: number; tone?: 'sky' | 'dusk'; style?: React.CSSProperties; className?: string }
export declare function Bubble(props: BubbleProps): React.ReactElement;

/** Стеклянная панель — основа всех карточек. */
export interface GlassCardProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'div' | 'article' | 'li' | 'section';
  radius?: 'xl' | '2xl';
  padding?: 'sm' | 'md' | 'lg';
  lift?: boolean;
  children?: React.ReactNode;
}
export declare function GlassCard(props: GlassCardProps): React.ReactElement;

/** Стеклянная навигация-«пилюля»: шар-логотип, имя, ссылки, одна глянцевая кнопка. */
export interface GlassNavProps {
  brand: React.ReactNode;
  brandHref?: string;
  mark?: React.ReactNode;
  links?: { label: string; href: string }[];
  cta?: { label: string; href: string };
  label?: string;
  className?: string;
}
export declare function GlassNav(props: GlassNavProps): React.ReactElement;

/** Шапка раздела: метка, заголовок h2 и справа короткий текст или ссылка. */
export interface SectionHeaderProps { eyebrow?: React.ReactNode; title: React.ReactNode; aside?: React.ReactNode; id?: string; tone?: 'sky' | 'dusk'; className?: string }
export declare function SectionHeader(props: SectionHeaderProps): React.ReactElement;

/** Карточка направления стека: плитка-иконка, заголовок, строка текста, теги. */
export interface StackCardProps { icon: IconName; title: React.ReactNode; text?: React.ReactNode; tags?: string[]; className?: string }
export declare function StackCard(props: StackCardProps): React.ReactElement;

/** Карточка проекта: поле под скриншот с бейджем платформы, название, год, описание, теги. */
export interface ProjectCardProps { title: React.ReactNode; platform?: string; year?: string; text?: React.ReactNode; tags?: string[]; image?: string; imageAlt?: string; placeholder?: string; className?: string }
export declare function ProjectCard(props: ProjectCardProps): React.ReactElement;

/** Окно в духе Aero для иллюстраций: стеклянная полоса заголовка, белая клиентская область. */
export interface AeroWindowProps { kind?: 'browser' | 'app'; url?: string; label?: string; decorative?: boolean; style?: React.CSSProperties; className?: string; children?: React.ReactNode }
export declare function AeroWindow(props: AeroWindowProps): React.ReactElement;

declare global {
  interface Window {
    VioletAero: {
      GlossButton: typeof GlossButton; Tag: typeof Tag; Eyebrow: typeof Eyebrow; Icon: typeof Icon; IconTile: typeof IconTile;
      Orb: typeof Orb; Bubble: typeof Bubble; GlassCard: typeof GlassCard; GlassNav: typeof GlassNav; SectionHeader: typeof SectionHeader;
      StackCard: typeof StackCard; ProjectCard: typeof ProjectCard; AeroWindow: typeof AeroWindow;
    };
  }
}
