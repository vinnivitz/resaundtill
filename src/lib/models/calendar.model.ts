// import type { ManipulateType } from 'dayjs';
// import type { Subscriber, Unsubscriber } from 'svelte/store';

// export type CalendarProps = {
// 	open: boolean;
// 	hasChosen: boolean;
// 	selected: Date;
// 	start: Date;
// 	end: Date;
// 	shouldEnlargeDay: boolean;
// 	enlargeDay: boolean;
// 	year: number;
// 	month: number;
// 	day: number;
// 	activeView: string;
// 	activeViewDirection: number;
// 	startOfWeekIndex: number;
// };

// export type CalendarStore = {
// 	set: (this: void, value: CalendarProps) => void;
// 	subscribe: (this: void, run: Subscriber<CalendarProps>, invalidate?: (value?: CalendarProps) => void) => Unsubscriber;
// 	getState(): CalendarProps;
// 	enlargeDay(enlargeDay?: boolean): void;
// 	getSelectableVector(date: Date): 0 | 1 | -1;
// 	isSelectable(date: Date, clamping?: string[]): boolean;
// 	clampValue(day: Date, clampable: boolean): unknown;
// 	add(amount: number, unit: ManipulateType, clampable?: unknown[]): void;
// 	setActiveView(newActiveView: string): void;
// 	setYear(year: number): void;
// 	setMonth(month: number): void;
// 	setDay(day: number): void;
// 	close(extraState: CalendarStore): void;
// 	selectDay(): void;
// 	getCalendarPage(
// 		month: number,
// 		year: number
// 	): {
// 		date: Date;
// 		outsider: boolean;
// 	}[];
// };

export type CalendarModel = {
	from?: Date;
	to?: Date;
};
