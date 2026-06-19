import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useNavigate } from 'react-router-dom'

export default function RobotScene() {
  const mountRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const width = mount.clientWidth
    const height = mount.clientHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000)
camera.position.set(1.5, 0.8, 5.5)
camera.lookAt(0, 0.3, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    // Lights
const ambient = new THREE.AmbientLight(0xffffff, 0.9)
scene.add(ambient)
const dirLight = new THREE.DirectionalLight(0xffffff, 1.5)
dirLight.position.set(3, 5, 5)
scene.add(dirLight)
const dirLight2 = new THREE.DirectionalLight(0x7F77DD, 0.8)
dirLight2.position.set(-4, 2, 3)
scene.add(dirLight2)
const rimLight = new THREE.PointLight(0x1D9E75, 2, 10)
rimLight.position.set(0, 1, 4)
scene.add(rimLight)
const topLight = new THREE.PointLight(0xffffff, 1, 8)
topLight.position.set(0, 4, 2)
scene.add(topLight)

    // Robot group
    const robot = new THREE.Group()

const purpleMat = new THREE.MeshStandardMaterial({ color: 0x8F87ED, metalness: 0.4, roughness: 0.25 })
const darkMat = new THREE.MeshStandardMaterial({ color: 0x3A3A4A, metalness: 0.6, roughness: 0.2 })
const tealMat = new THREE.MeshStandardMaterial({ color: 0x1DE99A, emissive: 0x1DE99A, emissiveIntensity: 1 })
const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.6 })
    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.1, 1.2), darkMat)
    head.position.y = 1.2
    robot.add(head)

    // Face screen
    const face = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.6, 0.05), purpleMat)
    face.position.set(0, 1.2, 0.62)
    robot.add(face)

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.12, 16, 16)
    const leftEye = new THREE.Mesh(eyeGeo, tealMat)
    leftEye.position.set(-0.28, 1.25, 0.68)
    robot.add(leftEye)
    const rightEye = new THREE.Mesh(eyeGeo, tealMat)
    rightEye.position.set(0.28, 1.25, 0.68)
    robot.add(rightEye)

    // Antenna
    const antennaStem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5), darkMat)
    antennaStem.position.set(0, 2, 0)
    robot.add(antennaStem)
    const antennaTip = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), whiteMat)
    antennaTip.position.set(0, 2.3, 0)
    robot.add(antennaTip)

    // Body
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 1.4, 8), purpleMat)
    body.position.y = -0.2
    robot.add(body)

    // Chest light
    const chestLight = new THREE.Mesh(new THREE.CircleGeometry(0.25, 32), tealMat)
    chestLight.position.set(0, -0.1, 0.75)
    robot.add(chestLight)

    // Arms
    const armGeo = new THREE.CylinderGeometry(0.15, 0.15, 1, 8)
    const leftArm = new THREE.Mesh(armGeo, darkMat)
    leftArm.position.set(-1, -0.1, 0)
    leftArm.rotation.z = 0.3
    robot.add(leftArm)
    const rightArm = new THREE.Mesh(armGeo, darkMat)
    rightArm.position.set(1, -0.1, 0)
    rightArm.rotation.z = -0.3
    robot.add(rightArm)

    // Base/legs
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.5, 8), darkMat)
    base.position.y = -1.15
    robot.add(base)
    robot.position.y = 0.3
robot.scale.set(1.15, 1.15, 1.15)

    scene.add(robot)

    // Mouse tracking
    let mouseX = 0, mouseY = 0
    const handleMouseMove = (e) => {
      const rect = mount.getBoundingClientRect()
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouseY = ((e.clientY - rect.top) / rect.height) * 2 - 1
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Click handler
    const handleClick = () => navigate('/register')
    mount.addEventListener('click', handleClick)
    mount.style.cursor = 'pointer'

    let frameId
    const clock = new THREE.Clock()
    const animate = () => {
      const t = clock.getElapsedTime()
      robot.position.y = Math.sin(t * 1.2) * 0.15
      robot.rotation.y += (mouseX * 0.4 - robot.rotation.y) * 0.05
      robot.rotation.x += (-mouseY * 0.15 - robot.rotation.x) * 0.05
      antennaTip.material.emissiveIntensity = 0.4 + Math.sin(t * 3) * 0.3
      renderer.render(scene, camera)
      frameId = requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      mount.removeEventListener('click', handleClick)
      mount.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [navigate])

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
}