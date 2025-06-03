# Planet Textures for 3D Solar System

This directory should contain the texture files for all planets. The solar system will work without these textures (using fallback colors), but textures make it much more realistic and beautiful!

## 📥 How to Get Textures

### Option 1: NASA/Solar System Scope (Recommended)
Download high-quality planet textures from:
- **Solar System Scope**: https://www.solarsystemscope.com/textures/
- **NASA Visible Earth**: https://visibleearth.nasa.gov/
- **NASA 3D Models**: https://nasa3d.arc.nasa.gov/

### Option 2: Free Texture Sites
- **Planet Pixel Emporium**: http://planetpixelemporium.com/
- **CGTextures**: https://www.textures.com/ (requires free account)

## 📁 Required Files

Place these texture files in this directory:

```
public/textures/
├── sun.jpg          # Sun surface texture
├── mercury.jpg      # Mercury surface
├── venus.jpg        # Venus clouds/surface
├── earth.jpg        # Earth continents and oceans
├── mars.jpg         # Mars red surface
├── jupiter.jpg      # Jupiter bands and Great Red Spot
├── saturn.jpg       # Saturn bands
├── uranus.jpg       # Uranus ice blue surface
├── neptune.jpg      # Neptune deep blue surface
├── saturn-rings.png # Saturn's ring system (with transparency)
└── uranus-rings.png # Uranus's faint rings (with transparency)
```

## 🎨 Texture Specifications

For best results, use textures with these specifications:

- **Format**: JPG for planets, PNG for rings (transparency needed)
- **Resolution**: 1024x512 to 2048x1024 pixels
- **Mapping**: Equirectangular projection (cylindrical)
- **File size**: Keep under 2MB per texture for web performance

## 🚀 Quick Start

1. Download textures from one of the sources above
2. Rename them to match the filenames listed above
3. Place them in this `/public/textures/` directory
4. Restart your dev server (`npm run dev`)
5. Enjoy realistic planet textures!

## 🔄 Fallback Behavior

Don't worry if you can't get all textures immediately! The solar system includes:
- ✅ **Automatic fallback** to realistic colors
- ✅ **Graceful loading** - missing textures won't break anything
- ✅ **Console warnings** to help you know which textures are missing
- ✅ **Progressive enhancement** - add textures one by one

## 🎯 Recommended Texture Sources

### Best Free Textures:
1. **Solar System Scope** - Highest quality, NASA-based
2. **Planet Pixel Emporium** - Classic, widely used
3. **NASA Visible Earth** - Real satellite imagery

### Pro Tips:
- Start with Earth, Jupiter, and Saturn for the most dramatic improvement
- Ring textures (Saturn/Uranus) have the biggest visual impact
- Higher resolution textures look better but load slower
- Consider using compressed JPG files for faster loading

---

**Missing textures?** No problem! The solar system looks great with the fallback colors and you can add textures later for enhanced realism. 🌌 