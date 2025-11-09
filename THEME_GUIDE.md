# 🎨 BonFire Modern Theme Guide

## Color Palette

### Primary Colors
```css
Background: Black Vanta WAVES (animated)
Primary Accent: #f97316 (Orange 500)
Text: #ffffff (White)
Secondary Text: #d1d5db (Gray 300)
```

### UI Elements
```css
Cards: rgba(0, 0, 0, 0.4) + backdrop-blur-xl
Borders: rgba(255, 255, 255, 0.1)
Hover Borders: rgba(255, 255, 255, 0.2)
Canvas: #ffffff (Pure White)
```

### Button Colors
```css
Primary: #f97316 (Orange) + glow
Secondary: rgba(255, 255, 255, 0.1) + glass
Success: #10b981 (Green) + glow
Danger: #ef4444 (Red) + glow
Info: #3b82f6 (Blue) + glow
```

## Component Styles

### Cards
```tsx
className="card"
// Translates to:
// bg-black bg-opacity-40 backdrop-blur-xl 
// border border-white border-opacity-10 
// rounded-2xl p-6 shadow-2xl
```

### Primary Button
```tsx
className="btn-primary"
// Translates to:
// px-6 py-3 bg-orange-500 hover:bg-orange-600 
// rounded-xl font-semibold transition-all 
// shadow-lg shadow-orange-500/50 
// hover:shadow-orange-600/60 hover:scale-105
```

### Secondary Button
```tsx
className="btn-secondary"
// Translates to:
// px-6 py-3 bg-white bg-opacity-10 
// hover:bg-opacity-20 backdrop-blur-sm 
// rounded-xl font-semibold transition-all 
// border border-white border-opacity-20
```

### White Canvas Container
```tsx
className="white-canvas-container"
// Translates to:
// bg-white rounded-2xl shadow-2xl
```

## Effects

### Glassmorphism
- **Backdrop Blur**: `backdrop-blur-xl` or `backdrop-blur-lg`
- **Opacity**: 10-40% for backgrounds
- **Borders**: White with 10-20% opacity

### Glow Effects
```css
shadow-lg shadow-orange-500/50  /* Orange glow */
shadow-lg shadow-blue-500/50    /* Blue glow */
shadow-lg shadow-green-500/50   /* Green glow */
shadow-lg shadow-red-500/50     /* Red glow */
```

### Hover Transitions
```css
transition-all hover:scale-105  /* Scale up on hover */
transition-all hover:bg-opacity-20  /* Increase opacity */
```

## Usage Examples

### Modern Card
```tsx
<div className="card hover:border-orange-500 hover:shadow-orange-500/50 transition-all hover:scale-105">
  <h3 className="font-semibold text-orange-400 mb-2">Title</h3>
  <p className="text-sm text-gray-300">Description</p>
</div>
```

### Glass Input
```tsx
<input
  type="text"
  className="w-full px-4 py-3 bg-white bg-opacity-10 backdrop-blur-sm 
             border border-white border-opacity-20 rounded-xl 
             text-white placeholder-gray-400 
             focus:outline-none focus:border-orange-500 focus:bg-opacity-20 
             transition-all"
  placeholder="Enter text..."
/>
```

### Action Button with Glow
```tsx
<button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 
                   rounded-lg flex items-center gap-2 
                   transition-all shadow-lg shadow-blue-500/50 
                   hover:scale-105">
  <Icon className="w-4 h-4" />
  Action
</button>
```

### Role Selector Button
```tsx
<button
  className={`px-3 py-2 rounded-lg border transition-all text-sm ${
    isActive
      ? 'border-orange-500 bg-orange-500 bg-opacity-20 text-white shadow-lg shadow-orange-500/50'
      : 'border-white border-opacity-20 bg-white bg-opacity-10 backdrop-blur-sm text-gray-400 hover:border-opacity-40 hover:bg-opacity-20'
  }`}
>
  {icon} {label}
</button>
```

## Layout Structure

### Page Layout
```tsx
<VantaBackground>
  <Navigation />
  <main className="container mx-auto px-4 py-8">
    {/* Content with glassmorphism cards */}
  </main>
</VantaBackground>
```

### Canvas Layout (White Background)
```tsx
<div className="flex-1 white-canvas-container p-0 overflow-hidden">
  {/* 3D Visualization or ReactFlow */}
</div>
```

## Responsive Design

### Mobile
- Cards stack vertically
- Buttons maintain touch-friendly sizes
- Vanta waves scale appropriately

### Tablet
- Grid layouts (2 columns)
- Sidebar collapses

### Desktop
- Full grid layouts (3+ columns)
- All features visible

## Accessibility

### Contrast Ratios
- White text on black background: ✅ AAA
- Orange buttons: ✅ AA
- Glass elements: ✅ AA (with backdrop)

### Focus States
All interactive elements have:
- `focus:outline-none`
- `focus:border-orange-500`
- Visible focus indicators

### Keyboard Navigation
- Tab order preserved
- All buttons keyboard accessible
- Escape closes modals

## Animation Guidelines

### Hover Effects
```css
transition-all duration-200
hover:scale-105
hover:shadow-lg
```

### Loading States
```css
animate-pulse
animate-spin
```

### Page Transitions
```css
transition-opacity duration-300
```

## Best Practices

### DO ✅
- Use glassmorphism for overlays
- Keep canvas areas white
- Add glow to primary actions
- Use smooth transitions
- Maintain consistent spacing

### DON'T ❌
- Don't use solid backgrounds (except canvas)
- Don't mix too many glow colors
- Don't remove backdrop blur from glass elements
- Don't use harsh transitions
- Don't forget hover states

## Theme Consistency

All components follow:
1. **Black Vanta background** - Always visible
2. **Glassmorphism UI** - Semi-transparent with blur
3. **White canvas** - For work areas
4. **Orange accents** - Primary actions
5. **Smooth animations** - All interactions

---

**Theme**: Modern Glassmorphism with Vanta WAVES
**Status**: Production Ready
**Version**: 1.0.0
