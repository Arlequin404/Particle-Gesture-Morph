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

        // UI Volume Control
        const volumeSlider = document.getElementById('volume-slider');
        const audio = document.getElementById('bg-music');
        const musicIcon = document.querySelector('.music-playing-icon');
        let audioContext, source, analyser;

        audio.volume = volumeSlider.value;

        volumeSlider.addEventListener('input', (e) => {
            audio.volume = e.target.value;
        });

        // Error handling for audio file
        audio.addEventListener('error', (e) => {
            console.error("Audio Load Error:", e);
        });

        // --- Robust Autostart logic ---
        const startAudio = async () => {
            console.log("Attempting to start audio...");
            try {
                if (!audioContext) {
                    const AudioCtx = window.AudioContext || window.webkitAudioContext;
                    if (!AudioCtx) {
                        console.error("AudioContext not supported in this browser.");
                        return;
                    }

                    audioContext = new AudioCtx();
                    source = audioContext.createMediaElementSource(audio);
                    analyser = audioContext.createAnalyser();
                    source.connect(analyser);
                    analyser.connect(audioContext.destination);
                    this.particles.setAudioAnalyser(analyser);
                    console.log("Audio Engine Initialized.");
                }

                if (audioContext.state === 'suspended') {
                    await audioContext.resume();
                    console.log("AudioContext resumed.");
                }

                if (audio.paused) {
                    await audio.play();
                    console.log("✅ Saturno is playing.");
                    if (musicIcon) musicIcon.classList.add('playing-anim');

                    // Only remove if playing successfully
                    document.removeEventListener('click', startAudio);
                    document.removeEventListener('touchstart', startAudio);
                }
            } catch (err) {
                console.error("Audio Initialization/Playback Error:", err);
            }
        };

        // Try to play immediately (fails in most browsers)
        startAudio();

        // Fast audio trigger
        const fastStart = () => {
            startAudio();
            document.removeEventListener('mousemove', fastStart);
            document.removeEventListener('scroll', fastStart);
        };

        document.addEventListener('mousemove', fastStart, { once: true });
        document.addEventListener('scroll', fastStart, { once: true });
        document.addEventListener('mousedown', startAudio, { once: true });
        document.addEventListener('touchstart', startAudio, { once: true });
        document.addEventListener('keydown', startAudio, { once: true });

        // Gesture Detection
        this.gestureHandler = new GestureHandler(
            (gesture) => this.handleGestureChange(gesture),
            (handData) => {
                if (this.particles) this.particles.rotateTo(handData);
            }
        );

        // Special check for Women's Day UI
        const today = new Date();
        if (today.getMonth() === 2 && today.getDate() === 8) {
            const loveLabel = document.getElementById('gesture-indicator-love');
            if (loveLabel) {
                loveLabel.innerHTML = '<span class="emoji">👌</span> I LOVE YOU';
            }
        }

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
