import Konva from 'konva';
import { useEffect, useRef } from 'react';
import { Transformer } from 'react-konva';

export function TransformerWrapper({
	selectedNode,
}: {
	selectedNode?: Konva.Node | null;
}) {
	const trRef = useRef<Konva.Transformer>(null);

	useEffect(() => {
		const tr = trRef.current;
		if (!tr) return;

		if (!selectedNode) {
			tr.nodes([]);
			tr.getLayer()?.batchDraw();
			return;
		}

		tr.nodes([selectedNode]);
		tr.getLayer()?.batchDraw();
	}, [selectedNode]);

	return (
		<Transformer
			ref={trRef}
			keepRatio={true}
			rotateEnabled={true}
			enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
			boundBoxFunc={(oldBox, newBox) => {
				if (newBox.width < 20 || newBox.height < 20) return oldBox;
				return newBox;
			}}
		/>
	);
}
