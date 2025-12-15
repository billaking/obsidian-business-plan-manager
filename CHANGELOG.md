# Changelog

All notable changes to the BK Business Plan Manager plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2024-12-15

### Added

#### Executive Summary (🎯 Executive tab) - Phase 2
- **Business Information Card**: Editable fields for business name, tagline, founder, and founded date
- **Mission & Vision Card**: Textarea editors for mission statement and vision statement with auto-save
- **Core Values Management**: 
  - Add new core values with "+ Add Value" button
  - Edit existing values via modal
  - Delete values with confirmation
  - Reorder values using up/down arrows
  - Suggestion chips for common values (Innovation, Integrity, etc.)
- **Market & Value Card**: Editable textareas for target market and unique value proposition
- **Summary Preview**: Live preview showing business name, tagline, mission, vision, and core values
- **Completion Indicator**: Progress bar showing section completion percentage (9 fields tracked)
- **Auto-Save**: All fields save automatically after 500ms of typing or on blur

#### New Components
- `EditCoreValueModal`: Modal for adding/editing core values with suggestion chips
- `renderEditableField()`: Helper for inline-editable text inputs
- `renderEditableTextArea()`: Helper for inline-editable textareas
- `calculateExecutiveCompletion()`: Tracks completion across 9 executive fields

#### New Styles
- Executive card layout (`.bk-exec-card`)
- Info grid for business details (`.bk-exec-info-grid`)
- Editable field styling with focus states (`.bk-field-input`, `.bk-field-textarea`)
- Core values list with drag handles (`.bk-values-list`, `.bk-value-item`)
- Icon buttons for value actions (`.bk-btn-icon`, `.bk-btn-small`)
- Summary preview styling (`.bk-exec-preview`, `.bk-preview-content`)
- Progress bar completion indicator (`.bk-progress-bar`, `.bk-progress-fill`)
- Value suggestion chips (`.bk-suggestion-chip`)

---

## [1.0.0] - 2024-12-15

### Changed

#### Styling Improvements
- **H2 Section Headers**: Added `font-weight: 700` for bolder, more prominent section titles with blue bottom border accent
- **Action Buttons**: Simplified design using flat background (`background-modifier-hover`) instead of bordered card style, with adjusted padding and margins for better visual balance

### Added

#### Multi-Plan Architecture
- Create and manage unlimited business plans
- Each plan has unique ID, name, description, icon, and color
- Switch between plans via dropdown selector in header
- Plan data includes all 9 business sections

#### Plan Manager View (📋 Plans tab)
- View all plans in a responsive card grid
- Plan cards show icon, name, description, stats, and last updated
- Active plan indicator with checkmark badge
- Create, activate, and delete plans directly from the view
- "+ Create New Plan" card with dashed border

#### Template System
- **📄 Blank Plan** - Empty plan for custom setup
- **🔌 Plugin Business** - Pre-configured for WordPress/Obsidian plugin developers
- **☁️ SaaS Business** - Software as a Service template
- **💼 Consulting** - Professional services template
- **❤️ Non-profit** - Mission-driven organization template

#### Dashboard (📊 Dashboard tab)
- Welcome section with business name and mission
- Quick stats grid: Products, Launched, Est. Monthly Revenue, Milestones
- Quick action buttons: Add Product, Add Milestone, Add Revenue, Edit Executive
- Recent milestones list with status indicators
- Products overview with category icons and status badges
- Last updated timestamp

#### Navigation
- 11 section tabs: Plans, Dashboard, Executive, Products, Market, Marketing, Operations, Technology, Financial, Legal, Roadmap
- Responsive design - icons only on mobile
- Active tab highlighting with gradient background

#### Settings Tab
- Plan Management section with plan list
- Create new plan button with modal
- Edit plan details (name, description, icon, color)
- Delete plans with confirmation
- Display options: Show sidebar on startup, Auto-save
- Export all plans to JSON
- Import plans from JSON file
- Reset all data with double confirmation
- About section with plan count

#### Commands
- `Open Business Plan Manager` - Opens the sidebar view
- `Show Dashboard` - Jump to dashboard
- `Show Executive Summary` - Jump to executive section
- `Show Products & Services` - Jump to products section
- `Show Financial Plan` - Jump to financial section
- `Show Roadmap & Milestones` - Jump to roadmap section

#### Data Models
- Complete TypeScript interfaces for all 9 sections
- ExecutiveSummary: businessName, tagline, mission, vision, coreValues, targetMarket, uniqueValue, foundedDate, founder
- Products: id, sku, name, category, description, features, pricingTiers, status, launchDate, tags
- Bundles: productIds, discountPercent, price
- Market Analysis: marketSize, growthRate, trends, competitors, differentiators, opportunities, threats
- Marketing & Sales: channels, funnel stages, pricingStrategy, promotions, partnerships
- Operations: developmentProcess, releaseSchedule, supportChannels, processes
- Technology: stack, licensingSystem, paymentProcessors, analyticsTools
- Financial: revenueStreams, expenses, projections, startupCosts, breakEvenPoint
- Legal: businessStructure, licensingModel, documents, complianceNotes
- Roadmap: milestones, quarterlyGoals, longTermVision

#### Helper Functions
- `generateId()` - Create unique IDs for entities
- `formatCurrency()` - Format numbers as USD currency
- `formatDate()` - Format ISO dates to readable strings
- `calculateMonthlyRevenue()` - Sum revenue streams
- `calculateMonthlyExpenses()` - Sum and normalize expenses
- `getProductsByStatus()` - Filter products by status
- `getMilestonesByStatus()` - Filter milestones by status
- `createNewPlan()` - Create plan from template

#### Styling
- CSS variables for theming (--bk-primary, --bk-success, etc.)
- Dark mode support
- Gradient header with plan selector
- Card-based layouts with hover effects
- Status badges with color coding
- Responsive grid layouts
- Modal styling for create/edit dialogs

---

## Upcoming

### [1.2.0] - Phase 3: Products & Services
- Product CRUD (create, read, update, delete)
- Pricing tiers management
- Product bundles
- Status tracking (idea → development → beta → launched)
- Category organization
- Unique value proposition editor
- Business info editing

### [1.2.0] - Phase 3: Products & Services
- Product CRUD operations
- SKU management
- Pricing tiers with features
- Bundle creation
- Product status workflow

### [1.3.0] - Phase 4: Market Analysis
- Competitor tracking
- SWOT analysis
- Market trends
- Differentiator management

### [1.4.0] - Phase 5: Marketing & Sales
- Channel management
- Sales funnel visualization
- Pricing strategy
- Promotion planning

### [1.5.0] - Phase 6: Operations & Technology
- Process documentation
- Tool tracking with costs
- Tech stack management

### [1.6.0] - Phase 7: Financial Planning
- Revenue stream management
- Expense tracking
- Financial projections
- Break-even analysis

### [1.7.0] - Phase 8: Legal & Compliance
- Document management
- License tracking
- Policy templates

### [1.8.0] - Phase 9: Roadmap & Milestones
- Milestone CRUD
- Timeline visualization
- Quarterly goal setting
- Progress tracking
