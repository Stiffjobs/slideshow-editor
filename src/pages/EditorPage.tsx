import Konva from 'konva';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
	AlignLeft,
	AlignCenter,
	AlignRight,
	Download,
	ImagePlus,
	Plus,
	Trash2,
} from 'lucide-react';

import { EditorStage } from '@/canvas/EditorStage';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '@/canvas/constants';
import { useResizeObserver } from '@/hooks/useResizeObserver';
import { useWindowSize } from '@/hooks/useWindowSize';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useEditorStore } from '@/state/useEditorStore';
import type { ProjectDoc } from '@/state/types';
import {
	deleteBackgroundImageBlob,
	getCurrentProjectId,
	loadBackgroundImageBlob,
	loadProjectDoc,
	saveBackgroundImageBlob,
	saveProjectDoc,
	setCurrentProjectId,
} from '@/storage/projectStorage';

function createDefaultProject(id: string): ProjectDoc {
	return {
		id,
		width: CANVAS_WIDTH,
		height: CANVAS_HEIGHT,
		updatedAt: Date.now(),
		texts: [],
		backgroundImage: { hasImage: false },
	};
}

export function EditorPage() {
	const stageRef = useRef<Konva.Stage>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const rect = useResizeObserver(containerRef);
	const win = useWindowSize();

	const project = useEditorStore((s) => s.project);
	const backgroundImageUrl = useEditorStore((s) => s.backgroundImageUrl);
	const selectedTextId = useEditorStore((s) => s.selectedTextId);
	const setProject = useEditorStore((s) => s.setProject);
	const setBackgroundImageUrl = useEditorStore((s) => s.setBackgroundImageUrl);
	const addText = useEditorStore((s) => s.addText);
	const updateText = useEditorStore((s) => s.updateText);
	const deleteText = useEditorStore((s) => s.deleteText);
	const clear = useEditorStore((s) => s.clear);

	const [fileInputKey, setFileInputKey] = useState(0);

	const selectedText = useMemo(() => {
		if (!selectedTextId) return undefined;
		return project.texts.find((t) => t.id === selectedTextId);
	}, [project.texts, selectedTextId]);

	const displayScale = useMemo(() => {
		const availableW = (rect?.width ?? 0) - 16;
		const availableH = win.height - 64 - 24 * 2 - 56;

		if (!availableW || !win.height) return 1;

		const scaleW = Math.max(0.1, availableW / CANVAS_WIDTH);
		const scaleH = Math.max(0.1, availableH / CANVAS_HEIGHT);

		return Math.min(1, scaleW, scaleH);
	}, [rect?.width, win.height]);

	// Initial load (localStorage + IndexedDB)
	useEffect(() => {
		const existingId = getCurrentProjectId();
		const id = existingId ?? crypto.randomUUID();
		if (!existingId) setCurrentProjectId(id);

		const doc = loadProjectDoc(id) ?? createDefaultProject(id);
		setProject(doc);

		let urlToRevoke: string | undefined;
		void (async () => {
			const blob = await loadBackgroundImageBlob(id);
			if (!blob) return;
			const url = URL.createObjectURL(blob);
			urlToRevoke = url;
			setBackgroundImageUrl(url, blob.type || undefined);
		})();

		return () => {
			if (urlToRevoke) URL.revokeObjectURL(urlToRevoke);
		};
	}, [setBackgroundImageUrl, setProject]);

	// Autosave project doc (debounced)
	useEffect(() => {
		const t = window.setTimeout(() => {
			saveProjectDoc(project);
		}, 250);
		return () => window.clearTimeout(t);
	}, [project]);

	async function onPickImage(file: File) {
		const projectId = project.id;
		await saveBackgroundImageBlob(projectId, file);

		// swap object URLs safely
		if (backgroundImageUrl) URL.revokeObjectURL(backgroundImageUrl);
		setBackgroundImageUrl(undefined);

		const url = URL.createObjectURL(file);
		setBackgroundImageUrl(url, file.type || undefined);
	}

	async function onClearImage() {
		const projectId = project.id;
		await deleteBackgroundImageBlob(projectId);
		if (backgroundImageUrl) URL.revokeObjectURL(backgroundImageUrl);
		setBackgroundImageUrl(undefined);
		setFileInputKey((k) => k + 1);
	}

	function downloadDataUrl(dataUrl: string, filename: string) {
		const a = document.createElement('a');
		a.download = filename;
		a.href = dataUrl;
		a.click();
	}

	function exportImage(mimeType: 'image/png' | 'image/jpeg') {
		const stage = stageRef.current;
		if (!stage) return;

		const dataUrl = stage.toDataURL({
			mimeType,
			pixelRatio: 2,
			quality: mimeType === 'image/jpeg' ? 0.92 : undefined,
		});
		const ext = mimeType === 'image/png' ? 'png' : 'jpg';
		downloadDataUrl(dataUrl, `design-${project.id}.${ext}`);
	}

	return (
		<div className="min-h-[calc(100vh-64px)] bg-background">
			<div className="mx-auto max-w-7xl px-4 py-6">
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
					<div ref={containerRef} className="min-w-0">
						<div className="mb-3 flex flex-wrap items-center gap-2">
							<Button onClick={() => addText()} className="gap-2">
								<Plus className="size-4" />
								Add text
							</Button>

							<Label className="inline-flex items-center gap-2">
								<span className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm">
									<ImagePlus className="size-4" />
									Upload image
								</span>
								<Input
									key={fileInputKey}
									className="hidden"
									type="file"
									accept="image/*"
									onChange={(e) => {
										const f = e.target.files?.[0];
										if (f) void onPickImage(f);
									}}
								/>
							</Label>

							<Button
								variant="secondary"
								onClick={() => exportImage('image/png')}
								className="gap-2"
							>
								<Download className="size-4" />
								Export PNG
							</Button>

							<Button
								variant="secondary"
								onClick={() => exportImage('image/jpeg')}
								className="gap-2"
							>
								<Download className="size-4" />
								Export JPG
							</Button>
						</div>

						<EditorStage stageRef={stageRef} displayScale={displayScale} />
					</div>

					<Card className="h-fit p-4">
						<div className="space-y-4">
							<div className="space-y-1">
								<div className="text-sm font-semibold">Project</div>
								<div className="text-xs text-muted-foreground">
									{project.width}×{project.height} • {project.id}
								</div>
							</div>

							<div className="flex flex-wrap gap-2">
								<Button
									variant="outline"
									onClick={() => void onClearImage()}
									disabled={!backgroundImageUrl}
								>
									Clear image
								</Button>
								<Button
									variant="destructive"
									onClick={() => {
										void (async () => {
											await onClearImage();
											clear();
										})();
									}}
								>
									Reset project
								</Button>
							</div>

							<Separator />

							<div className="space-y-3">
								<div className="text-sm font-semibold">Selected text</div>

								{!selectedText ? (
									<div className="text-sm text-muted-foreground">
										Select a text element on the canvas.
									</div>
								) : (
									<div className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor="text">Text</Label>
											<Textarea
												id="text"
												value={selectedText.text}
												onChange={(e) =>
													updateText(selectedText.id, { text: e.target.value })
												}
											/>
										</div>

										<div className="space-y-2">
											<Label>Font size</Label>
											<Slider
												value={[selectedText.fontSize]}
												min={8}
												max={140}
												step={1}
												onValueChange={([v]) =>
													updateText(selectedText.id, { fontSize: v ?? 48 })
												}
											/>
											<div className="text-xs text-muted-foreground">
												{selectedText.fontSize}px
											</div>
										</div>

										<div className="space-y-2">
											<Label>Style presets</Label>
											<div className="grid grid-cols-2 gap-2">
												<Button
													type="button"
													variant="outline"
													onClick={() =>
														updateText(selectedText.id, {
															fill: '#ffffff',
															stroke: undefined,
															strokeWidth: 0,
															backgroundFill: undefined,
															backgroundPadding: 0,
															backgroundCornerRadius: 0,
														})
													}
												>
													Plain
												</Button>
												<Button
													type="button"
													variant="outline"
													onClick={() =>
														updateText(selectedText.id, {
															fill: '#ffffff',
															stroke: '#000000',
															strokeWidth: 12,
															backgroundFill: undefined,
															backgroundPadding: 0,
															backgroundCornerRadius: 0,
															fontStyle: 'bold',
														})
													}
												>
													Outlined
												</Button>
												<Button
													type="button"
													variant="outline"
													onClick={() =>
														updateText(selectedText.id, {
															fill: '#000000',
															stroke: undefined,
															strokeWidth: 0,
															backgroundFill: '#ffffff',
															backgroundPadding: 18,
															backgroundCornerRadius: 22,
															fontStyle: 'bold',
														})
													}
												>
													White badge
												</Button>
												<Button
													type="button"
													variant="outline"
													onClick={() =>
														updateText(selectedText.id, {
															fill: '#ffffff',
															stroke: undefined,
															strokeWidth: 0,
															backgroundFill: '#000000',
															backgroundPadding: 18,
															backgroundCornerRadius: 22,
															fontStyle: 'bold',
														})
													}
												>
													Black badge
												</Button>
											</div>
											<div className="text-xs text-muted-foreground">
												Presets override stroke/background for the selected
												text.
											</div>
										</div>

										<div className="space-y-2">
											<Label>Layout</Label>

											<label className="flex items-center justify-between gap-3 text-sm">
												<span className="text-muted-foreground">
													Fit to canvas width
												</span>
												<input
													type="checkbox"
													className="h-4 w-4 accent-primary"
													checked={Boolean(selectedText.fitToCanvas)}
													onChange={(e) => {
														const fitToCanvas = e.target.checked;
														const marginX = selectedText.marginX ?? 64;
														updateText(selectedText.id, {
															fitToCanvas,
															marginX,
															// when fit is enabled, keep it aligned to the canvas margin
															x: fitToCanvas ? marginX : selectedText.x,
														});
													}}
												/>
											</label>

											<div className="flex items-center gap-2">
												<div className="flex rounded-md border" role="group">
													<Button
														type="button"
														variant={
															selectedText.align === 'left'
																? 'default'
																: 'ghost'
														}
														className="rounded-r-none border-r"
														onClick={() => {
															const marginX = selectedText.marginX ?? 64;
															updateText(selectedText.id, {
																fitToCanvas: true,
																marginX,
																align: 'left',
																x: marginX,
															});
														}}
														disabled={!selectedText.fitToCanvas}
													>
														<AlignLeft className="size-4" />
													</Button>
													<Button
														type="button"
														variant={
															selectedText.align === 'center'
																? 'default'
																: 'ghost'
														}
														className="rounded-none border-r"
														onClick={() => {
															const marginX = selectedText.marginX ?? 64;
															updateText(selectedText.id, {
																fitToCanvas: true,
																marginX,
																align: 'center',
																x: marginX,
															});
														}}
														disabled={!selectedText.fitToCanvas}
													>
														<AlignCenter className="size-4" />
													</Button>
													<Button
														type="button"
														variant={
															selectedText.align === 'right'
																? 'default'
																: 'ghost'
														}
														className="rounded-l-none"
														onClick={() => {
															const marginX = selectedText.marginX ?? 64;
															updateText(selectedText.id, {
																fitToCanvas: true,
																marginX,
																align: 'right',
																x: marginX,
															});
														}}
														disabled={!selectedText.fitToCanvas}
													>
														<AlignRight className="size-4" />
													</Button>
												</div>
											</div>

											<div className="text-xs text-muted-foreground">
												Alignment applies when “fit” is enabled (wrap/box
												width).
											</div>
										</div>

										<div className="flex items-center justify-between">
											<Button
												variant="destructive"
												className="gap-2"
												onClick={() => deleteText(selectedText.id)}
											>
												<Trash2 className="size-4" />
												Delete
											</Button>
											<div className="text-xs text-muted-foreground">
												Drag on canvas, resize via handles
											</div>
										</div>
									</div>
								)}
							</div>
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
}
