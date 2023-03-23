// export interface GigDateData {

// }

export interface GigDate {
	title: string;
	dateTime: string;
	dateString?: string;
	parsedDateTime?: Date;
	localeDate: string;
	localeTime: string;
	venue: string;
	address: string | null;
	image: string;
	imageClasses?: string[];
	displayHistorical: boolean;
	featured?: boolean;
}
