import {
	MeshStandardMaterial,
	type MeshStandardMaterialParameters,
	type WebGLProgramParametersWithUniforms,
} from "three";
import vertexShader from "@src/lib/three/shaders/billboard_material.vs";
import fragmentShader from "@src/lib/three/shaders/billboard_material.fs";

export default class BillboardMaterial extends MeshStandardMaterial {
	public constructor(parameters?: MeshStandardMaterialParameters) {
		super(parameters);
	}

	onBeforeCompile(params: WebGLProgramParametersWithUniforms): void {
		params.vertexShader = vertexShader;
		params.fragmentShader = fragmentShader;
	}
}
