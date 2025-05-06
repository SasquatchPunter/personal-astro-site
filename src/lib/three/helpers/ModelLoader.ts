import type { Object3D } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

class ModelLoaderError extends Error {}

export default class ModelLoader {
	/**
	 * Loads and traverses model files.
	 * @param url Url of the model file
	 * @param traverse Callback to traverse the data nodes of each model.
	 * @param onProgress Optional callback to respond to Progress events.
	 */
	public static async load(
		url: string,
		traverse: (object: Object3D) => void,
		onProgress?: (event: ProgressEvent) => void,
	) {
		const loader = this.getLoader(url);
		try {
			if (loader instanceof GLTFLoader) {
				const data = await loader.loadAsync(url, onProgress);
				for (const scene of data.scenes) {
					scene.traverse(traverse);
				}
			} else if (loader instanceof OBJLoader) {
				const data = await loader.loadAsync(url, onProgress);
				data.traverse(traverse);
			}
		} catch (error) {
			throw new ModelLoaderError(
				`The model at ${url} could not be loaded.`,
			);
		}
	}

	private static getLoader(url: string) {
		const extension = url.match(/\.\w+$/)?.[0].replace(".", "");

		switch (extension) {
			case "glb":
				return new GLTFLoader();
			case "gltf":
				return new GLTFLoader();
			case "obj":
				return new OBJLoader();
			case undefined:
				throw new ModelLoaderError(
					"Model files without an extension aren't recognized by ModelLoader.",
				);
			default:
				throw new ModelLoaderError(
					`Model files with the .${extension} extension are not supported by ModelLoader.`,
				);
		}
	}
}
