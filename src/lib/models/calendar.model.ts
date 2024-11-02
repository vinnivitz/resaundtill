import type { Subscriber, Unsubscriber } from 'svelte/store';

export type CalendarProps = {
	open: boolean;
	hasChosen: boolean;
	selected: any;
	start: Date;
	end: Date;
	shouldEnlargeDay: boolean;
	enlargeDay: boolean;
	year: any;
	month: any;
	day: any;
	activeView: string;
	activeViewDirection: number;
	startOfWeekIndex: number;
};

export type CalendarStore = {
	set: (this: void, value: CalendarProps) => void;
	subscribe: (this: void, run: Subscriber<CalendarProps>, invalidate?: (value?: CalendarProps) => void) => Unsubscriber;
	getState(): CalendarProps;
	enlargeDay(enlargeDay?: boolean): void;
	getSelectableVector(date: any): 0 | 1 | -1;
	isSelectable(date: any, clamping?: any[]): any;
	clampValue(day: any, clampable: any): any;
	add(amount: any, unit: any, clampable?: any[]): void;
	setActiveView(newActiveView: any): void;
	setYear(year: any): void;
	setMonth(month: any): void;
	setDay(day: any): void;
	close(extraState: any): void;
	selectDay(): void;
	getCalendarPage(
		month: any,
		year: any
	): {
		date: any;
		outsider: boolean;
	}[];
};
