# 🎨 BK Business Plan Manager - Design Guide

This document defines the design system, component patterns, and CSS architecture for the BK Business Plan Manager plugin. Reference this guide when building new features to maintain consistency.

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Component Library](#component-library)
6. [CSS Architecture](#css-architecture)
7. [Responsive Design](#responsive-design)
8. [Dark Mode Support](#dark-mode-support)
9. [Animation & Transitions](#animation--transitions)
10. [Accessibility](#accessibility)
11. [Icon Usage](#icon-usage)
12. [Code Patterns](#code-patterns)

---

## Design Philosophy

### Core Principles

1. **Clarity First** - Information should be easy to scan and understand
2. **Consistent Patterns** - Reuse components and patterns across sections
3. **Progressive Disclosure** - Show overview first, details on demand
4. **Mobile-Friendly** - Design for touch and small screens
5. **Obsidian Native** - Respect Obsidian's theming and conventions

### Visual Language

- **Cards** for grouping related content
- **Badges** for status and categories
- **Icons (Emoji)** for visual recognition
- **Gradients** for headers and emphasis
- **Shadows** for depth and hierarchy

---

## Color System

### CSS Variables

```css
.bk-plan-container {
    /* Primary Colors */
    --bk-primary: #3498db;        /* Main brand blue */
    --bk-primary-dark: #2980b9;   /* Darker blue for hover/active */
    
    /* Semantic Colors */
    --bk-success: #27ae60;        /* Green - completed, launched */
    --bk-warning: #f39c12;        /* Orange - in-progress, beta */
    --bk-danger: #e74c3c;         /* Red - delayed, errors, delete */
    --bk-purple: #9b59b6;         /* Purple - ideas, special items */
    
    /* Text Colors */
    --bk-text: var(--text-normal);
    --bk-text-muted: var(--text-muted);
    
    /* Background Colors */
    --bk-bg-light: var(--background-secondary);
    
    /* Border Colors */
    --bk-border: var(--background-modifier-border);
    
    /* Radius */
    --bk-radius: 8px;             /* Standard border radius */
    --bk-radius-lg: 12px;         /* Large radius for cards */
    
    /* Shadow */
    --bk-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

### Color Usage Guide

| Color | Variable | Use Cases |
|-------|----------|-----------|
| Blue | `--bk-primary` | Primary buttons, links, active states, headers |
| Dark Blue | `--bk-primary-dark` | Hover states, gradients |
| Green | `--bk-success` | Completed, launched, success messages |
| Orange | `--bk-warning` | In-progress, beta, warnings |
| Red | `--bk-danger` | Delayed, errors, delete buttons |
| Purple | `--bk-purple` | Ideas, special categories |

### Status Color Mapping

```css
/* Product Status */
.product-status.launched    { color: var(--bk-success); }
.product-status.development { color: var(--bk-primary); }
.product-status.beta        { color: var(--bk-warning); }
.product-status.idea        { color: var(--bk-purple); }
.product-status.retired     { color: var(--bk-text-muted); }

/* Milestone Status */
.milestone-item.completed   { border-left-color: var(--bk-success); }
.milestone-item.in-progress { border-left-color: var(--bk-warning); }
.milestone-item.delayed     { border-left-color: var(--bk-danger); }
.milestone-item.planned     { border-left-color: var(--bk-border); }
```

---

## Typography

### Font Sizes

```css
/* Headings */
h1 { font-size: 1.5em; }    /* Main page title */
h2 { font-size: 1.3em; }    /* Section titles */
h3 { font-size: 1.1em; }    /* Subsection titles */

/* Body Text */
.body-text { font-size: 1em; }
.small-text { font-size: 0.9em; }
.tiny-text { font-size: 0.85em; }
.micro-text { font-size: 0.8em; }

/* Special */
.stat-value { font-size: 1.5em; }
.stat-label { font-size: 0.85em; }
```

### Font Weights

```css
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
```

### Text Styles

- **Headers**: Bold (700), normal color
- **Labels**: Medium (500), muted color
- **Body**: Normal (400), normal color
- **Descriptions**: Normal (400), muted color, italic optional
- **Stats**: Bold (700), primary color

---

## Spacing & Layout

### Spacing Scale

```css
/* Padding/Margin scale (use consistently) */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 12px;
--space-lg: 16px;
--space-xl: 20px;
--space-2xl: 24px;
--space-3xl: 32px;
--space-4xl: 40px;
```

### Common Spacing Patterns

```css
/* Section spacing */
.bk-section { margin-bottom: 24px; }

/* Card padding */
.card-padding { padding: 16px; }
.card-padding-lg { padding: 20px 24px; }

/* Grid gaps */
.grid-gap-sm { gap: 8px; }
.grid-gap-md { gap: 12px; }
.grid-gap-lg { gap: 16px; }
.grid-gap-xl { gap: 20px; }
```

### Layout Patterns

#### Grid Layouts

```css
/* Stats Grid - Auto-fit columns */
.bk-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 16px;
}

/* Plans Grid - Fixed minimum */
.bk-plans-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
}

/* Template Grid */
.bk-template-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
}

/* Actions Grid */
.bk-actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
}
```

#### Flex Layouts

```css
/* Horizontal centering */
.flex-center {
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Space between */
.flex-between {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

/* Column layout */
.flex-column {
    display: flex;
    flex-direction: column;
}

/* Wrap navigation */
.bk-plan-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    justify-content: center;
}
```

---

## Component Library

### 1. Header Component

```css
.bk-plan-header {
    padding: 20px 24px;
    background: linear-gradient(135deg, #3498db, #2980b9);
    color: white;
    text-align: center;
}
```

**Structure:**
```html
<div class="bk-plan-header">
    <div class="bk-plan-title-row">
        <h1>📊 Title</h1>
        <div class="bk-plan-selector">...</div>
    </div>
    <p class="bk-plan-subtitle">Subtitle text</p>
</div>
```

### 2. Navigation Tabs

```css
.bk-nav-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border: none;
    background: transparent;
    border-radius: var(--bk-radius);
    cursor: pointer;
    transition: all 0.2s ease;
}

.bk-nav-btn.active {
    background: linear-gradient(135deg, #3498db, #2980b9);
    color: white;
    box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
}
```

**Structure:**
```html
<button class="bk-nav-btn active">
    <span class="nav-icon">📊</span>
    <span class="nav-label">Dashboard</span>
</button>
```

### 3. Stat Card

```css
.bk-stat-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 20px 16px;
    background: var(--background-primary);
    border: 1px solid var(--bk-border);
    border-radius: var(--bk-radius-lg);
    box-shadow: var(--bk-shadow);
    transition: transform 0.2s ease;
}

.bk-stat-card:hover {
    transform: translateY(-3px);
}
```

**Structure:**
```html
<div class="bk-stat-card">
    <span class="stat-icon">📦</span>
    <span class="stat-value">12</span>
    <span class="stat-label">Products</span>
</div>
```

### 4. Action Button

```css
.bk-action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px;
    border: 2px solid var(--bk-border);
    border-radius: var(--bk-radius);
    background: var(--background-primary);
    cursor: pointer;
    transition: all 0.2s ease;
}

.bk-action-btn:hover {
    border-color: var(--bk-primary);
    background: rgba(52, 152, 219, 0.08);
    transform: translateY(-2px);
}
```

**Structure:**
```html
<button class="bk-action-btn">
    <span class="action-icon">➕</span>
    <span class="action-label">Add Product</span>
</button>
```

### 5. List Item

```css
.bk-list-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: var(--background-primary);
    border: 1px solid var(--bk-border);
    border-radius: var(--bk-radius);
    transition: all 0.2s ease;
}

.bk-list-item:hover {
    border-color: var(--bk-primary);
}
```

**Structure:**
```html
<div class="bk-list-item">
    <span class="item-icon">📦</span>
    <span class="item-title">Item Name</span>
    <span class="item-badge status-launched">Launched</span>
</div>
```

### 6. Plan Card

```css
.bk-plan-card {
    background: var(--background-primary);
    border: 2px solid var(--bk-border);
    border-radius: var(--bk-radius-lg);
    overflow: hidden;
    transition: all 0.2s ease;
}

.bk-plan-card:hover {
    box-shadow: var(--bk-shadow);
    transform: translateY(-2px);
}

.bk-plan-card.is-active {
    border-color: var(--bk-primary);
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}
```

**Structure:**
```html
<div class="bk-plan-card is-active">
    <div class="plan-card-header">
        <span class="plan-card-icon">📊</span>
        <span class="plan-card-name">Plan Name</span>
        <span class="plan-card-active">✓</span>
    </div>
    <div class="plan-card-info">
        <p class="plan-card-desc">Description</p>
        <div class="plan-card-stats">...</div>
        <span class="plan-card-date">Updated: Dec 15, 2024</span>
    </div>
    <div class="plan-card-actions">
        <button class="mod-cta">Activate</button>
        <button class="plan-delete-btn">🗑️</button>
    </div>
</div>
```

### 7. Status Badge

```css
.status-badge {
    font-size: 0.75em;
    padding: 4px 10px;
    border-radius: 12px;
    font-weight: 500;
    text-transform: capitalize;
}

/* Color variants */
.status-badge.launched {
    background: rgba(39, 174, 96, 0.15);
    color: var(--bk-success);
}

.status-badge.development {
    background: rgba(52, 152, 219, 0.15);
    color: var(--bk-primary);
}

.status-badge.beta {
    background: rgba(243, 156, 18, 0.15);
    color: var(--bk-warning);
}
```

### 8. Section Header

```css
.bk-section h2 {
    margin: 0 0 16px 0;
    font-size: 1.3em;
    color: var(--bk-text);
    border-bottom: 2px solid var(--bk-primary);
    padding-bottom: 8px;
}
```

### 9. Empty State

```css
.bk-empty-state {
    padding: 40px 24px;
    text-align: center;
}

.bk-empty-icon {
    font-size: 4em;
    margin-bottom: 16px;
}
```

**Structure:**
```html
<div class="bk-empty-state">
    <div class="bk-empty-icon">📋</div>
    <h2>No Items Yet</h2>
    <p>Description of what to do</p>
    <button class="mod-cta">Create First Item</button>
</div>
```

### 10. Modal Dialog

```css
.bkbpm-modal {
    padding: 20px;
}

.bkbpm-modal h2 {
    margin: 0 0 20px 0;
}

.bkbpm-modal-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
}
```

---

## CSS Architecture

### File Structure

```
styles.css
├── CSS Variables
├── Main Container
├── Header
├── Navigation
├── Content Area
├── Sections
├── Welcome Section
├── Stats Grid
├── Quick Actions
├── List Components
├── Card Components
├── Status Badges
├── Footer
├── Placeholders
├── Plan Selector
├── Empty State
├── Template Grid
├── Plan Manager
├── Settings Styles
├── Modal Styles
└── Responsive Overrides
```

### Naming Conventions

**BEM-like Pattern:**
```css
/* Block */
.bk-plan-card { }

/* Element */
.plan-card-header { }
.plan-card-info { }
.plan-card-actions { }

/* Modifier */
.bk-plan-card.is-active { }
```

**Prefixes:**
- `bk-` - Main plugin components
- `bkbpm-` - Settings/modal specific
- `plan-` - Plan card elements
- `stat-` - Stat card elements
- `nav-` - Navigation elements
- `action-` - Action button elements
- `milestone-` - Milestone item elements
- `product-` - Product item elements
- `template-` - Template card elements

### CSS Class Categories

| Prefix | Purpose | Example |
|--------|---------|---------|
| `bk-` | Plugin blocks | `bk-plan-container` |
| `is-` | State modifiers | `is-active` |
| `has-` | Feature modifiers | `has-border` |
| `mod-` | Obsidian modifiers | `mod-cta` |

---

## Responsive Design

### Breakpoints

```css
/* Mobile: < 600px */
@media (max-width: 600px) { }

/* Tablet: 600px - 900px */
@media (min-width: 600px) and (max-width: 900px) { }

/* Desktop: > 900px */
@media (min-width: 900px) { }
```

### Mobile Adaptations

```css
@media (max-width: 600px) {
    /* Smaller header */
    .bk-plan-header {
        padding: 16px;
    }
    
    .bk-plan-header h1 {
        font-size: 1.3em;
    }
    
    /* Icon-only navigation */
    .bk-nav-btn .nav-label {
        display: none;
    }
    
    .bk-nav-btn {
        padding: 10px 12px;
    }
    
    .bk-nav-btn .nav-icon {
        font-size: 1.3em;
    }
    
    /* Reduced content padding */
    .bk-plan-content {
        padding: 16px;
    }
    
    /* 2-column stats */
    .bk-stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
```

### Responsive Grid Rules

| Component | Desktop | Tablet | Mobile |
|-----------|---------|--------|--------|
| Stats Grid | 4 columns | 3 columns | 2 columns |
| Plans Grid | 3 columns | 2 columns | 1 column |
| Actions Grid | 4 columns | 2 columns | 2 columns |
| Templates | 5 columns | 3 columns | 2 columns |

---

## Dark Mode Support

### Theme Detection

Obsidian applies `.theme-dark` class to the body in dark mode.

```css
/* Light mode default */
.bk-welcome-section {
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
}

/* Dark mode override */
.theme-dark .bk-welcome-section {
    background: linear-gradient(135deg, #2c3e50, #34495e);
}
```

### Color Adjustments for Dark Mode

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Card backgrounds | `--background-primary` | Auto-adapts |
| Borders | `--background-modifier-border` | Auto-adapts |
| Text | `--text-normal` | Auto-adapts |
| Shadows | `rgba(0,0,0,0.1)` | `rgba(0,0,0,0.3)` |
| Primary tints | `rgba(52,152,219,0.08)` | `rgba(52,152,219,0.15)` |

---

## Animation & Transitions

### Standard Transition

```css
transition: all 0.2s ease;
```

### Hover Effects

```css
/* Lift effect */
.card:hover {
    transform: translateY(-2px);
    box-shadow: var(--bk-shadow);
}

/* Stronger lift */
.stat-card:hover {
    transform: translateY(-3px);
}

/* Border highlight */
.list-item:hover {
    border-color: var(--bk-primary);
}

/* Background tint */
.btn:hover {
    background: rgba(52, 152, 219, 0.08);
}
```

### Click Feedback

```css
.btn:active {
    transform: translateY(0);
}
```

---

## Accessibility

### Focus States

```css
.bk-nav-btn:focus,
.bk-action-btn:focus {
    outline: 2px solid var(--bk-primary);
    outline-offset: 2px;
}
```

### Color Contrast

- Text on white: Use `--text-normal` (high contrast)
- Text on primary: Use `white`
- Muted text: Use `--text-muted` (reduced contrast, decorative only)

### Interactive Elements

- Minimum touch target: 44px × 44px
- Clear hover/focus states
- Cursor: pointer for clickable elements

---

## Icon Usage

### Emoji Icons

We use emoji for visual icons to avoid external dependencies.

**Section Icons:**
| Section | Icon |
|---------|------|
| Plans | 📋 |
| Dashboard | 📊 |
| Executive | 🎯 |
| Products | 📦 |
| Market | 📈 |
| Marketing | 📣 |
| Operations | ⚙️ |
| Technology | 💻 |
| Financial | 💰 |
| Legal | 📜 |
| Roadmap | 🗺️ |

**Status Icons:**
| Status | Icon |
|--------|------|
| Completed | ✅ |
| In Progress | 🔄 |
| Planned | 📋 |
| Delayed | ⚠️ |
| Active | ✓ |

**Category Icons:**
| Category | Icon |
|----------|------|
| WordPress | 🔷 |
| Obsidian | 💎 |
| Service | 🛠️ |
| Other | 📦 |

**Action Icons:**
| Action | Icon |
|--------|------|
| Add | ➕ |
| Edit | ✏️ |
| Delete | 🗑️ |
| Export | 📤 |
| Import | 📥 |

**Template Icons:**
| Template | Icon |
|----------|------|
| Blank | 📄 |
| Plugin Business | 🔌 |
| SaaS | ☁️ |
| Consulting | 💼 |
| Non-profit | ❤️ |

---

## Code Patterns

### Creating Elements (TypeScript)

```typescript
// Creating a div with class
const container = parentEl.createDiv({ cls: 'bk-section' });

// Creating element with text
container.createEl('h2', { text: '📊 Dashboard' });

// Creating element with multiple classes
const card = container.createDiv({ cls: 'bk-stat-card highlighted' });

// Creating span with class
card.createEl('span', { text: '📦', cls: 'stat-icon' });

// Adding class after creation
element.addClass('is-active');

// Creating button with click handler
const btn = container.createEl('button', { 
    text: 'Click Me', 
    cls: 'mod-cta' 
});
btn.addEventListener('click', () => { /* handler */ });
```

### Render Pattern

```typescript
private renderSection(container: HTMLElement) {
    const section = container.createDiv({ cls: 'bk-section' });
    
    // Header
    section.createEl('h2', { text: '📊 Section Title' });
    
    // Content
    const content = section.createDiv({ cls: 'bk-section-content' });
    
    // Grid/List
    const grid = content.createDiv({ cls: 'bk-grid' });
    
    // Items
    items.forEach(item => {
        this.renderItem(grid, item);
    });
}
```

### Save Pattern

```typescript
async saveField(field: string, value: any) {
    const plan = this.getActivePlan();
    if (!plan) return;
    
    // Update field
    plan[field] = value;
    plan.lastUpdated = new Date().toISOString();
    
    // Save
    await this.plugin.saveSettings();
    
    // Optional: Refresh view
    this.refresh();
}
```

---

## Checklist for New Components

When adding a new component:

- [ ] Follow BEM-like naming with `bk-` prefix
- [ ] Use CSS variables for colors
- [ ] Add hover/focus states
- [ ] Include transition animations
- [ ] Test dark mode appearance
- [ ] Test responsive behavior
- [ ] Use emoji icons consistently
- [ ] Follow spacing scale
- [ ] Document in this guide

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-12-15 | Initial design system |

---

*This guide should be updated as new components and patterns are added to the plugin.*
