import { openDB } from 'idb';

import type { ProjectDoc } from '@/state/types';

const DB_NAME = 'slideshow-gen';
const DB_VERSION = 1;
const IMAGE_STORE = 'images';

const LS_PROJECT_PREFIX = 'slideshow-gen:project:';
const LS_CURRENT_PROJECT = 'slideshow-gen:currentProjectId';

async function getDb() {
	return await openDB(DB_NAME, DB_VERSION, {
		upgrade(db) {
			if (!db.objectStoreNames.contains(IMAGE_STORE)) {
				db.createObjectStore(IMAGE_STORE);
			}
		},
	});
}

export function getCurrentProjectId(): string | null {
	return localStorage.getItem(LS_CURRENT_PROJECT);
}

export function setCurrentProjectId(id: string) {
	localStorage.setItem(LS_CURRENT_PROJECT, id);
}

export function loadProjectDoc(id: string): ProjectDoc | null {
	const raw = localStorage.getItem(`${LS_PROJECT_PREFIX}${id}`);
	if (!raw) return null;
	try {
		return JSON.parse(raw) as ProjectDoc;
	} catch {
		return null;
	}
}

export function saveProjectDoc(doc: ProjectDoc) {
	localStorage.setItem(`${LS_PROJECT_PREFIX}${doc.id}`, JSON.stringify(doc));
	setCurrentProjectId(doc.id);
}

export async function saveBackgroundImageBlob(projectId: string, blob: Blob) {
	const db = await getDb();
	await db.put(IMAGE_STORE, blob, projectId);
}

export async function loadBackgroundImageBlob(projectId: string) {
	const db = await getDb();
	return (await db.get(IMAGE_STORE, projectId)) as Blob | undefined;
}

export async function deleteBackgroundImageBlob(projectId: string) {
	const db = await getDb();
	await db.delete(IMAGE_STORE, projectId);
}
