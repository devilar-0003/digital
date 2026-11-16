/**
 * models.ts – Builds interactive 3D circuit models (PCB, switches, IC, LEDs, wires)
 * from a CircuitBuild definition. Returns an updater that colours signals live.
 */
import * as THREE from "three";
import type { CircuitBuild, Bits } from "./builds";

export interface CircuitModel {
  group: THREE.Group;
  pickables: THREE.Object3D[];
  update: (inputs: Bits, outputs: Bits, clockPulse: number) => void;
  animate: (t: number) => void;
}

const COLOR_ON = new THREE.Color(0x22d3ee);
const COLOR_ON_OUT = new THREE.Color(0x4ade80);
const COLOR_OFF = new THREE.Color(0x334155);
const WIRE_OFF = new THREE.Color(0x475569);

function labelSprite(text: string, color = "#e2e8f0", size = 1.4): THREE.Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 96;
  const ctx = canvas.getContext("2d")!;
  ctx.font = "bold 46px 'Inter', system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 8;
  ctx.fillText(text, 128, 48);
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const sp = new THREE.Sprite(mat);
  sp.scale.set(size * 2.6, size, 1);
  return sp;
}

function chipTexture(name: string, sub: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, 512, 512);
  // subtle circuit traces
  ctx.strokeStyle = "rgba(34,211,238,0.18)";
  ctx.lineWidth = 3;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(30 + i * 60, 40);
    ctx.lineTo(30 + i * 60, 160 + (i % 3) * 40);
    ctx.lineTo(90 + i * 50, 160 + (i % 3) * 40);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(60, 60, 16, 0, Math.PI * 2);
  ctx.fillStyle = "#1e293b";
  ctx.fill();
  ctx.fillStyle = "#e2e8f0";
  ctx.font = "bold 64px 'Inter', system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(name.length > 10 ? name.slice(0, 10) : name, 256, 280);
  ctx.fillStyle = "#22d3ee";
  ctx.font = "32px 'JetBrains Mono', monospace";
  ctx.fillText(sub, 256, 340);
  ctx.fillStyle = "#64748b";
  ctx.font = "24px monospace";
  ctx.fillText("DigiLab Pro", 256, 440);
  return new THREE.CanvasTexture(canvas);
}

function wire(from: THREE.Vector3, to: THREE.Vector3, lift = 0.35): THREE.Mesh {
  const mid1 = new THREE.Vector3((from.x * 2 + to.x) / 3, from.y + lift, from.z);
  const mid2 = new THREE.Vector3((from.x + to.x * 2) / 3, to.y + lift, to.z);
  const curve = new THREE.CatmullRomCurve3([from, mid1, mid2, to]);
  const geo = new THREE.TubeGeometry(curve, 24, 0.06, 8, false);
  const mat = new THREE.MeshStandardMaterial({ color: WIRE_OFF, emissive: 0x000000, roughness: 0.4, metalness: 0.3 });
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  return m;
}

export function buildCircuitModel(def: CircuitBuild, label: string, code: string): CircuitModel {
  const group = new THREE.Group();
  const pickables: THREE.Object3D[] = [];
  const nIn = def.inputs.length + (def.clocked ? 1 : 0);
  const nOut = def.outputs.length;
  const rows = Math.max(nIn, nOut, 2);
  const spacing = 1.5;
  const depth = rows * spacing + 1.5;
  const width = 12;

  /* PCB board */
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.4, depth),
    new THREE.MeshStandardMaterial({ color: 0x0b3b3f, roughness: 0.75, metalness: 0.15 })
  );
  board.position.y = -0.4;
  board.receiveShadow = true;
  group.add(board);
  const edge = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.1, 0.05, depth + 0.1),
    new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x22d3ee, emissiveIntensity: 0.6 })
  );
  edge.position.y = -0.62;
  group.add(edge);
  // mounting holes
  [-1, 1].forEach((sx) =>
    [-1, 1].forEach((sz) => {
      const h = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.5, 16), new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.9, roughness: 0.2 }));
      h.position.set(sx * (width / 2 - 0.45), -0.4, sz * (depth / 2 - 0.45));
      group.add(h);
    })
  );

  /* IC chip */
  const chipW = 3.6;
  const chipD = Math.max(2.4, rows * spacing * 0.8);
  const chipMats = [
    new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.5 }),
    new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.5 }),
    new THREE.MeshStandardMaterial({ map: chipTexture(code, label), roughness: 0.45 }),
    new THREE.MeshStandardMaterial({ color: 0x111827 }),
    new THREE.MeshStandardMaterial({ color: 0x111827 }),
    new THREE.MeshStandardMaterial({ color: 0x111827 }),
  ];
  const chip = new THREE.Mesh(new THREE.BoxGeometry(chipW, 0.7, chipD), chipMats);
  chip.position.y = 0.15;
  chip.castShadow = true;
  group.add(chip);
  // pins
  const pinMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.95, roughness: 0.15 });
  const pinCount = Math.max(nIn, nOut, 3);
  for (let i = 0; i < pinCount; i++) {
    const z = -((pinCount - 1) * (chipD - 0.6)) / (2 * Math.max(pinCount - 1, 1)) + (i * (chipD - 0.6)) / Math.max(pinCount - 1, 1);
    [-1, 1].forEach((s) => {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.22), pinMat);
      p.position.set(s * (chipW / 2 + 0.2), -0.1, z);
      group.add(p);
    });
  }

  /* Inputs: toggle switches + LED */
  const inputNames = [...def.inputs, ...(def.clocked ? ["CLK"] : [])];
  const switchMeshes: Record<string, { lever: THREE.Mesh; led: THREE.Mesh; wire: THREE.Mesh }> = {};
  const inZ0 = -((inputNames.length - 1) * spacing) / 2;
  inputNames.forEach((name, i) => {
    const z = inZ0 + i * spacing;
    const x = -width / 2 + 1.6;
    const isClk = name === "CLK";
    const holder = new THREE.Group();
    holder.position.set(x, 0, z);
    holder.userData.pickId = name;
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.35, 0.9),
      new THREE.MeshStandardMaterial({ color: isClk ? 0x3b1d5e : 0x1e293b, roughness: 0.6 })
    );
    base.position.y = -0.03;
    base.castShadow = true;
    holder.add(base);
    const lever = new THREE.Mesh(
      isClk ? new THREE.CylinderGeometry(0.28, 0.32, 0.3, 24) : new THREE.BoxGeometry(0.35, 0.55, 0.3),
      new THREE.MeshStandardMaterial({ color: isClk ? 0xa78bfa : 0xf8fafc, emissive: isClk ? 0x7c3aed : 0x000000, emissiveIntensity: 0.4, roughness: 0.35 })
    );
    lever.position.set(0, 0.3, 0);
    if (!isClk) lever.rotation.x = 0.55;
    holder.add(lever);
    const led = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 16, 16),
      new THREE.MeshStandardMaterial({ color: COLOR_OFF, emissive: 0x000000, emissiveIntensity: 1.5 })
    );
    led.position.set(0.7, 0.1, 0);
    holder.add(led);
    const lbl = labelSprite(name, isClk ? "#c4b5fd" : "#67e8f9", 0.9);
    lbl.position.set(-0.2, 1.05, 0);
    holder.add(lbl);
    group.add(holder);
    pickables.push(holder);
    const w = wire(new THREE.Vector3(x + 0.85, 0.05, z), new THREE.Vector3(-chipW / 2 - 0.4, 0.0, Math.max(-chipD / 2 + 0.3, Math.min(chipD / 2 - 0.3, z))));
    group.add(w);
    switchMeshes[name] = { lever, led, wire: w };
  });

  /* Outputs: LEDs */
  const outMeshes: Record<string, { led: THREE.Mesh; wire: THREE.Mesh; glow: THREE.Mesh }> = {};
  const outZ0 = -((nOut - 1) * spacing) / 2;
  def.outputs.forEach((name, i) => {
    const z = outZ0 + i * spacing;
    const x = width / 2 - 1.6;
    const holder = new THREE.Group();
    holder.position.set(x, 0, z);
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.25, 24), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
    ring.position.y = 0;
    holder.add(ring);
    const led = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 24, 24),
      new THREE.MeshStandardMaterial({ color: COLOR_OFF, emissive: 0x000000, emissiveIntensity: 2, roughness: 0.2 })
    );
    led.position.y = 0.25;
    led.castShadow = true;
    holder.add(led);
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 16, 16),
      new THREE.MeshBasicMaterial({ color: COLOR_ON_OUT, transparent: true, opacity: 0, depthWrite: false })
    );
    glow.position.y = 0.25;
    holder.add(glow);
    const lbl = labelSprite(name, "#86efac", 0.9);
    lbl.position.set(0, 1.15, 0);
    holder.add(lbl);
    group.add(holder);
    const w = wire(new THREE.Vector3(chipW / 2 + 0.4, 0.0, Math.max(-chipD / 2 + 0.3, Math.min(chipD / 2 - 0.3, z))), new THREE.Vector3(x - 0.5, 0.05, z));
    group.add(w);
    outMeshes[name] = { led, wire: w, glow };
  });

  /* Title */
  const title = labelSprite(label, "#e2e8f0", 1.1);
  title.position.set(0, 2.2, -depth / 2 + 0.2);
  group.add(title);

  let clockFlash = 0;
  const update = (inputs: Bits, outputs: Bits, clockPulse: number) => {
    for (const [name, m] of Object.entries(switchMeshes)) {
      const isClk = name === "CLK";
      const on = isClk ? 0 : inputs[name] ?? 0;
      const ledMat = m.led.material as THREE.MeshStandardMaterial;
      const wMat = m.wire.material as THREE.MeshStandardMaterial;
      if (!isClk) {
        m.lever.rotation.x = on ? -0.55 : 0.55;
        ledMat.color.copy(on ? COLOR_ON : COLOR_OFF);
        ledMat.emissive.copy(on ? COLOR_ON : new THREE.Color(0));
        wMat.color.copy(on ? COLOR_ON : WIRE_OFF);
        wMat.emissive.copy(on ? COLOR_ON : new THREE.Color(0));
        wMat.emissiveIntensity = on ? 0.6 : 0;
      } else {
        clockFlash = clockPulse;
      }
    }
    for (const [name, m] of Object.entries(outMeshes)) {
      const on = outputs[name] ?? 0;
      const ledMat = m.led.material as THREE.MeshStandardMaterial;
      const wMat = m.wire.material as THREE.MeshStandardMaterial;
      ledMat.color.copy(on ? COLOR_ON_OUT : COLOR_OFF);
      ledMat.emissive.copy(on ? COLOR_ON_OUT : new THREE.Color(0));
      wMat.color.copy(on ? COLOR_ON_OUT : WIRE_OFF);
      wMat.emissive.copy(on ? COLOR_ON_OUT : new THREE.Color(0));
      wMat.emissiveIntensity = on ? 0.6 : 0;
      (m.glow.material as THREE.MeshBasicMaterial).opacity = on ? 0.25 : 0;
    }
  };

  let lastFlash = -1;
  const animate = (t: number) => {
    const clk = switchMeshes["CLK"];
    if (clk) {
      if (clockFlash !== lastFlash) {
        lastFlash = clockFlash;
        clk.lever.userData.t0 = t;
      }
      const dt = t - (clk.lever.userData.t0 ?? -1e9);
      const k = Math.max(0, 1 - dt / 350);
      const ledMat = clk.led.material as THREE.MeshStandardMaterial;
      const wMat = clk.wire.material as THREE.MeshStandardMaterial;
      const c = new THREE.Color(0xa78bfa);
      ledMat.color.copy(k > 0 ? c : COLOR_OFF);
      ledMat.emissive.copy(c).multiplyScalar(k * 1.5);
      wMat.color.copy(k > 0 ? c : WIRE_OFF);
      wMat.emissive.copy(c).multiplyScalar(k);
      clk.lever.position.y = 0.3 - 0.12 * k;
    }
    // subtle breathing glow on output halos
    for (const m of Object.values(outMeshes)) {
      const mat = m.glow.material as THREE.MeshBasicMaterial;
      if (mat.opacity > 0) mat.opacity = 0.2 + 0.08 * Math.sin(t / 250);
    }
  };

  return { group, pickables, update, animate };
}
