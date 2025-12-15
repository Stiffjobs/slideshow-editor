import { createFileRoute } from '@tanstack/react-router';

import { EditorPage } from '@/pages/EditorPage';

export const Route = createFileRoute('/')({
	ssr: false,
	component: EditorPage,
});
