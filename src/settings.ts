// ===========================================
// BK Business Plan Manager - Settings
// ===========================================

import { App, PluginSettingTab, Setting, Notice, Modal } from 'obsidian';
import type BKBusinessPlanPlugin from '../main';
import { BusinessPlan, createNewPlan, PlanTemplate } from './planData';

export interface BKBusinessPlanSettings {
	plans: BusinessPlan[];
	activePlanId: string;
	showSidebar: boolean;
	autoSave: boolean;
	exportFormat: 'json' | 'markdown';
}

export const DEFAULT_SETTINGS: BKBusinessPlanSettings = {
	plans: [],
	activePlanId: '',
	showSidebar: true,
	autoSave: true,
	exportFormat: 'json'
};

export class BKBusinessPlanSettingTab extends PluginSettingTab {
	plugin: BKBusinessPlanPlugin;

	constructor(app: App, plugin: BKBusinessPlanPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// Header
		containerEl.createEl('h1', { text: '📊 Business Plan Manager' });
		containerEl.createEl('p', { 
			text: 'Manage your business plans and plugin settings.',
			cls: 'setting-item-description'
		});

		// =========================
		// PLAN MANAGEMENT
		// =========================
		containerEl.createEl('h2', { text: '📋 Plan Management' });

		// Plan list
		const planListContainer = containerEl.createDiv({ cls: 'bkbpm-plan-list-container' });
		this.renderPlanList(planListContainer);

		// Create New Plan
		new Setting(containerEl)
			.setName('Create new plan')
			.setDesc('Start a new business plan from scratch or from a template')
			.addButton(button => button
				.setButtonText('New Plan')
				.setCta()
				.onClick(() => {
					new CreatePlanModal(this.app, this.plugin, () => {
						this.display(); // Refresh
					}).open();
				})
			);

		// =========================
		// DISPLAY OPTIONS
		// =========================
		containerEl.createEl('h2', { text: '⚙️ Display Options' });

		new Setting(containerEl)
			.setName('Show sidebar on startup')
			.setDesc('Automatically show the business plan sidebar when Obsidian starts')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showSidebar)
				.onChange(async (value) => {
					this.plugin.settings.showSidebar = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName('Auto-save')
			.setDesc('Automatically save changes as you edit')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.autoSave)
				.onChange(async (value) => {
					this.plugin.settings.autoSave = value;
					await this.plugin.saveSettings();
				})
			);

		// =========================
		// EXPORT / IMPORT
		// =========================
		containerEl.createEl('h2', { text: '📤 Export & Import' });

		new Setting(containerEl)
			.setName('Export format')
			.setDesc('Choose the format for exporting plans')
			.addDropdown(dropdown => dropdown
				.addOption('json', 'JSON')
				.addOption('markdown', 'Markdown')
				.setValue(this.plugin.settings.exportFormat)
				.onChange(async (value: 'json' | 'markdown') => {
					this.plugin.settings.exportFormat = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName('Export all plans')
			.setDesc('Export all your business plans to a file')
			.addButton(button => button
				.setButtonText('Export All')
				.onClick(() => {
					this.exportAllPlans();
				})
			);

		new Setting(containerEl)
			.setName('Import plans')
			.setDesc('Import business plans from a JSON file')
			.addButton(button => button
				.setButtonText('Import')
				.onClick(() => {
					this.importPlans();
				})
			);

		// =========================
		// DANGER ZONE
		// =========================
		containerEl.createEl('h2', { text: '⚠️ Danger Zone' });

		new Setting(containerEl)
			.setName('Reset all plans')
			.setDesc('Delete all plans and reset to defaults. This cannot be undone!')
			.addButton(button => button
				.setButtonText('Reset All')
				.setWarning()
				.onClick(async () => {
					if (confirm('Are you sure you want to delete ALL plans? This cannot be undone!')) {
						if (confirm('This will permanently delete all your business plans. Continue?')) {
							this.plugin.settings.plans = [];
							this.plugin.settings.activePlanId = '';
							await this.plugin.saveSettings();
							this.plugin.refreshViews();
							new Notice('All plans have been reset');
							this.display();
						}
					}
				})
			);

		// =========================
		// ABOUT
		// =========================
		containerEl.createEl('h2', { text: 'ℹ️ About' });

		const aboutDiv = containerEl.createDiv({ cls: 'bkbpm-about' });
		aboutDiv.createEl('p', { text: 'BK Business Plan Manager v1.0.0' });
		aboutDiv.createEl('p', { text: 'Create and manage comprehensive business plans for your WordPress and Obsidian plugin business.' });
		aboutDiv.createEl('p', { 
			text: `Total Plans: ${this.plugin.settings.plans.length}`,
			cls: 'bkbpm-about-stat'
		});
	}

	renderPlanList(container: HTMLElement): void {
		container.empty();

		const plans = this.plugin.settings.plans;

		if (plans.length === 0) {
			const emptyDiv = container.createDiv({ cls: 'bkbpm-plan-list-empty' });
			emptyDiv.createEl('p', { text: 'No business plans yet. Create one to get started!' });
			return;
		}

		for (const plan of plans) {
			const planItem = container.createDiv({ cls: 'bkbpm-plan-list-item' });
			
			// Active indicator
			if (plan.id === this.plugin.settings.activePlanId) {
				planItem.addClass('is-active');
			}

			// Plan icon and name
			const planInfo = planItem.createDiv({ cls: 'bkbpm-plan-list-info' });
			planInfo.createSpan({ text: plan.icon, cls: 'bkbpm-plan-icon' });
			planInfo.createSpan({ text: plan.name, cls: 'bkbpm-plan-name' });
			
			if (plan.id === this.plugin.settings.activePlanId) {
				planInfo.createSpan({ text: '(Active)', cls: 'bkbpm-plan-active-badge' });
			}

			// Actions
			const actionsDiv = planItem.createDiv({ cls: 'bkbpm-plan-list-actions' });

			// Set Active button
			if (plan.id !== this.plugin.settings.activePlanId) {
				const activateBtn = actionsDiv.createEl('button', { text: 'Activate' });
				activateBtn.onclick = async () => {
					this.plugin.settings.activePlanId = plan.id;
					await this.plugin.saveSettings();
					this.plugin.refreshViews();
					this.renderPlanList(container);
					new Notice(`Switched to "${plan.name}"`);
				};
			}

			// Edit button
			const editBtn = actionsDiv.createEl('button', { text: 'Edit' });
			editBtn.onclick = () => {
				new EditPlanModal(this.app, this.plugin, plan, () => {
					this.display();
				}).open();
			};

			// Delete button
			const deleteBtn = actionsDiv.createEl('button', { text: '🗑️', cls: 'bkbpm-delete-btn' });
			deleteBtn.onclick = async () => {
				if (confirm(`Delete "${plan.name}"? This cannot be undone.`)) {
					this.plugin.settings.plans = this.plugin.settings.plans.filter(p => p.id !== plan.id);
					if (this.plugin.settings.activePlanId === plan.id) {
						this.plugin.settings.activePlanId = this.plugin.settings.plans[0]?.id || '';
					}
					await this.plugin.saveSettings();
					this.plugin.refreshViews();
					this.renderPlanList(container);
					new Notice(`Deleted "${plan.name}"`);
				}
			};
		}
	}

	exportAllPlans(): void {
		const data = JSON.stringify(this.plugin.settings.plans, null, 2);
		const blob = new Blob([data], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `business-plans-${new Date().toISOString().split('T')[0]}.json`;
		a.click();
		URL.revokeObjectURL(url);
		new Notice('Plans exported successfully');
	}

	importPlans(): void {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json';
		input.onchange = async (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (!file) return;

			try {
				const text = await file.text();
				const plans = JSON.parse(text) as BusinessPlan[];
				
				if (!Array.isArray(plans)) {
					throw new Error('Invalid format');
				}

				// Add imported plans
				for (const plan of plans) {
					// Check for duplicates
					const existing = this.plugin.settings.plans.find(p => p.id === plan.id);
					if (existing) {
						plan.id = plan.id + '-imported';
						plan.name = plan.name + ' (Imported)';
					}
					this.plugin.settings.plans.push(plan);
				}

				await this.plugin.saveSettings();
				this.display();
				new Notice(`Imported ${plans.length} plan(s)`);
			} catch (err) {
				new Notice('Failed to import plans. Invalid file format.');
			}
		};
		input.click();
	}
}

// ===========================================
// CREATE PLAN MODAL
// ===========================================
class CreatePlanModal extends Modal {
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
// EDIT PLAN MODAL
// ===========================================
class EditPlanModal extends Modal {
	plugin: BKBusinessPlanPlugin;
	plan: BusinessPlan;
	onComplete: () => void;

	constructor(app: App, plugin: BKBusinessPlanPlugin, plan: BusinessPlan, onComplete: () => void) {
		super(app);
		this.plugin = plugin;
		this.plan = plan;
		this.onComplete = onComplete;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('bkbpm-edit-plan-modal');

		contentEl.createEl('h2', { text: '✏️ Edit Plan Details' });

		// Plan Name
		new Setting(contentEl)
			.setName('Plan name')
			.addText(text => text
				.setValue(this.plan.name)
				.onChange(value => {
					this.plan.name = value;
				})
			);

		// Description
		new Setting(contentEl)
			.setName('Description')
			.addTextArea(text => text
				.setValue(this.plan.description)
				.onChange(value => {
					this.plan.description = value;
				})
			);

		// Icon
		new Setting(contentEl)
			.setName('Icon')
			.setDesc('Enter an emoji')
			.addText(text => text
				.setValue(this.plan.icon)
				.onChange(value => {
					this.plan.icon = value;
				})
			);

		// Color
		new Setting(contentEl)
			.setName('Color')
			.addColorPicker(color => color
				.setValue(this.plan.color)
				.onChange(value => {
					this.plan.color = value;
				})
			);

		// Buttons
		const buttonDiv = contentEl.createDiv({ cls: 'bkbpm-modal-buttons' });
		
		const cancelBtn = buttonDiv.createEl('button', { text: 'Cancel' });
		cancelBtn.onclick = () => this.close();

		const saveBtn = buttonDiv.createEl('button', { text: 'Save Changes', cls: 'mod-cta' });
		saveBtn.onclick = async () => {
			this.plan.lastUpdated = new Date().toISOString();
			await this.plugin.saveSettings();
			this.plugin.refreshViews();
			
			new Notice(`Updated "${this.plan.name}"`);
			this.close();
			this.onComplete();
		};
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
