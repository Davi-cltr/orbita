import * as THREE from 'three'
import {
  planetFragment,
  planetVertex,
  ringFragment,
  ringVertex,
  starFragment,
  starVertex,
} from './shaders'

export interface PlanetSlot {
  type: number
  visible: boolean
  x: number
  y: number
  scale: number
}

export interface SceneState {
  a: PlanetSlot
  b: PlanetSlot
  /** 0..1, intensidade da dobra espacial */
  warp: number
  /** 0..1, força do raio-x em volta do cursor */
  reveal: number
  /** cursor em px relativos ao canvas; null = fora */
  mouse: { x: number; y: number } | null
  revealRadius: number
}

const RING_IN = 1.32
const RING_OUT = 2.35

class PlanetGroup {
  group = new THREE.Group()
  tilt = new THREE.Group()
  sphere: THREE.Mesh<THREE.SphereGeometry, THREE.ShaderMaterial>
  ring: THREE.Mesh<THREE.RingGeometry, THREE.ShaderMaterial>

  constructor(geo: THREE.SphereGeometry, shared: Record<string, THREE.IUniform>) {
    const mat = new THREE.ShaderMaterial({
      vertexShader: planetVertex,
      fragmentShader: planetFragment,
      uniforms: { ...shared, uType: { value: 0 } },
    })
    this.sphere = new THREE.Mesh(geo, mat)
    const ringMat = new THREE.ShaderMaterial({
      vertexShader: ringVertex,
      fragmentShader: ringFragment,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      uniforms: { uInner: { value: RING_IN }, uOuter: { value: RING_OUT }, uOpacity: { value: 1 } },
    })
    this.ring = new THREE.Mesh(new THREE.RingGeometry(RING_IN, RING_OUT, 160, 1), ringMat)
    this.ring.rotation.x = -Math.PI / 2
    this.tilt.add(this.sphere, this.ring)
    this.group.add(this.tilt)
  }

  setType(type: number) {
    this.sphere.material.uniforms.uType.value = type
    this.ring.visible = type === 4
    // inclinação axial aproximada de cada destino
    const tilts = [0.41, 0.1, 0.44, 0.05, 0.47]
    this.tilt.rotation.z = tilts[type] ?? 0
    this.tilt.rotation.x = type === 4 ? 0.32 : 0.12
  }
}

export class PlanetScene {
  renderer: THREE.WebGLRenderer
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(35, 1, 0.1, 200)
  shared: Record<string, THREE.IUniform>
  a: PlanetGroup
  b: PlanetGroup
  stars: THREE.Points
  streaks: THREE.LineSegments
  starUniforms: Record<string, THREE.IUniform>
  last = performance.now()
  elapsed = 0
  travel = 0
  spin = 0
  reduced: boolean
  width = 1
  height = 1
  dpr = 1
  /** metade da altura visível no plano z=0 */
  halfH = 1

  constructor(canvas: HTMLCanvasElement, reduced: boolean) {
    this.reduced = reduced
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
    this.renderer.setClearColor(0x000000, 0)
    this.camera.position.set(0, 0, 6)

    this.shared = {
      uTime: { value: 0 },
      uLight: { value: new THREE.Vector3(-0.55, 0.45, 0.7).normalize() },
      uMouse: { value: new THREE.Vector2(-9999, -9999) },
      uRadius: { value: 110 },
      uReveal: { value: 0 },
      uDpr: { value: 1 },
    }
    const geo = new THREE.SphereGeometry(1, 128, 96)
    this.a = new PlanetGroup(geo, this.shared)
    this.b = new PlanetGroup(geo, this.shared)
    this.scene.add(this.a.group, this.b.group)

    // estrelas: pontos parados + rastros para a dobra espacial
    const COUNT = 1400
    const pos = new Float32Array(COUNT * 3)
    const seed = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      const r = 2.2 + Math.random() * 18
      const t = Math.random() * Math.PI * 2
      pos[i * 3] = Math.cos(t) * r
      pos[i * 3 + 1] = Math.sin(t) * r * 0.75
      pos[i * 3 + 2] = -Math.random() * 64 + 4
      seed[i] = Math.random()
    }
    this.starUniforms = {
      uTravel: { value: 0 },
      uWarp: { value: 0 },
      uTime: this.shared.uTime,
      uDpr: this.shared.uDpr,
      uColor: { value: new THREE.Color('#f1ecff') },
      uOpacity: { value: 1 },
    }
    const pointGeo = new THREE.BufferGeometry()
    pointGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    pointGeo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    pointGeo.setAttribute('aTail', new THREE.BufferAttribute(new Float32Array(COUNT), 1))
    this.stars = new THREE.Points(
      pointGeo,
      new THREE.ShaderMaterial({
        vertexShader: starVertex,
        fragmentShader: starFragment.replace(
          'gl_FragColor',
          'if(length(gl_PointCoord-0.5)>0.5) discard;\n  gl_FragColor',
        ),
        uniforms: this.starUniforms,
        transparent: true,
        depthWrite: false,
      }),
    )
    // cada rastro = cabeça + cauda
    const lpos = new Float32Array(COUNT * 6)
    const lseed = new Float32Array(COUNT * 2)
    const ltail = new Float32Array(COUNT * 2)
    for (let i = 0; i < COUNT; i++) {
      for (let k = 0; k < 2; k++) {
        lpos.set([pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]], (i * 2 + k) * 3)
        lseed[i * 2 + k] = seed[i]
        ltail[i * 2 + k] = k
      }
    }
    const lineGeo = new THREE.BufferGeometry()
    lineGeo.setAttribute('position', new THREE.BufferAttribute(lpos, 3))
    lineGeo.setAttribute('aSeed', new THREE.BufferAttribute(lseed, 1))
    lineGeo.setAttribute('aTail', new THREE.BufferAttribute(ltail, 1))
    this.streaks = new THREE.LineSegments(
      lineGeo,
      new THREE.ShaderMaterial({
        vertexShader: starVertex,
        fragmentShader: starFragment,
        uniforms: this.starUniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    )
    this.stars.renderOrder = -1
    this.streaks.renderOrder = -1
    this.scene.add(this.stars, this.streaks)
  }

  resize(w: number, h: number) {
    this.width = w
    this.height = h
    this.dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.renderer.setPixelRatio(this.dpr)
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.shared.uDpr.value = this.dpr
    this.halfH = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * this.camera.position.z
  }

  get aspect() {
    return this.width / this.height
  }

  private place(g: PlanetGroup, s: PlanetSlot) {
    g.group.visible = s.visible
    if (!s.visible) return
    g.setType(s.type)
    g.group.position.set(s.x * this.halfH, s.y * this.halfH, 0)
    g.group.scale.setScalar(s.scale * this.halfH * 0.62)
  }

  render(state: SceneState) {
    const now = performance.now()
    const dt = Math.min((now - this.last) / 1000, 0.05)
    this.last = now
    this.elapsed += dt
    const t = this.elapsed
    this.shared.uTime.value = this.reduced ? 0 : t

    this.place(this.a, state.a)
    this.place(this.b, state.b)
    if (!this.reduced) this.spin += dt * 0.09
    this.a.sphere.rotation.y = this.spin
    this.b.sphere.rotation.y = this.spin + 1.3

    const warp = this.reduced ? 0 : state.warp
    this.travel += dt * (0.35 + warp * 55)
    this.starUniforms.uTravel.value = this.reduced ? 0 : this.travel
    this.starUniforms.uWarp.value = warp
    this.streaks.visible = warp > 0.01
    this.camera.fov = 35 + warp * 9
    this.camera.updateProjectionMatrix()

    this.shared.uReveal.value = state.mouse ? state.reveal : 0
    this.shared.uRadius.value = state.revealRadius
    if (state.mouse) {
      this.shared.uMouse.value.set(state.mouse.x * this.dpr, (this.height - state.mouse.y) * this.dpr)
    }
    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    this.renderer.dispose()
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh
      m.geometry?.dispose?.()
      const mat = m.material as THREE.Material | undefined
      mat?.dispose?.()
    })
  }
}
