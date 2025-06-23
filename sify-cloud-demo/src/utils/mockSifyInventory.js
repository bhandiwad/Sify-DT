import { v4 as uuidv4 } from 'uuid';

const generateUsageData = (unit, trend = 'stable') => {
  const data = [];
  const today = new Date();
  for (let i = 2; i >= 0; i--) {
    const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
    let value;
    if (trend === 'up') {
      value = 50 + (2 - i) * 15 + Math.random() * 10;
    } else if (trend === 'down') {
      value = 80 - (2 - i) * 15 - Math.random() * 10;
    } else {
      value = 65 + Math.random() * 10;
    }
    data.push({
      month: month.toLocaleString('default', { month: 'short' }),
      value: Math.max(0, Math.min(100, parseFloat(value.toFixed(2)))),
      unit,
    });
  }
  return data;
};

export const maxHealthSifyInventory = {
  customerName: "Max Health Inc.",
  customerId: "CUST-MAXH-001",
  sifyServices: [
    // --- COMPUTE ---
    {
      id: uuidv4(),
      category: 'Compute',
      service: 'Virtual Machine',
      name: 'MH-PROD-WEB-01',
      location: 'Mumbai',
      role: 'DC',
      provider: 'Sify',
      redundancy: 'High Availability',
      status: 'Running',
      details: {
        instanceId: `i-${uuidv4().slice(0, 12)}`,
        privateIp: '10.10.1.15',
        image: 'Windows Server 2022',
        series: 'General Purpose',
        vcpu: 8,
        ram: 32, // GB
        storage: '250GB SSD',
        creationDate: '2023-01-15',
      },
      usage: {
        cpu: generateUsageData('%', 'up'),
        memory: generateUsageData('%'),
      },
      tags: { department: 'web-ops', project: 'e-commerce-prod' }
    },
    {
      id: uuidv4(),
      category: 'Compute',
      service: 'Virtual Machine',
      name: 'MH-PROD-WEB-02',
      location: 'Mumbai',
      role: 'DC',
      provider: 'Sify',
      redundancy: 'High Availability',
      status: 'Running',
      details: {
        instanceId: `i-${uuidv4().slice(0, 12)}`,
        privateIp: '10.10.1.16',
        image: 'Windows Server 2022',
        series: 'General Purpose',
        vcpu: 8,
        ram: 32,
        storage: '250GB SSD',
        creationDate: '2023-01-15',
      },
      usage: {
        cpu: generateUsageData('%', 'up'),
        memory: generateUsageData('%'),
      },
      tags: { department: 'web-ops', project: 'e-commerce-prod' }
    },
    {
      id: uuidv4(),
      category: 'Compute',
      service: 'Bare Metal Server',
      name: 'MH-PROD-DB-01',
      location: 'Mumbai',
      role: 'DC',
      provider: 'Sify',
      redundancy: 'Single Instance',
      status: 'Running',
      details: {
        serverId: `bm-${uuidv4().slice(0, 12)}`,
        privateIp: '10.10.2.10',
        model: 'Dell PowerEdge R740',
        cpu: '2 x Intel Xeon Gold 6248R',
        ram: '256GB DDR4',
        storage: '4 x 1.92TB NVMe SSD RAID-10',
        purchaseDate: '2022-11-20',
      },
      usage: {
        cpu: generateUsageData('%'),
        network: generateUsageData('Gbps'),
      },
      tags: { department: 'database-admin', project: 'e-commerce-prod' }
    },
    {
        id: uuidv4(),
        category: 'Compute',
        service: 'Kubernetes Cluster',
        name: 'MH-PROD-K8S-CLUSTER',
        location: 'Mumbai',
        role: 'DC',
        provider: 'Sify',
        redundancy: 'High Availability',
        status: 'Active',
        details: {
            clusterId: `k8s-${uuidv4().slice(0,12)}`,
            version: '1.28',
            nodePools: 3,
            totalVCpus: 24,
            totalMemory: '96GB',
            endpoint: '10.10.0.5'
        },
        usage: {
            podCapacity: generateUsageData('%'),
            cpuUsage: generateUsageData('%')
        },
        tags: { department: 'dev-ops', project: 'container-platform' }
    },
    {
        id: uuidv4(),
        category: 'Compute',
        service: 'Backup Job',
        name: 'Daily-VM-Backup-Policy',
        location: 'Mumbai',
        role: 'DC',
        provider: 'Sify',
        redundancy: 'High Availability',
        status: 'Active',
        details: {
            policyId: `pol-${uuidv4().slice(0,12)}`,
            frequency: 'Daily',
            retention: '30 days',
            backupTime: '02:00 AM',
            target: 'All production VMs'
        },
        usage: {},
        tags: { department: 'it-infra', project: 'disaster-recovery' }
    },
     // --- DR Site Resources ---
    {
      id: uuidv4(),
      category: 'Compute',
      service: 'Virtual Machine',
      name: 'MH-DR-WEB-01',
      location: 'Chennai',
      role: 'DR',
      provider: 'Sify',
      redundancy: 'High Availability',
      status: 'Stopped (Standby)',
       details: {
        instanceId: `i-${uuidv4().slice(0, 12)}`,
        privateIp: '10.20.1.15',
        image: 'Windows Server 2022',
        series: 'General Purpose',
        vcpu: 4,
        ram: 16,
        storage: '250GB SSD',
        creationDate: '2023-02-10',
      },
      usage: {},
      tags: { department: 'web-ops', project: 'e-commerce-dr' }
    },
    // --- STORAGE ---
    {
      id: uuidv4(),
      category: 'Storage',
      service: 'Block Storage',
      name: 'MH-PROD-DB-LOGS',
      location: 'Mumbai',
      role: 'DC',
      provider: 'Sify',
      redundancy: 'High Availability',
      status: 'Attached',
      details: {
        volumeId: `vol-${uuidv4().slice(0, 12)}`,
        type: 'High-IOPS SSD',
        size: '500GB',
        iops: '10,000',
        attachedTo: 'MH-PROD-DB-01'
      },
      usage: {
        readIops: generateUsageData('IOPS', 'stable'),
        writeIops: generateUsageData('IOPS', 'stable'),
      },
      tags: { department: 'database-admin', project: 'e-commerce-prod' }
    },
    // --- NETWORKING ---
    {
      id: uuidv4(),
      category: 'Networking',
      service: 'Cloud Connect',
      name: 'Sify-Mumbai-Chennai-P2P',
      location: 'N/A',
      role: 'Backbone',
      provider: 'Sify',
      redundancy: 'High Availability',
      status: 'Active',
      details: {
        circuitId: `cc-${uuidv4().slice(0, 12)}`,
        bandwidth: '10 Gbps',
        latency: '8ms',
        endpointA: 'Mumbai DC',
        endpointB: 'Chennai DR',
      },
      usage: {
        traffic: generateUsageData('Gbps', 'stable'),
      },
      tags: { department: 'it-infra', project: 'disaster-recovery' }
    },
    // --- SECURITY ---
    {
      id: uuidv4(),
      category: 'Security',
      service: 'SIEM',
      name: 'MaxHealth-Central-SIEM',
      location: 'Mumbai',
      role: 'DC',
      provider: 'Sify',
      redundancy: 'High Availability',
      status: 'Active',
      details: {
        serviceId: `siem-${uuidv4().slice(0, 12)}`,
        ingestionRate: '50 GB/day',
        hotStorage: '1TB',
        coldStorage: '5TB',
        monitoredSources: 'Sify Cloud, AWS, GCP'
      },
      usage: {
        events: generateUsageData('events/sec', 'up'),
      },
      tags: { department: 'security-ops', project: 'global-monitoring' }
    }
  ],
}; 