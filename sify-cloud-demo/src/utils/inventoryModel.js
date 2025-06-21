/**
 * @file This file defines the modernized data model for the Customer Inventory Portal.
 * It aligns with industry-standard cloud terminology and provides a structured
 * hierarchy for representing complex customer inventories.
 */

// 1. Core Terminology Constants

export const CLOUD_TYPES = {
  SHARED: 'Shared Cloud', // Formerly VPI
  DEDICATED: 'Dedicated Cloud', // Formerly VPE
};

export const LOCATIONS = {
  MUMBAI: 'Mumbai (DC1)',
  CHENNAI: 'Chennai (DC2)',
  HYDERABAD: 'Hyderabad (DC3)',
  US_EAST_1: 'US East (N. Virginia)',
  EU_WEST_1: 'Europe (Ireland)',
};

export const SERVICE_CATEGORIES = {
  COMPUTE: 'Compute',
  STORAGE: 'Storage',
  NETWORK: 'Networking',
  DATABASE: 'Databases',
  SECURITY: 'Security',
  MANAGED_SERVICES: 'Managed Services',
};

export const RESOURCE_STATUS = {
  ACTIVE: 'Active',
  PROVISIONING: 'Provisioning',
  STOPPED: 'Stopped',
  DELETED: 'Deleted',
  PENDING_AMENDMENT: 'Pending Amendment',
};

// 2. Data Structure Definitions (for type hinting and documentation)

/**
 * Represents a single, concrete cloud resource.
 * This is the most granular level of the inventory.
 * @typedef {Object} Resource
 * @property {string} id - Unique identifier for the resource (e.g., res-0a1b2c3d).
 * @property {string} name - Human-readable name (e.g., 'prod-db-server-01').
 * @property {string} category - The service category (from SERVICE_CATEGORIES).
 * @property {string} type - The specific type of resource (e.g., 'Virtual Machine', 'Load Balancer').
 * @property {string} cloudType - The type of cloud environment (from CLOUD_TYPES).
 * @property {string} location - The physical/logical location (from LOCATIONS).
 * @property {string} status - The current operational status (from RESOURCE_STATUS).
 * @property {Object} specs - A flexible object for technical specifications (e.g., { vcpu: 8, ram: 32, disk: '500GB SSD' }).
 * @property {Array<string>} dependsOn - An array of resource IDs this resource depends on.
 * @property {number} mrr - Monthly Recurring Revenue for this specific resource.
 */

/**
 * Represents a subscribed service, which can be composed of one or more resources.
 * @typedef {Object} Service
 * @property {string} id - Unique identifier for the service instance (e.g., svc-12345).
 * @property {string} name - Name of the subscribed service (e.g., 'Production Web Hosting', 'P2P Link Mumbai-Chennai').
 * @property {string} category - The primary category of the service (from SERVICE_CATEGORIES).
 * @property {Array<Resource>} resources - An array of resources that make up this service.
 */

/**
 * Represents a customer's subscription or contract. It can contain multiple services
 * and track changes over time through amendments.
 * @typedef {Object} Subscription
 * @property {string} id - The subscription or contract ID (e.g., 'SUB-2024-001').
 * @property {string} name - A descriptive name for the subscription (e.g., 'Initial Infrastructure Order').
 * @property {string} startDate - The date the subscription became active.
 * @property {string} term - The contract term (e.g., '12 Months', '36 Months').
 * @property {Array<Service>} services - An array of services included in this subscription.
 * @property {Array<Object>} amendments - A log of all changes made to this subscription.
 * @property {number} totalMrr - The total Monthly Recurring Revenue for this subscription.
 */

/**
 * Represents the top-level customer object.
 * @typedef {Object} Customer
 * @property {string} id - The customer's unique ID (e.g., 'CUST-ACME').
 * @property {string} name - The customer's name (e.g., 'ACME Corporation').
 * @property {Array<Subscription>} subscriptions - An array of the customer's subscriptions.
 */ 