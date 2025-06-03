import * as THREE from 'three';
import { TEXTURE_PATHS } from '../utils/constants.js';
import { Moon } from './Moon.js';

export class Planet {
    constructor(options = {}, textureLoader = null) {
        this.radius = options.radius || 0.5;
        this.color = options.color || 0x888888;
        this.orbitRadius = options.orbitRadius || 10;
        this.orbitSpeed = options.orbitSpeed || 0.01;
        this.rotationSpeed = options.rotationSpeed || 0.02;
        this.name = options.name || 'Planet';
        this.texture = options.texture || null;
        this.hasRings = options.hasRings || false;
        this.ringInnerRadius = options.ringInnerRadius || this.radius * 1.5;
        this.ringOuterRadius = options.ringOuterRadius || this.radius * 2;
        this.description = options.description || '';
        
        // Moon properties
        this.hasMoon = options.hasMoon || false;
        this.moonOptions = options.moonOptions || null;
        this.moon = null;
        
        this.angle = options.startAngle || 0;
        this.group = new THREE.Group();
        this.textureLoader = textureLoader;
        this.isLoaded = false;
        
        // Create basic planet first
        this.createBasicPlanet();
        this.createOrbitPath();
        this.updatePosition();
        
        // Note: loadTextures() will be called explicitly from main.js
    }

    createBasicPlanet() {
        // Planet geometry
        const geometry = new THREE.SphereGeometry(this.radius, 32, 32);
        
        // Start with basic material that will be replaced by textured material
        const material = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.7,
            metalness: 0.0
            // No emissive - we'll add lighting instead
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        // Add planet name for identification
        this.mesh.userData = { 
            name: this.name,
            type: 'planet',
            description: this.description 
        };
        
        this.group.add(this.mesh);

        // Add subtle atmosphere glow for larger planets
        if (this.radius > 0.4) {
            this.createAtmosphere();
        }
    }

    /**
     * Load and apply textures to the planet
     */
    async loadTextures() {
        if (!this.textureLoader || !this.texture) {
            console.log(`No texture loader or texture specified for planet`);
            return;
        }

        try {
            console.log(`Loading texture for planet:`, this.texture);
            
            // Get the full texture path from TEXTURE_PATHS
            const texturePath = TEXTURE_PATHS[this.texture.replace('.jpg', '')];
            console.log(`Texture path:`, texturePath);
            
            // Use the new createMaterial method that guarantees texture visibility
            const newMaterial = await this.textureLoader.createMaterial(
                texturePath, 
                this.color
            );
            
            // Replace the material on the mesh
            if (this.mesh && this.mesh.material) {
                this.mesh.material.dispose();
                this.mesh.material = newMaterial;
                console.log(`✓ Texture applied successfully for planet`);
            }
            
            // Create rings if this planet has them
            if (this.rings) {
                this.createRings();
            }
            
            // Create moon if this planet has one
            if (this.hasMoon) {
                await this.createMoon();
            }
            
        } catch (error) {
            console.error(`Failed to load texture:`, error);
        }
    }

    addDebugMessage(message) {
        // Create or get debug container
        let debugContainer = document.getElementById('texture-debug');
        if (!debugContainer) {
            debugContainer = document.createElement('div');
            debugContainer.id = 'texture-debug';
            debugContainer.style.cssText = `
                position: fixed;
                top: 10px;
                left: 10px;
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 10px;
                border-radius: 5px;
                font-family: monospace;
                font-size: 12px;
                max-width: 400px;
                max-height: 300px;
                overflow-y: auto;
                z-index: 1000;
            `;
            document.body.appendChild(debugContainer);
        }
        
        // Add timestamped message
        const time = new Date().toLocaleTimeString();
        const messageDiv = document.createElement('div');
        messageDiv.textContent = `[${time}] ${message}`;
        debugContainer.appendChild(messageDiv);
        
        // Auto-scroll to bottom
        debugContainer.scrollTop = debugContainer.scrollHeight;
    }

    createAtmosphere() {
        const glowGeometry = new THREE.SphereGeometry(this.radius * 1.05, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: this.color,
            transparent: true,
            opacity: 0.15,
            side: THREE.BackSide
        });
        
        this.atmosphere = new THREE.Mesh(glowGeometry, glowMaterial);
        this.group.add(this.atmosphere);
    }

    async createRings() {
        if (!this.hasRings) return;

        const ringGeometry = new THREE.RingGeometry(
            this.ringInnerRadius, 
            this.ringOuterRadius, 
            64
        );

        let ringMaterial;
        if (this.textureLoader) {
            const ringTexturePath = this.name.toLowerCase() === 'saturn' 
                ? '/textures/saturn-rings.png' 
                : '/textures/uranus-rings.png';
                
            ringMaterial = await this.textureLoader.createRingMaterial(
                ringTexturePath,
                0xaaaaaa
            );
        } else {
            // Fallback ring material
            ringMaterial = new THREE.MeshLambertMaterial({
                color: 0xaaaaaa,
                transparent: true,
                opacity: 0.7,
                side: THREE.DoubleSide
            });
        }

        this.rings = new THREE.Mesh(ringGeometry, ringMaterial);
        this.rings.rotation.x = Math.PI / 2; // Lay rings flat
        
        // Slightly tilt Uranus rings
        if (this.name.toLowerCase() === 'uranus') {
            this.rings.rotation.z = Math.PI / 4;
        }

        this.rings.userData = { 
            name: `${this.name} Rings`,
            type: 'rings' 
        };

        this.group.add(this.rings);
    }

    createOrbitPath() {
        // Create visible orbit path visualization with planet-specific colors
        const orbitGeometry = new THREE.RingGeometry(
            this.orbitRadius - 0.05, 
            this.orbitRadius + 0.05, 
            128
        );
        
        // Color-code orbits based on planet
        let orbitColor = 0x666666; // Default gray
        switch(this.name.toLowerCase()) {
            case 'mercury': orbitColor = 0x8c7853; break;
            case 'venus': orbitColor = 0xffa500; break;
            case 'earth': orbitColor = 0x6b93d6; break;
            case 'mars': orbitColor = 0xcd5c5c; break;
            case 'jupiter': orbitColor = 0xd8ca9d; break;
            case 'saturn': orbitColor = 0xfad5a5; break;
            case 'uranus': orbitColor = 0x4fd0e7; break;
            case 'neptune': orbitColor = 0x4b70dd; break;
        }
        
        const orbitMaterial = new THREE.MeshBasicMaterial({
            color: orbitColor,
            transparent: true,
            opacity: 0.6, // Much more visible
            side: THREE.DoubleSide
        });
        
        this.orbitPath = new THREE.Mesh(orbitGeometry, orbitMaterial);
        this.orbitPath.rotation.x = Math.PI / 2; // Lay flat
        
        // Add orbit label for identification
        this.orbitPath.userData = {
            name: `${this.name} Orbit`,
            type: 'orbit'
        };
    }

    updatePosition() {
        // Calculate orbital position
        const x = Math.cos(this.angle) * this.orbitRadius;
        const z = Math.sin(this.angle) * this.orbitRadius;
        
        this.group.position.set(x, 0, z);
    }

    update(deltaTime, speedMultiplier = 1) {
        // Update orbital motion
        this.angle += this.orbitSpeed * deltaTime * speedMultiplier;
        this.updatePosition();
        
        // Rotate planet on its axis
        if (this.mesh) {
            this.mesh.rotation.y += this.rotationSpeed * deltaTime * speedMultiplier;
        }
        
        // Rotate atmosphere slightly differently for effect
        if (this.atmosphere) {
            this.atmosphere.rotation.y += this.rotationSpeed * deltaTime * speedMultiplier * 0.8;
            this.atmosphere.rotation.x += this.rotationSpeed * deltaTime * speedMultiplier * 0.3;
        }

        // Slowly rotate rings
        if (this.rings) {
            this.rings.rotation.z += deltaTime * speedMultiplier * 0.001;
        }
        
        // Update moon if it exists
        if (this.moon) {
            this.moon.update(deltaTime, speedMultiplier);
        }
    }

    // Method to focus camera on this planet
    focusCamera(camera, controls, distance = null) {
        const focusDistance = distance || this.radius * 8;
        const targetPosition = this.group.position.clone();
        
        // Calculate camera position
        const cameraPosition = targetPosition.clone();
        cameraPosition.x += focusDistance;
        cameraPosition.y += focusDistance * 0.5;
        
        // Animate camera (you can enhance this with tweening libraries)
        camera.position.copy(cameraPosition);
        if (controls) {
            controls.target.copy(targetPosition);
            controls.update();
        }
    }

    getMesh() {
        return this.group;
    }

    getOrbitPath() {
        return this.orbitPath;
    }

    getInfo() {
        return {
            name: this.name,
            radius: this.radius,
            orbitRadius: this.orbitRadius,
            color: this.color,
            description: this.description,
            hasRings: this.hasRings,
            isLoaded: this.isLoaded
        };
    }

    // Get distance from camera for sorting/LOD
    getDistanceFromCamera(camera) {
        return this.group.position.distanceTo(camera.position);
    }

    // Dispose of resources
    dispose() {
        if (this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
        if (this.atmosphere) {
            this.atmosphere.geometry.dispose();
            this.atmosphere.material.dispose();
        }
        if (this.rings) {
            this.rings.geometry.dispose();
            this.rings.material.dispose();
        }
        if (this.orbitPath) {
            this.orbitPath.geometry.dispose();
            this.orbitPath.material.dispose();
        }
    }

    async createMoon() {
        if (!this.hasMoon || !this.moonOptions) return;

        console.log(`Creating moon for ${this.name}`);
        
        // Create moon with the provided options
        this.moon = new Moon(this.moonOptions, this.textureLoader);
        
        // Load moon textures
        await this.moon.loadTextures();
        
        // Add moon to planet's group so it follows the planet
        this.group.add(this.moon.getMesh());
        
        // Add moon's orbit path to the scene (it will be relative to the planet)
        this.group.add(this.moon.getOrbitPath());
        
        console.log(`✓ Moon created for ${this.name}`);
    }
} 