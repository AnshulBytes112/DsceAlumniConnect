declare global {
	const apiClient: typeof import('../lib/api').apiClient;
	const getImageUrl: typeof import('../lib/api').getImageUrl;
	const dashboardUser: any;
	const homePageGallery: string[];
	const mockCredentials: any;
}

export {};
