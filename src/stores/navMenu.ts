import { map } from "nanostores";

type NavMenuStore = {
	open: boolean;
};

const initialStore: NavMenuStore = {
	open: false,
};

const store = map(initialStore);

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

const subscribe = store.subscribe;

export default { actions, read: store.get, listen: store.listen, subscribe };
