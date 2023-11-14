export enum LayoutTheme {
	LIGHT = 'light',
	DARK = 'dark'
}

export enum Locale {
	EN = 'en',
	DE = 'de'
}

export type UserPrefs = {
	theme: LayoutTheme;
	locale: Locale;
};
