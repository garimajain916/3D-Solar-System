import * as THREE from 'three';

export class Sun {
    constructor(textureLoader = null) {
        this.group = new THREE.Group();
        this.textureLoader = textureLoader;
        this.isLoaded = false;
        this.createSun();
        this.createGlow();
        this.createCorona();
    }

    async createSun() {
        // Main sun sphere with higher detail
        const geometry = new THREE.SphereGeometry(2.5, 64, 64);
        
        let material;
        if (this.textureLoader) {
            material = await this.textureLoader.createMaterial(
                '/textures/sun.jpg',
                0xfdb813,
                {
                    emissive: 0xfdb813,
                    emissiveIntensity: 0.6
                }
            );
        } else {
            material = new THREE.MeshBasicMaterial({
                color: 0xfdb813,
                emissive: 0xfdb813,
                emissiveIntensity: 0.4
            });
        }
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.userData = { 
            name: 'Sun',
            type: 'star',
            description: 'The star at the center of our solar system' 
        };
        this.group.add(this.mesh);

        // Add sun surface layer with animated texture
        const surfaceGeometry = new THREE.SphereGeometry(2.52, 32, 32);
        const surfaceMaterial = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        this.surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
        this.group.add(this.surface);

        this.isLoaded = true;
    }

    createGlow() {
        // Multiple glow layers for more realistic effect
        const glowLayers = [
            { radius: 3.2, color: 0xffaa00, opacity: 0.15 },
            { radius: 4.0, color: 0xff6600, opacity: 0.08 },
            { radius: 5.0, color: 0xff4400, opacity: 0.04 }
        ];

        this.glowMeshes = [];

        glowLayers.forEach(layer => {
            const glowGeometry = new THREE.SphereGeometry(layer.radius, 16, 16);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: layer.color,
                transparent: true,
                opacity: layer.opacity,
                side: THREE.BackSide
            });
            
            const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
            this.glowMeshes.push(glowMesh);
            this.group.add(glowMesh);
        });

        // Primary point light to illuminate planets
        this.light = new THREE.PointLight(0xffffff, 3, 2000);
        this.light.position.set(0, 0, 0);
        this.light.castShadow = true;
        this.light.shadow.mapSize.width = 2048;
        this.light.shadow.mapSize.height = 2048;
        this.light.shadow.camera.near = 0.5;
        this.light.shadow.camera.far = 500;
        this.group.add(this.light);

        // Secondary warm light for atmospheric effect
        this.secondaryLight = new THREE.PointLight(0xffaa44, 1, 1000);
        this.secondaryLight.position.set(0, 0, 0);
        this.group.add(this.secondaryLight);

        // Ambient light for general illumination
        this.ambientLight = new THREE.AmbientLight(0x404040, 0.2);
        this.group.add(this.ambientLight);
    }

    createCorona() {
        // Solar corona effect using particles
        const coronaGeometry = new THREE.BufferGeometry();
        const coronaVertices = [];
        const coronaColors = [];

        // Create corona particles
        for (let i = 0; i < 2000; i++) {
            // Random position around the sun
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const radius = 3 + Math.random() * 4;

            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);

            coronaVertices.push(x, y, z);

            // Corona colors (orange to yellow)
            const intensity = 0.5 + Math.random() * 0.5;
            coronaColors.push(1.0, intensity * 0.7, intensity * 0.3);
        }

        coronaGeometry.setAttribute('position', new THREE.Float32BufferAttribute(coronaVertices, 3));
        coronaGeometry.setAttribute('color', new THREE.Float32BufferAttribute(coronaColors, 3));

        const coronaMaterial = new THREE.PointsMaterial({
            size: 0.1,
            transparent: true,
            opacity: 0.6,
            vertexColors: true,
            blending: THREE.AdditiveBlending
        });

        this.corona = new THREE.Points(coronaGeometry, coronaMaterial);
        this.group.add(this.corona);
    }

    update(deltaTime) {
        // Rotate the sun on its axis
        if (this.mesh) {
            this.mesh.rotation.y += deltaTime * 0.2;
        }
        
        if (this.surface) {
            this.surface.rotation.y += deltaTime * 0.15;
            this.surface.rotation.x += deltaTime * 0.05;
        }

        // Animate glow layers
        this.glowMeshes.forEach((glowMesh, index) => {
            const time = Date.now() * 0.001;
            const pulse = Math.sin(time * (1 + index * 0.3)) * 0.2 + 0.8;
            glowMesh.scale.setScalar(pulse);
            
            // Vary opacity slightly
            const baseOpacity = [0.15, 0.08, 0.04][index];
            glowMesh.material.opacity = baseOpacity * pulse;
            
            // Slowly rotate each glow layer
            glowMesh.rotation.y += deltaTime * (0.1 + index * 0.05);
        });

        // Animate corona
        if (this.corona) {
            this.corona.rotation.y += deltaTime * 0.02;
            this.corona.rotation.x += deltaTime * 0.01;
            
            // Pulse corona opacity
            const coronaPulse = Math.sin(Date.now() * 0.003) * 0.2 + 0.8;
            this.corona.material.opacity = 0.6 * coronaPulse;
        }

        // Subtle light intensity variation
        if (this.light) {
            const lightPulse = Math.sin(Date.now() * 0.002) * 0.3 + 1;
            this.light.intensity = 3 * lightPulse;
        }
    }

    // Get sun information
    getInfo() {
        return {
            name: 'Sun',
            type: 'Star',
            description: 'The star at the center of our solar system',
            isLoaded: this.isLoaded
        };
    }

    getMesh() {
        return this.group;
    }

    // Dispose of resources
    dispose() {
        if (this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
        if (this.surface) {
            this.surface.geometry.dispose();
            this.surface.material.dispose();
        }
        this.glowMeshes.forEach(glowMesh => {
            glowMesh.geometry.dispose();
            glowMesh.material.dispose();
        });
        if (this.corona) {
            this.corona.geometry.dispose();
            this.corona.material.dispose();
        }
    }
} 