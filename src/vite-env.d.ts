/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_STRIPE_LAUNCH_HOSTING_URL?: string;
	readonly VITE_STRIPE_STUDIO_HOSTING_URL?: string;
	readonly VITE_STRIPE_STUDIO_DOMAIN_URL?: string;
	readonly VITE_STRIPE_LEARNKIT_URL?: string;
	readonly VITE_STRIPE_FOCUS_SCHOOL_URL?: string;
	readonly VITE_STRIPE_DOMAIN_HOSTING_URL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
