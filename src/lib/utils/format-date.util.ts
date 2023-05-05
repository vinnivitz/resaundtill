export type FormatDateOptions = {
	w?: boolean;
	d?: boolean;
	m?: boolean;
	y?: boolean;
};

export const formatDate = (date: Date, options: FormatDateOptions = { w: true, d: true, m: true, y: true }) =>
	`${options.w ? date.toLocaleString('default', { weekday: 'long' }) : ''}, ${
		options.d ? (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) : ''
	}.${options.m ? date.toLocaleString('default', { month: 'long' }) : ''}.${options.y ? date.getFullYear() : ''}`;
