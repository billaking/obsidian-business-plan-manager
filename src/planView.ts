// ===========================================
// BK Business Plan Manager - Main View
// ===========================================

import { App, ItemView, WorkspaceLeaf, Notice, Modal, Setting } from 'obsidian';
import BKBusinessPlanPlugin from '../main';
import {
	BusinessPlan,
	Product,
	PricingTier,
	formatCurrency,
	formatDate,
	calculateMonthlyRevenue,
	calculateMonthlyExpenses,
	getProductsByStatus,
	getMilestonesByStatus,
	createNewPlan,
	PlanTemplate,
	generateId
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
	// EXECUTIVE SUMMARY
	// =========================================
	private renderExecutive(container: HTMLElement) {
		const plan = this.getActivePlan();
		if (!plan) {
			container.createEl('p', { text: 'No plan selected', cls: 'bk-no-plan' });
			return;
		}

		const exec = plan.executive;

		// Header
		const header = container.createDiv({ cls: 'bk-section' });
		header.createEl('h2', { text: '🎯 Executive Summary' });

		// Business Info Card
		const businessCard = container.createDiv({ cls: 'bk-exec-card' });
		businessCard.createEl('h3', { text: '🏢 Business Information' });

		const businessInfo = businessCard.createDiv({ cls: 'bk-exec-info-grid' });

		// Business Name
		this.renderEditableField(businessInfo, 'Business Name', exec.businessName, async (value) => {
			plan.executive.businessName = value;
			plan.lastUpdated = new Date().toISOString();
			await this.plugin.saveSettings();
		});

		// Tagline
		this.renderEditableField(businessInfo, 'Tagline', exec.tagline, async (value) => {
			plan.executive.tagline = value;
			plan.lastUpdated = new Date().toISOString();
			await this.plugin.saveSettings();
		}, 'A catchy phrase that describes your business');

		// Founder
		this.renderEditableField(businessInfo, 'Founder', exec.founder, async (value) => {
			plan.executive.founder = value;
			plan.lastUpdated = new Date().toISOString();
			await this.plugin.saveSettings();
		});

		// Founded Date
		this.renderEditableField(businessInfo, 'Founded', exec.foundedDate, async (value) => {
			plan.executive.foundedDate = value;
			plan.lastUpdated = new Date().toISOString();
			await this.plugin.saveSettings();
		}, 'e.g., January 2024');

		// Mission & Vision Card
		const missionVisionCard = container.createDiv({ cls: 'bk-exec-card' });
		missionVisionCard.createEl('h3', { text: '🎯 Mission & Vision' });

		// Mission Statement
		this.renderEditableTextArea(missionVisionCard, 'Mission Statement', exec.mission, async (value) => {
			plan.executive.mission = value;
			plan.lastUpdated = new Date().toISOString();
			await this.plugin.saveSettings();
		}, 'What your business does and why it exists');

		// Vision Statement
		this.renderEditableTextArea(missionVisionCard, 'Vision Statement', exec.vision, async (value) => {
			plan.executive.vision = value;
			plan.lastUpdated = new Date().toISOString();
			await this.plugin.saveSettings();
		}, 'Where you want your business to be in 5-10 years');

		// Core Values Card
		const valuesCard = container.createDiv({ cls: 'bk-exec-card' });
		const valuesHeader = valuesCard.createDiv({ cls: 'bk-exec-card-header' });
		valuesHeader.createEl('h3', { text: '💎 Core Values' });
		
		const addValueBtn = valuesHeader.createEl('button', { text: '+ Add Value', cls: 'bk-btn-small' });
		addValueBtn.addEventListener('click', () => {
			new EditCoreValueModal(this.app, this.plugin, plan, null, () => this.refresh()).open();
		});

		const valuesContainer = valuesCard.createDiv({ cls: 'bk-values-list' });

		if (exec.coreValues.length === 0) {
			valuesContainer.createEl('p', { 
				text: 'No core values defined yet. Click "Add Value" to create your first core value.',
				cls: 'bk-empty-state-text'
			});
		} else {
			exec.coreValues.forEach((value, index) => {
				const valueItem = valuesContainer.createDiv({ cls: 'bk-value-item' });
				
				const dragHandle = valueItem.createEl('span', { text: '☰', cls: 'bk-value-drag' });
				dragHandle.title = 'Drag to reorder';
				
				valueItem.createEl('span', { text: value, cls: 'bk-value-text' });
				
				const actions = valueItem.createDiv({ cls: 'bk-value-actions' });
				
				// Move Up
				if (index > 0) {
					const upBtn = actions.createEl('button', { text: '↑', cls: 'bk-btn-icon' });
					upBtn.title = 'Move up';
					upBtn.addEventListener('click', async () => {
						const values = [...plan.executive.coreValues];
						[values[index - 1], values[index]] = [values[index], values[index - 1]];
						plan.executive.coreValues = values;
						plan.lastUpdated = new Date().toISOString();
						await this.plugin.saveSettings();
						this.refresh();
					});
				}
				
				// Move Down
				if (index < exec.coreValues.length - 1) {
					const downBtn = actions.createEl('button', { text: '↓', cls: 'bk-btn-icon' });
					downBtn.title = 'Move down';
					downBtn.addEventListener('click', async () => {
						const values = [...plan.executive.coreValues];
						[values[index], values[index + 1]] = [values[index + 1], values[index]];
						plan.executive.coreValues = values;
						plan.lastUpdated = new Date().toISOString();
						await this.plugin.saveSettings();
						this.refresh();
					});
				}
				
				// Edit
				const editBtn = actions.createEl('button', { text: '✏️', cls: 'bk-btn-icon' });
				editBtn.title = 'Edit';
				editBtn.addEventListener('click', () => {
					new EditCoreValueModal(this.app, this.plugin, plan, index, () => this.refresh()).open();
				});
				
				// Delete
				const deleteBtn = actions.createEl('button', { text: '🗑️', cls: 'bk-btn-icon bk-btn-danger' });
				deleteBtn.title = 'Delete';
				deleteBtn.addEventListener('click', async () => {
					if (confirm(`Delete "${value}"?`)) {
						plan.executive.coreValues.splice(index, 1);
						plan.lastUpdated = new Date().toISOString();
						await this.plugin.saveSettings();
						this.refresh();
						new Notice('Core value deleted');
					}
				});
			});
		}

		// Target Market & Value Proposition Card
		const marketCard = container.createDiv({ cls: 'bk-exec-card' });
		marketCard.createEl('h3', { text: '🎯 Market & Value' });

		// Target Market
		this.renderEditableTextArea(marketCard, 'Target Market', exec.targetMarket, async (value) => {
			plan.executive.targetMarket = value;
			plan.lastUpdated = new Date().toISOString();
			await this.plugin.saveSettings();
		}, 'Who are your ideal customers?');

		// Unique Value Proposition
		this.renderEditableTextArea(marketCard, 'Unique Value Proposition', exec.uniqueValue, async (value) => {
			plan.executive.uniqueValue = value;
			plan.lastUpdated = new Date().toISOString();
			await this.plugin.saveSettings();
		}, 'What makes your business different from competitors?');

		// Summary Preview Card
		const previewCard = container.createDiv({ cls: 'bk-exec-card bk-exec-preview' });
		previewCard.createEl('h3', { text: '📋 Summary Preview' });
		
		const previewContent = previewCard.createDiv({ cls: 'bk-preview-content' });
		
		if (exec.businessName) {
			previewContent.createEl('h4', { text: exec.businessName });
		}
		if (exec.tagline) {
			previewContent.createEl('p', { text: exec.tagline, cls: 'bk-preview-tagline' });
		}
		if (exec.mission) {
			const missionP = previewContent.createDiv({ cls: 'bk-preview-section' });
			missionP.createEl('strong', { text: 'Mission: ' });
			missionP.createEl('span', { text: exec.mission });
		}
		if (exec.vision) {
			const visionP = previewContent.createDiv({ cls: 'bk-preview-section' });
			visionP.createEl('strong', { text: 'Vision: ' });
			visionP.createEl('span', { text: exec.vision });
		}
		if (exec.coreValues.length > 0) {
			const valuesP = previewContent.createDiv({ cls: 'bk-preview-section' });
			valuesP.createEl('strong', { text: 'Core Values: ' });
			valuesP.createEl('span', { text: exec.coreValues.join(' • ') });
		}

		// Completion indicator
		const completionScore = this.calculateExecutiveCompletion(exec);
		const completionDiv = container.createDiv({ cls: 'bk-completion-indicator' });
		completionDiv.createEl('span', { text: `Section Completion: ${completionScore}%`, cls: 'bk-completion-text' });
		const progressBar = completionDiv.createDiv({ cls: 'bk-progress-bar' });
		const progressFill = progressBar.createDiv({ cls: 'bk-progress-fill' });
		progressFill.style.width = `${completionScore}%`;
	}

	// Helper: Calculate executive summary completion
	private calculateExecutiveCompletion(exec: any): number {
		const fields = [
			exec.businessName,
			exec.tagline,
			exec.mission,
			exec.vision,
			exec.founder,
			exec.foundedDate,
			exec.targetMarket,
			exec.uniqueValue,
			exec.coreValues.length > 0
		];
		const filled = fields.filter(f => f).length;
		return Math.round((filled / fields.length) * 100);
	}

	// Helper: Render editable single-line field
	private renderEditableField(
		container: HTMLElement,
		label: string,
		value: string,
		onSave: (value: string) => Promise<void>,
		placeholder?: string
	) {
		const fieldDiv = container.createDiv({ cls: 'bk-exec-field' });
		
		const labelEl = fieldDiv.createEl('label', { text: label, cls: 'bk-field-label' });
		
		const inputWrapper = fieldDiv.createDiv({ cls: 'bk-input-wrapper' });
		const input = inputWrapper.createEl('input', {
			type: 'text',
			cls: 'bk-field-input',
			value: value,
			placeholder: placeholder || `Enter ${label.toLowerCase()}...`
		});
		
		let saveTimeout: NodeJS.Timeout;
		input.addEventListener('input', () => {
			clearTimeout(saveTimeout);
			saveTimeout = setTimeout(async () => {
				await onSave(input.value);
			}, 500);
		});
		
		input.addEventListener('blur', async () => {
			clearTimeout(saveTimeout);
			await onSave(input.value);
		});
	}

	// Helper: Render editable textarea field
	private renderEditableTextArea(
		container: HTMLElement,
		label: string,
		value: string,
		onSave: (value: string) => Promise<void>,
		placeholder?: string
	) {
		const fieldDiv = container.createDiv({ cls: 'bk-exec-field bk-exec-field-textarea' });
		
		fieldDiv.createEl('label', { text: label, cls: 'bk-field-label' });
		
		const textarea = fieldDiv.createEl('textarea', {
			cls: 'bk-field-textarea',
			text: value,
			placeholder: placeholder || `Enter ${label.toLowerCase()}...`
		});
		textarea.rows = 3;
		
		let saveTimeout: NodeJS.Timeout;
		textarea.addEventListener('input', () => {
			clearTimeout(saveTimeout);
			saveTimeout = setTimeout(async () => {
				await onSave(textarea.value);
			}, 500);
		});
		
		textarea.addEventListener('blur', async () => {
			clearTimeout(saveTimeout);
			await onSave(textarea.value);
		});
	}

	// =========================================
	// PRODUCTS & SERVICES
	// =========================================
	private renderProducts(container: HTMLElement) {
		const plan = this.getActivePlan();
		if (!plan) {
			container.createEl('p', { text: 'No plan selected', cls: 'bk-no-plan' });
			return;
		}

		// Header with Add button
		const header = container.createDiv({ cls: 'bk-section-header' });
		header.createEl('h2', { text: '📦 Products & Services' });
		
		const addBtn = header.createEl('button', { text: '+ Add Product', cls: 'bk-btn-primary' });
		addBtn.addEventListener('click', () => {
			new ProductModal(this.app, this.plugin, plan, null, () => this.refresh()).open();
		});

		// Stats Row
		const statsRow = container.createDiv({ cls: 'bk-products-stats' });
		
		const totalProducts = plan.products.length;
		const launchedCount = plan.products.filter(p => p.status === 'launched').length;
		const devCount = plan.products.filter(p => p.status === 'development' || p.status === 'beta').length;
		const ideaCount = plan.products.filter(p => p.status === 'idea').length;
		
		this.renderMiniStat(statsRow, '📦', totalProducts.toString(), 'Total');
		this.renderMiniStat(statsRow, '🚀', launchedCount.toString(), 'Launched');
		this.renderMiniStat(statsRow, '🔧', devCount.toString(), 'In Dev');
		this.renderMiniStat(statsRow, '💡', ideaCount.toString(), 'Ideas');

		// Filter tabs
		const filterTabs = container.createDiv({ cls: 'bk-filter-tabs' });
		const filters = [
			{ id: 'all', label: 'All', count: totalProducts },
			{ id: 'launched', label: 'Launched', count: launchedCount },
			{ id: 'development', label: 'In Development', count: plan.products.filter(p => p.status === 'development').length },
			{ id: 'beta', label: 'Beta', count: plan.products.filter(p => p.status === 'beta').length },
			{ id: 'idea', label: 'Ideas', count: ideaCount },
		];
		
		filters.forEach(filter => {
			const tab = filterTabs.createEl('button', { 
				text: `${filter.label} (${filter.count})`,
				cls: 'bk-filter-tab'
			});
			if (filter.id === 'all') tab.addClass('active');
			
			tab.addEventListener('click', () => {
				filterTabs.querySelectorAll('.bk-filter-tab').forEach(t => t.removeClass('active'));
				tab.addClass('active');
				this.filterProducts(container, plan.products, filter.id);
			});
		});

		// Products List
		const productsList = container.createDiv({ cls: 'bk-products-list', attr: { 'data-products-list': 'true' } });
		
		if (plan.products.length === 0) {
			this.renderEmptyProductsState(productsList);
		} else {
			this.renderProductCards(productsList, plan.products, plan);
		}
	}

	private renderMiniStat(container: HTMLElement, icon: string, value: string, label: string) {
		const stat = container.createDiv({ cls: 'bk-mini-stat' });
		stat.createEl('span', { text: icon, cls: 'mini-stat-icon' });
		stat.createEl('span', { text: value, cls: 'mini-stat-value' });
		stat.createEl('span', { text: label, cls: 'mini-stat-label' });
	}

	private renderEmptyProductsState(container: HTMLElement) {
		container.empty();
		const emptyState = container.createDiv({ cls: 'bk-empty-state' });
		emptyState.createEl('div', { text: '📦', cls: 'empty-state-icon' });
		emptyState.createEl('h3', { text: 'No Products Yet' });
		emptyState.createEl('p', { text: 'Add your first product or service to start building your catalog.' });
		
		const addBtn = emptyState.createEl('button', { text: '+ Add Your First Product', cls: 'bk-btn-primary' });
		addBtn.addEventListener('click', () => {
			const plan = this.getActivePlan();
			if (plan) {
				new ProductModal(this.app, this.plugin, plan, null, () => this.refresh()).open();
			}
		});
	}

	private filterProducts(container: HTMLElement, products: Product[], filter: string) {
		const productsList = container.querySelector('[data-products-list]') as HTMLElement;
		if (!productsList) return;
		
		const plan = this.getActivePlan();
		if (!plan) return;

		let filtered = products;
		if (filter !== 'all') {
			filtered = products.filter(p => p.status === filter);
		}

		productsList.empty();
		if (filtered.length === 0) {
			const noResults = productsList.createDiv({ cls: 'bk-no-results' });
			noResults.createEl('p', { text: `No ${filter} products found.` });
		} else {
			this.renderProductCards(productsList, filtered, plan);
		}
	}

	private renderProductCards(container: HTMLElement, products: Product[], plan: BusinessPlan) {
		products.forEach(product => {
			const card = container.createDiv({ cls: 'bk-product-card' });
			
			// Card Header
			const cardHeader = card.createDiv({ cls: 'bk-product-card-header' });
			
			const categoryIcon = this.getCategoryIcon(product.category);
			cardHeader.createEl('span', { text: categoryIcon, cls: 'product-category-icon' });
			
			const titleArea = cardHeader.createDiv({ cls: 'product-title-area' });
			titleArea.createEl('h4', { text: product.name, cls: 'product-name' });
			if (product.sku) {
				titleArea.createEl('span', { text: `SKU: ${product.sku}`, cls: 'product-sku' });
			}
			
			const statusBadge = cardHeader.createEl('span', { 
				text: this.formatStatus(product.status),
				cls: `product-status-badge status-${product.status}`
			});

			// Card Body
			const cardBody = card.createDiv({ cls: 'bk-product-card-body' });
			
			if (product.description) {
				cardBody.createEl('p', { text: product.description, cls: 'product-description' });
			}

			// Features preview
			if (product.features.length > 0) {
				const featuresPreview = cardBody.createDiv({ cls: 'product-features-preview' });
				const displayFeatures = product.features.slice(0, 3);
				displayFeatures.forEach(f => {
					featuresPreview.createEl('span', { text: `✓ ${f}`, cls: 'feature-item' });
				});
				if (product.features.length > 3) {
					featuresPreview.createEl('span', { 
						text: `+${product.features.length - 3} more`,
						cls: 'feature-more'
					});
				}
			}

			// Pricing summary
			if (product.pricingTiers.length > 0) {
				const pricingArea = cardBody.createDiv({ cls: 'product-pricing-area' });
				pricingArea.createEl('span', { text: '💰', cls: 'pricing-icon' });
				
				const prices = product.pricingTiers.map(t => this.formatPrice(t.price, t.billingCycle));
				const priceText = prices.length === 1 ? prices[0] : `From ${prices[0]}`;
				pricingArea.createEl('span', { text: priceText, cls: 'pricing-text' });
				
				if (product.pricingTiers.length > 1) {
					pricingArea.createEl('span', { 
						text: `(${product.pricingTiers.length} tiers)`,
						cls: 'pricing-tiers-count'
					});
				}
			}

			// Tags
			if (product.tags.length > 0) {
				const tagsArea = cardBody.createDiv({ cls: 'product-tags' });
				product.tags.slice(0, 4).forEach(tag => {
					tagsArea.createEl('span', { text: tag, cls: 'product-tag' });
				});
			}

			// Card Actions
			const cardActions = card.createDiv({ cls: 'bk-product-card-actions' });
			
			const editBtn = cardActions.createEl('button', { text: '✏️ Edit', cls: 'bk-btn-small' });
			editBtn.addEventListener('click', () => {
				new ProductModal(this.app, this.plugin, plan, product, () => this.refresh()).open();
			});
			
			const duplicateBtn = cardActions.createEl('button', { text: '📋 Duplicate', cls: 'bk-btn-small bk-btn-secondary' });
			duplicateBtn.addEventListener('click', async () => {
				const newProduct: Product = {
					...product,
					id: generateId(),
					name: `${product.name} (Copy)`,
					sku: product.sku ? `${product.sku}-COPY` : '',
					pricingTiers: product.pricingTiers.map(t => ({ ...t, id: generateId() }))
				};
				plan.products.push(newProduct);
				plan.lastUpdated = new Date().toISOString();
				await this.plugin.saveSettings();
				this.refresh();
				new Notice(`Duplicated "${product.name}"`);
			});
			
			const deleteBtn = cardActions.createEl('button', { text: '🗑️', cls: 'bk-btn-icon bk-btn-danger' });
			deleteBtn.addEventListener('click', async () => {
				if (confirm(`Delete "${product.name}"? This cannot be undone.`)) {
					plan.products = plan.products.filter(p => p.id !== product.id);
					plan.lastUpdated = new Date().toISOString();
					await this.plugin.saveSettings();
					this.refresh();
					new Notice(`Deleted "${product.name}"`);
				}
			});
		});
	}

	private getCategoryIcon(category: Product['category']): string {
		const icons: Record<Product['category'], string> = {
			'wordpress': '🔷',
			'obsidian': '💎',
			'service': '🛠️',
			'other': '📦'
		};
		return icons[category] || '📦';
	}

	private formatStatus(status: Product['status']): string {
		const labels: Record<Product['status'], string> = {
			'idea': '💡 Idea',
			'development': '🔧 Development',
			'beta': '🧪 Beta',
			'launched': '🚀 Launched',
			'retired': '📁 Retired'
		};
		return labels[status] || status;
	}

	private formatPrice(price: number, cycle: PricingTier['billingCycle']): string {
		const formatted = new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0
		}).format(price);
		
		const cycleLabels: Record<PricingTier['billingCycle'], string> = {
			'one-time': '',
			'monthly': '/mo',
			'yearly': '/yr',
			'lifetime': ' lifetime'
		};
		return `${formatted}${cycleLabels[cycle]}`;
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

// ===========================================
// EDIT CORE VALUE MODAL
// ===========================================
class EditCoreValueModal extends Modal {
	plugin: BKBusinessPlanPlugin;
	plan: BusinessPlan;
	valueIndex: number | null;
	onComplete: () => void;
	valueText: string = '';

	constructor(
		app: App,
		plugin: BKBusinessPlanPlugin,
		plan: BusinessPlan,
		valueIndex: number | null,
		onComplete: () => void
	) {
		super(app);
		this.plugin = plugin;
		this.plan = plan;
		this.valueIndex = valueIndex;
		this.onComplete = onComplete;
		
		if (valueIndex !== null && plan.executive.coreValues[valueIndex]) {
			this.valueText = plan.executive.coreValues[valueIndex];
		}
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('bk-modal');

		const isEdit = this.valueIndex !== null;
		contentEl.createEl('h2', { text: isEdit ? '✏️ Edit Core Value' : '➕ Add Core Value' });

		new Setting(contentEl)
			.setName('Core Value')
			.setDesc('A principle or belief that guides your business')
			.addText(text => text
				.setPlaceholder('e.g., Customer First')
				.setValue(this.valueText)
				.onChange(value => {
					this.valueText = value;
				})
			);

		// Suggestions
		const suggestionsDiv = contentEl.createDiv({ cls: 'bk-value-suggestions' });
		suggestionsDiv.createEl('p', { text: 'Suggestions:', cls: 'bk-suggestions-label' });
		
		const suggestions = [
			'Innovation', 'Integrity', 'Customer Focus', 'Quality',
			'Teamwork', 'Excellence', 'Sustainability', 'Transparency',
			'Accountability', 'Continuous Improvement'
		];
		
		const suggestionsGrid = suggestionsDiv.createDiv({ cls: 'bk-suggestions-grid' });
		suggestions.forEach(suggestion => {
			const chip = suggestionsGrid.createEl('button', { text: suggestion, cls: 'bk-suggestion-chip' });
			chip.addEventListener('click', () => {
				this.valueText = suggestion;
				const input = contentEl.querySelector('input');
				if (input) (input as HTMLInputElement).value = suggestion;
			});
		});

		// Buttons
		const buttonDiv = contentEl.createDiv({ cls: 'bkbpm-modal-buttons' });

		const cancelBtn = buttonDiv.createEl('button', { text: 'Cancel' });
		cancelBtn.onclick = () => this.close();

		const saveBtn = buttonDiv.createEl('button', { 
			text: isEdit ? 'Save Changes' : 'Add Value', 
			cls: 'mod-cta' 
		});
		saveBtn.onclick = async () => {
			if (!this.valueText.trim()) {
				new Notice('Please enter a core value');
				return;
			}

			if (isEdit && this.valueIndex !== null) {
				this.plan.executive.coreValues[this.valueIndex] = this.valueText.trim();
				new Notice('Core value updated');
			} else {
				this.plan.executive.coreValues.push(this.valueText.trim());
				new Notice('Core value added');
			}
			
			this.plan.lastUpdated = new Date().toISOString();
			await this.plugin.saveSettings();
			this.close();
			this.onComplete();
		};
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}

// ===========================================
// PRODUCT MODAL (Create/Edit)
// ===========================================
class ProductModal extends Modal {
	plugin: BKBusinessPlanPlugin;
	plan: BusinessPlan;
	product: Product | null;
	onComplete: () => void;
	
	// Form data
	formData: Product;

	constructor(
		app: App,
		plugin: BKBusinessPlanPlugin,
		plan: BusinessPlan,
		product: Product | null,
		onComplete: () => void
	) {
		super(app);
		this.plugin = plugin;
		this.plan = plan;
		this.product = product;
		this.onComplete = onComplete;
		
		// Initialize form data
		if (product) {
			this.formData = { ...product, pricingTiers: [...product.pricingTiers], features: [...product.features], tags: [...product.tags] };
		} else {
			this.formData = {
				id: generateId(),
				sku: '',
				name: '',
				category: 'other',
				description: '',
				features: [],
				pricingTiers: [],
				status: 'idea',
				launchDate: '',
				tags: []
			};
		}
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('bk-product-modal');

		const isEdit = this.product !== null;
		contentEl.createEl('h2', { text: isEdit ? '✏️ Edit Product' : '➕ Add Product' });

		// Basic Info Section
		const basicSection = contentEl.createDiv({ cls: 'bk-modal-section' });
		basicSection.createEl('h3', { text: '📋 Basic Information' });

		new Setting(basicSection)
			.setName('Product Name')
			.setDesc('The name of your product or service')
			.addText(text => text
				.setPlaceholder('My Awesome Product')
				.setValue(this.formData.name)
				.onChange(value => this.formData.name = value)
			);

		new Setting(basicSection)
			.setName('SKU')
			.setDesc('Stock keeping unit (optional)')
			.addText(text => text
				.setPlaceholder('PRD-001')
				.setValue(this.formData.sku)
				.onChange(value => this.formData.sku = value)
			);

		new Setting(basicSection)
			.setName('Category')
			.addDropdown(dropdown => dropdown
				.addOption('wordpress', '🔷 WordPress Plugin')
				.addOption('obsidian', '💎 Obsidian Plugin')
				.addOption('service', '🛠️ Service')
				.addOption('other', '📦 Other')
				.setValue(this.formData.category)
				.onChange((value: Product['category']) => this.formData.category = value)
			);

		new Setting(basicSection)
			.setName('Status')
			.addDropdown(dropdown => dropdown
				.addOption('idea', '💡 Idea')
				.addOption('development', '🔧 Development')
				.addOption('beta', '🧪 Beta')
				.addOption('launched', '🚀 Launched')
				.addOption('retired', '📁 Retired')
				.setValue(this.formData.status)
				.onChange((value: Product['status']) => this.formData.status = value)
			);

		// Description
		const descSection = contentEl.createDiv({ cls: 'bk-modal-section' });
		descSection.createEl('h3', { text: '📝 Description' });
		
		const descTextarea = descSection.createEl('textarea', {
			cls: 'bk-modal-textarea',
			placeholder: 'Describe your product or service...'
		});
		descTextarea.value = this.formData.description;
		descTextarea.rows = 3;
		descTextarea.addEventListener('input', () => this.formData.description = descTextarea.value);

		// Features Section
		const featuresSection = contentEl.createDiv({ cls: 'bk-modal-section' });
		const featuresHeader = featuresSection.createDiv({ cls: 'bk-modal-section-header' });
		featuresHeader.createEl('h3', { text: '✨ Features' });
		
		const addFeatureBtn = featuresHeader.createEl('button', { text: '+ Add', cls: 'bk-btn-small' });
		addFeatureBtn.addEventListener('click', () => {
			this.formData.features.push('');
			this.renderFeaturesList(featuresListEl);
		});
		
		const featuresListEl = featuresSection.createDiv({ cls: 'bk-modal-list' });
		this.renderFeaturesList(featuresListEl);

		// Pricing Tiers Section
		const pricingSection = contentEl.createDiv({ cls: 'bk-modal-section' });
		const pricingHeader = pricingSection.createDiv({ cls: 'bk-modal-section-header' });
		pricingHeader.createEl('h3', { text: '💰 Pricing Tiers' });
		
		const addTierBtn = pricingHeader.createEl('button', { text: '+ Add Tier', cls: 'bk-btn-small' });
		addTierBtn.addEventListener('click', () => {
			new PricingTierModal(this.app, null, (tier) => {
				this.formData.pricingTiers.push(tier);
				this.renderPricingTiersList(pricingListEl);
			}).open();
		});
		
		const pricingListEl = pricingSection.createDiv({ cls: 'bk-modal-list' });
		this.renderPricingTiersList(pricingListEl);

		// Tags Section
		const tagsSection = contentEl.createDiv({ cls: 'bk-modal-section' });
		tagsSection.createEl('h3', { text: '🏷️ Tags' });
		
		const tagsInput = tagsSection.createEl('input', {
			type: 'text',
			cls: 'bk-modal-input',
			placeholder: 'Enter tags separated by commas'
		});
		tagsInput.value = this.formData.tags.join(', ');
		tagsInput.addEventListener('input', () => {
			this.formData.tags = tagsInput.value.split(',').map(t => t.trim()).filter(t => t);
		});

		// Launch Date (if launched)
		const launchSection = contentEl.createDiv({ cls: 'bk-modal-section' });
		new Setting(launchSection)
			.setName('Launch Date')
			.setDesc('When was/will this product be launched?')
			.addText(text => text
				.setPlaceholder('YYYY-MM-DD')
				.setValue(this.formData.launchDate || '')
				.onChange(value => this.formData.launchDate = value)
			);

		// Buttons
		const buttonDiv = contentEl.createDiv({ cls: 'bkbpm-modal-buttons' });

		const cancelBtn = buttonDiv.createEl('button', { text: 'Cancel' });
		cancelBtn.onclick = () => this.close();

		const saveBtn = buttonDiv.createEl('button', { 
			text: isEdit ? 'Save Changes' : 'Add Product', 
			cls: 'mod-cta' 
		});
		saveBtn.onclick = async () => {
			if (!this.formData.name.trim()) {
				new Notice('Please enter a product name');
				return;
			}

			if (isEdit) {
				// Update existing product
				const index = this.plan.products.findIndex(p => p.id === this.formData.id);
				if (index !== -1) {
					this.plan.products[index] = this.formData;
				}
				new Notice(`Updated "${this.formData.name}"`);
			} else {
				// Add new product
				this.plan.products.push(this.formData);
				new Notice(`Added "${this.formData.name}"`);
			}
			
			this.plan.lastUpdated = new Date().toISOString();
			await this.plugin.saveSettings();
			this.close();
			this.onComplete();
		};
	}

	private renderFeaturesList(container: HTMLElement) {
		container.empty();
		
		if (this.formData.features.length === 0) {
			container.createEl('p', { text: 'No features added yet.', cls: 'bk-empty-list-text' });
			return;
		}

		this.formData.features.forEach((feature, index) => {
			const item = container.createDiv({ cls: 'bk-list-item-editable' });
			
			const input = item.createEl('input', {
				type: 'text',
				cls: 'bk-list-item-input',
				value: feature,
				placeholder: 'Feature description...'
			});
			input.addEventListener('input', () => {
				this.formData.features[index] = input.value;
			});
			
			const deleteBtn = item.createEl('button', { text: '×', cls: 'bk-list-item-delete' });
			deleteBtn.addEventListener('click', () => {
				this.formData.features.splice(index, 1);
				this.renderFeaturesList(container);
			});
		});
	}

	private renderPricingTiersList(container: HTMLElement) {
		container.empty();
		
		if (this.formData.pricingTiers.length === 0) {
			container.createEl('p', { text: 'No pricing tiers added yet.', cls: 'bk-empty-list-text' });
			return;
		}

		this.formData.pricingTiers.forEach((tier, index) => {
			const item = container.createDiv({ cls: 'bk-pricing-tier-item' });
			
			const info = item.createDiv({ cls: 'tier-info' });
			info.createEl('span', { text: tier.name, cls: 'tier-name' });
			
			const priceText = this.formatTierPrice(tier);
			info.createEl('span', { text: priceText, cls: 'tier-price' });
			
			if (tier.isPopular) {
				info.createEl('span', { text: '⭐ Popular', cls: 'tier-popular' });
			}
			
			const actions = item.createDiv({ cls: 'tier-actions' });
			
			const editBtn = actions.createEl('button', { text: '✏️', cls: 'bk-btn-icon' });
			editBtn.addEventListener('click', () => {
				new PricingTierModal(this.app, tier, (updatedTier) => {
					this.formData.pricingTiers[index] = updatedTier;
					this.renderPricingTiersList(container);
				}).open();
			});
			
			const deleteBtn = actions.createEl('button', { text: '🗑️', cls: 'bk-btn-icon bk-btn-danger' });
			deleteBtn.addEventListener('click', () => {
				this.formData.pricingTiers.splice(index, 1);
				this.renderPricingTiersList(container);
			});
		});
	}

	private formatTierPrice(tier: PricingTier): string {
		const price = new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0
		}).format(tier.price);
		
		const cycles: Record<string, string> = {
			'one-time': '',
			'monthly': '/month',
			'yearly': '/year',
			'lifetime': ' (lifetime)'
		};
		return `${price}${cycles[tier.billingCycle] || ''}`;
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}

// ===========================================
// PRICING TIER MODAL
// ===========================================
class PricingTierModal extends Modal {
	tier: PricingTier | null;
	onSave: (tier: PricingTier) => void;
	formData: PricingTier;

	constructor(app: App, tier: PricingTier | null, onSave: (tier: PricingTier) => void) {
		super(app);
		this.tier = tier;
		this.onSave = onSave;
		
		if (tier) {
			this.formData = { ...tier, features: [...tier.features] };
		} else {
			this.formData = {
				id: generateId(),
				name: '',
				price: 0,
				billingCycle: 'one-time',
				features: [],
				isPopular: false
			};
		}
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('bk-tier-modal');

		const isEdit = this.tier !== null;
		contentEl.createEl('h2', { text: isEdit ? '✏️ Edit Pricing Tier' : '➕ Add Pricing Tier' });

		new Setting(contentEl)
			.setName('Tier Name')
			.setDesc('e.g., Basic, Pro, Enterprise')
			.addText(text => text
				.setPlaceholder('Pro')
				.setValue(this.formData.name)
				.onChange(value => this.formData.name = value)
			);

		new Setting(contentEl)
			.setName('Price')
			.addText(text => text
				.setPlaceholder('29')
				.setValue(this.formData.price.toString())
				.onChange(value => this.formData.price = parseFloat(value) || 0)
			);

		new Setting(contentEl)
			.setName('Billing Cycle')
			.addDropdown(dropdown => dropdown
				.addOption('one-time', 'One-time')
				.addOption('monthly', 'Monthly')
				.addOption('yearly', 'Yearly')
				.addOption('lifetime', 'Lifetime')
				.setValue(this.formData.billingCycle)
				.onChange((value: PricingTier['billingCycle']) => this.formData.billingCycle = value)
			);

		new Setting(contentEl)
			.setName('Mark as Popular')
			.setDesc('Highlight this tier as the recommended option')
			.addToggle(toggle => toggle
				.setValue(this.formData.isPopular || false)
				.onChange(value => this.formData.isPopular = value)
			);

		// Tier Features
		const featuresSection = contentEl.createDiv({ cls: 'bk-modal-section' });
		const featuresHeader = featuresSection.createDiv({ cls: 'bk-modal-section-header' });
		featuresHeader.createEl('h3', { text: 'Included Features' });
		
		const addFeatureBtn = featuresHeader.createEl('button', { text: '+ Add', cls: 'bk-btn-small' });
		addFeatureBtn.addEventListener('click', () => {
			this.formData.features.push('');
			this.renderTierFeatures(featuresListEl);
		});
		
		const featuresListEl = featuresSection.createDiv({ cls: 'bk-modal-list' });
		this.renderTierFeatures(featuresListEl);

		// Buttons
		const buttonDiv = contentEl.createDiv({ cls: 'bkbpm-modal-buttons' });

		const cancelBtn = buttonDiv.createEl('button', { text: 'Cancel' });
		cancelBtn.onclick = () => this.close();

		const saveBtn = buttonDiv.createEl('button', { 
			text: isEdit ? 'Save Tier' : 'Add Tier', 
			cls: 'mod-cta' 
		});
		saveBtn.onclick = () => {
			if (!this.formData.name.trim()) {
				new Notice('Please enter a tier name');
				return;
			}
			this.onSave(this.formData);
			this.close();
		};
	}

	private renderTierFeatures(container: HTMLElement) {
		container.empty();
		
		if (this.formData.features.length === 0) {
			container.createEl('p', { text: 'No features added.', cls: 'bk-empty-list-text' });
			return;
		}

		this.formData.features.forEach((feature, index) => {
			const item = container.createDiv({ cls: 'bk-list-item-editable' });
			
			const input = item.createEl('input', {
				type: 'text',
				cls: 'bk-list-item-input',
				value: feature,
				placeholder: 'Feature...'
			});
			input.addEventListener('input', () => {
				this.formData.features[index] = input.value;
			});
			
			const deleteBtn = item.createEl('button', { text: '×', cls: 'bk-list-item-delete' });
			deleteBtn.addEventListener('click', () => {
				this.formData.features.splice(index, 1);
				this.renderTierFeatures(container);
			});
		});
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
