import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Sun } from './objects/Sun.js';
import { Planet } from './objects/Planet.js';
import { AsteroidBelt } from './objects/AsteroidBelt.js';
import { TextureLoader } from './utils/TextureLoader.js';
import { GUIControls } from './utils/GUIControls.js';
import { InfoPanel } from './utils/InfoPanel.js';
import { PLANET_DATA, TEXTURE_PATHS, SETTINGS, getPlanetsArray } from './utils/constants.js';

class SolarSystem {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.sun = null;
        this.planets = [];
        this.asteroidBelt = null;
        this.clock = new THREE.Clock();
        this.speedMultiplier = SETTINGS.defaultSpeedMultiplier;
        this.textureLoader = new TextureLoader();
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.guiControls = null;
        this.infoPanel = null;
        
        // Performance monitoring
        this.lastTime = 0;
        this.frameCount = 0;
        this.fps = 0;
        
        this.init();
        this.setupEventListeners();
        this.createStars();
        this.loadSolarSystem();
    }

    async init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x000011, 200, 3000);

        // Camera setup with better mobile positioning
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            3000
        );
        this.camera.position.set(0, 30, 50);

        // Renderer setup with enhanced settings
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: window.devicePixelRatio < 2, // Disable antialiasing on high DPI displays for performance
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.8;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        
        document.getElementById('app').appendChild(this.renderer.domElement);

        // Controls setup with mobile-friendly settings
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = SETTINGS.cameraMinDistance;
        this.controls.maxDistance = SETTINGS.cameraMaxDistance;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.3;
        this.controls.maxPolarAngle = Math.PI;
        
        // Mobile optimizations
        if (this.isMobile()) {
            this.controls.enableZoom = true;
            this.controls.zoomSpeed = 0.5;
            this.controls.panSpeed = 0.5;
            this.controls.rotateSpeed = 0.3;
        }
    }

    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Keyboard controls
        window.addEventListener('keydown', (event) => this.onKeyDown(event));
        
        // Mouse interactions for planet selection
        window.addEventListener('click', (event) => this.onMouseClick(event));
        window.addEventListener('mousemove', (event) => this.onMouseMove(event));
        
        // Mobile touch events
        if (this.isMobile()) {
            window.addEventListener('touchstart', (event) => this.onTouchStart(event));
            window.addEventListener('touchend', (event) => this.onTouchEnd(event));
        }
        
        // Visibility change for performance
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.speedMultiplier = 0; // Pause when tab is hidden
            } else {
                this.speedMultiplier = 1; // Resume when tab is visible
            }
        });
    }

    createStars() {
        // Enhanced starfield with multiple layers and better mobile performance
        const starLayers = this.isMobile() ? 
            [
                { count: 4000, size: 0.5, color: 0xffffff, distance: 1500 },
                { count: 2000, size: 0.8, color: 0xffffcc, distance: 1000 }
            ] :
            [
                { count: 8000, size: 0.5, color: 0xffffff, distance: 1500 },
                { count: 4000, size: 0.8, color: 0xffffcc, distance: 1000 },
                { count: 2000, size: 1.2, color: 0xccccff, distance: 800 }
            ];

        starLayers.forEach(layer => {
            const starsGeometry = new THREE.BufferGeometry();
            const starsMaterial = new THREE.PointsMaterial({
                color: layer.color,
                size: layer.size,
                transparent: true,
                opacity: 0.8,
                sizeAttenuation: false
            });

            const starsVertices = [];
            for (let i = 0; i < layer.count; i++) {
                const x = (Math.random() - 0.5) * layer.distance * 2;
                const y = (Math.random() - 0.5) * layer.distance * 2;
                const z = (Math.random() - 0.5) * layer.distance * 2;
                starsVertices.push(x, y, z);
            }

            starsGeometry.setAttribute(
                'position',
                new THREE.Float32BufferAttribute(starsVertices, 3)
            );

            const stars = new THREE.Points(starsGeometry, starsMaterial);
            this.scene.add(stars);
        });
    }

    async loadSolarSystem() {
        try {
            // Show enhanced loading screen
            this.showLoadingProgress('Initializing solar system...', 0);
            
            // Preload textures (optional - will fallback to colors if missing)
            const texturePaths = Object.values(TEXTURE_PATHS);
            this.showLoadingProgress('Loading textures...', 10);
            
            this.textureLoader.preloadTextures(texturePaths).catch(() => {
                console.log('📝 Some textures could not be loaded, using fallback colors');
            });

            // Create sun
            this.showLoadingProgress('Creating the Sun...', 30);
            await this.createSun();
            
            // Create all planets
            this.showLoadingProgress('Creating planets...', 50);
            await this.createPlanets();
            
            // Create asteroid belt
            this.showLoadingProgress('Creating asteroid belt...', 80);
            await this.createAsteroidBelt();
            
            // Initialize GUI controls
            this.showLoadingProgress('Setting up controls...', 90);
            this.initializeGUI();
            
            // Initialize info panel
            this.infoPanel = new InfoPanel();
            
            // Hide loading screen
            this.showLoadingProgress('Ready!', 100);
            setTimeout(() => {
                this.hideLoadingScreen();
            }, 500);
            
            // Start animation
            this.animate();
            
            // Store global reference for info panel
            window.solarSystemInstance = this;
            
        } catch (error) {
            console.error('Error loading solar system:', error);
            this.hideLoadingScreen();
        }
    }

    showLoadingProgress(message, percentage) {
        const loadingScreen = document.getElementById('loading-screen');
        const loadingText = loadingScreen?.querySelector('.loading-text');
        const progressBar = loadingScreen?.querySelector('.progress-fill');
        
        if (loadingText) loadingText.textContent = message;
        if (progressBar) progressBar.style.width = `${percentage}%`;
    }

    async createSun() {
        this.sun = new Sun(this.textureLoader);
        this.scene.add(this.sun.getMesh());
    }

    async createPlanets() {
        const planetsData = getPlanetsArray();
        
        // Create planets with staggered loading for smooth experience
        for (const planetData of planetsData) {
            const planet = new Planet(planetData, this.textureLoader);
            this.planets.push(planet);
            this.scene.add(planet.getMesh());
            this.scene.add(planet.getOrbitPath());
            
            // Small delay to prevent blocking
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        console.log(`✅ Created ${this.planets.length} planets`);
        this.updateInfoPanel();
    }

    async createAsteroidBelt() {
        // Create asteroid belt between Mars and Jupiter
        const marsOrbit = PLANET_DATA.mars.orbitRadius;
        const jupiterOrbit = PLANET_DATA.jupiter.orbitRadius;
        
        const asteroidCount = this.isMobile() ? 1500 : 3000; // Reduce on mobile
        
        this.asteroidBelt = new AsteroidBelt(
            marsOrbit + 2,     // Inner radius (just outside Mars)
            jupiterOrbit - 2,  // Outer radius (just inside Jupiter) 
            asteroidCount
        );
        
        this.scene.add(this.asteroidBelt.getMesh());
    }

    initializeGUI() {
        this.guiControls = new GUIControls(this);
        
        // Hide GUI on mobile by default
        if (this.isMobile()) {
            this.guiControls.gui.close();
        }
    }

    updateInfoPanel() {
        const infoPanel = document.getElementById('info-panel');
        if (infoPanel) {
            const asteroidStats = this.asteroidBelt ? this.asteroidBelt.getStats() : null;
            
            infoPanel.innerHTML = `
                <h2>🌌 3D Solar System - Milestone 3</h2>
                <p>🎮 Mouse: Drag to rotate, Scroll to zoom</p>
                <p>🌟 All ${this.planets.length} planets with realistic motion!</p>
                <p>🪐 Saturn and Uranus have rings!</p>
                <p>☄️ ${asteroidStats ? asteroidStats.totalAsteroids : 0} asteroids in the belt!</p>
                <p>⌨️ Space: Pause, ↑↓: Speed, R: Reset, C: Focus</p>
                <p>🖱️ Click planets to see detailed information</p>
                <p>🎛️ Use the control panel to customize everything!</p>
            `;
        }
    }

    onMouseClick(event) {
        // Update mouse coordinates
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Raycast to detect planet clicks
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        const allMeshes = [];
        this.planets.forEach(planet => {
            planet.getMesh().traverse(child => {
                if (child.isMesh && child.userData.type === 'planet') {
                    allMeshes.push(child);
                }
            });
        });

        const intersects = this.raycaster.intersectObjects(allMeshes);
        
        if (intersects.length > 0) {
            const clickedPlanet = this.planets.find(planet => 
                planet.getMesh().children.includes(intersects[0].object)
            );
            
            if (clickedPlanet) {
                this.focusOnPlanet(clickedPlanet);
                this.infoPanel.showPlanet(clickedPlanet);
                console.log(`🎯 Focused on ${clickedPlanet.name}`);
            }
        }
    }

    onMouseMove(event) {
        // Update mouse coordinates for potential hover effects
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    onTouchStart(event) {
        if (event.touches.length === 1) {
            this.touchStartTime = Date.now();
            this.touchStartPos = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
        }
    }

    onTouchEnd(event) {
        if (this.touchStartTime && Date.now() - this.touchStartTime < 300) {
            // Quick tap - simulate click
            const touchEndPos = {
                x: event.changedTouches[0].clientX,
                y: event.changedTouches[0].clientY
            };
            
            const distance = Math.sqrt(
                Math.pow(touchEndPos.x - this.touchStartPos.x, 2) +
                Math.pow(touchEndPos.y - this.touchStartPos.y, 2)
            );
            
            if (distance < 10) { // Small movement tolerance
                this.onMouseClick({
                    clientX: touchEndPos.x,
                    clientY: touchEndPos.y
                });
            }
        }
        
        this.touchStartTime = null;
        this.touchStartPos = null;
    }

    focusOnPlanet(planet) {
        // Disable auto-rotation temporarily
        this.controls.autoRotate = false;
        
        // Focus camera on planet
        planet.focusCamera(this.camera, this.controls);
        
        // Update GUI if available
        if (this.guiControls) {
            this.guiControls.settings.focusedPlanet = planet.name;
            this.guiControls.updateGUI();
        }
        
        // Re-enable auto-rotation after a delay
        setTimeout(() => {
            this.controls.autoRotate = true;
            this.controls.autoRotateSpeed = 0.1;
        }, 5000);
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }, 1000);
    }

    onKeyDown(event) {
        switch(event.code) {
            case 'Space':
                this.speedMultiplier = this.speedMultiplier === 0 ? 1 : 0;
                event.preventDefault();
                break;
            case 'ArrowUp':
                this.speedMultiplier = Math.min(this.speedMultiplier + 0.5, SETTINGS.maxSpeedMultiplier);
                console.log(`Speed: ${this.speedMultiplier}x`);
                break;
            case 'ArrowDown':
                this.speedMultiplier = Math.max(this.speedMultiplier - 0.5, SETTINGS.minSpeedMultiplier);
                console.log(`Speed: ${this.speedMultiplier}x`);
                break;
            case 'KeyR':
                this.controls.reset();
                this.controls.autoRotate = true;
                this.controls.autoRotateSpeed = 0.3;
                if (this.infoPanel) this.infoPanel.hide();
                break;
            case 'KeyC':
                // Focus on random planet
                const randomPlanet = this.planets[Math.floor(Math.random() * this.planets.length)];
                this.focusOnPlanet(randomPlanet);
                break;
            case 'KeyH':
                // Toggle info panel
                const infoPanel = document.getElementById('info-panel');
                infoPanel.style.display = infoPanel.style.display === 'none' ? 'block' : 'none';
                break;
            case 'KeyI':
                // Toggle planet info panel
                if (this.infoPanel) {
                    this.infoPanel.toggle();
                }
                break;
            case 'KeyA':
                // Trigger asteroid shower
                if (this.asteroidBelt) {
                    this.asteroidBelt.createAsteroidShower(30);
                }
                break;
        }
    }

    calculateFPS() {
        this.frameCount++;
        const currentTime = performance.now();
        
        if (currentTime >= this.lastTime + 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
            this.frameCount = 0;
            this.lastTime = currentTime;
            
            // Update FPS display if enabled
            const fpsDisplay = document.getElementById('fps-display');
            if (fpsDisplay) {
                fpsDisplay.textContent = `FPS: ${this.fps}`;
            }
        }
    }

    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (window.innerWidth <= 768);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Update mobile status
        if (this.isMobile() && this.guiControls) {
            this.guiControls.gui.close();
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const deltaTime = this.clock.getDelta();

        // Calculate FPS
        this.calculateFPS();

        // Update sun
        if (this.sun) {
            this.sun.update(deltaTime);
        }

        // Update planets
        this.planets.forEach(planet => {
            planet.update(deltaTime, this.speedMultiplier);
        });

        // Update asteroid belt
        if (this.asteroidBelt) {
            this.asteroidBelt.update(deltaTime, this.speedMultiplier);
            
            // Optimize asteroid rendering based on camera distance
            this.asteroidBelt.updateLOD(this.camera.position);
        }

        // Update controls
        this.controls.update();

        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }

    // Cleanup method
    dispose() {
        if (this.sun) {
            this.sun.dispose();
        }
        this.planets.forEach(planet => {
            planet.dispose();
        });
        if (this.asteroidBelt) {
            this.asteroidBelt.dispose();
        }
        if (this.guiControls) {
            this.guiControls.dispose();
        }
        if (this.infoPanel) {
            this.infoPanel.dispose();
        }
        this.textureLoader.dispose();
        this.renderer.dispose();
    }
}

// Initialize the solar system when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SolarSystem();
});

// Enhanced console messages for Milestone 3
console.log('🌌 3D Solar System - Milestone 3 Complete!');
console.log('🎮 Controls:');
console.log('   Mouse: Drag to rotate, Scroll to zoom, Click planets for info');
console.log('   Space: Pause/Resume animation');
console.log('   ↑/↓: Speed up/slow down (0-10x)');
console.log('   R: Reset camera view');
console.log('   C: Focus on random planet');
console.log('   H: Toggle info panel');
console.log('   I: Toggle planet details panel');
console.log('   A: Trigger asteroid shower');
console.log('   Ctrl/Cmd + G: Toggle GUI controls');
console.log('🚀 New Features:');
console.log('   • Complete dat.GUI control panel');
console.log('   • Detailed planet information panels');
console.log('   • 3000+ asteroid belt between Mars and Jupiter');
console.log('   • Enhanced mobile support');
console.log('   • Performance optimizations');
console.log('   • Asteroid shower effects');
console.log('   • Real-time FPS monitoring');
console.log('🌟 Ultimate solar system experience ready!'); 