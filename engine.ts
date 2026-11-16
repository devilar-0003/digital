/**
 * engine.ts – Three.js rendering engine: scene, camera, lights, orbit controls,
 * raycast picking, resize handling and theme-aware backgrounds.
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export type PickHandler = (object: THREE.Object3D) => void;

export class Engine {
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  readonly renderer: THREE.WebGLRenderer;
  readonly controls: OrbitControls;
  readonly root = new THREE.Group();
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private pickables: THREE.Object3D[] = [];
  private onPick?: PickHandler;
  private raf = 0;
  private ro: ResizeObserver;
  private grid: THREE.GridHelper;
  private downPos = { x: 0, y: 0 };
  private disposed = false;
  onFrame?: (t: number) => void;

  constructor(private container: HTMLElement) {
    const w = container.clientWidth || 600;
    const h = container.clientHeight || 400;
    this.camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 200);
    this.camera.position.set(0, 9, 13);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.maxPolarAngle = Math.PI / 2.05;
    this.controls.minDistance = 4;
    this.controls.maxDistance = 40;

    // Lighting
    this.scene.add(new THREE.HemisphereLight(0xbfefff, 0x101820, 0.9));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(6, 12, 8);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -12;
    key.shadow.camera.right = 12;
    key.shadow.camera.top = 12;
    key.shadow.camera.bottom = -12;
    this.scene.add(key);
    const rim = new THREE.PointLight(0x22d3ee, 6, 30);
    rim.position.set(-6, 4, -6);
    this.scene.add(rim);

    this.grid = new THREE.GridHelper(40, 40, 0x22d3ee, 0x1e293b);
    (this.grid.material as THREE.Material).transparent = true;
    (this.grid.material as THREE.Material).opacity = 0.25;
    this.grid.position.y = -0.61;
    this.scene.add(this.grid);
    this.scene.add(this.root);

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(container);

    const el = this.renderer.domElement;
    el.addEventListener("pointerdown", this.handleDown);
    el.addEventListener("pointerup", this.handleUp);
    el.style.touchAction = "none";

    this.loop(0);
  }

  setTheme(dark: boolean) {
    this.scene.background = new THREE.Color(dark ? 0x060b14 : 0xeef4fb);
    this.scene.fog = new THREE.Fog(dark ? 0x060b14 : 0xeef4fb, 25, 60);
    (this.grid.material as THREE.LineBasicMaterial).opacity = dark ? 0.25 : 0.45;
  }

  setPickables(list: THREE.Object3D[], handler: PickHandler) {
    this.pickables = list;
    this.onPick = handler;
  }

  resetView() {
    this.camera.position.set(0, 9, 13);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  private handleDown = (e: PointerEvent) => {
    this.downPos = { x: e.clientX, y: e.clientY };
  };

  private handleUp = (e: PointerEvent) => {
    // ignore drags (orbit)
    if (Math.hypot(e.clientX - this.downPos.x, e.clientY - this.downPos.y) > 5) return;
    if (!this.onPick || !this.pickables.length) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.pickables, true);
    if (hits.length) {
      let o: THREE.Object3D | null = hits[0].object;
      while (o && !o.userData.pickId) o = o.parent;
      if (o) this.onPick(o);
    }
  };

  private resize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (!w || !h) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  private loop = (t: number) => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    this.controls.update();
    this.onFrame?.(t);
    this.renderer.render(this.scene, this.camera);
  };

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    const el = this.renderer.domElement;
    el.removeEventListener("pointerdown", this.handleDown);
    el.removeEventListener("pointerup", this.handleUp);
    this.controls.dispose();
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry && !(o as THREE.Sprite).isSprite) m.geometry.dispose();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else mat?.dispose();
    });
    this.renderer.dispose();
    if (el.parentElement === this.container) this.container.removeChild(el);
  }
}
