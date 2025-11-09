# 🔥 Start BonFire with Vanta WAVES

## Quick Start

```bash
# Make sure you're in the project root
cd D:\Guild\Bonfire

# Start all services
npm run dev:all
```

## What You'll See

### 1. **Animated Black Waves Background**
- Beautiful WebGL-powered wave animation
- Interactive (responds to mouse movement)
- Smooth 60fps performance

### 2. **Modern Glassmorphism UI**
- Semi-transparent cards with backdrop blur
- White borders with subtle opacity
- Orange glow effects on buttons
- Smooth hover animations

### 3. **White Canvas Areas**
- 3D Repository Visualization (Developer View)
- Workflow Builder (ReactFlow canvas)
- Clean, professional appearance

## Access Points

### Main Application
```
http://localhost:3000
```

### Developer View (3D Visualization)
```
http://localhost:3000/developer
```

### Workflow Builder
```
http://localhost:3000/workflows
```

### Data Analysis
```
http://localhost:3000/data-analysis
```

## Features to Try

### 1. **3D Repository Visualization**
1. Go to Developer View
2. Enter a repo: `facebook/react`
3. Click "🔥 Visualize Repository"
4. See the white canvas with 3D visualization
5. Notice the Vanta waves in the background

### 2. **Workflow Builder**
1. Go to Workflows
2. Drag nodes from the library
3. Connect them on the white canvas
4. Click "AI Assistant" for glassmorphism chat panel
5. Try `@dedalus Create a workflow...`

### 3. **Role Switching**
1. Click role buttons in top-right
2. See smooth transitions
3. Notice orange glow on active role
4. Each role has different view

## UI Elements to Notice

### Navigation Bar
- Glassmorphism effect
- Sticky at top
- Backdrop blur
- Hover effects on links

### Cards
- Semi-transparent black
- Backdrop blur
- White borders
- Hover scale effect

### Buttons
- Orange glow on primary actions
- Glass effect on secondary
- Smooth scale on hover
- Shadow effects

### Inputs
- Glass effect
- White borders
- Focus states with orange
- Placeholder text visible

## Customization

### Change Wave Color
Edit `apps/web/src/components/VantaBackground.tsx`:
```typescript
color: 0x0,  // 0x0 = black, 0x1a1a2e = dark blue, etc.
```

### Adjust Wave Speed
```typescript
waveSpeed: 1,  // Increase for faster, decrease for slower
```

### Change Wave Height
```typescript
waveHeight: 15,  // Increase for taller waves
```

## Troubleshooting

### Vanta Not Showing
1. Check browser console for errors
2. Make sure Three.js is installed: `npm list three`
3. Clear browser cache
4. Restart dev server

### Performance Issues
1. Reduce wave quality in VantaBackground.tsx
2. Disable mouse controls: `mouseControls: false`
3. Lower wave height and speed

### Canvas Not White
1. Check if `white-canvas-container` class is applied
2. Verify index.css has the class definition
3. Clear Tailwind cache: `npm run build`

## Browser Support

✅ **Chrome/Edge**: Full support
✅ **Firefox**: Full support
✅ **Safari**: Full support
✅ **Mobile**: Full support (touch controls enabled)

## Performance

- **60 FPS**: Smooth animations
- **WebGL**: Hardware accelerated
- **Responsive**: Adapts to screen size
- **Optimized**: Minimal CPU/GPU usage

## Next Steps

1. ✅ Explore the 3D visualization
2. ✅ Build a workflow with AI
3. ✅ Try different roles
4. ✅ Customize the theme
5. ✅ Deploy to production

---

**Enjoy your modern BonFire experience! 🔥**
