import { Image as KonvaImage } from 'react-konva';
import { useEffect, useMemo, useState } from 'react';

import { CANVAS_HEIGHT, CANVAS_WIDTH } from './constants';
import { getCoverRect } from './getCoverRect';

export function ImageLayer({ src }: { src?: string }) {
	const [image, setImage] = useState<HTMLImageElement | null>(null);

	useEffect(() => {
		if (!src) {
			setImage(null);
			return;
		}
		const img = new window.Image();
		img.crossOrigin = 'anonymous';
		img.onload = () => setImage(img);
		img.src = src;
		return () => {
			// allow GC
			img.onload = null;
		};
	}, [src]);

	const rect = useMemo(() => {
		if (!image) return null;
		return getCoverRect({
			imgWidth: image.width,
			imgHeight: image.height,
			canvasWidth: CANVAS_WIDTH,
			canvasHeight: CANVAS_HEIGHT,
		});
	}, [image]);

	if (!image || !rect) return null;

	return (
		<KonvaImage
			image={image}
			x={rect.x}
			y={rect.y}
			width={rect.width}
			height={rect.height}
			listening={false}
		/>
	);
}
