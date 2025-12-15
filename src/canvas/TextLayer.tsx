import Konva from 'konva';
import { Group, Rect, Text } from 'react-konva';
import { useEffect, useMemo, useRef, useState } from 'react';

import { CANVAS_WIDTH } from '@/canvas/constants';
import type { TextElement } from '@/state/types';

export function TextLayer({
	el,
	onSelect,
	onChange,
	setNodeRef,
	onDragMove,
	onDragEnd,
}: {
	el: TextElement;
	onSelect: () => void;
	onChange: (patch: Partial<TextElement>) => void;
	setNodeRef: (node: Konva.Group | null) => void;
	onDragMove?: (node: Konva.Group) => void;
	onDragEnd?: (node: Konva.Group) => void;
}) {
	const groupRef = useRef<Konva.Group | null>(null);
	const textRef = useRef<Konva.Text | null>(null);
	const [textRect, setTextRect] = useState<{
		x: number;
		y: number;
		width: number;
		height: number;
	} | null>(null);

	const hasBackground = Boolean(el.backgroundFill);
	const pad = hasBackground ? (el.backgroundPadding ?? 0) : 0;
	const cornerRadius = hasBackground ? (el.backgroundCornerRadius ?? 0) : 0;

	const strokeWidth = el.strokeWidth ?? 0;
	const stroke = strokeWidth > 0 ? (el.stroke ?? '#000000') : undefined;

	const fontStyle = el.fontStyle ?? 'normal';
	const marginX = el.marginX ?? 64;
	const fitToCanvas = el.fitToCanvas ?? false;
	const align = el.align ?? 'left';

	const boxWidth = fitToCanvas
		? Math.max(1, CANVAS_WIDTH - marginX * 2)
		: undefined;

	const depsKey = useMemo(
		() =>
			JSON.stringify({
				text: el.text,
				fontSize: el.fontSize,
				fill: el.fill,
				fontFamily: el.fontFamily,
				fontStyle,
				stroke,
				strokeWidth,
				pad,
			}),
		[
			el.text,
			el.fontSize,
			el.fill,
			el.fontFamily,
			fontStyle,
			stroke,
			strokeWidth,
			pad,
		],
	);

	useEffect(() => {
		const node = textRef.current;
		if (!node) return;

		const id = requestAnimationFrame(() => {
			const r = node.getClientRect({ skipTransform: true });
			setTextRect({ x: r.x, y: r.y, width: r.width, height: r.height });
		});
		return () => cancelAnimationFrame(id);
	}, [depsKey]);

	return (
		<Group
			ref={(node) => {
				groupRef.current = node;
				setNodeRef(node);
			}}
			id={el.id}
			x={el.x}
			y={el.y}
			draggable
			onClick={onSelect}
			onTap={onSelect}
			onDblClick={() => {
				const next = window.prompt('Edit text', el.text);
				if (next !== null) onChange({ text: next });
			}}
			onDblTap={() => {
				const next = window.prompt('Edit text', el.text);
				if (next !== null) onChange({ text: next });
			}}
			onDragMove={(e) => {
				onDragMove?.(e.target as Konva.Group);
			}}
			onDragEnd={(e) => {
				const node = e.target as Konva.Group;
				onDragEnd?.(node);
				onChange({
					x: fitToCanvas ? marginX : node.x(),
					y: node.y(),
				});
			}}
			onTransformEnd={(e) => {
				const node = e.target as Konva.Group;
				const scaleX = node.scaleX();
				const nextFontSize = Math.max(8, Math.round(el.fontSize * scaleX));
				node.scaleX(1);
				node.scaleY(1);
				onChange({
					x: fitToCanvas ? marginX : node.x(),
					y: node.y(),
					fontSize: nextFontSize,
				});
			}}
		>
			{hasBackground && textRect ? (
				<Rect
					x={textRect.x - pad}
					y={textRect.y - pad}
					width={textRect.width + pad * 2}
					height={textRect.height + pad * 2}
					fill={el.backgroundFill}
					cornerRadius={cornerRadius}
					listening={false}
				/>
			) : null}
			<Text
				ref={(node) => {
					textRef.current = node;
				}}
				text={el.text}
				x={0}
				y={0}
				width={boxWidth}
				align={fitToCanvas ? align : undefined}
				fontSize={el.fontSize}
				fill={el.fill}
				fontFamily={el.fontFamily}
				fontStyle={fontStyle}
				stroke={stroke}
				strokeWidth={strokeWidth}
				fillAfterStrokeEnabled={true}
			/>
		</Group>
	);
}
