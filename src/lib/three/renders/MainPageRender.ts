import {
	PerspectiveCamera,
	Scene,
	WebGLRenderer,
	SpotLight,
	AmbientLight,
	Clock,
	LinearSRGBColorSpace,
} from "three";

import {
	EffectComposer,
	RenderPass,
	EffectPass,
	BloomEffect,
	ScanlineEffect,
} from "postprocessing";

import MouseIntersector from "@src/lib/three/helpers/MouseIntersector";
import Globe from "@src/lib/three/models/Globe";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { degToRad } from "three/src/math/MathUtils.js";

type ExtendedXRFrameRequestCallback = (
	delta: number,
	...args: Parameters<XRFrameRequestCallback>
) => void;

export default class MainPageRender {
	private renderer: WebGLRenderer;
	private scene: Scene;
	private camera: PerspectiveCamera;
	private spotlight: SpotLight;
	private ambientLight: AmbientLight;
	private intersector: MouseIntersector;
	private clock: Clock;
	private animations: ExtendedXRFrameRequestCallback[] = [];
	private composer: EffectComposer;

	public constructor(canvas: HTMLCanvasElement) {
		this.scene = new Scene();

		this.renderer = new WebGLRenderer({
			canvas,
			powerPreference: "high-performance",
			antialias: true,
			alpha: true,
		});
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.outputColorSpace = LinearSRGBColorSpace;

		this.camera = new PerspectiveCamera(65, canvas.width / canvas.height);
		this.camera.position.set(0, 0, 1.5);
		this.camera.rotation.set(0, 0, 0);
		this.scene.add(this.camera);

		this.onResize();

		this.spotlight = new SpotLight(0xffffff);
		this.spotlight.position.set(0, 0, 0);
		this.spotlight.target.position.set(0, 0, -1);
		this.spotlight.power = 5;
		this.spotlight.angle = degToRad(15);
		this.spotlight.penumbra = 0.1;
		this.camera.add(this.spotlight, this.spotlight.target);

		this.ambientLight = new AmbientLight(0x2a392a, 0.5);
		this.scene.add(this.ambientLight);

		this.clock = new Clock();

		this.animations = [];

		this.intersector = new MouseIntersector(
			this.renderer.domElement,
			this.camera,
			this.spotlight.target.position,
		);

		this.composer = new EffectComposer(this.renderer);
		this.composeEffects();

		this.initListeners();
	}

	/** Loads this render's models and assets. */
	public async load() {
		const globe = await new Globe().load();
		globe.scale.set(0.3, 0.3, 0.3);
		this.scene.add(globe);

		const controls = new OrbitControls(
			this.camera,
			this.renderer.domElement,
		);

		controls.enableDamping = true;
		controls.autoRotate = true;
		controls.autoRotateSpeed = 1;
		controls.enablePan = false;
		controls.minDistance = 0.5;
		controls.maxDistance = 1.5;

		const animate = ((delta, time, frame) => {
			controls.update();
			this.intersector.updatePlane();
		}) satisfies ExtendedXRFrameRequestCallback;

		animate.bind(this);

		this.animations.push(animate, globe.animate.bind(globe));
	}

	private composeEffects() {
		this.composer.addPass(new RenderPass(this.scene, this.camera));
		this.composer.addPass(
			new EffectPass(
				this.camera,
				new BloomEffect({
					intensity: 2,
					mipmapBlur: true,
					levels: 4,
					luminanceThreshold: 0,
				}),
				new ScanlineEffect(),
			),
		);
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
		this.stop();
		this.intersector.dispose();
		this.renderer.dispose();
		this.composer.dispose();
	}

	/** Main animation callback for the render. */
	private animate = ((time, frame) => {
		const delta = this.clock.getDelta();

		for (const cb of this.animations) {
			cb(delta, time, frame);
		}

		// this.renderer.render(this.scene, this.camera);
		this.composer.render(delta);
	}) satisfies XRFrameRequestCallback;

	private initListeners() {
		this.onResize = this.onResize.bind(this);
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
