import * as THREE from 'three';

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
        
        // Start with basic colored material
        const material = new THREE.MeshLambertMaterial({
            color: this.color,
            emissive: this.color,
            emissiveIntensity: 0.1
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

    async loadTextures() {
        try {
            // Add visible debug message to the page
            this.addDebugMessage(`Starting texture load for ${this.name}`);
            
            // Load planet texture
            if (this.textureLoader && this.texture) {
                const texturePath = `/textures/${this.texture}`;
                console.log(`🎨 Loading texture for ${this.name}: ${texturePath}`);
                this.addDebugMessage(`Loading texture: ${texturePath}`);
                
                // Use white color and no emissive when we have a texture
                const material = await this.textureLoader.createMaterial(
                    texturePath, 
                    0xffffff, // White color so texture shows through
                    {
                        // No emissive when we have texture
                    }
                );
                
                // Debug: Check if material has texture
                this.addDebugMessage(`Material created. Has texture map: ${material.map ? 'YES' : 'NO'}`);
                if (material.map) {
                    this.addDebugMessage(`Texture size: ${material.map.image?.width}x${material.map.image?.height}`);
                }
                
                if (this.mesh) {
                    const oldMaterial = this.mesh.material;
                    this.mesh.material.dispose(); // Clean up old material
                    this.mesh.material = material;
                    
                    // Force material update
                    this.mesh.material.needsUpdate = true;
                    
                    console.log(`✅ Texture loaded for ${this.name}`);
                    this.addDebugMessage(`✅ SUCCESS: ${this.name} texture applied!`);
                    this.addDebugMessage(`Material color: ${material.color.getHexString()}`);
                } else {
                    this.addDebugMessage(`❌ ERROR: No mesh found for ${this.name}`);
                }
            } else {
                this.addDebugMessage(`❌ ERROR: No textureLoader or texture for ${this.name}`);
            }

            // Load rings if needed
            if (this.hasRings) {
                await this.createRings();
                this.addDebugMessage(`✅ Rings created for ${this.name}`);
            }

            this.isLoaded = true;
        } catch (error) {
            console.warn(`⚠️ Error loading textures for ${this.name}:`, error);
            this.addDebugMessage(`❌ FAILED: ${this.name} - ${error.message}`);
            this.isLoaded = true; // Still mark as loaded to prevent retry
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
        // Create more subtle orbit path visualization
        const orbitGeometry = new THREE.RingGeometry(
            this.orbitRadius - 0.02, 
            this.orbitRadius + 0.02, 
            128
        );
        const orbitMaterial = new THREE.MeshBasicMaterial({
            color: 0x444444,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide
        });
        
        this.orbitPath = new THREE.Mesh(orbitGeometry, orbitMaterial);
        this.orbitPath.rotation.x = Math.PI / 2; // Lay flat
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
} 