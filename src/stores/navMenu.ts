import { map } from "nanostores";

type NavMenuStore = {
	open: boolean;
};

const initialStore: NavMenuStore = {
	open: false,
};

const store = map(initialStore);

const read = store.get;

const actions = {
	open() {
		store.setKey("open", true);
	},
	close() {
		store.setKey("open", false);
	},
	toggle() {
		store.setKey("open", !store.get().open);
	},
};

const listen = store.listen;

const subscribe = store.subscribe;

export default { read, actions, listen, subscribe };
