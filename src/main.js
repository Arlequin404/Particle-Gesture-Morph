import * as THREE from 'three';
import { ParticleSystem } from './particleSystem';
import { GestureHandler } from './gestureHandler';

class App {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('three-canvas'),
            antialias: true,
            alpha: true
        });

        this.particles = null;
        this.gestureHandler = null;
        this.activeGestureId = '';

        this.init();
    }

    init() {
        // Renderer setup
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.camera.position.z = 10;

        // Particle System
        this.particles = new ParticleSystem(this.scene);

        // UI Camera Toggle
        const btnToggle = document.getElementById('btn-toggle-camera');
        const videoCont = document.getElementById('video-container');
        btnToggle.addEventListener('click', () => {
            const isHidden = videoCont.classList.contains('hidden-preview');
            videoCont.classList.toggle('hidden-preview');
            btnToggle.innerText = isHidden ? 'Ocultar Cámara' : 'Ver Cámara';
        });

        // Gesture Detection
        this.gestureHandler = new GestureHandler(
            (gesture) => this.handleGestureChange(gesture),
            (handData) => {
                if (this.particles) this.particles.rotateTo(handData);
            }
        );

        // Event listeners
        window.addEventListener('resize', () => this.onResize());

        this.animate();
    }

    handleGestureChange(gesture) {
        // UI Updates
        this.updateUI(gesture);

        // Particle Morphing
        this.particles.morphTo(gesture);
    }

    updateUI(gesture) {
        // Reset all active classes
        document.querySelectorAll('.gesture-card').forEach(el => el.classList.remove('active'));

        // Mark new active if valid
        const targetId = `gesture-indicator-${gesture}`;
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
            targetEl.classList.add('active');
            document.getElementById('status').innerText = `Gesto detectado: ${gesture.toUpperCase()}`;
        } else {
            document.getElementById('status').innerText = `Buscando mano...`;
        }
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.particles.update(performance.now());
        this.renderer.render(this.scene, this.camera);
    }
}

// Instantiate and start
new App();
