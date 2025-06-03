// Realistic planetary data based on NASA specifications
// Scaled for visual appeal while maintaining relative proportions

export const PLANET_DATA = {
    mercury: {
        name: 'Mercury',
        radius: 0.38,
        color: 0x8c7853,
        orbitRadius: 6,
        orbitSpeed: 0.048,
        rotationSpeed: 0.002,
        texture: 'mercury.jpg',
        description: 'The smallest planet and closest to the Sun'
    },
    venus: {
        name: 'Venus',
        radius: 0.95,
        color: 0xffa500,
        orbitRadius: 8,
        orbitSpeed: 0.035,
        rotationSpeed: -0.001, // Retrograde rotation
        texture: 'venus.jpg',
        description: 'The hottest planet with a toxic atmosphere'
    },
    earth: {
        name: 'Earth',
        radius: 1.0,
        color: 0x6b93d6,
        orbitRadius: 10,
        orbitSpeed: 0.030,
        rotationSpeed: 0.02,
        texture: 'earth.jpg',
        description: 'Our beautiful blue home planet'
    },
    mars: {
        name: 'Mars',
        radius: 0.53,
        color: 0xcd5c5c,
        orbitRadius: 13,
        orbitSpeed: 0.024,
        rotationSpeed: 0.018,
        texture: 'mars.jpg',
        description: 'The red planet with polar ice caps'
    },
    jupiter: {
        name: 'Jupiter',
        radius: 2.8,
        color: 0xd8ca9d,
        orbitRadius: 18,
        orbitSpeed: 0.013,
        rotationSpeed: 0.04,
        texture: 'jupiter.jpg',
        description: 'The largest planet, a gas giant'
    },
    saturn: {
        name: 'Saturn',
        radius: 2.3,
        color: 0xfad5a5,
        orbitRadius: 24,
        orbitSpeed: 0.009,
        rotationSpeed: 0.038,
        texture: 'saturn.jpg',
        hasRings: true,
        ringInnerRadius: 2.8,
        ringOuterRadius: 4.2,
        description: 'The ringed planet, famous for its beautiful rings'
    },
    uranus: {
        name: 'Uranus',
        radius: 1.6,
        color: 0x4fd0e7,
        orbitRadius: 30,
        orbitSpeed: 0.007,
        rotationSpeed: 0.03,
        texture: 'uranus.jpg',
        hasRings: true,
        ringInnerRadius: 2.0,
        ringOuterRadius: 2.8,
        description: 'The tilted ice giant with faint rings'
    },
    neptune: {
        name: 'Neptune',
        radius: 1.5,
        color: 0x4b70dd,
        orbitRadius: 36,
        orbitSpeed: 0.005,
        rotationSpeed: 0.032,
        texture: 'neptune.jpg',
        description: 'The windiest planet in the solar system'
    }
};

// Texture paths - you can replace these with actual texture files
export const TEXTURE_PATHS = {
    sun: '/textures/sun.jpg',
    mercury: '/textures/mercury.jpg',
    venus: '/textures/venus.jpg',
    earth: '/textures/earth.jpg',
    mars: '/textures/mars.jpg',
    jupiter: '/textures/jupiter.jpg',
    saturn: '/textures/saturn.jpg',
    uranus: '/textures/uranus.jpg',
    neptune: '/textures/neptune.jpg',
    saturnRings: '/textures/saturn-rings.png',
    uranusRings: '/textures/uranus-rings.png',
    stars: '/textures/stars.jpg'
};

// Animation and visual constants
export const SETTINGS = {
    defaultSpeedMultiplier: 1,
    maxSpeedMultiplier: 10,
    minSpeedMultiplier: 0,
    cameraMinDistance: 3,
    cameraMaxDistance: 300,
    starCount: 15000,
    sunRadius: 2.5
};

// Helper function to get planet data as array
export const getPlanetsArray = () => {
    return Object.values(PLANET_DATA);
};

// Helper function to get planet by name
export const getPlanetByName = (name) => {
    return Object.values(PLANET_DATA).find(planet => 
        planet.name.toLowerCase() === name.toLowerCase()
    );
}; 