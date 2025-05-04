import { animate } from "animejs";

const vertexShader = `
precision mediump float;

attribute vec4 aPosition;

uniform vec2 uResolution;
        
varying vec2 vUv;
varying vec2 vNormalUv;

void main() {
    vUv = aPosition.xy;
    vNormalUv = vec2((aPosition.x + 1.0) / 2.0, (aPosition.y + 1.0) / 2.0);
    gl_Position = aPosition;
}
`;

const fragmentShader = `
precision mediump float;

uniform float uTime;
uniform float uOpenState;
uniform vec2 uResolution;

varying vec2 vUv;
varying vec2 vNormalUv;

void main() {
    float minRadius = -1.0 + uOpenState * 2.0;
    float maxRadius = 0.0 + uOpenState;
    float radius = mix(minRadius, maxRadius, vNormalUv.x); // 
    float vertical = 50.0; // number of dots vertically
    float cellSize = uResolution.y / vertical;

    vec2 localOrigin = vec2(cellSize) / 2.0;

    vec2 pixelCoords = uResolution * vNormalUv;

    vec2 cellCoords = vec2(floor(pixelCoords.x / cellSize), floor(pixelCoords.y / cellSize));

    vec2 offset = vec2(0.0, cellSize / 2.0 * mod(cellCoords.x, 2.0));

    pixelCoords += offset;

    vec2 uv = mod(pixelCoords, cellSize);

    float circle = step(distance(localOrigin, uv), radius * cellSize);

    vec4 circleColor = vec4(0.04, 0.04, 0.04, 1.0);

    gl_FragColor = circleColor * circle;
}
`;

type DataBindings = {
	[name: string]: {
		/** Indexed location of the data binding in the program */
		index: any;
		/** Data that belongs to the binding */
		data: any;
	};
};

export default class NavMenuBackgroundRender {
	private canvas: HTMLCanvasElement;
	private gl: WebGLRenderingContext;
	private program: WebGLProgram;
	private attributes: DataBindings;
	private uniforms: DataBindings;
	private frameRef: number;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		const gl = canvas.getContext("webgl");

		if (gl === null) {
			throw new Error(
				"WebGL context could not be found for the input canvas element!",
			);
		}

		this.gl = gl;
		this.program = this.gl.createProgram();
		this.attributes = {};
		this.uniforms = {};
		this.frameRef = 0;

		this.resize = this.resize.bind(this);
		this.animate = this.animate.bind(this);
		this.updateUTime = this.updateUTime.bind(this);
		this.updateUResolution = this.updateUResolution.bind(this);
		this.updateUOpenState = this.updateUOpenState.bind(this);
		this.openShutter = this.openShutter.bind(this);
		this.closeShutter = this.closeShutter.bind(this);
		this.start = this.start.bind(this);
		this.stop = this.stop.bind(this);

		this.initShaders();
		this.initProgram();
		this.initAttributes();
		this.initUniforms();
	}

	private initShaders() {
		const vShader = this.gl.createShader(this.gl.VERTEX_SHADER)!;
		this.gl.shaderSource(vShader, vertexShader);
		this.gl.compileShader(vShader);

		const fShader = this.gl.createShader(this.gl.FRAGMENT_SHADER)!;
		this.gl.shaderSource(fShader, fragmentShader);
		this.gl.compileShader(fShader);

		const vShaderCompiled = this.gl.getShaderParameter(
			vShader,
			this.gl.COMPILE_STATUS,
		);
		const fShaderCompiled = this.gl.getShaderParameter(
			fShader,
			this.gl.COMPILE_STATUS,
		);

		if (!vShaderCompiled)
			console.error(
				"Vertex shader could not be compiled!",
				this.gl.getShaderInfoLog(vShader),
			);

		if (!fShaderCompiled) {
			console.error(
				"Fragment shader could not be compiled!",
				this.gl.getShaderInfoLog(fShader),
			);
		}

		this.gl.attachShader(this.program, vShader);
		this.gl.attachShader(this.program, fShader);
	}

	private initProgram() {
		this.gl.linkProgram(this.program);

		const programLinked = this.gl.getProgramParameter(
			this.program,
			this.gl.LINK_STATUS,
		);

		if (!programLinked) {
			console.error(
				"Shader program could not be linked!",
				this.gl.getProgramInfoLog(this.program),
			);
		}

		this.gl.useProgram(this.program);
	}

	private initAttributes() {
		this.attributes.aPosition = {
			index: this.gl.getAttribLocation(this.program, "aPosition"),
			data: new Float32Array([
				-1, 1, 0, 1, 1, 1, 0, 1, -1, -1, 0, 1, 1, -1, 0, 1,
			]),
		};

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gl.createBuffer());
		this.gl.bufferData(
			this.gl.ARRAY_BUFFER,
			this.attributes.aPosition.data,
			this.gl.STATIC_DRAW,
		);
		this.gl.enableVertexAttribArray(this.attributes.aPosition.index);
		this.gl.vertexAttribPointer(
			this.attributes.aPosition.index,
			4,
			this.gl.FLOAT,
			false,
			0,
			0,
		);
	}

	private initUniforms() {
		this.uniforms.uTime = {
			index: this.gl.getUniformLocation(this.program, "uTime"),
			data: 0,
		};
		this.gl.uniform1f(this.uniforms.uTime.index, this.uniforms.uTime.data);

		this.uniforms.uResolution = {
			index: this.gl.getUniformLocation(this.program, "uResolution"),
			data: new Uint16Array([this.canvas.width, this.canvas.height]),
		};
		this.gl.uniform2f(
			this.uniforms.uResolution.index,
			this.uniforms.uResolution.data[0],
			this.uniforms.uResolution.data[1],
		);

		this.uniforms.uOpenState = {
			index: this.gl.getUniformLocation(this.program, "uOpenState"),
			data: 0,
		};
		this.gl.uniform1f(
			this.uniforms.uOpenState.index,
			this.uniforms.uOpenState.data,
		);
	}

	private updateUTime(time: number) {
		this.uniforms.uTime.data = time;
		this.gl.uniform1f(this.uniforms.uTime.index, this.uniforms.uTime.data);
	}

	private updateUResolution(width: number, height: number) {
		this.uniforms.uResolution.data[0] = width;
		this.uniforms.uResolution.data[1] = height;
		this.gl.uniform2f(
			this.uniforms.uResolution.index,
			this.uniforms.uResolution.data[0],
			this.uniforms.uResolution.data[1],
		);
	}

	private updateUOpenState(state: number) {
		this.uniforms.uOpenState.data = state;
		this.gl.uniform1f(
			this.uniforms.uOpenState.index,
			this.uniforms.uOpenState.data,
		);
	}

	private draw() {
		this.gl.drawArrays(
			this.gl.TRIANGLE_STRIP,
			0,
			(this.attributes.aPosition.data as Float32Array).length / 4,
		);
	}

	private animate(time = 0) {
		this.draw();
		this.updateUTime(time);
		this.frameRef = requestAnimationFrame(this.animate);
	}

	public resize() {
		const dpr = window.devicePixelRatio || 1;
		const { width, height } = this.canvas.getBoundingClientRect();
		const w = width * dpr;
		const h = height * dpr;
		this.canvas.width = w;
		this.canvas.height = h;
		this.gl.viewport(0, 0, w, h);
		this.updateUResolution(w, h);
	}

	public start() {
		this.animate();
	}

	public stop() {
		cancelAnimationFrame(this.frameRef);
	}

	public openShutter() {
		const state = { ...this.uniforms.uOpenState };
		const updateUOpenState = this.updateUOpenState;

		animate(state, {
			data: {
				to: 1,
			},
			onUpdate: () => {
				updateUOpenState(state.data);
			},
			onBegin: this.start,
			onComplete: this.stop,
		});
	}

	public closeShutter() {
		const state = { ...this.uniforms.uOpenState };
		const updateUOpenState = this.updateUOpenState;

		animate(state, {
			data: {
				to: 0,
			},
			onUpdate: () => {
				updateUOpenState(state.data);
			},
			onBegin: this.start,
			onComplete: this.stop,
		});
	}
}
