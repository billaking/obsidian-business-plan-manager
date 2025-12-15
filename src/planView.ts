// ===========================================
// BK Business Plan Manager - Main View
// ===========================================

import { App, ItemView, WorkspaceLeaf, Notice, Modal, Setting } from 'obsidian';
import BKBusinessPlanPlugin from '../main';
import {
	BusinessPlan,
	formatCurrency,
	formatDate,
	calculateMonthlyRevenue,
	calculateMonthlyExpenses,
	getProductsByStatus,
	getMilestonesByStatus,
	createNewPlan,
	PlanTemplate
} from './planData';

export const VIEW_TYPE_BUSINESS_PLAN = 'bk-business-plan-view';

type Section = 'plans' | 'dashboard' | 'executive' | 'products' | 'market' | 'marketing' | 'operations' | 'technology' | 'financial' | 'legal' | 'roadmap';

export class BusinessPlanView extends ItemView {
	plugin: BKBusinessPlanPlugin;
	activeSection: Section = 'plans';

	constructor(leaf: WorkspaceLeaf, plugin: BKBusinessPlanPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return VIEW_TYPE_BUSINESS_PLAN;
	}

	getDisplayText(): string {
		return 'Business Plan';
	}

	getIcon(): string {
		return 'briefcase';
	}

	async onOpen() {
		this.render();
	}

	async onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	refresh() {
		this.render();
	}

	private getActivePlan(): BusinessPlan | null {
		return this.plugin.getActivePlan();
	}

	render() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('bk-plan-container');

		// Header with Plan Selector
		this.renderHeader(contentEl);

		// If no plans exist, show create plan view
		if (this.plugin.settings.plans.length === 0) {
			this.renderNoPlanView(contentEl);
			return;
		}

		// Navigation
		this.renderNavigation(contentEl);

		// Main Content
		const mainContent = contentEl.createDiv({ cls: 'bk-plan-content' });
		
		switch (this.activeSection) {
			case 'plans':
				this.renderPlanManager(mainContent);
				break;
			case 'dashboard':
				this.renderDashboard(mainContent);
				break;
			case 'executive':
				this.renderExecutive(mainContent);
				break;
			case 'products':
				this.renderProducts(mainContent);
				break;
			case 'market':
				this.renderMarket(mainContent);
				break;
			case 'marketing':
				this.renderMarketing(mainContent);
				break;
			case 'operations':
				this.renderOperations(mainContent);
				break;
			case 'technology':
				this.renderTechnology(mainContent);
				break;
			case 'financial':
				this.renderFinancial(mainContent);
				break;
			case 'legal':
				this.renderLegal(mainContent);
				break;
			case 'roadmap':
				this.renderRoadmap(mainContent);
				break;
		}
	}

	// =========================================
	// HEADER WITH PLAN SELECTOR
	// =========================================
	private renderHeader(container: HTMLElement) {
		const header = container.createDiv({ cls: 'bk-plan-header' });
		
		const titleRow = header.createDiv({ cls: 'bk-plan-title-row' });
		titleRow.createEl('h1', { text: '📊 Business Plan Manager' });
		
		// Plan Selector (if plans exist)
		if (this.plugin.settings.plans.length > 0) {
			const planSelector = titleRow.createDiv({ cls: 'bk-plan-selector' });
			
			const selectEl = planSelector.createEl('select', { cls: 'bk-plan-dropdown' });
			
			this.plugin.settings.plans.forEach(plan => {
				const option = selectEl.createEl('option', {
					text: `${plan.icon} ${plan.name}`,
					value: plan.id
				});
				if (plan.id === this.plugin.settings.activePlanId) {
					option.selected = true;
				}
			});
			
			selectEl.addEventListener('change', async (e) => {
				const newId = (e.target as HTMLSelectElement).value;
				this.plugin.settings.activePlanId = newId;
				await this.plugin.saveSettings();
				this.refresh();
				const plan = this.getActivePlan();
				if (plan) {
					new Notice(`Switched to "${plan.name}"`);
				}
			});
			
			// New Plan Button
			const newPlanBtn = planSelector.createEl('button', { 
				text: '+ New',
				cls: 'bk-new-plan-btn'
			});
			newPlanBtn.addEventListener('click', () => {
				new QuickCreatePlanModal(this.app, this.plugin, () => {
					this.refresh();
				}).open();
			});
		}
		
		header.createEl('p', { 
			text: 'Plan, track, and grow your business',
			cls: 'bk-plan-subtitle'
		});
	}

	// =========================================
	// NO PLAN VIEW
	// =========================================
	private renderNoPlanView(container: HTMLElement) {
		const emptyState = container.createDiv({ cls: 'bk-empty-state' });
		
		emptyState.createEl('div', { text: '📋', cls: 'bk-empty-icon' });
		emptyState.createEl('h2', { text: 'No Business Plans Yet' });
		emptyState.createEl('p', { text: 'Create your first business plan to get started.' });
		
		// Template Grid
		const templateGrid = emptyState.createDiv({ cls: 'bk-template-grid' });
		
		const templates: { id: PlanTemplate; icon: string; name: string; desc: string }[] = [
			{ id: 'blank', icon: '📄', name: 'Blank Plan', desc: 'Start from scratch' },
			{ id: 'plugin-business', icon: '🔌', name: 'Plugin Business', desc: 'WordPress/Obsidian plugins' },
			{ id: 'saas', icon: '☁️', name: 'SaaS Business', desc: 'Software as a Service' },
			{ id: 'consulting', icon: '💼', name: 'Consulting', desc: 'Professional services' },
			{ id: 'nonprofit', icon: '❤️', name: 'Non-profit', desc: 'Mission-driven organization' }
		];
		
		templates.forEach(template => {
			const card = templateGrid.createDiv({ cls: 'bk-template-card' });
			card.createEl('div', { text: template.icon, cls: 'template-icon' });
			card.createEl('div', { text: template.name, cls: 'template-name' });
			card.createEl('div', { text: template.desc, cls: 'template-desc' });
			
			card.addEventListener('click', async () => {
				const name = await this.promptPlanName(template.name);
				if (name) {
					const newPlan = createNewPlan(name, template.id);
					this.plugin.settings.plans.push(newPlan);
					this.plugin.settings.activePlanId = newPlan.id;
					await this.plugin.saveSettings();
					this.activeSection = 'dashboard';
					this.refresh();
					new Notice(`Created "${name}"!`);
				}
			});
		});
	}

	private async promptPlanName(defaultName: string): Promise<string | null> {
		return new Promise((resolve) => {
			const modal = new Modal(this.app);
			let inputValue = defaultName;
			
			modal.contentEl.createEl('h3', { text: '📝 Name Your Business Plan' });
			
			const inputEl = modal.contentEl.createEl('input', {
				type: 'text',
				value: defaultName,
				cls: 'bk-plan-name-input'
			});
			inputEl.style.width = '100%';
			inputEl.style.padding = '8px';
			inputEl.style.marginBottom = '16px';
			inputEl.addEventListener('input', (e) => {
				inputValue = (e.target as HTMLInputElement).value;
			});
			
			const btnRow = modal.contentEl.createDiv({ cls: 'bk-modal-buttons' });
			
			const cancelBtn = btnRow.createEl('button', { text: 'Cancel' });
			cancelBtn.addEventListener('click', () => {
				modal.close();
				resolve(null);
			});
			
			const createBtn = btnRow.createEl('button', { text: 'Create', cls: 'mod-cta' });
			createBtn.addEventListener('click', () => {
				modal.close();
				resolve(inputValue.trim() || defaultName);
			});
			
			modal.open();
			inputEl.focus();
			inputEl.select();
		});
	}

	// =========================================
	// NAVIGATION
	// =========================================
	private renderNavigation(container: HTMLElement) {
		const nav = container.createDiv({ cls: 'bk-plan-nav' });
		
		const sections: { id: Section; icon: string; label: string }[] = [
			{ id: 'plans', icon: '📋', label: 'Plans' },
			{ id: 'dashboard', icon: '📊', label: 'Dashboard' },
			{ id: 'executive', icon: '🎯', label: 'Executive' },
			{ id: 'products', icon: '📦', label: 'Products' },
			{ id: 'market', icon: '📈', label: 'Market' },
			{ id: 'marketing', icon: '📣', label: 'Marketing' },
			{ id: 'operations', icon: '⚙️', label: 'Operations' },
			{ id: 'technology', icon: '💻', label: 'Technology' },
			{ id: 'financial', icon: '💰', label: 'Financial' },
			{ id: 'legal', icon: '📜', label: 'Legal' },
			{ id: 'roadmap', icon: '🗺️', label: 'Roadmap' }
		];
		
		sections.forEach(section => {
			const btn = nav.createEl('button', {
				cls: `bk-nav-btn ${this.activeSection === section.id ? 'active' : ''}`
			});
			btn.createEl('span', { text: section.icon, cls: 'nav-icon' });
			btn.createEl('span', { text: section.label, cls: 'nav-label' });
			
			btn.addEventListener('click', () => {
				this.activeSection = section.id;
				this.refresh();
			});
		});
	}

	// =========================================
	// PLAN MANAGER
	// =========================================
	private renderPlanManager(container: HTMLElement) {
		const section = container.createDiv({ cls: 'bk-section' });
		section.createEl('h2', { text: '📋 Manage Business Plans' });
		
		const plans = this.plugin.settings.plans;
		
		// Create New Plan Card
		const createCard = section.createDiv({ cls: 'bk-create-plan-card' });
		createCard.createEl('span', { text: '+', cls: 'create-icon' });
		createCard.createEl('span', { text: 'Create New Plan', cls: 'create-text' });
		createCard.addEventListener('click', () => {
			new QuickCreatePlanModal(this.app, this.plugin, () => {
				this.refresh();
			}).open();
		});
		
		// Plans Grid
		const planGrid = section.createDiv({ cls: 'bk-plans-grid' });
		
		plans.forEach(plan => {
			const card = planGrid.createDiv({ cls: 'bk-plan-card' });
			if (plan.id === this.plugin.settings.activePlanId) {
				card.addClass('is-active');
			}
			card.style.borderColor = plan.color;
			
			// Card Header
			const cardHeader = card.createDiv({ cls: 'plan-card-header' });
			cardHeader.createEl('span', { text: plan.icon, cls: 'plan-card-icon' });
			cardHeader.createEl('span', { text: plan.name, cls: 'plan-card-name' });
			
			if (plan.id === this.plugin.settings.activePlanId) {
				cardHeader.createEl('span', { text: '✓', cls: 'plan-card-active' });
			}
			
			// Card Info
			const cardInfo = card.createDiv({ cls: 'plan-card-info' });
			if (plan.description) {
				cardInfo.createEl('p', { text: plan.description, cls: 'plan-card-desc' });
			}
			
			const statsRow = cardInfo.createDiv({ cls: 'plan-card-stats' });
			statsRow.createEl('span', { text: `📦 ${plan.products.length} products` });
			statsRow.createEl('span', { text: `🎯 ${plan.roadmap.milestones.length} milestones` });
			
			cardInfo.createEl('span', { 
				text: `Updated: ${formatDate(plan.lastUpdated)}`,
				cls: 'plan-card-date'
			});
			
			// Card Actions
			const cardActions = card.createDiv({ cls: 'plan-card-actions' });
			
			if (plan.id !== this.plugin.settings.activePlanId) {
				const activateBtn = cardActions.createEl('button', { text: 'Activate', cls: 'mod-cta' });
				activateBtn.addEventListener('click', async (e) => {
					e.stopPropagation();
					this.plugin.settings.activePlanId = plan.id;
					await this.plugin.saveSettings();
					this.activeSection = 'dashboard';
					this.refresh();
					new Notice(`Activated "${plan.name}"`);
				});
			} else {
				const viewBtn = cardActions.createEl('button', { text: 'View Dashboard', cls: 'mod-cta' });
				viewBtn.addEventListener('click', (e) => {
					e.stopPropagation();
					this.activeSection = 'dashboard';
					this.refresh();
				});
			}
			
			const deleteBtn = cardActions.createEl('button', { text: '🗑️', cls: 'plan-delete-btn' });
			deleteBtn.addEventListener('click', async (e) => {
				e.stopPropagation();
				if (confirm(`Delete "${plan.name}"? This cannot be undone.`)) {
					this.plugin.settings.plans = this.plugin.settings.plans.filter(p => p.id !== plan.id);
					if (this.plugin.settings.activePlanId === plan.id) {
						this.plugin.settings.activePlanId = this.plugin.settings.plans[0]?.id || '';
					}
					await this.plugin.saveSettings();
					this.refresh();
					new Notice(`Deleted "${plan.name}"`);
				}
			});
		});
	}

	// =========================================
	// DASHBOARD
	// =========================================
	private renderDashboard(container: HTMLElement) {
		const plan = this.getActivePlan();
		if (!plan) {
			container.createEl('p', { text: 'No plan selected', cls: 'bk-no-plan' });
			return;
		}
		
		// Welcome Section
		const welcome = container.createDiv({ cls: 'bk-section bk-welcome-section' });
		welcome.createEl('h2', { text: `${plan.icon} ${plan.executive.businessName || plan.name}` });
		if (plan.executive.mission) {
			welcome.createEl('p', { text: plan.executive.mission, cls: 'bk-mission-text' });
		}
		
		// Quick Stats
		const statsGrid = container.createDiv({ cls: 'bk-stats-grid' });
		
		// Products Stat
		const productsStat = statsGrid.createDiv({ cls: 'bk-stat-card' });
		productsStat.createEl('span', { text: '📦', cls: 'stat-icon' });
		productsStat.createEl('span', { text: plan.products.length.toString(), cls: 'stat-value' });
		productsStat.createEl('span', { text: 'Products', cls: 'stat-label' });
		
		// Launched Products
		const launchedStat = statsGrid.createDiv({ cls: 'bk-stat-card' });
		launchedStat.createEl('span', { text: '🚀', cls: 'stat-icon' });
		const launched = getProductsByStatus(plan.products, 'launched').length;
		launchedStat.createEl('span', { text: launched.toString(), cls: 'stat-value' });
		launchedStat.createEl('span', { text: 'Launched', cls: 'stat-label' });
		
		// Monthly Revenue
		const revenueStat = statsGrid.createDiv({ cls: 'bk-stat-card' });
		revenueStat.createEl('span', { text: '💰', cls: 'stat-icon' });
		const monthlyRev = calculateMonthlyRevenue(plan.financial.revenueStreams);
		revenueStat.createEl('span', { text: formatCurrency(monthlyRev), cls: 'stat-value' });
		revenueStat.createEl('span', { text: 'Est. Monthly', cls: 'stat-label' });
		
		// Milestones
		const milestonesStat = statsGrid.createDiv({ cls: 'bk-stat-card' });
		milestonesStat.createEl('span', { text: '🎯', cls: 'stat-icon' });
		const completed = getMilestonesByStatus(plan.roadmap.milestones, 'completed').length;
		const total = plan.roadmap.milestones.length;
		milestonesStat.createEl('span', { text: `${completed}/${total}`, cls: 'stat-value' });
		milestonesStat.createEl('span', { text: 'Milestones', cls: 'stat-label' });
		
		// Quick Actions
		const actionsSection = container.createDiv({ cls: 'bk-section' });
		actionsSection.createEl('h3', { text: '⚡ Quick Actions' });
		
		const actionsGrid = actionsSection.createDiv({ cls: 'bk-actions-grid' });
		
		const actions = [
			{ icon: '➕', label: 'Add Product', section: 'products' as Section },
			{ icon: '🎯', label: 'Add Milestone', section: 'roadmap' as Section },
			{ icon: '💵', label: 'Add Revenue', section: 'financial' as Section },
			{ icon: '📝', label: 'Edit Executive', section: 'executive' as Section }
		];
		
		actions.forEach(action => {
			const btn = actionsGrid.createEl('button', { cls: 'bk-action-btn' });
			btn.createEl('span', { text: action.icon, cls: 'action-icon' });
			btn.createEl('span', { text: action.label, cls: 'action-label' });
			btn.addEventListener('click', () => {
				this.activeSection = action.section;
				this.refresh();
			});
		});
		
		// Recent Milestones
		if (plan.roadmap.milestones.length > 0) {
			const milestonesSection = container.createDiv({ cls: 'bk-section' });
			milestonesSection.createEl('h3', { text: '🗺️ Recent Milestones' });
			
			const recentMilestones = plan.roadmap.milestones.slice(0, 5);
			const milestonesList = milestonesSection.createDiv({ cls: 'bk-milestones-list' });
			
			recentMilestones.forEach(milestone => {
				const item = milestonesList.createDiv({ cls: `bk-milestone-item ${milestone.status}` });
				
				const statusIcon = milestone.status === 'completed' ? '✅' :
								   milestone.status === 'in-progress' ? '🔄' :
								   milestone.status === 'delayed' ? '⚠️' : '📋';
				
				item.createEl('span', { text: statusIcon, cls: 'milestone-status' });
				item.createEl('span', { text: milestone.title, cls: 'milestone-title' });
				if (milestone.targetDate) {
					item.createEl('span', { text: formatDate(milestone.targetDate), cls: 'milestone-date' });
				}
			});
		}
		
		// Products Overview
		if (plan.products.length > 0) {
			const productsSection = container.createDiv({ cls: 'bk-section' });
			productsSection.createEl('h3', { text: '📦 Products Overview' });
			
			const productsList = productsSection.createDiv({ cls: 'bk-products-overview' });
			
			plan.products.slice(0, 5).forEach(product => {
				const item = productsList.createDiv({ cls: 'bk-product-item' });
				
				const categoryIcon = product.category === 'wordpress' ? '🔷' :
									 product.category === 'obsidian' ? '💎' :
									 product.category === 'service' ? '🛠️' : '📦';
				
				item.createEl('span', { text: categoryIcon, cls: 'product-category' });
				item.createEl('span', { text: product.name, cls: 'product-name' });
				
				item.createEl('span', { 
					text: product.status,
					cls: `product-status ${product.status}`
				});
			});
		}
		
		// Last Updated
		const footer = container.createDiv({ cls: 'bk-dashboard-footer' });
		footer.createEl('span', { 
			text: `Last updated: ${formatDate(plan.lastUpdated)}`,
			cls: 'bk-last-updated'
		});
	}

	// =========================================
	// EXECUTIVE SUMMARY (Placeholder)
	// =========================================
	private renderExecutive(container: HTMLElement) {
		const section = container.createDiv({ cls: 'bk-section' });
		section.createEl('h2', { text: '🎯 Executive Summary' });
		section.createEl('p', { 
			text: 'Coming in Phase 2: Mission, vision, values, and business overview.',
			cls: 'bk-coming-soon'
		});
	}

	// =========================================
	// PRODUCTS (Placeholder)
	// =========================================
	private renderProducts(container: HTMLElement) {
		const section = container.createDiv({ cls: 'bk-section' });
		section.createEl('h2', { text: '📦 Products & Services' });
		section.createEl('p', { 
			text: 'Coming in Phase 3: Product management, pricing tiers, and bundles.',
			cls: 'bk-coming-soon'
		});
	}

	// =========================================
	// MARKET ANALYSIS (Placeholder)
	// =========================================
	private renderMarket(container: HTMLElement) {
		const section = container.createDiv({ cls: 'bk-section' });
		section.createEl('h2', { text: '📈 Market Analysis' });
		section.createEl('p', { 
			text: 'Coming in Phase 4: Competitors, differentiators, and market insights.',
			cls: 'bk-coming-soon'
		});
	}

	// =========================================
	// MARKETING & SALES (Placeholder)
	// =========================================
	private renderMarketing(container: HTMLElement) {
		const section = container.createDiv({ cls: 'bk-section' });
		section.createEl('h2', { text: '📣 Marketing & Sales' });
		section.createEl('p', { 
			text: 'Coming in Phase 5: Channels, funnel, and pricing strategies.',
			cls: 'bk-coming-soon'
		});
	}

	// =========================================
	// OPERATIONS (Placeholder)
	// =========================================
	private renderOperations(container: HTMLElement) {
		const section = container.createDiv({ cls: 'bk-section' });
		section.createEl('h2', { text: '⚙️ Operations' });
		section.createEl('p', { 
			text: 'Coming in Phase 6: Development, support, and distribution.',
			cls: 'bk-coming-soon'
		});
	}

	// =========================================
	// TECHNOLOGY (Placeholder)
	// =========================================
	private renderTechnology(container: HTMLElement) {
		const section = container.createDiv({ cls: 'bk-section' });
		section.createEl('h2', { text: '💻 Technology & Infrastructure' });
		section.createEl('p', { 
			text: 'Coming in Phase 6: Tech stack, licensing, and analytics.',
			cls: 'bk-coming-soon'
		});
	}

	// =========================================
	// FINANCIAL (Placeholder)
	// =========================================
	private renderFinancial(container: HTMLElement) {
		const section = container.createDiv({ cls: 'bk-section' });
		section.createEl('h2', { text: '💰 Financial Plan' });
		section.createEl('p', { 
			text: 'Coming in Phase 7: Revenue, expenses, and projections.',
			cls: 'bk-coming-soon'
		});
	}

	// =========================================
	// LEGAL (Placeholder)
	// =========================================
	private renderLegal(container: HTMLElement) {
		const section = container.createDiv({ cls: 'bk-section' });
		section.createEl('h2', { text: '📜 Legal & Compliance' });
		section.createEl('p', { 
			text: 'Coming in Phase 8: Licenses, policies, and EULA.',
			cls: 'bk-coming-soon'
		});
	}

	// =========================================
	// ROADMAP (Placeholder)
	// =========================================
	private renderRoadmap(container: HTMLElement) {
		const section = container.createDiv({ cls: 'bk-section' });
		section.createEl('h2', { text: '🗺️ Milestones & Roadmap' });
		section.createEl('p', { 
			text: 'Coming in Phase 9: Goals, timeline, and progress tracking.',
			cls: 'bk-coming-soon'
		});
	}
}

// ===========================================
// QUICK CREATE PLAN MODAL
// ===========================================
class QuickCreatePlanModal extends Modal {
	plugin: BKBusinessPlanPlugin;
	onComplete: () => void;
	planName: string = '';
	template: PlanTemplate = 'blank';

	constructor(app: App, plugin: BKBusinessPlanPlugin, onComplete: () => void) {
		super(app);
		this.plugin = plugin;
		this.onComplete = onComplete;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('bkbpm-create-plan-modal');

		contentEl.createEl('h2', { text: '📊 Create New Business Plan' });

		// Plan Name
		new Setting(contentEl)
			.setName('Plan name')
			.setDesc('Give your business plan a name')
			.addText(text => text
				.setPlaceholder('My Business Plan')
				.onChange(value => {
					this.planName = value;
				})
			);

		// Template
		new Setting(contentEl)
			.setName('Template')
			.setDesc('Start with a template or blank plan')
			.addDropdown(dropdown => dropdown
				.addOption('blank', '📄 Blank Plan')
				.addOption('plugin-business', '🔌 Plugin Business')
				.addOption('saas', '☁️ SaaS Business')
				.addOption('consulting', '💼 Consulting')
				.addOption('nonprofit', '❤️ Non-profit')
				.setValue(this.template)
				.onChange((value: PlanTemplate) => {
					this.template = value;
				})
			);

		// Buttons
		const buttonDiv = contentEl.createDiv({ cls: 'bkbpm-modal-buttons' });
		
		const cancelBtn = buttonDiv.createEl('button', { text: 'Cancel' });
		cancelBtn.onclick = () => this.close();

		const createBtn = buttonDiv.createEl('button', { text: 'Create Plan', cls: 'mod-cta' });
		createBtn.onclick = async () => {
			if (!this.planName.trim()) {
				new Notice('Please enter a plan name');
				return;
			}

			const newPlan = createNewPlan(this.planName.trim(), this.template);
			this.plugin.settings.plans.push(newPlan);
			this.plugin.settings.activePlanId = newPlan.id;
			await this.plugin.saveSettings();
			this.plugin.refreshViews();
			
			new Notice(`Created "${newPlan.name}"`);
			this.close();
			this.onComplete();
		};
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
