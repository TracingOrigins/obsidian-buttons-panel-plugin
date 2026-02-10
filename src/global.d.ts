// Global type augmentations for custom DOM events

declare global {
	interface DocumentEventMap {
		'buttons-panel-refresh': CustomEvent<unknown>;
	}
}

export {};

