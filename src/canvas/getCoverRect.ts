export function getCoverRect(args: {
	imgWidth: number;
	imgHeight: number;
	canvasWidth: number;
	canvasHeight: number;
}) {
	const { imgWidth, imgHeight, canvasWidth, canvasHeight } = args;

	const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
	const width = imgWidth * scale;
	const height = imgHeight * scale;

	return {
		width,
		height,
		x: (canvasWidth - width) / 2,
		y: (canvasHeight - height) / 2,
	};
}
