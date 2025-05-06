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

	public constructor(
		canvas: HTMLCanvasElement,
		camera: PerspectiveCamera | OrthographicCamera,
		target: Vector3,
	) {
		this.onMouseMove = this.onMouseMove.bind(this);
		this.canvas = canvas;
		this.camera = camera;

		this.raycaster = new Raycaster();
		this.plane = new Plane(new Vector3(0, 0, 1), 1);
		this.target = target;
		this.ndc = new Vector2();

		window.addEventListener("mousemove", this.onMouseMove);
	}

	public cleanup() {
		window.removeEventListener("mousemove", this.onMouseMove);
	}

	/**
	 * Adds PlaneHelper to a scene. This helper provides a visual plane that represents the intersection plane.
	 * @param scene Scene to add PlaneHelper to
	 * @param size Size of the PlaneHelper
	 * @param color Color of the PlaneHelper
	 */
	public addHelperPlaneToScene(
		scene: Scene,
		size: number | undefined = 1,
		color: number | undefined = 0x00ffff,
	) {
		scene.add(new PlaneHelper(this.plane, size, color));
	}

	/**
	 * Updates orientation of the intersection plane in relation to the camera.
	 *
	 * This needs to be called whenever the camera direction changes.
	 */
	public updatePlane() {
		this.camera.getWorldDirection(this.plane.normal).negate();
	}

	private updateMouseNDC(event: MouseEvent) {
		const { left, top, width, height } =
			this.canvas.getBoundingClientRect();

		this.ndc.set(
			((event.clientX - left) / width) * 2 - 1,
			-((event.clientY - top) / height) * 2 + 1,
		);
	}

	private updateMouseWorldPos(event: MouseEvent) {
		this.updateMouseNDC(event);
		this.raycaster.setFromCamera(this.ndc, this.camera);
		this.raycaster.ray.intersectPlane(this.plane, this.target);
		this.target.applyMatrix4(this.camera.matrixWorldInverse);
	}

	private onMouseMove(event: MouseEvent) {
		this.updateMouseWorldPos(event);
	}
}
