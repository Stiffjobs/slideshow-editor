import { create } from 'zustand';

import type { ProjectDoc, TextElement } from './types';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '@/canvas/constants';

type EditorState = {
	project: ProjectDoc;
	backgroundImageUrl?: string;
	selectedTextId?: string;

	setProject: (project: ProjectDoc) => void;
	setBackgroundImageUrl: (url?: string, mimeType?: string) => void;
	selectText: (id?: string) => void;

	addText: () => void;
	updateText: (id: string, patch: Partial<TextElement>) => void;
	deleteText: (id: string) => void;
	clear: () => void;
};

function createBlankProject(id: string): ProjectDoc {
	return {
		id,
		width: CANVAS_WIDTH,
		height: CANVAS_HEIGHT,
		updatedAt: Date.now(),
		texts: [],
		backgroundImage: { hasImage: false },
	};
}

export const useEditorStore = create<EditorState>((set, get) => ({
	project: createBlankProject(crypto.randomUUID()),
	backgroundImageUrl: undefined,
	selectedTextId: undefined,

	setProject: (project) =>
		set({
			project,
			selectedTextId: undefined,
		}),

	setBackgroundImageUrl: (url, mimeType) =>
		set((s) => ({
			backgroundImageUrl: url,
			project: {
				...s.project,
				updatedAt: Date.now(),
				backgroundImage: { hasImage: Boolean(url), mimeType },
			},
		})),

	selectText: (id) => set({ selectedTextId: id }),

	addText: () => {
		const id = crypto.randomUUID();
		const next: TextElement = {
			id,
			text: 'Double-click to edit',
			x: 80,
			y: 80,
			fontSize: 48,
			fill: '#ffffff',
			fontFamily: 'TikTok Sans',
			fontStyle: 'bold',
			stroke: undefined,
			strokeWidth: 0,
			backgroundFill: undefined,
			backgroundPadding: 0,
			backgroundCornerRadius: 0,
			fitToCanvas: true,
			marginX: 64,
			align: 'center',
		};

		set((s) => ({
			selectedTextId: id,
			project: {
				...s.project,
				updatedAt: Date.now(),
				texts: [...s.project.texts, next],
			},
		}));
	},

	updateText: (id, patch) =>
		set((s) => ({
			project: {
				...s.project,
				updatedAt: Date.now(),
				texts: s.project.texts.map((t) =>
					t.id === id ? { ...t, ...patch } : t,
				),
			},
		})),

	deleteText: (id) =>
		set((s) => ({
			selectedTextId: s.selectedTextId === id ? undefined : s.selectedTextId,
			project: {
				...s.project,
				updatedAt: Date.now(),
				texts: s.project.texts.filter((t) => t.id !== id),
			},
		})),

	clear: () => {
		const id = get().project.id;
		set({
			project: createBlankProject(id),
			backgroundImageUrl: undefined,
			selectedTextId: undefined,
		});
	},
}));
