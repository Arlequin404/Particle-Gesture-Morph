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
        const btnToggleCamera = document.getElementById('btn-toggle-camera');
        const videoCont = document.getElementById('video-container');
        btnToggleCamera.addEventListener('click', () => {
            const isHidden = videoCont.classList.contains('hidden-preview');
            videoCont.classList.toggle('hidden-preview');
            btnToggleCamera.innerText = isHidden ? 'Ocultar Cámara' : 'Ver Cámara';
        });

        // UI Music Toggle & Volume Control
        const btnToggleMusic = document.getElementById('btn-toggle-music');
        const volumeSlider = document.getElementById('volume-slider');
        const audio = document.getElementById('bg-music');
        let audioContext, source, analyser;

        // Initialize volume from slider
        audio.volume = volumeSlider.value;
        console.log("Audio Initialized. Volume:", audio.volume);

        volumeSlider.addEventListener('input', (e) => {
            audio.volume = e.target.value;
        });

        // Error handling for audio file
        audio.addEventListener('error', (e) => {
            console.error("Audio Load Error:", e);
            btnToggleMusic.innerHTML = '<span class="music-icon">❌</span> Error Audio';
        });

        // --- Robust Autostart logic ---
        const startAudio = async () => {
            if (!audioContext) {
                console.log("Initializing Audio Engine...");
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                source = audioContext.createMediaElementSource(audio);
                analyser = audioContext.createAnalyser();
                source.connect(analyser);
                analyser.connect(audioContext.destination);
                this.particles.setAudioAnalyser(analyser);
            }

            if (audio.paused) {
                audio.volume = volumeSlider.value; // Ensure volume from slider
                try {
                    await audioContext.resume();
                    await audio.play();
                    console.log("✅ Audio started successfully.");
                    btnToggleMusic.classList.add('active-music', 'playing');
                    btnToggleMusic.innerHTML = '<span class="music-icon">🎵</span> Saturno: ON';

                    // Cleanup interactions
                    document.removeEventListener('click', startAudio);
                    document.removeEventListener('touchstart', startAudio);
                } catch (err) {
                    console.warn("🚫 Autoplay blocked. Waiting for first interaction...");
                    btnToggleMusic.innerHTML = '<span class="music-icon">🎵</span> Toca para sonar';
                }
            }
        };

        // Try to play immediately (will fail in most browsers but worth it)
        startAudio();

        // Universal interaction hooks (First click/tap anywhere starts it)
        document.addEventListener('click', startAudio, { once: true });
        document.addEventListener('touchstart', startAudio, { once: true });

        btnToggleMusic.addEventListener('click', async (e) => {
            e.stopPropagation(); // Avoid double trigger

            if (!audioContext) await startAudio();

            if (audio.paused) {
                await audioContext.resume();
                audio.play()
                    .then(() => {
                        btnToggleMusic.classList.add('active-music', 'playing');
                        btnToggleMusic.innerHTML = '<span class="music-icon">🎵</span> Saturno: ON';
                    });
            } else {
                audio.pause();
                btnToggleMusic.classList.remove('active-music', 'playing');
                btnToggleMusic.innerHTML = '<span class="music-icon">🎵</span> Saturno: OFF';
            }
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
