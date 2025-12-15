import Konva from 'konva';
import { Layer, Rect, Stage } from 'react-konva';
import type { RefObject } from 'react';
import { useMemo, useRef, useState } from 'react';

import { CANVAS_HEIGHT, CANVAS_WIDTH } from './constants';
import { CanvasGuides, type CanvasGuidesState } from './CanvasGuides';
import { ImageLayer } from './ImageLayer';
import { TextLayer } from './TextLayer';
import { TransformerWrapper } from './TransformerWrapper';
import { useEditorStore } from '@/state/useEditorStore';

const CENTER_SNAP_DISTANCE = 6; // px

function getCenterGuidesForNode(node: Konva.Node) {
	const rect = node.getClientRect();
	const cx = rect.x + rect.width / 2;
	const cy = rect.y + rect.height / 2;

	const showVCenter = Math.abs(cx - CANVAS_WIDTH / 2) <= CENTER_SNAP_DISTANCE;
	const showHCenter = Math.abs(cy - CANVAS_HEIGHT / 2) <= CENTER_SNAP_DISTANCE;

	return { showVCenter, showHCenter, cx, cy };
}

export function EditorStage({
	stageRef,
	displayScale,
}: {
	stageRef: RefObject<Konva.Stage | null>;
	displayScale: number;
}) {
	const { project, backgroundImageUrl, selectedTextId } = useEditorStore();
	const selectText = useEditorStore((s) => s.selectText);
	const updateText = useEditorStore((s) => s.updateText);

	const nodeRefs = useRef<Record<string, Konva.Group | null>>({});
	const [guides, setGuides] = useState<CanvasGuidesState | null>(null);

	const selectedNode = useMemo(() => {
		if (!selectedTextId) return null;
		return nodeRefs.current[selectedTextId] ?? null;
	}, [selectedTextId]);

	return (
		<div
			className="rounded-lg border bg-card shadow-sm"
			style={{
				width: CANVAS_WIDTH * displayScale,
				height: CANVAS_HEIGHT * displayScale,
			}}
		>
			<div
				style={{
					width: CANVAS_WIDTH,
					height: CANVAS_HEIGHT,
					transform: `scale(${displayScale})`,
					transformOrigin: 'top left',
				}}
			>
				<Stage
					ref={stageRef}
					width={CANVAS_WIDTH}
					height={CANVAS_HEIGHT}
					onMouseDown={(e) => {
						const stage = e.target.getStage();
						if (!stage) return;
						const clickedOnEmpty = e.target === stage;
						if (clickedOnEmpty) {
							selectText(undefined);
							setGuides(null);
						}
					}}
					onTouchStart={(e) => {
						const stage = e.target.getStage();
						if (!stage) return;
						const clickedOnEmpty = e.target === stage;
						if (clickedOnEmpty) {
							selectText(undefined);
							setGuides(null);
						}
					}}
				>
					<Layer>
						<Rect
							x={0}
							y={0}
							width={CANVAS_WIDTH}
							height={CANVAS_HEIGHT}
							fill="#0b1220"
							listening={false}
						/>
						<ImageLayer src={backgroundImageUrl} />
						{project.texts.map((t) => (
							<TextLayer
								key={t.id}
								el={t}
								onSelect={() => selectText(t.id)}
								onChange={(patch) => updateText(t.id, patch)}
								onDragMove={(node) => {
									const g = getCenterGuidesForNode(node);

									// Snap (Figma-like) while showing guides
									if (g.showVCenter) {
										node.x(node.x() + (CANVAS_WIDTH / 2 - g.cx));
									}
									if (g.showHCenter) {
										node.y(node.y() + (CANVAS_HEIGHT / 2 - g.cy));
									}

									setGuides({
										showVCenter: g.showVCenter,
										showHCenter: g.showHCenter,
									});
								}}
								onDragEnd={() => setGuides(null)}
								setNodeRef={(node) => {
									nodeRefs.current[t.id] = node;
								}}
							/>
						))}
						<TransformerWrapper selectedNode={selectedNode} />
						<CanvasGuides guides={guides} />
					</Layer>
				</Stage>
			</div>
		</div>
	);
}
