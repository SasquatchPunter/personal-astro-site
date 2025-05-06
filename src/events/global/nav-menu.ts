const NavMenuEvents = {
	open: new CustomEvent("global:nav-menu:open"),
	close: new CustomEvent("global:nav-menu:close"),
};

export function dispatch(type: keyof typeof NavMenuEvents) {
	document.dispatchEvent(NavMenuEvents[type]);
}

export function register(
	type: keyof typeof NavMenuEvents,
	listener: EventListenerOrEventListenerObject,
	options?: boolean | AddEventListenerOptions,
) {
	document.addEventListener(NavMenuEvents[type].type, listener, options);
}

export function deregister(
	type: keyof typeof NavMenuEvents,
	listener: EventListenerOrEventListenerObject,
	options?: boolean | EventListenerOptions,
) {
	document.removeEventListener(NavMenuEvents[type].type, listener, options);
}
