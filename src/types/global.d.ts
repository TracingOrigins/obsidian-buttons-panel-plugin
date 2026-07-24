// Global type augmentations for custom DOM events

declare global {
	interface DocumentEventMap {
		'buttons-panel-refresh': CustomEvent<unknown>;
		'buttons-panel-search': CustomEvent<{ query?: string }>;
	}

	// dnd-kit 传感器监听目标，供 hover-expand nudge 使用
	var __dndSensorTarget: EventTarget | undefined;
}

export {};

