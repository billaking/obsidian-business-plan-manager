// ===========================================
// BK Business Plan Manager - Data Models
// ===========================================

// =========================================
// EXECUTIVE SUMMARY
// =========================================
export interface ExecutiveSummary {
	businessName: string;
	tagline: string;
	mission: string;
	vision: string;
	coreValues: string[];
	targetMarket: string;
	uniqueValue: string;
	foundedDate: string;
	founder: string;
}

// =========================================
// PRODUCTS & SERVICES
// =========================================
export interface PricingTier {
	id: string;
	name: string;
	price: number;
	billingCycle: 'one-time' | 'monthly' | 'yearly' | 'lifetime';
	features: string[];
	isPopular?: boolean;
}

export interface Product {
	id: string;
	sku: string;
	name: string;
	category: 'wordpress' | 'obsidian' | 'service' | 'other';
	description: string;
	features: string[];
	pricingTiers: PricingTier[];
	status: 'idea' | 'development' | 'beta' | 'launched' | 'retired';
	launchDate?: string;
	tags: string[];
}

export interface Bundle {
	id: string;
	name: string;
	description: string;
	productIds: string[];
	discountPercent: number;
	price: number;
}

// =========================================
// MARKET ANALYSIS
// =========================================
export interface Competitor {
	id: string;
	name: string;
	website: string;
	products: string;
	strengths: string[];
	weaknesses: string[];
	pricing: string;
	notes: string;
}

export interface MarketAnalysis {
	marketSize: string;
	growthRate: string;
	trends: string[];
	targetSegments: string[];
	competitors: Competitor[];
	differentiators: string[];
	opportunities: string[];
	threats: string[];
}

// =========================================
// MARKETING & SALES
// =========================================
export interface MarketingChannel {
	id: string;
	name: string;
	type: 'content' | 'social' | 'email' | 'paid' | 'partnership' | 'directory' | 'other';
	description: string;
	budget: number;
	status: 'planned' | 'active' | 'paused';
	metrics: string;
}

export interface SalesFunnel {
	awareness: string[];
	interest: string[];
	consideration: string[];
	conversion: string[];
	retention: string[];
}

export interface MarketingSales {
	websiteUrl: string;
	channels: MarketingChannel[];
	funnel: SalesFunnel;
	pricingStrategy: string;
	promotions: string[];
	partnerships: string[];
}

// =========================================
// OPERATIONS
// =========================================
export interface OperationalProcess {
	id: string;
	name: string;
	category: 'development' | 'support' | 'distribution' | 'admin';
	description: string;
	frequency: 'daily' | 'weekly' | 'monthly' | 'as-needed';
	tools: string[];
	owner: string;
}

export interface Operations {
	developmentProcess: string;
	releaseSchedule: string;
	supportChannels: string[];
	distributionMethod: string;
	processes: OperationalProcess[];
	tools: string[];
}

// =========================================
// TECHNOLOGY & INFRASTRUCTURE
// =========================================
export interface TechStack {
	id: string;
	category: 'ecommerce' | 'licensing' | 'hosting' | 'analytics' | 'support' | 'development' | 'other';
	name: string;
	purpose: string;
	cost: number;
	billingCycle: 'monthly' | 'yearly' | 'one-time' | 'free';
	notes: string;
}

export interface Technology {
	stack: TechStack[];
	licensingSystem: string;
	paymentProcessors: string[];
	analyticsTools: string[];
}

// =========================================
// FINANCIAL PLAN
// =========================================
export interface RevenueStream {
	id: string;
	name: string;
	type: 'product-sales' | 'subscriptions' | 'renewals' | 'services' | 'other';
	monthlyEstimate: number;
	notes: string;
}

export interface Expense {
	id: string;
	name: string;
	category: 'hosting' | 'tools' | 'marketing' | 'payment-fees' | 'support' | 'development' | 'legal' | 'other';
	amount: number;
	frequency: 'monthly' | 'yearly' | 'one-time';
	notes: string;
}

export interface FinancialProjection {
	year: number;
	revenue: number;
	expenses: number;
	profit: number;
	customers: number;
	notes: string;
}

export interface FinancialPlan {
	revenueStreams: RevenueStream[];
	expenses: Expense[];
	projections: FinancialProjection[];
	startupCosts: number;
	breakEvenPoint: string;
	fundingNeeds: string;
}

// =========================================
// LEGAL & COMPLIANCE
// =========================================
export interface LegalDocument {
	id: string;
	name: string;
	type: 'license' | 'eula' | 'privacy' | 'terms' | 'refund' | 'other';
	status: 'draft' | 'review' | 'active';
	lastUpdated: string;
	notes: string;
}

export interface LegalCompliance {
	businessStructure: string;
	licensingModel: string;
	documents: LegalDocument[];
	complianceNotes: string[];
}

// =========================================
// MILESTONES & ROADMAP
// =========================================
export interface Milestone {
	id: string;
	title: string;
	description: string;
	category: 'product' | 'revenue' | 'customer' | 'marketing' | 'operations' | 'other';
	targetDate: string;
	status: 'planned' | 'in-progress' | 'completed' | 'delayed';
	metrics: string;
	completedDate?: string;
	notes: string;
}

export interface Roadmap {
	milestones: Milestone[];
	quarterlyGoals: { [quarter: string]: string[] };
	longTermVision: string;
}

// =========================================
// COMPLETE BUSINESS PLAN
// =========================================
export interface BusinessPlan {
	id: string;
	name: string;
	description: string;
	icon: string;
	color: string;
	createdAt: string;
	lastUpdated: string;
	executive: ExecutiveSummary;
	products: Product[];
	bundles: Bundle[];
	market: MarketAnalysis;
	marketing: MarketingSales;
	operations: Operations;
	technology: Technology;
	financial: FinancialPlan;
	legal: LegalCompliance;
	roadmap: Roadmap;
}

// =========================================
// PLAN TEMPLATES
// =========================================
export type PlanTemplate = 'blank' | 'plugin-business' | 'saas' | 'consulting' | 'nonprofit';

// =========================================
// DEFAULT DATA
// =========================================
export function generateId(): string {
	return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function createNewPlan(name: string, template: PlanTemplate = 'blank'): BusinessPlan {
	const baseplan: BusinessPlan = {
		id: generateId(),
		name: name,
		description: '',
		icon: '📊',
		color: '#3498db',
		createdAt: new Date().toISOString(),
		lastUpdated: new Date().toISOString(),
		executive: {
			businessName: name,
			tagline: '',
			mission: '',
			vision: '',
			coreValues: [],
			targetMarket: '',
			uniqueValue: '',
			foundedDate: '',
			founder: ''
		},
		products: [],
		bundles: [],
		market: {
			marketSize: '',
			growthRate: '',
			trends: [],
			targetSegments: [],
			competitors: [],
			differentiators: [],
			opportunities: [],
			threats: []
		},
		marketing: {
			websiteUrl: '',
			channels: [],
			funnel: {
				awareness: [],
				interest: [],
				consideration: [],
				conversion: [],
				retention: []
			},
			pricingStrategy: '',
			promotions: [],
			partnerships: []
		},
		operations: {
			developmentProcess: '',
			releaseSchedule: '',
			supportChannels: [],
			distributionMethod: '',
			processes: [],
			tools: []
		},
		technology: {
			stack: [],
			licensingSystem: '',
			paymentProcessors: [],
			analyticsTools: []
		},
		financial: {
			revenueStreams: [],
			expenses: [],
			projections: [],
			startupCosts: 0,
			breakEvenPoint: '',
			fundingNeeds: ''
		},
		legal: {
			businessStructure: '',
			licensingModel: '',
			documents: [],
			complianceNotes: []
		},
		roadmap: {
			milestones: [],
			quarterlyGoals: {},
			longTermVision: ''
		}
	};

	// Apply template
	if (template === 'plugin-business') {
		baseplan.icon = '🔌';
		baseplan.color = '#9b59b6';
		baseplan.executive.mission = 'Empower users with powerful, easy-to-use plugins.';
		baseplan.executive.coreValues = ['User-First Design', 'Quality & Reliability', 'Continuous Improvement'];
		baseplan.market.targetSegments = ['Small Businesses', 'Productivity Enthusiasts', 'Knowledge Workers'];
		baseplan.market.differentiators = ['Superior documentation', 'Regular updates', 'Excellent support'];
		baseplan.marketing.funnel = {
			awareness: ['Content marketing', 'Plugin directories', 'Social media'],
			interest: ['Free trial/lite versions', 'Documentation', 'Demo videos'],
			consideration: ['Comparison guides', 'Testimonials', 'Feature highlights'],
			conversion: ['Promotional discounts', 'Bundle deals'],
			retention: ['Email updates', 'New features', 'Community engagement']
		};
		baseplan.legal.licensingModel = 'GPL for PHP, commercial EULA for JS/assets';
		baseplan.technology.paymentProcessors = ['Stripe', 'PayPal'];
	} else if (template === 'saas') {
		baseplan.icon = '☁️';
		baseplan.color = '#3498db';
		baseplan.market.targetSegments = ['SMBs', 'Enterprise', 'Startups'];
		baseplan.marketing.funnel = {
			awareness: ['SEO', 'Content marketing', 'Paid ads'],
			interest: ['Free trial', 'Webinars', 'Case studies'],
			consideration: ['Demo calls', 'ROI calculator', 'Comparisons'],
			conversion: ['Annual discount', 'Onboarding support'],
			retention: ['Customer success', 'Feature updates', 'Community']
		};
	} else if (template === 'consulting') {
		baseplan.icon = '💼';
		baseplan.color = '#27ae60';
		baseplan.market.targetSegments = ['Businesses needing expertise', 'Project-based clients'];
		baseplan.marketing.funnel = {
			awareness: ['Networking', 'Referrals', 'LinkedIn'],
			interest: ['Portfolio', 'Case studies', 'Blog'],
			consideration: ['Discovery calls', 'Proposals'],
			conversion: ['Contract signing'],
			retention: ['Ongoing retainers', 'Follow-up projects']
		};
	} else if (template === 'nonprofit') {
		baseplan.icon = '❤️';
		baseplan.color = '#e74c3c';
		baseplan.executive.coreValues = ['Community Impact', 'Transparency', 'Sustainability'];
		baseplan.market.targetSegments = ['Donors', 'Volunteers', 'Beneficiaries'];
	}

	return baseplan;
}

export function getDefaultBusinessPlan(): BusinessPlan {
	const plan = createNewPlan('BK', 'plugin-business');
	plan.executive.businessName = 'BK';
	plan.executive.tagline = 'Tools for a Better Life';
	plan.executive.mission = 'Empower humanity to develop habits for a better quality of life through powerful, easy-to-use WordPress and Obsidian.md plugins.';
	plan.executive.vision = 'A world where technology helps people live healthier, more organized, and more intentional lives.';
	plan.executive.targetMarket = 'Churches, non-profits, small businesses, and productivity enthusiasts seeking tools for better habits and organization.';
	plan.executive.uniqueValue = 'Integrated suite of plugins focused on wellness, productivity, and community - with superior support and regular updates.';
	return plan;
}

// =========================================
// HELPER FUNCTIONS
// =========================================
export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD'
	}).format(amount);
}

export function formatDate(date: string): string {
	if (!date) return '';
	return new Date(date).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
}

export function calculateMonthlyRevenue(streams: RevenueStream[]): number {
	return streams.reduce((sum, s) => sum + s.monthlyEstimate, 0);
}

export function calculateMonthlyExpenses(expenses: Expense[]): number {
	return expenses.reduce((sum, e) => {
		if (e.frequency === 'monthly') return sum + e.amount;
		if (e.frequency === 'yearly') return sum + (e.amount / 12);
		return sum;
	}, 0);
}

export function getProductsByStatus(products: Product[], status: Product['status']): Product[] {
	return products.filter(p => p.status === status);
}

export function getMilestonesByStatus(milestones: Milestone[], status: Milestone['status']): Milestone[] {
	return milestones.filter(m => m.status === status);
}
