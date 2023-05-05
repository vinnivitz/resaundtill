import type { ID } from '@directus/sdk';

export type Departure = {
	id: ID;
	date: string;
};

export type DirectusLocation = {
	coordinates: number[];
	type: string;
};

export type SupportInfoEntry = {
	id: ID;
	content: string;
};

export type BlogPostEntry = {
	id: ID;
	status: number;
	date: string;
	title: string;
	description?: string;
	location?: DirectusLocation;
	images?: BlogPostImage[];
};

export type DirectusImage = {
	id: ID;
	height: number;
	width: number;
	title?: string;
	description?: string;
};

export type BlogPostImage = {
	id: ID;
	directus_files_id: DirectusImage;
	resaundtill_id: BlogPostEntry;
};

export enum BlogPostStatus {
	public = 'public',
	private = 'private'
}

export type DirectusActivity = {
	id: ID;
	action: string;
	user?: string | DirectusUsers;
	timestamp: string;
	ip?: string;
	user_agent?: string;
	collection: string;
	item: string;
	comment?: string;
	origin?: string;
	revisions: string | DirectusRevisions[];
};

export type DirectusCollections = {
	collection: string;
	icon?: string;
	note?: string;
	display_template?: string;
	hidden: boolean;
	singleton: boolean;
	translations?: unknown;
	archive_field?: string;
	archive_app_filter: boolean;
	archive_value?: string;
	unarchive_value?: string;
	sort_field?: string;
	accountability?: string;
	color?: string;
	item_duplication_fields?: unknown;
	sort?: number;
	group?: string | DirectusCollections;
	collapse: string;
};

export type DirectusFields = {
	id: ID;
	collection: string | DirectusCollections;
	field: string;
	special?: unknown;
	interface?: string;
	options?: unknown;
	display?: string;
	display_options?: unknown;
	readonly: boolean;
	hidden: boolean;
	sort?: number;
	width?: string;
	translations?: unknown;
	note?: string;
	conditions?: unknown;
	required?: boolean;
	group?: string | DirectusFields;
	validation?: unknown;
	validation_message?: string;
};

export type DirectusFiles = {
	id: ID;
	storage: string;
	filename_disk?: string;
	filename_download: string;
	title?: string;
	type?: string;
	folder?: string | DirectusFolders;
	uploaded_by?: string | DirectusUsers;
	uploaded_on: string;
	modified_by?: string | DirectusUsers;
	modified_on: string;
	charset?: string;
	filesize?: number;
	width?: number;
	height?: number;
	duration?: number;
	embed?: string;
	description?: string;
	location?: string;
	tags?: unknown;
	metadata?: unknown;
};

export type DirectusFolders = {
	id: ID;
	name: string;
	parent?: string | DirectusFolders;
};

export type DirectusMigrations = {
	version: string;
	name: string;
	timestamp?: string;
};

export type DirectusPermissions = {
	id: ID;
	role?: string | DirectusRoles;
	collection: string;
	action: string;
	permissions?: unknown;
	validation?: unknown;
	presets?: unknown;
	fields?: unknown;
};

export type DirectusPresets = {
	id: ID;
	bookmark?: string;
	user?: string | DirectusUsers;
	role?: string | DirectusRoles;
	collection?: string;
	search?: string;
	layout?: string;
	layout_query?: unknown;
	layout_options?: unknown;
	refresh_interval?: number;
	filter?: unknown;
	icon: string;
	color?: string;
};

export type DirectusRelations = {
	id: ID;
	many_collection: string;
	many_field: string;
	one_collection?: string;
	one_field?: string;
	one_collection_field?: string;
	one_allowed_collections?: unknown;
	junction_field?: string;
	sort_field?: string;
	one_deselect_action: string;
};

export type DirectusRevisions = {
	id: ID;
	activity: number | DirectusActivity;
	collection: string;
	item: string;
	data?: unknown;
	delta?: unknown;
	parent?: number | DirectusRevisions;
};

export type DirectusRoles = {
	id: ID;
	name: string;
	icon: string;
	description?: string;
	ip_access?: unknown;
	enforce_tfa: boolean;
	admin_access: boolean;
	app_access: boolean;
	users: string | DirectusUsers[];
};

export type DirectusSessions = {
	token: string;
	user?: string | DirectusUsers;
	expires: string;
	ip?: string;
	user_agent?: string;
	share?: string | DirectusShares;
	origin?: string;
};

export type DirectusSettings = {
	id: ID;
	project_name: string;
	project_url?: string;
	project_color?: string;
	project_logo?: string | DirectusFiles;
	public_foreground?: string | DirectusFiles;
	public_background?: string | DirectusFiles;
	public_note?: string;
	auth_login_attempts?: number;
	auth_password_policy?: string;
	storage_asset_transform?: string;
	storage_asset_presets?: unknown;
	custom_css?: string;
	storage_default_folder?: string | DirectusFolders;
	basemaps?: unknown;
	mapbox_key?: string;
	module_bar?: unknown;
	project_descriptor?: string;
	translation_strings?: unknown;
	default_language: string;
	custom_aspect_ratios?: unknown;
};

export type DirectusUsers = {
	id: ID;
	first_name?: string;
	last_name?: string;
	email?: string;
	password?: string;
	location?: string;
	title?: string;
	description?: string;
	tags?: unknown;
	avatar?: string | DirectusFiles;
	language?: string;
	theme?: string;
	tfa_secret?: string;
	status: string;
	role?: string | DirectusRoles;
	token?: string;
	last_access?: string;
	last_page?: string;
	provider: string;
	external_identifier?: string;
	auth_data?: unknown;
	email_notifications?: boolean;
};

export type DirectusWebhooks = {
	id: ID;
	name: string;
	method: string;
	url: string;
	status: string;
	data: boolean;
	actions: unknown;
	collections: unknown;
	headers?: unknown;
};

export type DirectusDashboards = {
	id: ID;
	name: string;
	icon: string;
	note?: string;
	date_created?: string;
	user_created?: string | DirectusUsers;
	color?: string;
	panels: string | DirectusPanels[];
};

export type DirectusPanels = {
	id: ID;
	dashboard: string | DirectusDashboards;
	name?: string;
	icon?: string;
	color?: string;
	show_header: boolean;
	note?: string;
	type: string;
	position_x: number;
	position_y: number;
	width: number;
	height: number;
	options?: unknown;
	date_created?: string;
	user_created?: string | DirectusUsers;
};

export type DirectusNotifications = {
	id: ID;
	timestamp?: string;
	status?: string;
	recipient: string | DirectusUsers;
	sender?: string | DirectusUsers;
	subject: string;
	message?: string;
	collection?: string;
	item?: string;
};

export type DirectusShares = {
	id: ID;
	name?: string;
	collection?: string | DirectusCollections;
	item?: string;
	role?: string | DirectusRoles;
	password?: string;
	user_created?: string | DirectusUsers;
	date_created?: string;
	date_start?: string;
	date_end?: string;
	times_used?: number;
	max_uses?: number;
};

export type DirectusFlows = {
	id: ID;
	name: string;
	icon?: string;
	color?: string;
	description?: string;
	status: string;
	trigger?: string;
	accountability?: string;
	options?: unknown;
	operation?: string | DirectusOperations;
	date_created?: string;
	user_created?: string | DirectusUsers;
	operations: string | DirectusOperations[];
};

export type DirectusOperations = {
	id: ID;
	name?: string;
	key: string;
	type: string;
	position_x: number;
	position_y: number;
	options?: unknown;
	resolve?: string | DirectusOperations;
	reject?: string | DirectusOperations;
	flow: string | DirectusFlows;
	date_created?: string;
	user_created?: string | DirectusUsers;
};

export type CustomDirectusTypes = {
	posts: BlogPostEntry;
	support: SupportInfoEntry;
	departure: Departure;
	directus_activity: DirectusActivity;
	directus_collections: DirectusCollections;
	directus_fields: DirectusFields;
	directus_files: DirectusFiles;
	directus_folders: DirectusFolders;
	directus_migrations: DirectusMigrations;
	directus_permissions: DirectusPermissions;
	directus_presets: DirectusPresets;
	directus_relations: DirectusRelations;
	directus_revisions: DirectusRevisions;
	directus_roles: DirectusRoles;
	directus_sessions: DirectusSessions;
	directus_settings: DirectusSettings;
	directus_users: DirectusUsers;
	directus_webhooks: DirectusWebhooks;
	directus_dashboards: DirectusDashboards;
	directus_panels: DirectusPanels;
	directus_notifications: DirectusNotifications;
	directus_shares: DirectusShares;
	directus_flows: DirectusFlows;
	directus_operations: DirectusOperations;
};
