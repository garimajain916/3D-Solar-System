import * as THREE from 'three';

export class TextureLoader {
    constructor() {
        this.loader = new THREE.TextureLoader();
        this.loadedTextures = new Map();
        this.loadingPromises = new Map();
    }

    /**
     * Load a single texture with fallback
     * @param {string} path - Path to the texture
     * @param {number} fallbackColor - Fallback color if texture fails
     * @returns {Promise<THREE.Texture|null>}
     */
    async loadTexture(path, fallbackColor = 0xffffff) {
        if (!path) {
            console.warn('No texture path provided');
            return null;
        }

        return new Promise((resolve) => {
            const loader = new THREE.TextureLoader();
            
            // Set a timeout to prevent hanging
            const timeout = setTimeout(() => {
                console.warn(`Texture loading timeout for: ${path}`);
                resolve(null);
            }, 10000); // 10 second timeout
            
            loader.load(
                path,
                // Success
                (texture) => {
                    clearTimeout(timeout);
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    console.log(`✓ Texture loaded successfully: ${path}`);
                    resolve(texture);
                },
                // Progress
                undefined,
                // Error
                (error) => {
                    clearTimeout(timeout);
                    console.warn(`Failed to load texture: ${path}`, error);
                    console.warn(`Using fallback color: ${fallbackColor.toString(16)}`);
                    resolve(null);
                }
            );
        });
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