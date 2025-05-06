import {
	BufferAttribute,
	InstancedMesh,
	Matrix4,
	PlaneGeometry,
	BufferGeometry,
	InterleavedBufferAttribute,
} from "three";
import BillboardMaterial from "@src/lib/three/materials/BillboardMaterial";

class BillboardMeshError extends Error {}

export default class BillboardMesh extends InstancedMesh {
	declare geometry: PlaneGeometry;
	declare material: BillboardMaterial;

	public constructor(
		data: BufferGeometry,
		material: BillboardMaterial = new BillboardMaterial(),
	) {
		let buffer = data.getAttribute("position");

		super(new PlaneGeometry(), material, buffer.count);

		this.initMatrix(buffer);
	}

	private initMatrix(buffer: BufferAttribute | InterleavedBufferAttribute) {
		for (let i = 0; i < buffer.count; i++) {
			this.setMatrixAt(
				i,
				new Matrix4().setPosition(
					buffer.getX(i),
					buffer.getY(i),
					buffer.getZ(i),
				),
			);
		}

		this.instanceMatrix.needsUpdate = true;
	}

	public update(buffer: BufferAttribute) {
		if (buffer.count !== this.instanceMatrix.count) {
			throw new BillboardMeshError(
				`Input buffer count of ${buffer.count} does not equal the expected count of ${this.instanceMatrix.count} that this mesh was instantiated with.
                Counts must match to update the matrix successfully, or a new mesh must be created.`,
			);
		}
		this.initMatrix(buffer);
	}
}
