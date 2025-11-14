export interface iPostCat {
	id: number;
	documentId: string;
	title: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
}
export interface iPostImage {
	url: string;
}
export interface iBlogPost {
	id: number;
	documentId: string;
	title: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	content: string;
	image: iPostImage | null;
	category: iPostCat;
}
