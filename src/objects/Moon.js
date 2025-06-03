import * as THREE from 'three';
import { TEXTURE_PATHS } from '../utils/constants.js';

export class Moon {
    constructor(options = {}, textureLoader = null) {
        this.radius = options.radius || 0.27; // Moon is about 27% the size of Earth
        this.color = options.color || 0x999999; // Gray color
        this.orbitRadius = options.orbitRadius || 2.5; // Distance from Earth
        this.orbitSpeed = options.orbitSpeed || 0.05; // Moon orbits Earth relatively quickly
        this.rotationSpeed = options.rotationSpeed || 0.005; // Slow rotation
        this.name = options.name || 'Moon';
        this.texture = options.texture || 'moon';
        this.description = options.description || "Earth's natural satellite";
        
        this.angle = options.startAngle || 0;
        this.group = new THREE.Group();
        this.textureLoader = textureLoader;
        this.isLoaded = false;
        
        // Create basic moon
        this.createBasicMoon();
        this.createOrbitPath();
        this.updatePosition();
    }

    createBasicMoon() {
        // Moon geometry with good detail
        const geometry = new THREE.SphereGeometry(this.radius, 32, 32);
        
        // Start with basic material that will be replaced by textured material
        const material = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.9, // Moon is quite rough
            metalness: 0.0  // Not metallic at all
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        // Add moon identification
        this.mesh.userData = { 
            name: this.name,
            type: 'moon',
            description: this.description 
        };
        
        this.group.add(this.mesh);
    }

    async loadTextures() {
        if (!this.textureLoader || !this.texture) {
            console.log(`No texture loader or texture specified for moon`);
            return;
        }

        try {
            console.log(`Loading texture for moon:`, this.texture);
            
            // Get the full texture path from TEXTURE_PATHS
            const texturePath = TEXTURE_PATHS[this.texture];
            console.log(`Moon texture path:`, texturePath);
            
            // Use the createMaterial method for guaranteed texture visibility
            const newMaterial = await this.textureLoader.createMaterial(
                texturePath, 
                this.color
            );
            
            // Replace the material on the mesh
            if (this.mesh && this.mesh.material) {
                this.mesh.material.dispose();
                this.mesh.material = newMaterial;
                console.log(`✓ Moon texture applied successfully`);
            }
            
        } catch (error) {
            console.error(`Failed to load moon texture:`, error);
        }
    }

    createOrbitPath() {
        // Create a smaller, more subtle orbit path for the moon
        const orbitGeometry = new THREE.RingGeometry(
            this.orbitRadius - 0.02, 
            this.orbitRadius + 0.02, 
            64
        );
        
        const orbitMaterial = new THREE.MeshBasicMaterial({
            color: 0x888888, // Light gray for moon orbit
            transparent: true,
            opacity: 0.3, // More subtle than planet orbits
            side: THREE.DoubleSide
        });
        
        this.orbitPath = new THREE.Mesh(orbitGeometry, orbitMaterial);
        this.orbitPath.rotation.x = Math.PI / 2; // Lay flat
        
        // Add orbit label
        this.orbitPath.userData = {
            name: `${this.name} Orbit`,
            type: 'moon-orbit'
        };
    }

    updatePosition() {
        // Calculate position relative to parent (will be offset later)
        const x = Math.cos(this.angle) * this.orbitRadius;
        const z = Math.sin(this.angle) * this.orbitRadius;
        
        this.group.position.set(x, 0, z);
    }

    update(deltaTime, speedMultiplier = 1) {
        // Update orbital motion around parent planet
        this.angle += this.orbitSpeed * deltaTime * speedMultiplier;
        this.updatePosition();
        
        // Rotate moon on its axis (tidally locked would be this.rotationSpeed = this.orbitSpeed)
        if (this.mesh) {
            this.mesh.rotation.y += this.rotationSpeed * deltaTime * speedMultiplier;
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
            isLoaded: this.isLoaded
        };
    }

    // Dispose of resources
    dispose() {
        if (this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
        if (this.orbitPath) {
            this.orbitPath.geometry.dispose();
            this.orbitPath.material.dispose();
        }
    }
} 