# BK Business Plan Manager - Developer Guide

> Technical documentation for developers contributing to or extending the plugin.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Development Setup](#development-setup)
- [Core Concepts](#core-concepts)
- [Data Models](#data-models)
- [Component Architecture](#component-architecture)
- [Styling System](#styling-system)
- [Adding New Features](#adding-new-features)
- [Testing](#testing)
- [Build & Release](#build--release)
- [Contributing Guidelines](#contributing-guidelines)

---

## Architecture Overview

### Technology Stack

| Layer | Technology |
|-------|------------|
| Runtime | Obsidian Plugin API |
| Language | TypeScript 4.x |
| Build Tool | esbuild |
| UI Framework | Vanilla DOM + Obsidian Components |
| Data Storage | Plugin Settings (data.json) |
| Styling | CSS with Custom Properties |

### Design Principles

1. **Multi-Plan Architecture**: Support unlimited business plans per vault
2. **Template-Driven**: Pre-built templates for common business types
3. **Obsidian-Native**: Follow Obsidian UI/UX conventions
4. **Data Portability**: JSON import/export for all plans
5. **Progressive Enhancement**: Graceful degradation for missing data

---

## Project Structure

```
bk-business-plan-manager/
├── main.ts                 # Plugin entry point
├── src/
│   ├── planData.ts         # Data models & helpers
│   ├── planView.ts         # Main sidebar view
│   └── settings.ts         # Settings tab & modals
├── styles.css              # All plugin styles
├── manifest.json           # Plugin metadata
├── package.json            # NPM dependencies
├── tsconfig.json           # TypeScript config
├── esbuild.config.mjs      # Build configuration
├── README.md               # User-facing docs
├── CHANGELOG.md            # Version history
├── DESIGNGUIDE.md          # Design system
├── LICENSE.md              # Commercial license
├── DEVELOPERSGUIDE.md      # This file
└── USERGUIDE.md            # End-user guide
```

### File Responsibilities

| File | Purpose |
|------|---------|
| `main.ts` | Plugin lifecycle, commands, settings management |
| `src/planData.ts` | TypeScript interfaces, data factories, utilities |
| `src/planView.ts` | ItemView implementation, UI rendering, event handling |
| `src/settings.ts` | PluginSettingTab, modals, import/export |
| `styles.css` | CSS variables, component styles, responsive design |

---

## Development Setup

### Prerequisites

- Node.js 16+ and npm
- Basic Obsidian plugin development knowledge
- TypeScript familiarity

### Installation

```bash
# Clone or navigate to plugin directory
cd /path/to/vault/.obsidian/plugins/bk-business-plan-manager

# Install dependencies
npm install

# Build the plugin
npm run build

# Development mode with hot reload
npm run dev
```

### NPM Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `build` | `node esbuild.config.mjs production` | Production build |
| `dev` | `node esbuild.config.mjs` | Development build with watch |

### Local Testing

1. Enable the plugin in Obsidian Settings → Community Plugins
2. Use `Cmd/Ctrl + P` → "Reload app without saving" to refresh
3. Check Developer Console (`Cmd/Ctrl + Shift + I`) for errors

---

## Core Concepts

### Plugin Lifecycle

```typescript
// main.ts
export default class BKBusinessPlanPlugin extends Plugin {
    settings: BKBusinessPlanSettings;

    async onload() {
        // 1. Load saved settings
        await this.loadSettings();
        
        // 2. Register the sidebar view
        this.registerView(VIEW_TYPE_PLAN, (leaf) => 
            new PlanView(leaf, this)
        );
        
        // 3. Add ribbon icon
        this.addRibbonIcon('briefcase', 'Business Plan Manager', ...);
        
        // 4. Register commands
        this.addCommand({ ... });
        
        // 5. Add settings tab
        this.addSettingTab(new BKBusinessPlanSettingTab(this.app, this));
    }

    async onunload() {
        // Cleanup when plugin is disabled
    }
}
```

### View Registration

The plugin uses Obsidian's `ItemView` for the sidebar panel:

```typescript
export const VIEW_TYPE_PLAN = 'bk-business-plan-view';

// Registration
this.registerView(VIEW_TYPE_PLAN, (leaf) => new PlanView(leaf, this));

// Activation
this.app.workspace.getRightLeaf(false)?.setViewState({
    type: VIEW_TYPE_PLAN,
    active: true,
});
```

### Settings Persistence

Settings are automatically persisted to `data.json`:

```typescript
async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
}

async saveSettings() {
    await this.saveData(this.settings);
}
```

---

## Data Models

### BusinessPlan Interface

```typescript
// src/planData.ts

export interface BusinessPlan {
    // Identity (Phase 1)
    id: string;                    // UUID
    name: string;                  // Display name
    description: string;           // Short description
    icon: string;                  // Emoji icon
    color: string;                 // Theme color (hex)
    createdAt: number;             // Unix timestamp
    
    // Business Info
    businessName: string;
    tagline: string;
    founder: string;
    foundedDate: string;
    
    // Executive Summary
    mission: string;
    vision: string;
    coreValues: string[];
    targetMarket: string;
    uniqueValueProposition: string;
    
    // Products & Services
    products: Product[];
    
    // Market Analysis
    marketSize: string;
    competitors: Competitor[];
    swotAnalysis: SWOTAnalysis;
    
    // Marketing
    marketingChannels: MarketingChannel[];
    salesStrategy: string;
    pricingStrategy: string;
    
    // Operations
    operationalPlan: string;
    keyProcesses: string[];
    
    // Technology
    techStack: TechStackItem[];
    infrastructure: string;
    
    // Financial
    financialProjections: FinancialProjection[];
    fundingRequirements: string;
    revenueModel: string;
    
    // Legal
    legalStructure: string;
    licenses: License[];
    intellectualProperty: string;
    
    // Roadmap
    milestones: Milestone[];
    currentPhase: string;
}
```

### Supporting Types

```typescript
export interface Product {
    id: string;
    name: string;
    description: string;
    price: string;
    status: 'concept' | 'development' | 'launched' | 'retired';
}

export interface Competitor {
    id: string;
    name: string;
    strengths: string;
    weaknesses: string;
    marketShare: string;
}

export interface Milestone {
    id: string;
    title: string;
    description: string;
    targetDate: string;
    status: 'not-started' | 'in-progress' | 'completed' | 'delayed';
    dependencies: string[];
}

export type PlanTemplate = 'blank' | 'plugin-business' | 'saas' | 'consulting' | 'nonprofit';
```

### Factory Functions

```typescript
// Create new plan with template
export function createNewPlan(
    name: string, 
    template: PlanTemplate = 'blank'
): BusinessPlan {
    const basePlan: BusinessPlan = {
        id: generateId(),
        name,
        createdAt: Date.now(),
        // ... defaults
    };
    
    // Apply template-specific values
    switch (template) {
        case 'plugin-business':
            return { ...basePlan, ...getPluginBusinessTemplate() };
        case 'saas':
            return { ...basePlan, ...getSaaSTemplate() };
        // ...
    }
    
    return basePlan;
}

// Generate UUID
export function generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
```

---

## Component Architecture

### PlanView Structure

The main view is organized into sections:

```typescript
// src/planView.ts

export class PlanView extends ItemView {
    plugin: BKBusinessPlanPlugin;
    activeTab: string = 'dashboard';
    
    async onOpen() {
        this.render();
    }
    
    render() {
        const container = this.containerEl.children[1];
        container.empty();
        container.addClass('bk-business-plan-container');
        
        // 1. Header with plan selector
        this.renderHeader(container);
        
        // 2. Navigation tabs
        this.renderNavigation(container);
        
        // 3. Content area (based on activeTab)
        this.renderContent(container);
    }
}
```

### Tab System

```typescript
const NAV_ITEMS = [
    { id: 'plans', label: 'Plans', icon: '📋' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'executive', label: 'Executive', icon: '🎯' },
    { id: 'products', label: 'Products', icon: '📦' },
    { id: 'market', label: 'Market', icon: '📈' },
    { id: 'marketing', label: 'Marketing', icon: '📣' },
    { id: 'operations', label: 'Operations', icon: '⚙️' },
    { id: 'technology', label: 'Technology', icon: '💻' },
    { id: 'financial', label: 'Financial', icon: '💰' },
    { id: 'legal', label: 'Legal', icon: '⚖️' },
    { id: 'roadmap', label: 'Roadmap', icon: '🗺️' },
];

renderContent(container: HTMLElement) {
    const contentEl = container.createDiv({ cls: 'bk-content' });
    
    switch (this.activeTab) {
        case 'plans':
            this.renderPlanManager(contentEl);
            break;
        case 'dashboard':
            this.renderDashboard(contentEl);
            break;
        // ... other tabs
    }
}
```

### Modal Pattern

```typescript
// Quick create modal example
export class QuickCreatePlanModal extends Modal {
    plugin: BKBusinessPlanPlugin;
    onSuccess: () => void;
    
    constructor(app: App, plugin: BKBusinessPlanPlugin, onSuccess: () => void) {
        super(app);
        this.plugin = plugin;
        this.onSuccess = onSuccess;
    }
    
    onOpen() {
        const { contentEl } = this;
        contentEl.addClass('bk-modal');
        
        // Modal content
        contentEl.createEl('h2', { text: 'Create New Plan' });
        
        // Form fields using Obsidian's Setting component
        new Setting(contentEl)
            .setName('Plan Name')
            .addText(text => text
                .setPlaceholder('My Business Plan')
                .onChange(value => this.planName = value)
            );
        
        // Submit button
        new Setting(contentEl)
            .addButton(btn => btn
                .setButtonText('Create')
                .setCta()
                .onClick(() => this.createPlan())
            );
    }
    
    onClose() {
        this.contentEl.empty();
    }
}
```

---

## Styling System

### CSS Variables

All colors and sizes use CSS custom properties for consistency:

```css
/* styles.css */

.bk-business-plan-container {
    /* Colors */
    --bk-primary: #7c3aed;
    --bk-primary-hover: #6d28d9;
    --bk-success: #10b981;
    --bk-warning: #f59e0b;
    --bk-danger: #ef4444;
    --bk-text: var(--text-normal);
    --bk-text-muted: var(--text-muted);
    --bk-bg: var(--background-primary);
    --bk-bg-secondary: var(--background-secondary);
    --bk-border: var(--background-modifier-border);
    
    /* Spacing */
    --bk-spacing-xs: 4px;
    --bk-spacing-sm: 8px;
    --bk-spacing-md: 16px;
    --bk-spacing-lg: 24px;
    --bk-spacing-xl: 32px;
    
    /* Border Radius */
    --bk-radius-sm: 4px;
    --bk-radius-md: 8px;
    --bk-radius-lg: 12px;
}
```

### BEM Naming Convention

Follow BEM for class naming:

```css
/* Block */
.bk-plan-card { }

/* Element */
.bk-plan-card__header { }
.bk-plan-card__title { }
.bk-plan-card__actions { }

/* Modifier */
.bk-plan-card--active { }
.bk-plan-card--compact { }
```

### Button Standards

All buttons with icons and labels should follow this pattern for consistent spacing and alignment:

#### Action Buttons (Icon + Label)

```css
.bk-action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 24px 16px;
    min-height: 100px;
    background: var(--bk-bg-card);
    border: 1px solid var(--bk-border);
    border-radius: var(--bk-radius-lg);
    cursor: pointer;
    transition: var(--bk-transition-bounce);
    position: relative;
    /* IMPORTANT: Do NOT use overflow: hidden - it clips content */
}

.bk-action-btn .action-icon {
    font-size: 1.8em;
    line-height: 1;
    transition: var(--bk-transition);
}

.bk-action-btn .action-label {
    font-size: 0.9em;
    font-weight: 600;
    color: var(--bk-text);
    line-height: 1.2;
}
```

#### Key Rules for Action Buttons

| Rule | Reason |
|------|--------|
| **Never use `overflow: hidden`** | Clips emoji icons and text labels |
| **Use `justify-content: center`** | Vertically centers content |
| **Set `min-height`** | Ensures consistent button sizing |
| **Use `gap` for spacing** | Cleaner than margins on children |
| **`line-height: 1` on icons** | Prevents extra space around emojis |

#### Gradient Buttons

When using gradient backgrounds on buttons, **always set explicit white text**:

```css
.my-gradient-btn {
    background: var(--bk-gradient);
    color: white !important;  /* Required - prevents black text inheritance */
    border: none;
}
```

### Dark Mode Support

Use Obsidian's CSS variables for automatic dark mode:

```css
/* These adapt to light/dark automatically */
background: var(--background-primary);
color: var(--text-normal);
border: 1px solid var(--background-modifier-border);
```

---

## Adding New Features

### Adding a New Tab

1. **Add to NAV_ITEMS** in `planView.ts`:

```typescript
const NAV_ITEMS = [
    // ... existing tabs
    { id: 'newtab', label: 'New Tab', icon: '🆕' },
];
```

2. **Add render method**:

```typescript
renderNewTab(container: HTMLElement) {
    const section = container.createDiv({ cls: 'bk-section' });
    section.createEl('h2', { text: 'New Tab' });
    // ... content
}
```

3. **Add to switch statement**:

```typescript
case 'newtab':
    this.renderNewTab(contentEl);
    break;
```

4. **Add styles** in `styles.css`:

```css
.bk-newtab-specific-class {
    /* styles */
}
```

### Adding a New Data Field

1. **Update interface** in `planData.ts`:

```typescript
export interface BusinessPlan {
    // ... existing fields
    newField: string;
    newArrayField: NewType[];
}
```

2. **Update DEFAULT_PLAN**:

```typescript
export const DEFAULT_PLAN: BusinessPlan = {
    // ... existing defaults
    newField: '',
    newArrayField: [],
};
```

3. **Update templates** if needed:

```typescript
function getSaaSTemplate(): Partial<BusinessPlan> {
    return {
        // ... existing template values
        newField: 'SaaS default value',
    };
}
```

4. **Add UI for editing** in the appropriate tab render method.

### Adding a New Command

```typescript
// main.ts - in onload()

this.addCommand({
    id: 'new-command-id',
    name: 'New Command Name',
    callback: () => {
        // Command logic
    },
    // Optional: Add hotkey
    hotkeys: [{ modifiers: ['Mod', 'Shift'], key: 'n' }],
});
```

### Adding a New Setting

```typescript
// settings.ts - in display()

new Setting(containerEl)
    .setName('New Setting')
    .setDesc('Description of what this setting does')
    .addToggle(toggle => toggle
        .setValue(this.plugin.settings.newSetting)
        .onChange(async (value) => {
            this.plugin.settings.newSetting = value;
            await this.plugin.saveSettings();
        })
    );
```

---

## Testing

### Manual Testing Checklist

- [ ] Create new plan with each template
- [ ] Switch between multiple plans
- [ ] Edit plan properties
- [ ] Delete plan (verify confirmation)
- [ ] Export plan to JSON
- [ ] Import plan from JSON
- [ ] All tabs render correctly
- [ ] Settings save and persist
- [ ] Plugin loads on restart
- [ ] Works in both light and dark themes

### Console Debugging

```typescript
// Add debug logging
console.log('BK Business Plan:', { 
    settings: this.plugin.settings,
    activePlan: this.plugin.getActivePlan() 
});
```

### Error Handling

Always wrap async operations:

```typescript
try {
    await this.plugin.saveSettings();
    new Notice('Saved successfully');
} catch (error) {
    console.error('BK Business Plan Error:', error);
    new Notice('Failed to save: ' + error.message);
}
```

---

## Build & Release

### Production Build

```bash
npm run build
```

This creates:
- `main.js` - Bundled JavaScript
- `manifest.json` - Plugin metadata
- `styles.css` - Stylesheet

### Version Bump

1. Update version in `manifest.json`:
```json
{
    "version": "1.1.0"
}
```

2. Update version in `package.json`:
```json
{
    "version": "1.1.0"
}
```

3. Update `CHANGELOG.md` with changes

### Release Checklist

- [ ] All features implemented and tested
- [ ] CHANGELOG.md updated
- [ ] Version numbers synced
- [ ] README.md reflects new features
- [ ] Build produces no errors
- [ ] Plugin loads in fresh vault

---

## Contributing Guidelines

### Code Style

- Use TypeScript strict mode
- Follow existing naming conventions
- Document public methods with JSDoc
- Keep functions focused and small
- Use meaningful variable names

### Commit Messages

Follow conventional commits:

```
feat: Add new milestone tracking feature
fix: Resolve plan deletion confirmation bug
docs: Update developer guide
style: Format CSS according to guidelines
refactor: Extract plan card into component
```

### Pull Request Process

1. Create feature branch from `main`
2. Implement changes with tests
3. Update documentation
4. Submit PR with clear description
5. Address review feedback
6. Squash and merge when approved

### Code Review Focus Areas

- Type safety and null checks
- Error handling
- UI consistency with design guide
- Performance (avoid unnecessary re-renders)
- Accessibility considerations

---

## API Reference

### Plugin Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `getActivePlan()` | `BusinessPlan \| undefined` | Get currently selected plan |
| `loadSettings()` | `Promise<void>` | Load settings from disk |
| `saveSettings()` | `Promise<void>` | Persist settings to disk |

### View Methods

| Method | Description |
|--------|-------------|
| `render()` | Re-render entire view |
| `setActiveTab(tabId)` | Switch to specified tab |
| `refreshPlanSelector()` | Update plan dropdown |

### Utility Functions

| Function | Returns | Description |
|----------|---------|-------------|
| `generateId()` | `string` | Generate UUID |
| `createNewPlan(name, template)` | `BusinessPlan` | Factory for new plans |
| `formatDate(timestamp)` | `string` | Format Unix timestamp |

---

## Resources

- [Obsidian Plugin API Docs](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [esbuild Documentation](https://esbuild.github.io/)
- [DESIGNGUIDE.md](./DESIGNGUIDE.md) - Visual design system

---

## Support

For development questions or issues:

- Check existing GitHub issues
- Review this documentation
- Contact: [YOUR DEVELOPER EMAIL]

---

*Last Updated: December 2024*
