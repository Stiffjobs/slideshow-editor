import type { RefObject } from 'react';
import { useEffect, useState } from 'react';

export function useResizeObserver<T extends Element>(ref: RefObject<T | null>) {
	const [rect, setRect] = useState<DOMRectReadOnly | null>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const ro = new ResizeObserver((entries) => {
			const next = entries[0]?.contentRect ?? null;
			setRect(next);
		});

		ro.observe(el);
		return () => ro.disconnect();
	}, [ref]);

	return rect;
}
