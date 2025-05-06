import {
	MeshStandardMaterial,
	type MeshStandardMaterialParameters,
	type WebGLProgramParametersWithUniforms,
} from "three";
import transformBillboards from "@src/three/shaders/chunks/transform-billboard.vs";

export default class BillboardMaterial extends MeshStandardMaterial {
	public constructor(parameters?: MeshStandardMaterialParameters) {
		super(parameters);
	}

	onBeforeCompile(params: WebGLProgramParametersWithUniforms): void {
		let token = `#include <fog_vertex>`;
		let insert = "\n" + transformBillboards;

		params.vertexShader = params.vertexShader.replace(
			token,
			token + insert,
		);
	}
}
