import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

export class GestureHandler {
    constructor(onGestureChange, onHandUpdate) {
        this.hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        this.hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        this.onGestureChange = onGestureChange;
        this.onHandUpdate = onHandUpdate;
        this.currentGesture = 'idle';
        this.init();
    }

    init() {
        const videoElement = document.getElementById('input-video');

        this.hands.onResults((results) => {
            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                const landmarks = results.multiHandLandmarks[0];

                // Track hand metrics
                const palmCenter = landmarks[9]; // Middle finger MCP
                const thumbMCP = landmarks[2];
                const pinkyMCP = landmarks[17];

                // Rotation estimate (Yaw/Pitch-ish)
                const pitch = Math.atan2(landmarks[0].y - landmarks[9].y, landmarks[0].x - landmarks[9].x);

                if (this.onHandUpdate) {
                    this.onHandUpdate({
                        x: (palmCenter.x - 0.5) * 2, // Centered -1 to 1
                        y: (palmCenter.y - 0.5) * -2, // Inverted Y
                        pitch: pitch
                    });
                }

                const gesture = this.recognizeGesture(landmarks);
                if (gesture !== this.currentGesture) {
                    this.currentGesture = gesture;
                    this.onGestureChange(gesture);
                }
            } else {
                if (this.currentGesture !== 'idle') {
                    this.currentGesture = 'idle';
                    this.onGestureChange('idle');
                }
            }
        });

        const camera = new Camera(videoElement, {
            onFrame: async () => {
                await this.hands.send({ image: videoElement });
            },
            width: 640,
            height: 480
        });
        camera.start();
    }

    recognizeGesture(landmarks) {
        // Logic to differentiate gestures based on landmark distances
        const dist = (p1, p2) => Math.sqrt(
            Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
        );

        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        const ringTip = landmarks[16];
        const pinkyTip = landmarks[20];
        const palmBase = landmarks[0];

        // Finger States (Extended vs Folded)
        const isIndexUp = indexTip.y < landmarks[6].y;
        const isMiddleUp = middleTip.y < landmarks[10].y;
        const isRingUp = ringTip.y < landmarks[14].y;
        const isPinkyUp = pinkyTip.y < landmarks[18].y;

        // 1. OK Gesture (Thumb + Index tip meeting)
        const thumbIndexDist = dist(thumbTip, indexTip);
        if (thumbIndexDist < 0.05 && isMiddleUp && isRingUp && isPinkyUp) {
            return 'love'; // OK => LOVE
        }

        // 2. Fist (All fingers folded towards palm base)
        if (!isIndexUp && !isMiddleUp && !isRingUp && !isPinkyUp) {
            return 'heart'; // Fist => Heart
        }

        // 3. Two Fingers (V-Sign: index and middle up)
        if (isIndexUp && isMiddleUp && !isRingUp && !isPinkyUp) {
            return 'star'; // Two fingers => Star
        }

        // 4. Open Palm (All fingers up)
        if (isIndexUp && isMiddleUp && isRingUp && isPinkyUp) {
            return 'sphere'; // Palm => Sphere
        }

        return 'idle';
    }
}
