export type TextElement = {
	id: string;
	text: string;
	x: number;
	y: number;
	fontSize: number;
	fill: string;
	fontFamily: string;
	fontStyle?: string;
	stroke?: string;
	strokeWidth?: number;
	backgroundFill?: string;
	backgroundPadding?: number;
	backgroundCornerRadius?: number;
	/**
	 * If true, the text box width is set to (canvasWidth - 2 * marginX),
	 * enabling wrapping and consistent alignment.
	 */
	fitToCanvas?: boolean;
	/** Horizontal padding from canvas edges when fitToCanvas is enabled. */
	marginX?: number;
	/** Konva Text align. Only meaningful when a width is set (fitToCanvas). */
	align?: 'left' | 'center' | 'right';
	/** Custom width for the text box. When set, text will wrap to fit. */
	width?: number;
};

export type ProjectDoc = {
	id: string;
	width: number;
	height: number;
	updatedAt: number;
	texts: TextElement[];
	backgroundImage: {
		hasImage: boolean;
		mimeType?: string;
	};
};
