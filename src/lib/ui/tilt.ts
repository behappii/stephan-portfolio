import type { Attachment } from 'svelte/attachments';

/** Наибольший наклон карточки к курсору, в градусах. */
const MAX_TILT = 6;

/**
 * Передаёт в CSS положение курсора над карточкой: --mx/--my для блика и --rx/--ry
 * для наклона. Сам эффект и условия, когда он включается, описаны в `.va-hover`.
 */
export const tilt: Attachment<HTMLElement> = (node) => {
	function move(e: PointerEvent) {
		if (e.pointerType !== 'mouse') return;
		const r = node.getBoundingClientRect();
		const x = (e.clientX - r.left) / r.width;
		const y = (e.clientY - r.top) / r.height;
		node.style.setProperty('--mx', `${x * 100}%`);
		node.style.setProperty('--my', `${y * 100}%`);
		node.style.setProperty('--rx', `${(0.5 - y) * MAX_TILT * 2}deg`);
		node.style.setProperty('--ry', `${(x - 0.5) * MAX_TILT * 2}deg`);
	}
	function leave() {
		for (const name of ['--mx', '--my', '--rx', '--ry']) node.style.removeProperty(name);
	}
	node.addEventListener('pointermove', move);
	node.addEventListener('pointerleave', leave);
	return () => {
		node.removeEventListener('pointermove', move);
		node.removeEventListener('pointerleave', leave);
	};
};
