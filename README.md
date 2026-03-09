# ✨ Particle Gesture Morph 3D

Una demostración interactiva de partículas 3D controladas por gestos manuales en tiempo real. Utiliza **Three.js** para la renderización y **MediaPipe** para el seguimiento de manos.

## 🚀 Ejecución Rápida (Docker)

Sigue estos pasos para correr el proyecto localmente con un solo comando:

1. **Clonar/Descargar** los archivos del proyecto.
2. Abre una terminal en la carpeta raíz.
3. Ejecuta el siguiente comando:

```bash
docker compose up --build
```

4. Abre tu navegador en: [http://localhost:8080](http://localhost:8080)
5. **Permite el acceso a la cámara** cuando el navegador lo solicite.

---

## 🖐️ Gestos y Acciones

| Gesto | Atajo Visual | Transformación de Partículas |
| :--- | :---: | :--- |
| **Palma Abierta** | 🖐️ | Esfera / Planeta Gigante |
| **Puño Cerrado** | ✊ | Corazón Pulsante |
| **Dos Dedos (Signo V)** | ✌️ | Estrella Fugaz |
| **Gesto OK (Pulgar+Índice)** | 👌 | Transición "LOVE" |
| **Sin mano detectada** | - | Órbita Amórfica (Idle) |

---

## 🛠️ Stack Tecnológico

- **Three.js**: Motor 3D y sistema de partículas.
- **MediaPipe Hands**: Seguimiento de puntos de referencia de la mano mediante visión artificial.
- **Vite**: Bundler ultra rápido para desarrollo web moderno.
- **Tween.js**: Motor de animaciones suaves para las transiciones de partículas.
- **Docker**: Containerización completa para evitar problemas de dependencias locales.

---

## 🎨 Características Premium

- **Estética Viral**: Diseño minimalista con Glassmorphism y tipografía futurista.
- **Transiciones Suaves**: Los 12,000 puntos de luz fluyen suavemente entre formas.
- **Optimizado**: Renderizado fluido incluso en dispositivos de gama media.
- **Responsive**: Ajuste automático al tamaño de la pantalla.

---

### Notas de Desarrollador
- Asegúrate de tener buena iluminación para que MediaPipe detecte los gestos correctamente.
- Si el navegador bloquea la cámara por ser `localhost` sin HTTPS (según políticas de Chrome), abre la configuración del navegador y habilita "Insecure origins treated as secure" para `http://localhost:8080`.
