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
	Object3D,
	Material,
	BufferGeometry,
	Texture,
	Light,
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

type Resources = {
	geometries: Record<string, BufferGeometry>;
	materials: Record<string, Material>;
	textures: Record<string, Texture>;
	meshes: Record<string, InstancedMesh>;
	lights: Record<string, Light>;
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

	// Track all resources for proper disposal
	private resources: Resources = {
		geometries: {},
		materials: {},
		textures: {},
		meshes: {},
		lights: {},
	};

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
		window.addEventListener("mouseup", this.resetCursor);
	}

	private cleanupListeners() {
		window.removeEventListener("resize", this.onResize);
		window.removeEventListener("mouseout", this.resetCursor);
		window.removeEventListener("touchend", this.resetCursor);
		window.removeEventListener("mouseup", this.resetCursor);
	}

	private resetCursor() {
		this.cursor.set(0, 0, 0);
	}

	/**
	 * Inits animations for the simulation and scene render. Call this after loading is complete.
	 */
	private initAnimations() {
		if (!this.simulation) return;

		{
			/* Setup animation to step the spheres simulation and update their rendered positions. */
			const {
				world,
				bodies: { spheres, agitator },
			} = this.simulation;
			const { sphereCount } = this.options;

			const spheresMesh = this.resources.meshes["spheres"];

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

		this.resources.geometries["sphere"] = new SphereGeometry(radius, 12, 6);
		this.resources.geometries["core"] = new SphereGeometry(0.3);

		const envMap = await new TextureLoader().loadAsync(
			"textures/envmap1-optimized.jpg",
		);
		envMap.mapping = EquirectangularReflectionMapping;
		envMap.flipY = false;
		this.resources.textures["envMap"] = envMap;

		this.resources.materials["sphere"] = new MeshStandardMaterial({
			envMap: this.resources.textures["envMap"],
			envMapIntensity: 0.2,
			roughness: 0.2,
			metalness: 1,
		});
		this.resources.materials["core"] = new MeshBasicMaterial({
			color: 0xeeffee,
		});

		// Create and store meshes
		const spheresMesh = new InstancedMesh(
			this.resources.geometries["sphere"],
			this.resources.materials["sphere"],
			count,
		);
		spheresMesh.name = "meshes.spheres";
		spheresMesh.castShadow = true;
		spheresMesh.receiveShadow = true;
		this.resources.meshes["spheres"] = spheresMesh;

		// Create and store lights
		this.resources.lights["ambient"] = new AmbientLight(0xd0f0d0, 5);

		const pointLight = new PointLight(0xa0ffd0, 10, 0, 1);
		pointLight.position.set(-0.5, 1, 2);
		pointLight.castShadow = true;
		this.resources.lights["point"] = pointLight;

		// Add to scene
		this.scene.add(
			this.resources.lights["point"],
			this.resources.lights["ambient"],
		);
		this.scene.add(this.resources.meshes["spheres"]);

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

	// Part of the render cleanup. Disposes asset resources, geometries, textures, etc.
	private disposeResources() {
		Object.values(this.resources.geometries).forEach((geometry) => {
			geometry.dispose();
		});

		Object.values(this.resources.materials).forEach((material) => {
			if (material instanceof MeshStandardMaterial) {
				if (material.map) material.map.dispose();
				if (material.lightMap) material.lightMap.dispose();
				if (material.aoMap) material.aoMap.dispose();
				if (material.emissiveMap) material.emissiveMap.dispose();
				if (material.bumpMap) material.bumpMap.dispose();
				if (material.normalMap) material.normalMap.dispose();
				if (material.displacementMap)
					material.displacementMap.dispose();
				if (material.roughnessMap) material.roughnessMap.dispose();
				if (material.metalnessMap) material.metalnessMap.dispose();
				if (material.alphaMap) material.alphaMap.dispose();
				if (material.envMap) material.envMap.dispose();
			}
			material.dispose();
		});

		Object.values(this.resources.textures).forEach((texture) => {
			texture.dispose();
		});

		this.resources = {
			geometries: {},
			materials: {},
			textures: {},
			meshes: {},
			lights: {},
		};
	}

	private disposeSimulation() {
		if (this.simulation !== null) {
			this.simulation.bodies.spheres.forEach((body) =>
				this.simulation!.world.removeBody(body),
			);
			this.simulation.world.removeBody(this.simulation.bodies.agitator);
			this.simulation.bodies.spheres = [];
			this.simulation = null;
		}
	}

	/**
	 * Disposes of all resources associated with this render.
	 */
	public dispose() {
		this.stopRender();
		this.cleanupListeners();
		this.intersector.dispose();
		this.animations = [];
		this.disposeResources();
		this.clearScene(this.scene);
		this.renderer.dispose();
		this.renderer.forceContextLoss();
		this.disposeSimulation();
	}

	private clearScene(obj: Object3D) {
		while (obj.children.length > 0) {
			this.clearScene(obj.children[0]);
			obj.remove(obj.children[0]);
		}

		if (obj instanceof InstancedMesh) {
			obj.dispose();
		}
	}

	private onResize() {
		const { width, height } =
			this.renderer.domElement.getBoundingClientRect();
		this.renderer.setSize(width, height, false);
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
	}
}
