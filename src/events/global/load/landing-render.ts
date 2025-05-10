const LoadEvents = {
	complete: new CustomEvent("global:load:landing-render:complete"),
};

export function dispatch(type: keyof typeof LoadEvents) {
	document.dispatchEvent(LoadEvents[type]);
}

export function register(
	type: keyof typeof LoadEvents,
	listener: EventListenerOrEventListenerObject,
	options?: boolean | AddEventListenerOptions,
) {
	document.addEventListener(LoadEvents[type].type, listener, options);
}

export function deregister(
	type: keyof typeof LoadEvents,
	listener: EventListenerOrEventListenerObject,
	options?: boolean | EventListenerOptions,
) {
	document.removeEventListener(LoadEvents[type].type, listener, options);
}
