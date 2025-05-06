import {
	OrthographicCamera,
	PerspectiveCamera,
	Plane,
	PlaneHelper,
	Raycaster,
	Scene,
	Vector2,
	Vector3,
} from "three";

/**
 * Tracks mouse movement and updates an intersection point in world space.
 * */
export default class MouseIntersector {
	private canvas: HTMLCanvasElement;
	private camera: PerspectiveCamera | OrthographicCamera;

	private raycaster: Raycaster;
	private plane: Plane;
	private target: Vector3;
	private ndc: Vector2;

	/**
	 * @param canvas Canvas that is being rendered to.
	 * @param camera Camera that projects the intersection ray.
	 * @param target A Vector3 that is the update target of worldspace mouse coords.
	 */
	public constructor(
		canvas: HTMLCanvasElement,
		camera: PerspectiveCamera | OrthographicCamera,
		target: Vector3,
	) {
		this.canvas = canvas;
		this.camera = camera;

		this.raycaster = new Raycaster();
		this.plane = new Plane(new Vector3(0, 0, 1), 1);
		this.target = target;
		this.ndc = new Vector2();

		this.updateTarget = this.updateTarget.bind(this);

		window.addEventListener("mousemove", this.updateTarget);
		window.addEventListener("touchmove", this.updateTarget);
		window.addEventListener("mousedown", this.updateTarget);
		window.addEventListener("touchstart", this.updateTarget);
	}

	public dispose() {
		window.removeEventListener("mousemove", this.updateTarget);
		window.removeEventListener("touchmove", this.updateTarget);
		window.removeEventListener("mousedown", this.updateTarget);
		window.removeEventListener("touchstart", this.updateTarget);
	}

	/**
	 * Updates orientation of the intersection plane in relation to the camera.
	 *
	 * This needs to be called whenever the camera direction changes.
	 */
	public updatePlane() {
		this.camera.getWorldDirection(this.plane.normal).negate();
	}

	/**
	 * Create a PlaneHelper to help visualize the intersection plane.
	 * @example scene.add(intersector.createHelper())
	 */
	public createHelper(size = 1, color = 0x00ffff) {
		return new PlaneHelper(this.plane, size, color);
	}

	private updateMouseNDC(event: MouseEvent | TouchEvent) {
		const { left, top, width, height } =
			this.canvas.getBoundingClientRect();

		const clientX =
			"clientX" in event ? event.clientX : event.touches[0].clientX;
		const clientY =
			"clientY" in event ? event.clientY : event.touches[0].clientY;

		this.ndc.set(
			((clientX - left) / width) * 2 - 1,
			-((clientY - top) / height) * 2 + 1,
		);
	}

	private updateMouseWorldPos(event: MouseEvent | TouchEvent) {
		this.updateMouseNDC(event);
		this.raycaster.setFromCamera(this.ndc, this.camera);
		this.raycaster.ray.intersectPlane(this.plane, this.target);
		this.target.applyMatrix4(this.camera.matrixWorldInverse);
	}

	private updateTarget(event: MouseEvent | TouchEvent) {
		this.updateMouseWorldPos(event);
	}
}
