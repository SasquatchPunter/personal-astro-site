import {
	AmbientLight,
	Clock,
	InstancedMesh,
	Matrix4,
	MeshStandardMaterial,
	PerspectiveCamera,
	PointLight,
	Scene,
	SphereGeometry,
	TextureLoader,
	WebGLRenderer,
	EquirectangularReflectionMapping,
	Vector3,
	Quaternion,
	MeshBasicMaterial,
} from "three";
import { World, Body, Sphere, Vec3, BODY_TYPES } from "cannon-es";
import MouseIntersector from "@src/lib/three/helpers/MouseIntersector";

type FrameRequestCallback = (
	delta: number,
	time: DOMHighResTimeStamp,
	frame: XRFrame,
) => void;

type LandingRenderOptions = {
	/** Number of spheres in the render. */
	sphereCount: number;
	sphereRadius: number;
	sphereMass: number;
	sphereDamping: number;
	agitatorRadius: number;
};

type Simulation = {
	world: World;
	bodies: {
		spheres: Body[];
		agitator: Body;
	};
};

export default class LandingRender {
	private options: LandingRenderOptions;

	private renderer: WebGLRenderer;
	private camera: PerspectiveCamera;
	private scene: Scene;
	private simulation: Simulation | null;
	private clock: Clock;
	private animations: Array<FrameRequestCallback>;
	private cursor: Vector3;
	private intersector: MouseIntersector;

	public constructor(
		canvas: HTMLCanvasElement,
		options: LandingRenderOptions,
	) {
		this.options = options;
		this.renderer = new WebGLRenderer({
			canvas,
			alpha: true,
			antialias: true,
			powerPreference: "high-performance",
		});
		this.camera = new PerspectiveCamera();
		this.scene = new Scene();
		this.simulation = null;
		this.clock = new Clock();
		this.animations = [];
		this.cursor = new Vector3();
		this.intersector = new MouseIntersector(
			canvas,
			this.camera,
			this.cursor,
		);

		this.initBindings();

		this.initRenderer();
		this.initComposer();
		this.initCamera();
		this.initListeners();
		this.initSimulation();

		this.onResize();
	}

	private initBindings() {
		this.animate = this.animate.bind(this);
		this.onResize = this.onResize.bind(this);
		this.resetCursor = this.resetCursor.bind(this);
	}

	private initRenderer() {
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.shadowMap.enabled = true;
	}

	private initComposer() {}

	private initCamera() {
		this.camera.fov = 65;
		this.camera.near = 0.1;
		this.camera.far = 1000;
		this.camera.position.set(0, 0, 5);
	}

	private initSimulation() {
		const {
			sphereCount: count,
			sphereRadius: radius,
			sphereMass: mass,
			sphereDamping: linearDamping,
			agitatorRadius,
		} = this.options;

		const shape = new Sphere(radius);
		const spheres: Body[] = [];
		for (let i = 0; i < count; i++) {
			const position = new Vec3(
				Math.random() * 6 - 2,
				Math.random() * 6 - 2,
				Math.random() * 6 - 2,
			);
			const sphere = new Body({ shape, mass, linearDamping, position });
			spheres.push(sphere);
		}

		const agitator = new Body({
			shape: new Sphere(agitatorRadius),
			type: BODY_TYPES.STATIC,
		});

		const simulation: Simulation = {
			world: new World(),
			bodies: {
				spheres,
				agitator,
			},
		};

		simulation.world.addBody(agitator);
		simulation.bodies.spheres.forEach((s) => simulation.world.addBody(s));

		this.simulation = simulation;
	}

	private initListeners() {
		window.addEventListener("resize", this.onResize);
		window.addEventListener("mouseout", this.resetCursor);
		window.addEventListener("touchend", this.resetCursor);
	}

	private resetCursor() {
		this.cursor.set(0, 0, 0);
	}

	/**
	 * Inits animations for the simulation and scene render. Call this after loading is complete.
	 */
	private initAnimations() {
		{
			/* Setup animation to step the spheres simulation and update their rendered positions. */
			const {
				world,
				bodies: { spheres, agitator },
			} = this.simulation!;
			const { sphereCount } = this.options;

			const spheresMesh = this.scene.getObjectByName(
				"meshes.spheres",
			) as InstancedMesh;

			const matrix = new Matrix4();
			const position = new Vector3();
			const quaternion = new Quaternion();
			const scale = new Vector3(1, 1, 1);

			this.animations.push((delta, time, frame) => {
				world.fixedStep();

				agitator.position.set(this.cursor.x, this.cursor.y, 0);

				for (let i = 0; i < sphereCount; i++) {
					const sphere = spheres[i];
					sphere.applyForce(
						sphere.position
							.addScaledVector(-1, agitator.position)
							.negate()
							.scale(100),
					);

					position.copy(sphere.position);
					quaternion.copy(sphere.quaternion);
					matrix.compose(position, quaternion, scale);

					spheresMesh.setMatrixAt(i, matrix);
				}

				spheresMesh.instanceMatrix.needsUpdate = true;
			});
		}
	}

	/**
	 * Loads all sync and async assets into the program and places them in the scene.
	 */
	public async load() {
		const { sphereCount: count, sphereRadius: radius } = this.options;

		const geometries = {
			sphere: new SphereGeometry(radius, 12, 6),
			core: new SphereGeometry(0.3),
		};
		const textures = {
			envMap: await new TextureLoader().loadAsync(
				"textures/envmap1-optimized.jpg",
			),
		};
		const materials = {
			sphere: new MeshStandardMaterial({
				envMap: textures.envMap,
				envMapIntensity: 0.2,
				roughness: 0.2,
				metalness: 1,
			}),
			core: new MeshBasicMaterial({ color: 0xeeffee }),
		};
		const meshes = {
			spheres: new InstancedMesh(
				geometries.sphere,
				materials.sphere,
				count,
			),
		};
		const lights = {
			ambient: new AmbientLight(0xd0f0d0, 5),
			point: new PointLight(0xa0ffd0, 10, 0, 1),
		};

		meshes.spheres.name = "meshes.spheres";

		textures.envMap.mapping = EquirectangularReflectionMapping;

		meshes.spheres.castShadow = true;
		meshes.spheres.receiveShadow = true;

		lights.point.position.set(-0.5, 1, 2);
		lights.point.castShadow = true;

		this.scene.add(lights.point, lights.ambient /*lights.fire*/);
		this.scene.add(meshes.spheres /*meshes.core*/);

		this.initAnimations();
	}

	// Main animation loop.
	private animate = ((time, frame) => {
		const delta = this.clock.getDelta();
		this.animations.forEach((cb) => cb(delta, time, frame));

		this.renderer.render(this.scene, this.camera);
	}) satisfies XRFrameRequestCallback;

	// Start render loop.
	public startRender() {
		this.renderer.setAnimationLoop(this.animate);
	}

	// Stop render loop.
	public stopRender() {
		this.renderer.setAnimationLoop(null);
	}

	// Dispose of render resources.
	public dispose() {
		this.renderer.dispose();
	}

	private onResize() {
		const { width, height } =
			this.renderer.domElement.getBoundingClientRect();
		this.renderer.setSize(width, height, false);
		// this.composer.setSize(width, height, false);
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
	}
}
