export class InfoPanel {
    constructor() {
        this.currentPlanet = null;
        this.panel = null;
        this.isVisible = false;
        this.createPanel();
        this.setupEventListeners();
    }

    createPanel() {
        // Create the info panel element
        this.panel = document.createElement('div');
        this.panel.id = 'planet-info-panel';
        this.panel.className = 'planet-info-panel hidden';
        
        document.body.appendChild(this.panel);
        
        // Add CSS styles
        this.addStyles();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .planet-info-panel {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 350px;
                max-height: 70vh;
                background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(20, 20, 40, 0.9));
                border: 2px solid #4a9eff;
                border-radius: 15px;
                padding: 20px;
                color: white;
                font-family: 'Arial', sans-serif;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(10px);
                transition: all 0.3s ease;
                z-index: 1000;
                overflow-y: auto;
            }

            .planet-info-panel.hidden {
                opacity: 0;
                transform: translateX(400px);
                pointer-events: none;
            }

            .planet-info-panel.visible {
                opacity: 1;
                transform: translateX(0);
                pointer-events: all;
            }

            .planet-header {
                text-align: center;
                margin-bottom: 20px;
                border-bottom: 2px solid #4a9eff;
                padding-bottom: 15px;
            }

            .planet-name {
                font-size: 2em;
                font-weight: bold;
                margin-bottom: 5px;
                text-shadow: 0 0 10px rgba(74, 158, 255, 0.5);
            }

            .planet-type {
                font-size: 1.1em;
                color: #4a9eff;
                font-style: italic;
            }

            .planet-image {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                margin: 15px auto;
                background: radial-gradient(circle, var(--planet-color), #000);
                box-shadow: 0 0 20px var(--planet-color);
                animation: planetGlow 3s ease-in-out infinite alternate;
            }

            @keyframes planetGlow {
                0% { box-shadow: 0 0 20px var(--planet-color); }
                100% { box-shadow: 0 0 30px var(--planet-color); }
            }

            .planet-description {
                margin-bottom: 20px;
                line-height: 1.6;
                font-size: 0.95em;
                color: #e0e0e0;
            }

            .planet-stats {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                margin-bottom: 20px;
            }

            .stat-item {
                background: rgba(255, 255, 255, 0.1);
                padding: 10px;
                border-radius: 8px;
                border-left: 3px solid #4a9eff;
            }

            .stat-label {
                font-size: 0.8em;
                color: #4a9eff;
                margin-bottom: 3px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .stat-value {
                font-size: 1.1em;
                font-weight: bold;
            }

            .fun-facts {
                background: rgba(74, 158, 255, 0.1);
                padding: 15px;
                border-radius: 10px;
                margin-bottom: 15px;
                border: 1px solid rgba(74, 158, 255, 0.3);
            }

            .fun-facts h4 {
                margin: 0 0 10px 0;
                color: #4a9eff;
                font-size: 1.1em;
            }

            .fun-facts ul {
                margin: 0;
                padding-left: 20px;
            }

            .fun-facts li {
                margin-bottom: 5px;
                line-height: 1.4;
                font-size: 0.9em;
            }

            .close-btn {
                position: absolute;
                top: 10px;
                right: 15px;
                background: none;
                border: none;
                color: #4a9eff;
                font-size: 1.5em;
                cursor: pointer;
                transition: color 0.2s;
            }

            .close-btn:hover {
                color: #fff;
            }

            .focus-btn {
                width: 100%;
                padding: 12px;
                background: linear-gradient(45deg, #4a9eff, #0066cc);
                border: none;
                border-radius: 8px;
                color: white;
                font-size: 1em;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s;
                margin-top: 10px;
            }

            .focus-btn:hover {
                background: linear-gradient(45deg, #0066cc, #4a9eff);
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(74, 158, 255, 0.4);
            }

            @media (max-width: 768px) {
                .planet-info-panel {
                    width: 300px;
                    right: 10px;
                    top: 10px;
                    font-size: 0.9em;
                }
                
                .planet-stats {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(style);
    }

    showPlanet(planet) {
        this.currentPlanet = planet;
        this.updateContent();
        this.show();
    }

    updateContent() {
        if (!this.currentPlanet) return;

        const planet = this.currentPlanet;
        const planetData = this.getPlanetData(planet.name);
        
        this.panel.innerHTML = `
            <button class="close-btn" onclick="planetInfoPanel.hide()">&times;</button>
            
            <div class="planet-header">
                <div class="planet-name">${planet.name}</div>
                <div class="planet-type">${planetData.type}</div>
                <div class="planet-image" style="--planet-color: ${this.getColorString(planet.color)}"></div>
            </div>

            <div class="planet-description">
                ${planet.description || planetData.description}
            </div>

            <div class="planet-stats">
                <div class="stat-item">
                    <div class="stat-label">Radius</div>
                    <div class="stat-value">${planetData.realRadius}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Distance from Sun</div>
                    <div class="stat-value">${planetData.realDistance}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Orbital Period</div>
                    <div class="stat-value">${planetData.orbitalPeriod}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Day Length</div>
                    <div class="stat-value">${planetData.dayLength}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Temperature</div>
                    <div class="stat-value">${planetData.temperature}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Moons</div>
                    <div class="stat-value">${planetData.moons}</div>
                </div>
            </div>

            <div class="fun-facts">
                <h4>🌟 Fun Facts</h4>
                <ul>
                    ${planetData.funFacts.map(fact => `<li>${fact}</li>`).join('')}
                </ul>
            </div>

            <button class="focus-btn" onclick="planetInfoPanel.focusOnPlanet()">
                🔭 Focus on ${planet.name}
            </button>
        `;
    }

    getPlanetData(planetName) {
        const data = {
            'Mercury': {
                type: 'Terrestrial Planet',
                description: 'The smallest planet and closest to the Sun, with extreme temperature variations.',
                realRadius: '2,439 km',
                realDistance: '57.9 million km',
                orbitalPeriod: '88 Earth days',
                dayLength: '176 Earth days',
                temperature: '-173°C to 427°C',
                moons: '0',
                funFacts: [
                    'Has the most eccentric orbit of all planets',
                    'One day on Mercury is longer than its year',
                    'Has a large iron core making up 75% of its radius',
                    'Surface is covered in impact craters',
                    'No atmosphere to retain heat'
                ]
            },
            'Venus': {
                type: 'Terrestrial Planet',
                description: 'The hottest planet with a thick, toxic atmosphere and runaway greenhouse effect.',
                realRadius: '6,051 km',
                realDistance: '108.2 million km',
                orbitalPeriod: '225 Earth days',
                dayLength: '243 Earth days',
                temperature: '462°C average',
                moons: '0',
                funFacts: [
                    'Rotates backwards (retrograde rotation)',
                    'Hottest planet despite being farther from Sun than Mercury',
                    'Has crushing atmospheric pressure 90x Earth\'s',
                    'Rains sulfuric acid',
                    'Often called Earth\'s "evil twin"'
                ]
            },
            'Earth': {
                type: 'Terrestrial Planet',
                description: 'Our beautiful blue home planet, the only known world with life.',
                realRadius: '6,371 km',
                realDistance: '149.6 million km',
                orbitalPeriod: '365.25 days',
                dayLength: '24 hours',
                temperature: '-89°C to 58°C',
                moons: '1 (The Moon)',
                funFacts: [
                    '71% of surface is covered by water',
                    'Only planet known to harbor life',
                    'Has a magnetic field protecting from solar wind',
                    'The Moon is unusually large relative to Earth',
                    'Constantly changing through plate tectonics'
                ]
            },
            'Mars': {
                type: 'Terrestrial Planet',
                description: 'The red planet with polar ice caps and evidence of ancient water.',
                realRadius: '3,389 km',
                realDistance: '227.9 million km',
                orbitalPeriod: '687 Earth days',
                dayLength: '24h 37m',
                temperature: '-87°C to -5°C',
                moons: '2 (Phobos, Deimos)',
                funFacts: [
                    'Has the largest volcano in the solar system (Olympus Mons)',
                    'Days are very similar to Earth (24.6 hours)',
                    'Has seasonal dust storms that can cover the entire planet',
                    'Evidence suggests it once had liquid water',
                    'Future target for human colonization'
                ]
            },
            'Jupiter': {
                type: 'Gas Giant',
                description: 'The largest planet, a gas giant with the famous Great Red Spot storm.',
                realRadius: '69,911 km',
                realDistance: '778.5 million km',
                orbitalPeriod: '12 Earth years',
                dayLength: '9h 56m',
                temperature: '-108°C average',
                moons: '95+ (Io, Europa, Ganymede, Callisto)',
                funFacts: [
                    'More massive than all other planets combined',
                    'The Great Red Spot is a storm larger than Earth',
                    'Acts as a "cosmic vacuum cleaner" protecting inner planets',
                    'Has a faint ring system',
                    'Could fit 1,300 Earths inside it'
                ]
            },
            'Saturn': {
                type: 'Gas Giant',
                description: 'The ringed planet, famous for its spectacular ring system.',
                realRadius: '58,232 km',
                realDistance: '1.4 billion km',
                orbitalPeriod: '29 Earth years',
                dayLength: '10h 33m',
                temperature: '-139°C average',
                moons: '146+ (Titan, Enceladus, Mimas)',
                funFacts: [
                    'Has the most spectacular ring system',
                    'Less dense than water - would float!',
                    'Titan has thick atmosphere and liquid methane lakes',
                    'Enceladus shoots water geysers from its south pole',
                    'Hexagonal storm at its north pole'
                ]
            },
            'Uranus': {
                type: 'Ice Giant',
                description: 'The tilted ice giant with faint rings and extreme seasons.',
                realRadius: '25,362 km',
                realDistance: '2.9 billion km',
                orbitalPeriod: '84 Earth years',
                dayLength: '17h 14m',
                temperature: '-197°C average',
                moons: '27+ (Miranda, Ariel, Umbriel)',
                funFacts: [
                    'Rotates on its side (98° tilt)',
                    'Has extreme 42-year seasons',
                    'Made mostly of water, methane, and ammonia ices',
                    'Has faint rings discovered in 1977',
                    'Coldest planetary atmosphere in solar system'
                ]
            },
            'Neptune': {
                type: 'Ice Giant',
                description: 'The windiest planet in the solar system with supersonic winds.',
                realRadius: '24,622 km',
                realDistance: '4.5 billion km',
                orbitalPeriod: '165 Earth years',
                dayLength: '16h 6m',
                temperature: '-201°C average',
                moons: '16+ (Triton, Nereid)',
                funFacts: [
                    'Has the fastest winds in the solar system (2,100 km/h)',
                    'Takes 165 Earth years to orbit the Sun',
                    'Triton orbits backwards and may be a captured object',
                    'Has a dynamic atmosphere with changing cloud patterns',
                    'Discovered through mathematical predictions'
                ]
            }
        };

        return data[planetName] || {
            type: 'Unknown',
            description: 'No data available',
            realRadius: 'Unknown',
            realDistance: 'Unknown',
            orbitalPeriod: 'Unknown',
            dayLength: 'Unknown',
            temperature: 'Unknown',
            moons: 'Unknown',
            funFacts: ['No data available']
        };
    }

    getColorString(colorNumber) {
        return `#${colorNumber.toString(16).padStart(6, '0')}`;
    }

    show() {
        this.isVisible = true;
        this.panel.classList.remove('hidden');
        this.panel.classList.add('visible');
    }

    hide() {
        this.isVisible = false;
        this.panel.classList.remove('visible');
        this.panel.classList.add('hidden');
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else if (this.currentPlanet) {
            this.show();
        }
    }

    focusOnPlanet() {
        if (this.currentPlanet && window.solarSystemInstance) {
            window.solarSystemInstance.focusOnPlanet(this.currentPlanet);
        }
    }

    setupEventListeners() {
        // Close panel on escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });

        // Close panel when clicking outside
        document.addEventListener('click', (event) => {
            if (this.isVisible && !this.panel.contains(event.target) && 
                !event.target.closest('.dg.ac')) { // Don't close when clicking dat.GUI
                this.hide();
            }
        });
    }

    dispose() {
        if (this.panel) {
            this.panel.remove();
        }
    }
}

// Create global instance
if (typeof window !== 'undefined') {
    window.planetInfoPanel = new InfoPanel();
} 