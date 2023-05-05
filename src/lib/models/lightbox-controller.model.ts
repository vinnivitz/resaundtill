export type LightboxController = {
	toggle: () => void;
	open: () => void;
	close: () => void;
	openImage: (id: number) => void;
};
