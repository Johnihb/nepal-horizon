'use client'

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const terrainHeight = (x: number, z: number, depth: number) => {
  const mainPeak = 10 * Math.exp(-(((x + 7) ** 2) / 85 + ((z + 3) ** 2) / 46))
  const westPeak = 6 * Math.exp(-(((x - 14) ** 2) / 45 + ((z - 2) ** 2) / 28))
  const ridge = 1.8 * Math.sin(x * 0.3 + z * 0.12) + 1.2 * Math.cos(x * 0.6 - z * 0.2)
  const detail = 0.55 * Math.sin(x * 1.35 + z * 0.52) * Math.cos(z * 0.85)
  return (mainPeak + westPeak + ridge + detail) * depth - Math.abs(x) * 0.06
}

const disposeScene = (scene: THREE.Scene) => {
  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh || object instanceof THREE.Points || object instanceof THREE.Line)) return
    object.geometry.dispose()
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    materials.forEach((material) => material.dispose())
  })
}

export default function NepalHorizonScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" })
    } catch {
      canvas.parentElement?.classList.add("nh-scene-fallback")
      return
    }

    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x0a0a0a, 14, 55)

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
    camera.position.set(0, 3.4, 15)

    const isMobile = window.matchMedia("(max-width: 720px)").matches
    const setCanvasSize = () => {
      const { width, height } = canvas.getBoundingClientRect()
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 1.75))
      renderer.setSize(width, height, false)
    }
    setCanvasSize()
    renderer.setClearColor(0x0a0a0a, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace

    scene.add(new THREE.HemisphereLight(0xe7e7e7, 0x111111, 1.4))
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2)
    keyLight.position.set(-10, 17, 11)
    scene.add(keyLight)
    const edgeLight = new THREE.DirectionalLight(0xbcbcbc, 1.8)
    edgeLight.position.set(12, 8, -18)
    scene.add(edgeLight)

    const mountainGroup = new THREE.Group()
    mountainGroup.rotation.set(-0.05, -0.22, 0)
    scene.add(mountainGroup)

    const createTerrain = (z: number, scale: number, color: number, depth: number) => {
      const geometry = new THREE.PlaneGeometry(46, 32, 120, 80)
      geometry.rotateX(-Math.PI / 2)
      const positions = geometry.attributes.position

      for (let index = 0; index < positions.count; index += 1) {
        const x = positions.getX(index)
        const localZ = positions.getZ(index)
        positions.setY(index, terrainHeight(x, localZ, depth))
      }

      positions.needsUpdate = true
      geometry.computeVertexNormals()
      const material = new THREE.MeshStandardMaterial({ color, roughness: 0.92, metalness: 0.03, flatShading: true })
      const mountain = new THREE.Mesh(geometry, material)
      mountain.position.set(0, -4.4, z)
      mountain.scale.setScalar(scale)
      mountain.rotation.y = 0.12
      mountainGroup.add(mountain)
      return mountain
    }

    createTerrain(-11, 1.25, 0x101010, 0.58)
    createTerrain(-5.8, 1, 0x4a4a4a, 0.92)
    const ascentTerrain = createTerrain(0.6, 0.82, 0xd7d7d7, 1.28)

    // Foreground ridge fills the lower dark region
    createTerrain(6, 0.6, 0x141414, 0.35)

    // Route climbs the front mountain: base -> west (child) peak -> saddle -> main peak
    const routeStops = [
      new THREE.Vector3(20, 0, 8),      // Base: low right edge
      new THREE.Vector3(14, 0, 2),      // West (child) peak
      new THREE.Vector3(6, 0, 0),       // Saddle
      new THREE.Vector3(-1, 0, -2),     // Ascending
      new THREE.Vector3(-7, 0, -3),     // Main peak
    ]
    const checkpointNames = ["Base Camp", "West Ridge", "The Saddle", "High Ridge", "Summit"]
    const surfaceY = (x: number, z: number) => Math.max(terrainHeight(x, z, 1.28), 0.08) + 0.1
    const routeGuide = new THREE.CatmullRomCurve3(routeStops, false, "chordal")
    const spacedPoints = routeGuide.getSpacedPoints(160).map(
      (point) => new THREE.Vector3(point.x, surfaceY(point.x, point.z), point.z),
    )
    // Start a little below the surface, end a little above the peak
    spacedPoints[0].y -= 0.8
    spacedPoints[spacedPoints.length - 1].y += 1.0
    const route = new THREE.CatmullRomCurve3(spacedPoints, false, "chordal")
    const routeMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uProgress: { value: 0 },
      },
      vertexShader: `
        attribute float curvePos;
        varying float vCurvePos;
        void main() {
          vCurvePos = curvePos;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uProgress;
        varying float vCurvePos;
        void main() {
          float reveal = smoothstep(0.0, 0.08, uProgress - vCurvePos);
          gl_FragColor = vec4(0.79, 0.60, 0.23, reveal * 0.85);
        }
      `,
      transparent: true,
    })
    const tubeGeo = new THREE.TubeGeometry(route, 220, 0.085, 8, false)
    const curvePositions = new Float32Array(tubeGeo.attributes.position.count)
    for (let i = 0; i < curvePositions.length; i++) {
      curvePositions[i] = (i / curvePositions.length)
    }
    tubeGeo.setAttribute('curvePos', new THREE.BufferAttribute(curvePositions, 1))
    const routeMesh = new THREE.Mesh(tubeGeo, routeMaterial)
    ascentTerrain.add(routeMesh)

    const routeNavigator = new THREE.Group()
    const navigatorCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.19, 20, 20),
      new THREE.MeshPhysicalMaterial({
        color: 0xf4efe6,
        emissive: 0xc99a3a,
        emissiveIntensity: 1.6,
        roughness: 0.12,
        metalness: 0.15,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
      }),
    )
    routeNavigator.add(navigatorCore)
    routeNavigator.add(new THREE.PointLight(0xc99a3a, 1.8, 3.2))
    ascentTerrain.add(routeNavigator)

    const navWorld = new THREE.Vector3()
    const setNavigatorPosition = (progress: number) => {
      route.getPointAt(THREE.MathUtils.clamp(progress, 0, 1), routeNavigator.position)
      routeNavigator.position.y += 0.24
    }
    setNavigatorPosition(0)

    const pinGeometry = new THREE.SphereGeometry(0.12, 12, 12)
    const pinMaterial = new THREE.MeshBasicMaterial({ color: 0xe8e2d6 })
    const pins: THREE.Mesh[] = []
    routeStops.forEach((point, index) => {
      const pin = new THREE.Mesh(
        index === routeStops.length - 1 ? new THREE.SphereGeometry(0.2, 14, 14) : pinGeometry,
        pinMaterial,
      )
      const lift = index === 0 ? -0.8 : index === routeStops.length - 1 ? 1.0 : 0
      pin.position.set(point.x, surfaceY(point.x, point.z) + 0.04 + lift, point.z)
      ascentTerrain.add(pin)
      pins.push(pin)
    })

    // Checkpoint labels, revealed as the navigator reaches each stop
    const labelHost = canvas.parentElement
    const labels = checkpointNames.map((name) => {
      const el = document.createElement("div")
      el.className = "nh-checkpoint"
      el.textContent = name
      labelHost?.appendChild(el)
      return el
    })

    const starGeometry = new THREE.BufferGeometry()
    const starCount = isMobile ? 180 : 360
    const stars = new Float32Array(starCount * 3)
    for (let index = 0; index < starCount; index += 1) {
      const radius = 18 + ((index * 19) % 32)
      const angle = index * 2.39996
      stars[index * 3] = Math.cos(angle) * radius
      stars[index * 3 + 1] = 3 + ((index * 11) % 23)
      stars[index * 3 + 2] = Math.sin(angle) * radius - 18
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(stars, 3))
    scene.add(new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xe4e4e4, size: 0.045, transparent: true, opacity: 0.68 })))

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshStandardMaterial({ color: 0x090909, roughness: 1 })
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -4.55
    scene.add(ground)

    const pointer = { x: 0, y: 0 }
    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX / window.innerWidth - 0.5
      pointer.y = event.clientY / window.innerHeight - 0.5
    }
    const onResize = () => setCanvasSize()
    window.addEventListener("pointermove", onPointerMove, { passive: true })
    window.addEventListener("resize", onResize, { passive: true })

    const hero = canvas.closest<HTMLElement>(".nh-hero")
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const cam = { x: 0, y: 3.4, z: 15 }
    const navigationProgress = { value: 0 }
    const context = gsap.context(() => {
      if (reducedMotion || !hero) return
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      })
      timeline
        .to(cam, { x: -5, y: 13, z: 7, duration: 2.4, ease: "power1.inOut" }, 0)
        .to(mountainGroup.rotation, { y: 0, x: -0.15, duration: 2.4, ease: "power1.inOut" }, 0)
        .to(navigationProgress, { value: 1, duration: 2.4, ease: "power1.inOut" }, 0)
        .to(routeMaterial.uniforms.uProgress, { value: 1, duration: 2.4, ease: "power1.inOut" }, 0)
      ScrollTrigger.refresh()
    }, hero ?? canvas)

    let animationFrame = 0
    const labelAnchor = new THREE.Vector3()
    const updateCheckpoints = () => {
      pins.forEach((pin, index) => {
        const label = labels[index]
        if (!label) return
        label.style.opacity = reducedMotion || navigationProgress.value >= index / (pins.length - 1) ? "1" : "0"
        pin.getWorldPosition(labelAnchor)
        labelAnchor.project(camera)
        const x = (labelAnchor.x * 0.5 + 0.5) * canvas.clientWidth
        const y = (-labelAnchor.y * 0.5 + 0.5) * canvas.clientHeight
        label.style.transform = `translate(-50%, -130%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`
      })
    }
    const render = () => {
      setNavigatorPosition(navigationProgress.value)
      updateCheckpoints()
      routeNavigator.getWorldPosition(navWorld)
      if (!reducedMotion) {
        const glow = 1 + Math.sin(window.performance.now() * 0.006) * 0.14
        navigatorCore.scale.setScalar(glow)
      }
      mountainGroup.rotation.z += (pointer.x * 0.035 - mountainGroup.rotation.z) * 0.035
      camera.position.set(cam.x + pointer.x * 0.28, cam.y - pointer.y * 0.42, cam.z) // reduced oscillation sensitivity
      camera.lookAt(navWorld.x, navWorld.y + 0.35, navWorld.z)
      renderer.render(scene, camera)
      animationFrame = window.requestAnimationFrame(render)
    }
    render()

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("resize", onResize)
      labels.forEach((el) => el.remove())
      context.revert()
      disposeScene(scene)
      renderer.dispose()
    }
  }, [])

  return (
    <div className="nh-scene" aria-hidden="true">
      <canvas ref={canvasRef} className="nh-scene-canvas" />
      <svg className="nh-static-mountain" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 100 C 18 72, 34 58, 50 62 C 66 66, 76 42, 90 56 C 96 62, 100 72, 100 100 Z" fill="#f4efe6" opacity="0.78" />
      </svg>
    </div>
  )
}
