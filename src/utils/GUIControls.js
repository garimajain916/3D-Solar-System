import * as dat from 'dat.gui';

export class GUIControls {
    constructor(solarSystem) {
        this.solarSystem = solarSystem;
        this.gui = new dat.GUI({ width: 300 });
        this.settings = {
            // Animation controls
            animationSpeed: 1,
            rotationSpeed: 1,
            autoRotateCamera: true,
            cameraSpeed: 0.3,
            
            // Visual controls
            showOrbitPaths: true,
            showPlanetNames: false,
            showAtmosphere: true,
            starfieldIntensity: 1,
            
            // Planet controls
            planetScale: 1,
            orbitScale: 1,
            showRings: true,
            
            // Lighting controls
            sunIntensity: 3,
            ambientIntensity: 0.2,
            shadowEnabled: true,
            
            // Effects
            coronaIntensity: 1,
            glowEffect: true,
            particleCount: 2000,
            
            // Focus controls
            focusedPlanet: 'None',
            cameraDistance: 'Auto',
            
            // Information
            showFPS: false,
            showControls: true,
            
            // Functions
            resetView: () => this.resetView(),
            randomPlanet: () => this.focusRandomPlanet(),
            toggleFullscreen: () => this.toggleFullscreen(),
            exportScreenshot: () => this.exportScreenshot()
        };
        
        this.initGUI();
        this.setupEventListeners();
    }

    initGUI() {
        // Animation folder
        const animationFolder = this.gui.addFolder('🎬 Animation');
        animationFolder.add(this.settings, 'animationSpeed', 0, 5)
            .name('Speed Multiplier')
            .onChange(value => {
                this.solarSystem.speedMultiplier = value;
            });
        
        animationFolder.add(this.settings, 'rotationSpeed', 0, 3)
            .name('Rotation Speed')
            .onChange(value => {
                this.solarSystem.planets.forEach(planet => {
                    planet.rotationSpeedMultiplier = value;
                });
            });
            
        animationFolder.add(this.settings, 'autoRotateCamera')
            .name('Auto Rotate Camera')
            .onChange(value => {
                this.solarSystem.controls.autoRotate = value;
            });
            
        animationFolder.add(this.settings, 'cameraSpeed', 0.1, 2)
            .name('Camera Speed')
            .onChange(value => {
                this.solarSystem.controls.autoRotateSpeed = value;
            });
        
        animationFolder.open();

        // Visual controls folder
        const visualFolder = this.gui.addFolder('🎨 Visual');
        visualFolder.add(this.settings, 'showOrbitPaths')
            .name('Show Orbit Paths')
            .onChange(value => this.toggleOrbitPaths(value));
            
        visualFolder.add(this.settings, 'showPlanetNames')
            .name('Show Planet Names')
            .onChange(value => this.togglePlanetNames(value));
            
        visualFolder.add(this.settings, 'showAtmosphere')
            .name('Show Atmosphere')
            .onChange(value => this.toggleAtmosphere(value));
            
        visualFolder.add(this.settings, 'starfieldIntensity', 0, 2)
            .name('Starfield Intensity')
            .onChange(value => this.adjustStarfield(value));
            
        visualFolder.open();

        // Planet controls folder
        const planetFolder = this.gui.addFolder('🪐 Planets');
        planetFolder.add(this.settings, 'planetScale', 0.1, 3)
            .name('Planet Scale')
            .onChange(value => this.scalePlanets(value));
            
        planetFolder.add(this.settings, 'orbitScale', 0.5, 2)
            .name('Orbit Scale')
            .onChange(value => this.scaleOrbits(value));
            
        planetFolder.add(this.settings, 'showRings')
            .name('Show Rings')
            .onChange(value => this.toggleRings(value));

        // Planet selector
        const planetNames = ['None', ...this.solarSystem.planets.map(p => p.name)];
        planetFolder.add(this.settings, 'focusedPlanet', planetNames)
            .name('Focus On')
            .onChange(value => this.focusPlanet(value));
            
        planetFolder.open();

        // Lighting folder
        const lightingFolder = this.gui.addFolder('💡 Lighting');
        lightingFolder.add(this.settings, 'sunIntensity', 0.5, 10)
            .name('Sun Intensity')
            .onChange(value => this.adjustSunIntensity(value));
            
        lightingFolder.add(this.settings, 'ambientIntensity', 0, 1)
            .name('Ambient Light')
            .onChange(value => this.adjustAmbientIntensity(value));
            
        lightingFolder.add(this.settings, 'shadowEnabled')
            .name('Enable Shadows')
            .onChange(value => this.toggleShadows(value));

        // Effects folder
        const effectsFolder = this.gui.addFolder('✨ Effects');
        effectsFolder.add(this.settings, 'coronaIntensity', 0, 2)
            .name('Corona Intensity')
            .onChange(value => this.adjustCorona(value));
            
        effectsFolder.add(this.settings, 'glowEffect')
            .name('Glow Effects')
            .onChange(value => this.toggleGlow(value));
            
        effectsFolder.add(this.settings, 'particleCount', 500, 5000)
            .name('Particle Count')
            .onChange(value => this.adjustParticles(value));

        // Information folder
        const infoFolder = this.gui.addFolder('ℹ️ Info');
        infoFolder.add(this.settings, 'showFPS')
            .name('Show FPS')
            .onChange(value => this.toggleFPS(value));
            
        infoFolder.add(this.settings, 'showControls')
            .name('Show Controls')
            .onChange(value => this.toggleControlsPanel(value));

        // Action buttons folder
        const actionsFolder = this.gui.addFolder('🎮 Actions');
        actionsFolder.add(this.settings, 'resetView').name('🔄 Reset View');
        actionsFolder.add(this.settings, 'randomPlanet').name('🎲 Random Planet');
        actionsFolder.add(this.settings, 'toggleFullscreen').name('🖥️ Fullscreen');
        actionsFolder.add(this.settings, 'exportScreenshot').name('📸 Screenshot');
        
        actionsFolder.open();
    }

    // Event handlers for GUI controls
    toggleOrbitPaths(show) {
        this.solarSystem.planets.forEach(planet => {
            const orbitPath = planet.getOrbitPath();
            if (orbitPath) {
                orbitPath.visible = show;
            }
        });
    }

    togglePlanetNames(show) {
        // This would require implementing text labels
        console.log(`Planet names ${show ? 'enabled' : 'disabled'}`);
    }

    toggleAtmosphere(show) {
        this.solarSystem.planets.forEach(planet => {
            if (planet.atmosphere) {
                planet.atmosphere.visible = show;
            }
        });
    }

    adjustStarfield(intensity) {
        this.solarSystem.scene.traverse(child => {
            if (child.isPoints) { // Starfield
                child.material.opacity = intensity * 0.8;
            }
        });
    }

    scalePlanets(scale) {
        this.solarSystem.planets.forEach(planet => {
            planet.getMesh().scale.setScalar(scale);
        });
    }

    scaleOrbits(scale) {
        this.solarSystem.planets.forEach(planet => {
            planet.orbitScale = scale;
        });
    }

    toggleRings(show) {
        this.solarSystem.planets.forEach(planet => {
            if (planet.rings) {
                planet.rings.visible = show;
            }
        });
    }

    focusPlanet(planetName) {
        if (planetName === 'None') {
            this.resetView();
            return;
        }
        
        const planet = this.solarSystem.planets.find(p => p.name === planetName);
        if (planet) {
            this.solarSystem.focusOnPlanet(planet);
        }
    }

    adjustSunIntensity(intensity) {
        if (this.solarSystem.sun && this.solarSystem.sun.light) {
            this.solarSystem.sun.light.intensity = intensity;
        }
    }

    adjustAmbientIntensity(intensity) {
        if (this.solarSystem.sun && this.solarSystem.sun.ambientLight) {
            this.solarSystem.sun.ambientLight.intensity = intensity;
        }
    }

    toggleShadows(enabled) {
        this.solarSystem.renderer.shadowMap.enabled = enabled;
    }

    adjustCorona(intensity) {
        if (this.solarSystem.sun && this.solarSystem.sun.corona) {
            this.solarSystem.sun.corona.material.opacity = intensity * 0.6;
        }
    }

    toggleGlow(enabled) {
        if (this.solarSystem.sun) {
            this.solarSystem.sun.glowMeshes?.forEach(glow => {
                glow.visible = enabled;
            });
        }
    }

    adjustParticles(count) {
        // This would require recreating particle systems
        console.log(`Particle count set to ${count}`);
    }

    toggleFPS(show) {
        // This would require implementing an FPS counter
        console.log(`FPS display ${show ? 'enabled' : 'disabled'}`);
    }

    toggleControlsPanel(show) {
        const controlsPanel = document.getElementById('info-panel');
        if (controlsPanel) {
            controlsPanel.style.display = show ? 'block' : 'none';
        }
    }

    // Action methods
    resetView() {
        this.solarSystem.controls.reset();
        this.solarSystem.controls.autoRotate = true;
        this.solarSystem.controls.autoRotateSpeed = 0.3;
        this.settings.focusedPlanet = 'None';
        this.updateGUI();
    }

    focusRandomPlanet() {
        const randomPlanet = this.solarSystem.planets[
            Math.floor(Math.random() * this.solarSystem.planets.length)
        ];
        this.solarSystem.focusOnPlanet(randomPlanet);
        this.settings.focusedPlanet = randomPlanet.name;
        this.updateGUI();
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    exportScreenshot() {
        const canvas = this.solarSystem.renderer.domElement;
        const link = document.createElement('a');
        link.download = `solar-system-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
    }

    setupEventListeners() {
        // Listen for keyboard shortcuts
        window.addEventListener('keydown', (event) => {
            if (event.ctrlKey || event.metaKey) {
                switch(event.code) {
                    case 'KeyG':
                        this.gui.closed ? this.gui.open() : this.gui.close();
                        event.preventDefault();
                        break;
                }
            }
        });
    }

    updateGUI() {
        // Refresh GUI to reflect current state
        for (let i in this.gui.__controllers) {
            this.gui.__controllers[i].updateDisplay();
        }
    }

    // Dispose method
    dispose() {
        this.gui.destroy();
    }
} 