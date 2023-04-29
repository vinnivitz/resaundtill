export enum LayoutTheme {
	light = 'light',
	dark = 'dark'
}

export enum Locale {
	en = 'en',
	de = 'de'
}

export type UserPrefs = {
	theme: LayoutTheme;
	locale: Locale;
};
