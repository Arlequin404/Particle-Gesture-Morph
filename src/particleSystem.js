import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particleCount = 12000;
        this.particles = null;
        this.geometry = new THREE.BufferGeometry();
        this.currentPositions = new Float32Array(this.particleCount * 3);
        this.targetPositions = new Float32Array(this.particleCount * 3);

        this.init();
    }

    init() {
        const sprite = new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/disc.png');

        // Material setup for modern look
        const material = new THREE.PointsMaterial({
            size: 0.05,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            map: sprite,
            color: new THREE.Color(0x00f2ff)
        });

        // Initial distribution: Sphere
        this.setInitialState();
        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.currentPositions, 3));

        this.particles = new THREE.Points(this.geometry, material);
        this.scene.add(this.particles);

        // Audio Reactive properties
        this.analyser = null;
        this.dataArray = null;
    }

    setAudioAnalyser(analyser) {
        this.analyser = analyser;
        this.dataArray = new Uint8Array(analyser.frequencyBinCount);
    }

    setInitialState() {
        // Start as an amorphous nebula
        for (let i = 0; i < this.particleCount; i++) {
            const r = Math.random() * 5 + 5;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;

            this.currentPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            this.currentPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            this.currentPositions[i * 3 + 2] = r * Math.cos(phi);
        }
    }

    // Helper to generate shape points
    morphTo(shapeType) {
        const targets = new Float32Array(this.particleCount * 3);

        switch (shapeType) {
            case 'sphere': this.generateSaturn(targets); break;
            case 'heart': this.generateHeart(targets); break;
            case 'star': this.generateStar(targets); break;
            case 'love': this.generateLove(targets); break;
            default: this.generateOrbit(targets); break;
        }

        // Tween positions
        new TWEEN.Tween(this.currentPositions)
            .to(targets, 1500)
            .easing(TWEEN.Easing.Cubic.InOut)
            .onUpdate(() => {
                this.geometry.attributes.position.needsUpdate = true;
            })
            .start();
    }

    generateSaturn(targets) {
        const planetRadius = 2.4;
        const ringInner = 3.2;
        const ringOuter = 5.0;
        const planetCount = Math.floor(this.particleCount * 0.65); // 65% for planet

        for (let i = 0; i < this.particleCount; i++) {
            if (i < planetCount) {
                // Sphere (Planet)
                const u = Math.random();
                const v = Math.random();
                const theta = 2 * Math.PI * u;
                const phi = Math.acos(2 * v - 1);

                targets[i * 3] = planetRadius * Math.sin(phi) * Math.cos(theta);
                targets[i * 3 + 1] = planetRadius * Math.sin(phi) * Math.sin(theta);
                targets[i * 3 + 2] = planetRadius * Math.cos(phi);
            } else {
                // Rings (Flat disk)
                const angle = Math.random() * Math.PI * 2;
                const radius = ringInner + Math.random() * (ringOuter - ringInner);

                // Slightly tilt the ring
                const tilt = 0.4;
                const x = radius * Math.cos(angle);
                const z = radius * Math.sin(angle);

                targets[i * 3] = x;
                targets[i * 3 + 1] = x * tilt + (Math.random() - 0.5) * 0.1; // Add thickness
                targets[i * 3 + 2] = z;
            }
        }
    }

    generateHeart(targets) {
        const scale = 0.2;
        for (let i = 0; i < this.particleCount; i++) {
            const t = Math.random() * Math.PI * 2;
            const x = 16 * Math.pow(Math.sin(t), 3);
            const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);

            // Add some jitter/depth for a cloud effect
            const jitter = (Math.random() - 0.5) * 2;
            targets[i * 3] = (x + jitter) * scale;
            targets[i * 3 + 1] = (y + jitter) * scale + 1;
            targets[i * 3 + 2] = (Math.random() - 0.5) * 2;
        }
    }

    generateStar(targets) {
        const r = 3;
        for (let i = 0; i < this.particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const arms = 5;
            const factor = (Math.cos(arms * angle) + 1.2) / 2.2;
            const currentR = r * factor;

            targets[i * 3] = currentR * Math.cos(angle);
            targets[i * 3 + 1] = currentR * Math.sin(angle);
            targets[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
        }
    }

    generateLove(targets) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1000;
        canvas.height = 200;

        ctx.fillStyle = 'white';
        // Bold sans-serif for better particle density
        ctx.font = 'bold 120px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('I LOVE YOU', 500, 100);

        const imageData = ctx.getImageData(0, 0, 1000, 200).data;
        const points = [];

        // High density sampling
        for (let y = 0; y < 200; y += 2) {
            for (let x = 0; x < 1000; x += 2) {
                const alpha = imageData[(y * 1000 + x) * 4 + 3];
                if (alpha > 180) { // Sharper threshold
                    points.push({
                        x: (x - 500) * 0.03,
                        y: (100 - y) * 0.03
                    });
                }
            }
        }

        // If no points (fallback), create a simple grid
        if (points.length === 0) {
            for (let i = 0; i < 1000; i++) points.push({ x: (Math.random() - 0.5) * 10, y: (Math.random() - 0.5) * 2 });
        }

        for (let i = 0; i < this.particleCount; i++) {
            const pt = points[i % points.length];
            // Jitter points slightly to fill gaps
            const jitterX = (Math.random() - 0.5) * 0.05;
            const jitterY = (Math.random() - 0.5) * 0.05;

            targets[i * 3] = (pt.x + jitterX);
            targets[i * 3 + 1] = (pt.y + jitterY);
            targets[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
        }
    }

    generateOrbit(targets) {
        // Amorphous cloud rotating
        for (let i = 0; i < this.particleCount; i++) {
            const dist = 4 + Math.random() * 2;
            const angle = Math.random() * Math.PI * 2;
            targets[i * 3] = dist * Math.cos(angle);
            targets[i * 3 + 1] = (Math.random() - 0.5) * 6;
            targets[i * 3 + 2] = dist * Math.sin(angle);
        }
    }

    update(time) {
        // Subtle constant rotation
        this.particles.rotation.y += 0.001;

        // Music reaction
        if (this.analyser) {
            this.analyser.getByteFrequencyData(this.dataArray);
            let avg = 0;
            for (let i = 0; i < this.dataArray.length; i++) avg += this.dataArray[i];
            avg /= this.dataArray.length;

            const scale = 1 + (avg / 255) * 0.4;
            this.particles.scale.set(scale, scale, scale);
            this.particles.material.size = 0.05 + (avg / 255) * 0.08;
        }

        TWEEN.update(time);
    }

    rotateTo(handData) {
        // Smoothly rotate points toward hand position
        const targetX = handData.y * 0.5; // Hand Y controls Rotation X
        const targetY = handData.x * 0.5; // Hand X controls Rotation Y

        // Simple lerp for smoothness
        this.particles.rotation.x += (targetX - this.particles.rotation.x) * 0.1;
        this.particles.rotation.y += (targetY - this.particles.rotation.y) * 0.1;

        // Optional Pitch/Roll from hand orientation
        if (handData.pitch) {
            this.particles.rotation.z += (handData.pitch * -0.2 - this.particles.rotation.z) * 0.05;
        }
    }
}
