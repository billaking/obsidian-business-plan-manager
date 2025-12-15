// ===========================================
// BK Business Plan Manager - Main Plugin
// ===========================================

import { App, Plugin, PluginManifest, WorkspaceLeaf } from 'obsidian';
import { BusinessPlanView, VIEW_TYPE_BUSINESS_PLAN } from './src/planView';
import { BKBusinessPlanSettingTab, BKBusinessPlanSettings, DEFAULT_SETTINGS } from './src/settings';
import { BusinessPlan, getDefaultBusinessPlan } from './src/planData';

// =========================================
// MAIN PLUGIN CLASS
// =========================================
export default class BKBusinessPlanPlugin extends Plugin {
	settings: BKBusinessPlanSettings;

	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest);
		this.settings = DEFAULT_SETTINGS;
	}

	async onload() {
		console.log('Loading BK Business Plan Manager');

		// Load settings
		await this.loadSettings();

		// Register view
		this.registerView(
			VIEW_TYPE_BUSINESS_PLAN,
			(leaf) => new BusinessPlanView(leaf, this)
		);

		// Add ribbon icon
		this.addRibbonIcon('briefcase', 'Open Business Plan Manager', () => {
			this.activateView();
		});

		// Add commands
		this.addCommand({
			id: 'open-business-plan',
			name: 'Open Business Plan Manager',
			callback: () => {
				this.activateView();
			}
		});

		this.addCommand({
			id: 'show-dashboard',
			name: 'Show Dashboard',
			callback: () => {
				this.activateView('dashboard');
			}
		});

		this.addCommand({
			id: 'show-executive',
			name: 'Show Executive Summary',
			callback: () => {
				this.activateView('executive');
			}
		});

		this.addCommand({
			id: 'show-products',
			name: 'Show Products & Services',
			callback: () => {
				this.activateView('products');
			}
		});

		this.addCommand({
			id: 'show-financial',
			name: 'Show Financial Plan',
			callback: () => {
				this.activateView('financial');
			}
		});

		this.addCommand({
			id: 'show-roadmap',
			name: 'Show Roadmap & Milestones',
			callback: () => {
				this.activateView('roadmap');
			}
		});

		// Add settings tab
		this.addSettingTab(new BKBusinessPlanSettingTab(this.app, this));

		console.log('BK Business Plan Manager loaded successfully');
	}

	onunload() {
		console.log('Unloading BK Business Plan Manager');
	}

	async loadSettings() {
		const loadedData = await this.loadData();
		this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedData);
		
		// Initialize with empty arrays if not present
		if (!this.settings.plans) {
			this.settings.plans = [];
		}
		
		// If no active plan, set first one or empty
		if (!this.settings.activePlanId && this.settings.plans.length > 0) {
			this.settings.activePlanId = this.settings.plans[0].id;
		}
	}

	async saveSettings() {
		// Update lastUpdated on active plan
		const activePlan = this.getActivePlan();
		if (activePlan) {
			activePlan.lastUpdated = new Date().toISOString();
		}
		await this.saveData(this.settings);
	}

	getActivePlan(): BusinessPlan | null {
		return this.settings.plans.find(p => p.id === this.settings.activePlanId) || null;
	}

	async activateView(section?: string) {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_BUSINESS_PLAN);

		if (leaves.length > 0) {
			leaf = leaves[0];
		} else {
			leaf = workspace.getRightLeaf(false);
			if (leaf) {
				await leaf.setViewState({ type: VIEW_TYPE_BUSINESS_PLAN, active: true });
			}
		}

		if (leaf) {
			workspace.revealLeaf(leaf);
			
			// Set section if specified
			if (section) {
				const view = leaf.view as BusinessPlanView;
				if (view && view.activeSection !== undefined) {
					(view as any).activeSection = section;
					view.refresh();
				}
			}
		}
	}

	refreshViews() {
		const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_BUSINESS_PLAN);
		leaves.forEach(leaf => {
			const view = leaf.view as BusinessPlanView;
			if (view) {
				view.refresh();
			}
		});
	}
}
