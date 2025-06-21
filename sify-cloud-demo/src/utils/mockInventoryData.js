import { CLOUD_TYPES, LOCATIONS, SERVICE_CATEGORIES, RESOURCE_STATUS } from './inventoryModel';
import { v4 as uuidv4 } from 'uuid';

/**
 * @file This file provides a mock data generator for creating a complex
 * customer inventory, matching the required user story for the portal.
 */

const generateResources = (serviceType, location, cloudType) => {
  const resources = [];
  if (serviceType === 'prod-hosting') {
    const webVmId = uuidv4();
    const dbVmId = uuidv4();
    resources.push({
      id: webVmId,
      name: `prod-web-vm-${location.slice(0, 3).toLowerCase()}-01`,
      category: SERVICE_CATEGORIES.COMPUTE,
      type: 'Virtual Machine',
      cloudType: cloudType,
      location: location,
      status: RESOURCE_STATUS.ACTIVE,
      specs: { vcpu: 4, ram: 16, disk: '200GB SSD' },
      dependsOn: [],
      mrr: cloudType === CLOUD_TYPES.DEDICATED ? 6000 : 4500,
    });
    resources.push({
      id: dbVmId,
      name: `prod-db-vm-${location.slice(0, 3).toLowerCase()}-01`,
      category: SERVICE_CATEGORIES.COMPUTE,
      type: 'Virtual Machine',
      cloudType: cloudType,
      location: location,
      status: RESOURCE_STATUS.ACTIVE,
      specs: { vcpu: 8, ram: 32, disk: '500GB SSD' },
      dependsOn: [webVmId],
      mrr: cloudType === CLOUD_TYPES.DEDICATED ? 11000 : 8000,
    });
    resources.push({
      id: uuidv4(),
      name: `prod-lb-${location.slice(0, 3).toLowerCase()}`,
      category: SERVICE_CATEGORIES.NETWORK,
      type: 'Load Balancer',
      cloudType: cloudType,
      location: location,
      status: RESOURCE_STATUS.ACTIVE,
      specs: { type: 'Application LB', throughput: '10 Gbps' },
      dependsOn: [webVmId, dbVmId],
      mrr: 1500,
    });
  }
  return resources;
};

const baseOrder = {
  id: `SUB-${uuidv4().slice(0, 8)}`,
  name: 'Initial Infrastructure Order',
  startDate: '2023-01-15',
  term: '36 Months',
  services: [
    {
      id: `svc-${uuidv4().slice(0, 8)}`,
      name: 'Production Hosting - Mumbai',
      category: SERVICE_CATEGORIES.COMPUTE,
      resources: generateResources('prod-hosting', LOCATIONS.MUMBAI, CLOUD_TYPES.DEDICATED),
    },
    {
      id: `svc-${uuidv4().slice(0, 8)}`,
      name: 'DR Hosting - Chennai',
      category: SERVICE_CATEGORIES.COMPUTE,
      resources: generateResources('prod-hosting', LOCATIONS.CHENNAI, CLOUD_TYPES.SHARED),
    },
    {
      id: `svc-${uuidv4().slice(0, 8)}`,
      name: 'Inter-DC P2P Link',
      category: SERVICE_CATEGORIES.NETWORK,
      resources: [
        {
          id: uuidv4(),
          name: 'P2P-MUM-CHN-10G',
          category: SERVICE_CATEGORIES.NETWORK,
          type: 'Point-to-Point Link',
          cloudType: CLOUD_TYPES.DEDICATED,
          location: `${LOCATIONS.MUMBAI} <--> ${LOCATIONS.CHENNAI}`,
          status: RESOURCE_STATUS.ACTIVE,
          specs: { speed: '10 Gbps' },
          dependsOn: [],
          mrr: 25000,
        },
      ],
    },
    {
      id: `svc-${uuidv4().slice(0, 8)}`,
      name: 'Advanced Security Package',
      category: SERVICE_CATEGORIES.SECURITY,
      resources: [
        {
          id: uuidv4(),
          name: 'Managed Firewall Service',
          category: SERVICE_CATEGORIES.SECURITY,
          type: 'Managed Firewall',
          cloudType: CLOUD_TYPES.DEDICATED,
          location: 'Global',
          status: RESOURCE_STATUS.ACTIVE,
          specs: { ruleCount: 500 },
          dependsOn: [],
          mrr: 12000,
        },
        {
          id: uuidv4(),
          name: 'Endpoint Detection & Response (EDR)',
          category: SERVICE_CATEGORIES.SECURITY,
          type: 'EDR Agent',
          cloudType: CLOUD_TYPES.DEDICATED,
          location: 'Global',
          status: RESOURCE_STATUS.ACTIVE,
          specs: { monitoredEndpoints: 4 },
          dependsOn: [],
          mrr: 3000,
        },
      ],
    },
    {
      id: `svc-${uuidv4().slice(0, 8)}`,
      name: 'Premier Managed Services',
      category: SERVICE_CATEGORIES.MANAGED_SERVICES,
      resources: [
        {
          id: uuidv4(),
          name: '24/7 Infrastructure Monitoring & Management',
          category: SERVICE_CATEGORIES.MANAGED_SERVICES,
          type: 'Support & Operations',
          cloudType: CLOUD_TYPES.DEDICATED,
          location: 'Global',
          status: RESOURCE_STATUS.ACTIVE,
          specs: { sla: '99.99%', responseTime: '15 Mins' },
          dependsOn: [],
          mrr: 35000,
        },
      ],
    },
  ],
  amendments: [],
};

// Function to calculate total MRR for a subscription
const calculateSubscriptionMrr = (subscription) => {
  return subscription.services.reduce((total, service) => {
    const serviceMrr = service.resources.reduce((sTotal, resource) => sTotal + resource.mrr, 0);
    return total + serviceMrr;
  }, 0);
};

baseOrder.totalMrr = calculateSubscriptionMrr(baseOrder);

// Simulate amendments
const amendments = [
  {
    date: '2023-06-20',
    type: 'UPDATE',
    description: 'Upgraded RAM for Mumbai DB server.',
    resourceId: baseOrder.services[0].resources[1].id,
    changes: {
      specs: { ...baseOrder.services[0].resources[1].specs, ram: 64 },
      mrr: baseOrder.services[0].resources[1].mrr + 4000,
    },
  },
  {
    date: '2024-01-10',
    type: 'ADD',
    description: 'Added new web server in Chennai for scalability.',
    serviceId: baseOrder.services[1].id,
    newResource: {
      id: uuidv4(),
      name: `dr-web-vm-che-02`,
      category: SERVICE_CATEGORIES.COMPUTE,
      type: 'Virtual Machine',
      cloudType: CLOUD_TYPES.SHARED,
      location: LOCATIONS.CHENNAI,
      status: RESOURCE_STATUS.ACTIVE,
      specs: { vcpu: 4, ram: 16, disk: '200GB SSD' },
      dependsOn: [],
      mrr: 4500,
    },
  },
];

// Apply amendments to a deep copy of the base order
const applyAmendments = (order, amendmentLog) => {
  const amendedOrder = JSON.parse(JSON.stringify(order));
  amendedOrder.amendments = amendmentLog;

  amendmentLog.forEach(amendment => {
    if (amendment.type === 'UPDATE') {
      const service = amendedOrder.services.find(s => s.resources.some(r => r.id === amendment.resourceId));
      if (service) {
        const resource = service.resources.find(r => r.id === amendment.resourceId);
        if (resource) {
          resource.specs = amendment.changes.specs;
          resource.mrr = amendment.changes.mrr;
        }
      }
    } else if (amendment.type === 'ADD') {
      const service = amendedOrder.services.find(s => s.id === amendment.serviceId);
      if (service) {
        service.resources.push(amendment.newResource);
      }
    }
  });

  amendedOrder.totalMrr = calculateSubscriptionMrr(amendedOrder);
  return amendedOrder;
};

const finalSubscription = applyAmendments(baseOrder, amendments);

export const mockCustomerInventory = {
  id: 'CUST-ACME-001',
  name: 'ACME Corporation',
  subscriptions: [finalSubscription],
}; 