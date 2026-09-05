'use client';

import { useEffect, useRef } from 'react';

/**
 * Interactive WebGL hero background: a faceted violet crystal wrapped in a
 * wireframe shell, floating over a drifting particle field. The whole scene
 * parallaxes toward the pointer. Loaded client-side only (dynamic import of
 * three, so it code-splits and never runs during SSR), degrades gracefully
 * when WebGL is unavailable, and honors prefers-reduced-motion.
 */
export default function Hero3D() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let raf = 0;
    let cleanup = () => {};

    (async () => {
      let THREE: typeof import('three');
      try {
        THREE = await import('three');
      } catch {
        return;
      }
      if (disposed || !mount) return;

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      let width = mount.clientWidth || window.innerWidth;
      let height = mount.clientHeight || 600;

      let renderer: import('three').WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      } catch {
        return; // no WebGL — the CSS gradient underneath stays visible
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setSize(width, height);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.display = 'block';
      mount.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
      camera.position.set(0, 0, 6);

      // Crystal group (solid faceted core + wireframe shell), offset to the
      // right so it sits beside the hero copy in the transparent scrim zone.
      const group = new THREE.Group();
      group.position.x = 1.7;
      scene.add(group);

      const core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.65, 1),
        new THREE.MeshStandardMaterial({
          color: 0x6d5efc,
          emissive: 0x2a1a6b,
          emissiveIntensity: 0.55,
          metalness: 0.35,
          roughness: 0.25,
          flatShading: true,
        }),
      );
      group.add(core);

      const shell = new THREE.Mesh(
        new THREE.IcosahedronGeometry(2.35, 1),
        new THREE.MeshBasicMaterial({ color: 0xa78bfa, wireframe: true, transparent: true, opacity: 0.16 }),
      );
      group.add(shell);

      // Lights to catch the facets
      scene.add(new THREE.AmbientLight(0x8b7bff, 0.5));
      const l1 = new THREE.PointLight(0x7c5cff, 90, 60);
      l1.position.set(6, 5, 8);
      scene.add(l1);
      const l2 = new THREE.PointLight(0x22d3ee, 55, 60);
      l2.position.set(-7, -4, 4);
      scene.add(l2);
      const l3 = new THREE.DirectionalLight(0xffffff, 0.35);
      l3.position.set(0, 3, 5);
      scene.add(l3);

      // Particle field
      const COUNT = 1300;
      const positions = new Float32Array(COUNT * 3);
      for (let i = 0; i < COUNT; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 26;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 18 - 2;
      }
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const particles = new THREE.Points(
        pGeo,
        new THREE.PointsMaterial({ color: 0xb7a6ff, size: 0.035, transparent: true, opacity: 0.7, depthWrite: false }),
      );
      scene.add(particles);

      // Pointer parallax
      const target = { x: 0, y: 0 };
      const current = { x: 0, y: 0 };
      const onPointer = (e: PointerEvent) => {
        target.x = (e.clientX / window.innerWidth) * 2 - 1;
        target.y = (e.clientY / window.innerHeight) * 2 - 1;
      };
      window.addEventListener('pointermove', onPointer, { passive: true });

      const onResize = () => {
        const w = mount.clientWidth || window.innerWidth;
        const h = mount.clientHeight || window.innerHeight || 600;
        if (w < 2 || h < 2) return; // ignore degenerate (e.g. offscreen) sizes
        width = w;
        height = h;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };
      window.addEventListener('resize', onResize);
      // A ResizeObserver corrects the canvas whenever the mount gets real
      // dimensions — e.g. if the first measure happened before layout settled.
      const ro = new ResizeObserver(onResize);
      ro.observe(mount);

      const clock = new THREE.Clock();
      const render = () => {
        const t = clock.getElapsedTime();
        current.x += (target.x - current.x) * 0.05;
        current.y += (target.y - current.y) * 0.05;

        group.rotation.y = t * 0.12 + current.x * 0.5;
        group.rotation.x = Math.sin(t * 0.15) * 0.15 + current.y * 0.35;
        group.position.y = Math.sin(t * 0.6) * 0.12;
        shell.rotation.z = t * 0.05;

        particles.rotation.y = t * 0.015 + current.x * 0.08;
        particles.rotation.x = current.y * 0.06;

        camera.position.x += (current.x * 0.6 - camera.position.x) * 0.04;
        camera.position.y += (-current.y * 0.4 - camera.position.y) * 0.04;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
      };

      const loop = () => {
        if (disposed) return;
        render();
        raf = requestAnimationFrame(loop);
      };

      const onVisibility = () => {
        if (document.hidden) {
          cancelAnimationFrame(raf);
        } else if (!reduceMotion && !disposed) {
          raf = requestAnimationFrame(loop);
        }
      };
      document.addEventListener('visibilitychange', onVisibility);

      if (reduceMotion) {
        render(); // single static frame
      } else {
        raf = requestAnimationFrame(loop);
      }

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('pointermove', onPointer);
        window.removeEventListener('resize', onResize);
        ro.disconnect();
        document.removeEventListener('visibilitychange', onVisibility);
        core.geometry.dispose();
        (core.material as import('three').Material).dispose();
        shell.geometry.dispose();
        (shell.material as import('three').Material).dispose();
        pGeo.dispose();
        (particles.material as import('three').Material).dispose();
        renderer.dispose();
        if (renderer.domElement.parentNode === mount) {
          mount.removeChild(renderer.domElement);
        }
      };
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cleanup();
    };
  }, []);

  return <div ref={mountRef} aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" />;
}
