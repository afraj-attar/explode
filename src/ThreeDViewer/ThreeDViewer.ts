import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

class ThreeDViewer {

    private scene: THREE.Scene;
    private renderer: THREE.WebGLRenderer;
    private camera: THREE.PerspectiveCamera;
    private sizes: { width: number, height: number };
    private controls: OrbitControls;

    constructor(canvasId: string) {

        /**
         * Initialize Scene
         */
        this.scene = new THREE.Scene();

        /**
         * Initialize Renderer
         */
        let canvas = document.getElementById(canvasId);
        if (!canvas) {
            canvas = document.createElement("canvas");
            canvas.id = canvasId;
        }

        this.sizes = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        this.renderer = new THREE.WebGLRenderer({ canvas: canvas });
        this.renderer.setSize(this.sizes.width, this.sizes.height);
        this.renderer.setPixelRatio(2);
        this.renderer.setClearColor(0x000000, 0);
        document.body.appendChild(this.renderer.domElement);

        /**
         * Initialize Camera
         */
        this.camera = new THREE.PerspectiveCamera(75, this.sizes.width / this.sizes.height, 0.1, 1000);

        /**
         * Add Orbit Controls
         */
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.04;
        this.camera.position.set(-30, 10, 50);

        /**
         * Lights
         */
        const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xFFFFFF, 0.5);
        pointLight.position.set(2, 3, 4);
        this.scene.add(pointLight);

        window.addEventListener('resize', () => {
            this.resize();
        });

        this.animate();

        this.addModel();

        /**
         * For Debugging Purposes
         */
        this.addToGlobalVariables();

    }

    addToGlobalVariables(): void {

        //@ts-ignore
        window.THREE = THREE;

        //@ts-ignore
        window.scene = this.scene;

        //@ts-ignore
        window.camera = this.camera;

    }

    fitToView(): void {

        const bBox = new THREE.Box3();
        bBox.setFromObject(this.scene);

        const center = new THREE.Vector3();
        bBox.getCenter(center);

        const size = new THREE.Vector3();
        bBox.getSize(size);

        const directionVector = new THREE.Vector3(1, 1, 1);

        const distance = bBox.min.distanceTo(bBox.max);

        this.controls.reset();
        this.controls.target.copy(center);

        this.camera.position.copy(center.clone().addScaledVector(directionVector.normalize(), distance));
        this.camera.lookAt(center);
        this.camera.updateProjectionMatrix();

    }

    resize(): void {

        this.sizes.width = window.innerWidth;
        this.sizes.height = window.innerHeight;

        // Update camera
        this.camera.aspect = this.sizes.width / this.sizes.height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.sizes.width, this.sizes.height);
        this.renderer.setPixelRatio(2);

    }

    addModel(): void {

        const gltflLoader = new GLTFLoader();
        gltflLoader.load('./swoosh.glb', (gltf) => {

            console.log("Called!!!");

            const points: THREE.Vector3[] = [];
            const nodes = gltf.scene.children[0].children;

            //this.scene.add(gltf.scene);

            points.push(...nodes.map(n => n.position));

            const textureLoader = new THREE.TextureLoader();
            const texture = textureLoader.load('./dot_border2.png');

            const material = new THREE.MeshBasicMaterial({ map: texture });

            material.onBeforeCompile = (shader) => {

                shader.uniforms.texAtlas = { value: texture };
                shader.vertexShader = `
                  attribute float texIdx;
                  varying float vTexIdx;
                  ${shader.vertexShader}
                `.replace(
                    `void main() {`,
                    `void main() {
                    vTexIdx = texIdx;
                  `
                );
                shader.fragmentShader = `
                  uniform sampler2D texAtlas;
                  varying float vTexIdx;
                  ${shader.fragmentShader}
                `.replace(
                    `#include <map_fragment>`,
                    `#include <map_fragment>
                    
                    vec2 blockUv = vec2(vUv.x * 0.5 + vTexIdx, vUv.y * 0.5); 
                    vec4 blockColor = texture2D(texAtlas, blockUv);
                    diffuseColor = blockColor;
                  `
                );

            };

            const scale =
                this.camera.aspect > 1 ? this.sizes.width / 900 : this.sizes.width / 800;
            const dotSize = scale * 8;

            const boxGeometry = new THREE.BoxBufferGeometry(dotSize, dotSize, dotSize);
            const instancedMesh = new THREE.InstancedMesh(boxGeometry, material, points.length);
            this.scene.add(instancedMesh);

            const tempBoxes = new THREE.Object3D();
            const color = new THREE.Color();
            const white = new THREE.Color(0xffffff);
            const currTranslate = new THREE.Vector3();
            const currRotation = new THREE.Quaternion();
            const currScale = new THREE.Vector3();
            const reveal = false;
            const showAmount = 1;
            const power = 0.5;
            const liveCount = 300;
            const liveEnabled = false;
            const baseColor = Math.floor(Math.random() * 3);

            const randPos = new Array(points.length).fill(0).map(() => {
                let d, x, y, z;
                do {
                    x = Math.random() * 2.0 - 1.0;
                    y = Math.random() * 2.0 - 1.0;
                    z = Math.random() * 2.0 - 1.0;
                    d = x * x + y * y + z * z;
                } while (d > 1.0);
                return [x, y, z];
            });
            const time = 0;
            const dimension = Math.round(Math.random());

            const offsetArray = Float32Array.from(
                new Array(points.length)
                    .fill(0)
                    .flatMap((_, i) => (baseColor === 0 || baseColor === 2 ? 0.5 : 0))
            );

            boxGeometry.setAttribute('texIdx', new THREE.BufferAttribute(offsetArray, 1));

            points.forEach((dot, i) => {

                const id = i;

                instancedMesh.getMatrixAt(id, tempBoxes.matrix);
                tempBoxes.matrix.decompose(currTranslate, currRotation, currScale);

                // set scale
                const boxScale = THREE.MathUtils.lerp(
                    currScale.x,
                    id < Math.pow(showAmount * power, 1) * points.length ? 1 : 0.2,
                    0.1
                );
                tempBoxes.scale.set(boxScale, boxScale, boxScale);

                // set position, when exploded dots float around

                const dist = scale * 2000;
                const newX = reveal
                    ? dot.x * scale + randPos[id][0] * dist + Math.sin((time / 10) * randPos[id][0] * Math.PI) * power
                    : i < liveCount ?
                        dot.x * scale + (liveEnabled ? Math.tan(
                            Math.pow(Math.sin(time / 5 + randPos[id][0] * Math.PI), 9)) * 2 * power : 0) : dot.x * scale;

                const newY = reveal
                    ? dot.y * scale + randPos[id][1] * dist + Math.cos((time / 10) * randPos[id][1] * Math.PI + 100) * power : i < liveCount
                        ? dot.y * scale + (liveEnabled ? Math.pow(Math.tan(time / 10 + randPos[id][1] * Math.PI * 2), 1) * 1 * power : 0)
                        : dot.y * scale;

                const newZ = reveal
                    ? dot.z * scale + randPos[id][2] * dist + Math.sin((time / 10) * randPos[id][2] * Math.PI + 200) * power
                    : i < liveCount
                        ? dot.z * scale + (liveEnabled ? Math.tan(Math.pow(Math.sin(time / 5 + randPos[id][2] * Math.PI), 9)) * 2 * power : 0)
                        : dot.z * scale;

                tempBoxes.position.set(
                    THREE.MathUtils.lerp(currTranslate.x, newX, 0.05),
                    THREE.MathUtils.lerp(currTranslate.y, newY, power < 0.9 ? 0.1 : Math.abs(newY - currTranslate.y) > 100 ? 1 : 0.05),
                    THREE.MathUtils.lerp(currTranslate.z, newZ, 0.05)
                );

                // copy camera rotation so cubes face the camera
                if (dimension) {
                    tempBoxes.rotation.set(0, 0, 0);
                } else {
                    tempBoxes.rotation.copy(this.camera.rotation);
                }

                const uvOffsets = instancedMesh.geometry.getAttribute("texIdx");
                if (power < 0.1) {
                    uvOffsets.setX(id, baseColor === 0 || baseColor === 2 ? 0.5 * Math.min(power * 10, 1) : 0);
                }

                tempBoxes.updateMatrix();
                instancedMesh.setMatrixAt(id, tempBoxes.matrix);
            });
            if (instancedMesh.instanceColor) {
                instancedMesh.instanceColor.needsUpdate = true;
            }
            instancedMesh.geometry.attributes.texIdx.needsUpdate = true;
            instancedMesh.instanceMatrix.needsUpdate = true;

        });

    }

    // As an Example
    addCube(): void {

        const geometry = new THREE.BoxGeometry(1, 1, 1, 16, 16, 16);
        const material = new THREE.MeshNormalMaterial();
        const cube = new THREE.Mesh(geometry, material);
        cube.position.x = 2;
        cube.castShadow = true;
        this.scene.add(cube);

        this.fitToView();
    }

    animate(): void {

        this.controls.update();

        this.renderer.render(this.scene, this.camera);

        requestAnimationFrame(this.animate.bind(this));

    }

}

export { ThreeDViewer };
