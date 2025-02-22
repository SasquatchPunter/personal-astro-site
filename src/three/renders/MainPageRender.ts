import {
	PerspectiveCamera,
	Scene,
	WebGLRenderer,
	SpotLight,
	AmbientLight,
	Clock,
} from "three";
import MouseIntersector from "@src/three/helpers/MouseIntersector";
import Head from "@src/three/models/Head";
import { degToRad } from "three/src/math/MathUtils.js";

export default class MainPageRender {
	private renderer: WebGLRenderer;
	private scene: Scene;
	private camera: PerspectiveCamera;
	private spotlight: SpotLight;
	private ambientLight: AmbientLight;
	private intersector: MouseIntersector;
	private clock: Clock;

	public constructor(canvas: HTMLCanvasElement) {
		this.renderer = new WebGLRenderer({
			canvas,
			antialias: true,
			alpha: true,
		});
		this.renderer.setPixelRatio(window.devicePixelRatio);

		this.scene = new Scene();

		this.camera = new PerspectiveCamera(65, canvas.width / canvas.height);
		this.camera.position.set(0, 0, 1.5);
		this.camera.rotation.set(0, 0, 0);
		this.scene.add(this.camera);

		this.spotlight = new SpotLight(0xffffff);
		this.spotlight.position.set(0, 0, 0);
		this.spotlight.target.position.set(0, 0, -1);
		this.spotlight.power = 10;
		this.spotlight.angle = degToRad(10);
		this.spotlight.penumbra = 0.1;
		this.camera.add(this.spotlight, this.spotlight.target);

		this.ambientLight = new AmbientLight(0x2a392a, 0.5);
		this.scene.add(this.ambientLight);

		this.clock = new Clock();

		this.intersector = new MouseIntersector(
			this.renderer.domElement,
			this.camera,
			this.spotlight.target.position,
		);

		this.onResize();
		this.initListeners();
	}

	/** Loads this render's models and assets. */
	public async load() {
		const head = await Head.load();
		head.position.set(0.4, 0, 0);
		head.rotation.set(degToRad(-90), degToRad(0), degToRad(-30));
		this.scene.add(head);
	}

	/** Starts the render's animation loop. */
	public start() {
		this.renderer.setAnimationLoop(this.animate);
	}

	/** Stops the render's animation loop. */
	public stop() {
		this.renderer.setAnimationLoop(null);
	}

	/** Call this method to cleanup the render resources. */
	public cleanup() {
		this.intersector.cleanup();
		this.renderer.dispose();
	}

	/** Main animation callback for the render. */
	private animate = ((time, frame) => {
		const delta = this.clock.getDelta() * 1000;

		this.renderer.render(this.scene, this.camera);
	}) satisfies XRFrameRequestCallback;

	private initListeners() {
		this.onResize = this.onResize.bind(this);
		this.camera.lookAt(0, 0, 0);
		window.addEventListener("resize", this.onResize);
	}

	private onResize() {
		const { width, height } =
			this.renderer.domElement.getBoundingClientRect();
		this.renderer.setSize(width, height, false);
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
	}
}
