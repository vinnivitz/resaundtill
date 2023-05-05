export enum LayoutTheme {
	light = 'light',
	dark = 'dark'
}

export enum Locale {
	en = 'en-US',
	de = 'de-DE'
}

export type UserPrefs = {
	theme: LayoutTheme;
	locale: Locale;
};
