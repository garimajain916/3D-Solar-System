import * as THREE from 'three';

export class AsteroidBelt {
    constructor(innerRadius = 15, outerRadius = 21, count = 3000) {
        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;
        this.count = count;
        this.asteroids = [];
        this.group = new THREE.Group();
        this.time = 0;
        
        this.createAsteroidBelt();
    }

    createAsteroidBelt() {
        // Create different types of asteroids
        const asteroidTypes = [
            { 
                color: 0x8c7853, 
                size: { min: 0.02, max: 0.08 }, 
                count: Math.floor(this.count * 0.7) // 70% small asteroids
            },
            { 
                color: 0x654321, 
                size: { min: 0.08, max: 0.15 }, 
                count: Math.floor(this.count * 0.25) // 25% medium asteroids
            },
            { 
                color: 0x444444, 
                size: { min: 0.15, max: 0.25 }, 
                count: Math.floor(this.count * 0.05) // 5% large asteroids
            }
        ];

        let totalCreated = 0;

        asteroidTypes.forEach(type => {
            for (let i = 0; i < type.count; i++) {
                this.createAsteroid(type);
                totalCreated++;
            }
        });

        console.log(`✅ Created ${totalCreated} asteroids in the asteroid belt`);
    }

    createAsteroid(type) {
        // Random position in the belt
        const angle = Math.random() * Math.PI * 2;
        const radius = this.innerRadius + Math.random() * (this.outerRadius - this.innerRadius);
        
        // Add some variation to make it look more natural
        const radiusVariation = (Math.random() - 0.5) * 2; // ±1 unit variation
        const heightVariation = (Math.random() - 0.5) * 0.5; // ±0.25 unit height variation
        
        const x = Math.cos(angle) * (radius + radiusVariation);
        const z = Math.sin(angle) * (radius + radiusVariation);
        const y = heightVariation;

        // Random asteroid size within type range
        const size = type.size.min + Math.random() * (type.size.max - type.size.min);
        
        // Create asteroid geometry (irregular shape)
        const geometry = this.createIrregularGeometry(size);
        
        // Create material with some variation
        const material = new THREE.MeshLambertMaterial({
            color: this.varyColor(type.color),
            flatShading: true
        });

        const asteroid = new THREE.Mesh(geometry, material);
        asteroid.position.set(x, y, z);
        
        // Random rotation
        asteroid.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        );

        // Store orbital data for animation
        asteroid.userData = {
            originalAngle: angle,
            originalRadius: radius + radiusVariation,
            originalHeight: y,
            orbitSpeed: this.calculateOrbitSpeed(radius),
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            },
            size: size
        };

        this.asteroids.push(asteroid);
        this.group.add(asteroid);
    }

    createIrregularGeometry(baseSize) {
        // Create an irregular asteroid shape
        const geometry = new THREE.SphereGeometry(baseSize, 8, 6);
        
        // Deform the sphere to make it look like an asteroid
        const vertices = geometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const vertex = new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
            
            // Add noise to make it irregular
            const noise = this.noise(vertex.x * 10, vertex.y * 10, vertex.z * 10) * 0.3;
            vertex.multiplyScalar(1 + noise);
            
            vertices[i] = vertex.x;
            vertices[i + 1] = vertex.y;
            vertices[i + 2] = vertex.z;
        }
        
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
        
        return geometry;
    }

    // Simple noise function for asteroid shape variation
    noise(x, y, z) {
        return Math.sin(x * 0.7) * Math.cos(y * 0.8) * Math.sin(z * 0.9) * 0.5 +
               Math.sin(x * 1.3) * Math.cos(y * 1.7) * Math.sin(z * 1.1) * 0.3 +
               Math.sin(x * 2.1) * Math.cos(y * 2.3) * Math.sin(z * 2.7) * 0.2;
    }

    varyColor(baseColor) {
        // Add some variation to the base color
        const variation = 0.3;
        const r = ((baseColor >> 16) & 255) / 255;
        const g = ((baseColor >> 8) & 255) / 255;
        const b = (baseColor & 255) / 255;
        
        const newR = Math.max(0, Math.min(1, r + (Math.random() - 0.5) * variation));
        const newG = Math.max(0, Math.min(1, g + (Math.random() - 0.5) * variation));
        const newB = Math.max(0, Math.min(1, b + (Math.random() - 0.5) * variation));
        
        return new THREE.Color(newR, newG, newB);
    }

    calculateOrbitSpeed(radius) {
        // Realistic orbital speed (Kepler's laws - closer objects orbit faster)
        const baseSpeed = 0.001;
        return baseSpeed * Math.sqrt(1 / radius) * (0.8 + Math.random() * 0.4); // Add some variation
    }

    update(deltaTime, speedMultiplier = 1) {
        this.time += deltaTime * speedMultiplier;
        
        // Update each asteroid
        this.asteroids.forEach(asteroid => {
            const userData = asteroid.userData;
            
            // Update orbital position
            const currentAngle = userData.originalAngle + this.time * userData.orbitSpeed;
            const x = Math.cos(currentAngle) * userData.originalRadius;
            const z = Math.sin(currentAngle) * userData.originalRadius;
            
            asteroid.position.x = x;
            asteroid.position.z = z;
            asteroid.position.y = userData.originalHeight + Math.sin(this.time * 0.1 + userData.originalAngle) * 0.1;
            
            // Update rotation
            asteroid.rotation.x += userData.rotationSpeed.x * deltaTime * speedMultiplier;
            asteroid.rotation.y += userData.rotationSpeed.y * deltaTime * speedMultiplier;
            asteroid.rotation.z += userData.rotationSpeed.z * deltaTime * speedMultiplier;
        });
    }

    // Level of Detail (LOD) optimization
    updateLOD(cameraPosition) {
        this.asteroids.forEach(asteroid => {
            const distance = asteroid.position.distanceTo(cameraPosition);
            
            if (distance > 200) {
                // Very far: hide asteroid
                asteroid.visible = false;
            } else if (distance > 100) {
                // Far: reduce quality
                asteroid.visible = true;
                asteroid.material.opacity = 0.5;
                asteroid.material.transparent = true;
            } else if (distance > 50) {
                // Medium distance: normal quality
                asteroid.visible = true;
                asteroid.material.opacity = 0.8;
                asteroid.material.transparent = true;
            } else {
                // Close: full quality
                asteroid.visible = true;
                asteroid.material.opacity = 1.0;
                asteroid.material.transparent = false;
            }
        });
    }

    // Get asteroids in a specific region (for collision detection, etc.)
    getAsteroidsInRegion(center, radius) {
        return this.asteroids.filter(asteroid => {
            return asteroid.position.distanceTo(center) <= radius;
        });
    }

    // Set visibility of the entire belt
    setVisible(visible) {
        this.group.visible = visible;
    }

    // Get belt statistics
    getStats() {
        return {
            totalAsteroids: this.asteroids.length,
            innerRadius: this.innerRadius,
            outerRadius: this.outerRadius,
            averageOrbitSpeed: this.asteroids.reduce((sum, a) => sum + a.userData.orbitSpeed, 0) / this.asteroids.length,
            visibleAsteroids: this.asteroids.filter(a => a.visible).length
        };
    }

    getMesh() {
        return this.group;
    }

    // Create a dramatic asteroid shower effect (for special events)
    createAsteroidShower(count = 50) {
        console.log(`🌟 Creating asteroid shower with ${count} asteroids!`);
        
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const asteroid = this.createSpecialAsteroid();
                this.group.add(asteroid);
                
                // Remove after animation
                setTimeout(() => {
                    this.group.remove(asteroid);
                    asteroid.geometry.dispose();
                    asteroid.material.dispose();
                }, 10000);
            }, i * 100); // Stagger creation
        }
    }

    createSpecialAsteroid() {
        const size = 0.1 + Math.random() * 0.3;
        const geometry = this.createIrregularGeometry(size);
        
        const material = new THREE.MeshLambertMaterial({
            color: 0xffaa00,
            emissive: 0xff4400,
            emissiveIntensity: 0.3
        });

        const asteroid = new THREE.Mesh(geometry, material);
        
        // Start from outer edge, move inward
        const angle = Math.random() * Math.PI * 2;
        const startRadius = this.outerRadius + 20;
        const endRadius = this.innerRadius - 5;
        
        asteroid.position.set(
            Math.cos(angle) * startRadius,
            (Math.random() - 0.5) * 2,
            Math.sin(angle) * startRadius
        );

        // Animate inward movement
        const duration = 5000 + Math.random() * 5000;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                const currentRadius = startRadius + (endRadius - startRadius) * progress;
                asteroid.position.x = Math.cos(angle) * currentRadius;
                asteroid.position.z = Math.sin(angle) * currentRadius;
                
                // Add spinning
                asteroid.rotation.x += 0.1;
                asteroid.rotation.y += 0.1;
                asteroid.rotation.z += 0.05;
                
                requestAnimationFrame(animate);
            }
        };
        
        animate();
        return asteroid;
    }

    dispose() {
        this.asteroids.forEach(asteroid => {
            asteroid.geometry.dispose();
            asteroid.material.dispose();
        });
        this.asteroids = [];
    }
} 