# AssetDesk Sidebar Integration Guide

## Quick Start

1. **Include the CSS file** in your project:
   ```html
   <link rel="stylesheet" href="sidebar-styles.css">
   ```

2. **Copy the HTML structure** from `sidebar-template.html`

3. **Add JavaScript** for toggle functionality (included in template)

## Key Features

- **Responsive Design**: Auto-collapses on mobile devices
- **Smooth Animations**: CSS transitions for all state changes
- **Accessible**: Proper focus states and keyboard navigation
- **Customizable**: CSS variables for easy theming

## CSS Variables to Customize

```css
:root {
  --primary-600: #2563eb;    /* Main brand color */
  --primary-700: #1d4ed8;    /* Hover state */
  --primary-50: #eff6ff;     /* Active background */
  --primary-200: #bfdbfe;    /* Active border */
}
```

## JavaScript API

```javascript
// Toggle sidebar
toggleSidebar()

// Close sidebar
closeSidebar()

// Check if collapsed
document.getElementById('sidebar').classList.contains('collapsed')
```

## Framework Integration

### React
```jsx
const [collapsed, setCollapsed] = useState(false);
<aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
```

### Vue
```vue
<aside :class="['sidebar', { collapsed: isCollapsed }]">
```

### Angular
```html
<aside class="sidebar" [class.collapsed]="collapsed">
```

## Mobile Behavior

- Sidebar becomes fixed overlay on screens < 768px
- Auto-collapses on mobile for better UX
- Swipe gestures can be added for mobile interaction