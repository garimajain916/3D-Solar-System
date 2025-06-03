import * as THREE from 'three';

export class TextureLoader {
    constructor() {
        this.loader = new THREE.TextureLoader();
        this.loadedTextures = new Map();
        this.loadingPromises = new Map();
    }

    /**
     * Load a texture with fallback to solid color
     * @param {string} texturePath - Path to the texture file
     * @param {number} fallbackColor - Hex color to use if texture fails to load
     * @returns {Promise<THREE.Texture|null>}
     */
    async loadTexture(texturePath, fallbackColor = 0xffffff) {
        // Check if texture is already loaded
        if (this.loadedTextures.has(texturePath)) {
            return this.loadedTextures.get(texturePath);
        }

        // Check if texture is currently being loaded
        if (this.loadingPromises.has(texturePath)) {
            return this.loadingPromises.get(texturePath);
        }

        // Start loading the texture
        const loadingPromise = new Promise((resolve) => {
            this.loader.load(
                texturePath,
                // Success callback
                (texture) => {
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    texture.colorSpace = THREE.SRGBColorSpace;
                    this.loadedTextures.set(texturePath, texture);
                    this.loadingPromises.delete(texturePath);
                    console.log(`✅ Loaded texture: ${texturePath}`);
                    resolve(texture);
                },
                // Progress callback
                (progress) => {
                    // Optional: handle loading progress
                },
                // Error callback
                (error) => {
                    console.warn(`⚠️ Failed to load texture: ${texturePath}. Using fallback color.`);
                    this.loadedTextures.set(texturePath, null);
                    this.loadingPromises.delete(texturePath);
                    resolve(null);
                }
            );
        });

        this.loadingPromises.set(texturePath, loadingPromise);
        return loadingPromise;
    }

    /**
     * Create a material with texture or fallback color
     * @param {string} texturePath - Path to the texture
     * @param {number} fallbackColor - Fallback color
     * @param {Object} materialOptions - Additional material options
     * @returns {Promise<THREE.Material>}
     */
    async createMaterial(texturePath, fallbackColor, materialOptions = {}) {
        const texture = await this.loadTexture(texturePath, fallbackColor);
        
        let defaultOptions;
        
        if (texture) {
            // When we have a texture, use MeshBasicMaterial to ensure it shows
            defaultOptions = {
                map: texture,
                color: 0xffffff, // Pure white to let texture show at full brightness
                ...materialOptions
            };
            // Use MeshBasicMaterial for guaranteed texture visibility
            return new THREE.MeshBasicMaterial(defaultOptions);
        } else {
            // Use MeshStandardMaterial for fallback colors
            defaultOptions = {
                color: fallbackColor,
                roughness: 0.7,
                metalness: 0.0,
                ...materialOptions
            };
            return new THREE.MeshStandardMaterial(defaultOptions);
        }
    }

    /**
     * Create a ring material for Saturn/Uranus
     * @param {string} texturePath - Path to the ring texture
     * @param {number} fallbackColor - Fallback color
     * @returns {Promise<THREE.Material>}
     */
    async createRingMaterial(texturePath, fallbackColor = 0xaaaaaa) {
        const texture = await this.loadTexture(texturePath, fallbackColor);
        
        const materialOptions = {
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide,
            roughness: 0.8,
            metalness: 0.0
        };

        if (texture) {
            materialOptions.map = texture;
            materialOptions.alphaMap = texture;
            materialOptions.color = 0xffffff; // White so texture shows clearly
        } else {
            materialOptions.color = fallbackColor;
        }

        return new THREE.MeshStandardMaterial(materialOptions);
    }

    /**
     * Preload all textures
     * @param {Array<string>} texturePaths - Array of texture paths to preload
     * @returns {Promise<void>}
     */
    async preloadTextures(texturePaths) {
        console.log('🌟 Preloading textures...');
        const promises = texturePaths.map(path => this.loadTexture(path));
        await Promise.all(promises);
        console.log('✅ All textures preloaded!');
    }

    /**
     * Clear all loaded textures to free memory
     */
    dispose() {
        this.loadedTextures.forEach(texture => {
            if (texture) {
                texture.dispose();
            }
        });
        this.loadedTextures.clear();
        this.loadingPromises.clear();
    }
} 