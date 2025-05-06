import { BufferAttribute, BufferGeometry, type Mesh } from "three";
import ModelLoader from "@src/lib/three/helpers/ModelLoader";
import BillboardMesh from "@src/lib/three/meshes/BillboardMesh";

export default class Head {
	public static async load() {
		const url = "models/blockhead.glb";
		const data: number[] = [];

		await ModelLoader.load(url, (object) => {
			if (object.type === "Mesh") {
				data.push(
					...(object as Mesh).geometry.getAttribute("position").array,
				);
			}
		});

		const geometry = new BufferGeometry().setAttribute(
			"position",
			new BufferAttribute(new Float32Array(data), 3),
		);

		return new BillboardMesh(geometry);
	}
}
