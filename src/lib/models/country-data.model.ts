export type CountryData = {
	area: number;
	borders: string[];
	capital: [string];
	cca2: string;
	currencies: { [key: string]: { name: string; symbol: string } };
	languages: { [key: string]: string }[];
	population: number;
};
