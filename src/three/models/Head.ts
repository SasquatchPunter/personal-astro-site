import ModelLoader from "@src/three/helpers/ModelLoader";
import BillboardMesh from "@src/three/meshes/BillboardMesh";
import {
	BufferAttribute,
	BufferGeometry,
	type Mesh,
	type Object3D,
} from "three";

export default class Head {
	public static async load() {
		const url = "models/blockhead.glb";
		const data: number[] = [];

		function traverse(object: Object3D) {
			if (object.type === "Mesh") {
				data.push(
					...(object as Mesh).geometry.getAttribute("position").array,
				);
			}
		}

		await ModelLoader.load(url, traverse);

		const geometry = new BufferGeometry();

		geometry.setAttribute(
			"position",
			new BufferAttribute(new Float32Array(data), 3),
		);

		return new BillboardMesh(geometry, {
			geometry: { width: 0.005, height: 0.005 },
			material: { color: 0xa0c0a0 },
		});
	}
}
