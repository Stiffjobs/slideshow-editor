import { Line } from 'react-konva';

import { CANVAS_HEIGHT, CANVAS_WIDTH } from '@/canvas/constants';

export type CanvasGuidesState = {
	showVCenter: boolean;
	showHCenter: boolean;
};

export function CanvasGuides({ guides }: { guides: CanvasGuidesState | null }) {
	if (!guides) return null;

	const stroke = 'red';
	const strokeWidth = 2;

	return (
		<>
			{guides.showVCenter ? (
				<Line
					points={[CANVAS_WIDTH / 2, 0, CANVAS_WIDTH / 2, CANVAS_HEIGHT]}
					stroke={stroke}
					strokeWidth={strokeWidth}
					listening={false}
				/>
			) : null}
			{guides.showHCenter ? (
				<Line
					points={[0, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT / 2]}
					stroke={stroke}
					strokeWidth={strokeWidth}
					listening={false}
				/>
			) : null}
		</>
	);
}
