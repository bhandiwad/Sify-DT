// Shared constants for BoQ and related components

export const CATALOG = [
  // Compute (VMs)
  { label: 'Windows VM 2vCPU 4GB', sku: 'CI-2C4R50S-WINDOWS', internalCode: 'CI-2C4R50S-WINDOWS', category: 'Compute', unitPrice: 2400, env: 'PROD' },
  { label: 'Windows VM 4vCPU 8GB', sku: 'CI-4C8R50S-WINDOWS', internalCode: 'CI-4C8R50S-WINDOWS', category: 'Compute', unitPrice: 4800, env: 'PROD' },
  { label: 'Windows VM 8vCPU 16GB', sku: 'CI-8C16R50S-WINDOWS', internalCode: 'CI-8C16R50S-WINDOWS', category: 'Compute', unitPrice: 9600, env: 'PROD' },
  { label: 'Linux VM 2vCPU 4GB', sku: 'CI-2C4R50S-LINUX', internalCode: 'CI-2C4R50S-LINUX', category: 'Compute', unitPrice: 2000, env: 'PROD' },
  { label: 'Linux VM 4vCPU 8GB', sku: 'CI-4C8R50S-LINUX', internalCode: 'CI-4C8R50S-LINUX', category: 'Compute', unitPrice: 4000, env: 'PROD' },
  { label: 'Linux VM 8vCPU 16GB', sku: 'CI-8C16R50S-LINUX', internalCode: 'CI-8C16R50S-LINUX', category: 'Compute', unitPrice: 8000, env: 'PROD' },

  // Storage
  { label: 'SSD Storage 100GB', sku: 'CI-ST-100G-SSD', internalCode: 'CI-ST-100G-SSD', category: 'Storage', unitPrice: 800, env: 'PROD' },
  { label: 'SSD Storage 500GB', sku: 'CI-ST-500G-SSD', internalCode: 'CI-ST-500G-SSD', category: 'Storage', unitPrice: 3500, env: 'PROD' },
  { label: 'HDD Storage 1TB', sku: 'CI-ST-1000G-HDD', internalCode: 'CI-ST-1000G-HDD', category: 'Storage', unitPrice: 2000, env: 'PROD' },

  // Network
  { label: 'Standard Load Balancer', sku: 'CI-NW-STD', internalCode: 'CI-NW-STD', category: 'Network', unitPrice: 2000, env: 'PROD' },
  { label: 'Advanced Load Balancer', sku: 'CI-NW-ADV', internalCode: 'CI-NW-ADV', category: 'Network', unitPrice: 4000, env: 'PROD' },
  { label: 'Site-to-Site VPN', sku: 'CI-VPN-S2S', internalCode: 'CI-VPN-S2S', category: 'Network', unitPrice: 1500, env: 'PROD' },
  { label: 'Internet 100Mbps', sku: 'CI-INET-100M', internalCode: 'CI-INET-100M', category: 'Network', unitPrice: 5000, env: 'PROD' },
  { label: 'Internet 1Gbps', sku: 'CI-INET-1G', internalCode: 'CI-INET-1G', category: 'Network', unitPrice: 15000, env: 'PROD' },
  // Additional Network
  { label: 'MPLS Link 10Mbps', sku: 'CI-NW-MPLS-10M', internalCode: 'CI-NW-MPLS-10M', category: 'Network', unitPrice: 7000, env: 'PROD' },
  { label: 'SD-WAN Edge', sku: 'CI-NW-SDWAN-EDGE', internalCode: 'CI-NW-SDWAN-EDGE', category: 'Network', unitPrice: 9000, env: 'PROD' },
  { label: 'ExpressRoute 1Gbps', sku: 'CI-NW-EXPR-1G', internalCode: 'CI-NW-EXPR-1G', category: 'Network', unitPrice: 18000, env: 'PROD' },

  // Security
  { label: 'Standard Firewall', sku: 'CI-SEC-FW-STD', internalCode: 'CI-SEC-FW-STD', category: 'Security', unitPrice: 2500, env: 'PROD' },
  { label: 'Enterprise Firewall', sku: 'CI-SEC-FW-ENT', internalCode: 'CI-SEC-FW-ENT', category: 'Security', unitPrice: 5000, env: 'PROD' },
  { label: 'Standard Antivirus', sku: 'CI-SEC-AV-STD', internalCode: 'CI-SEC-AV-STD', category: 'Security', unitPrice: 300, env: 'PROD' },
  { label: 'Enterprise Antivirus', sku: 'CI-SEC-AV-ENT', internalCode: 'CI-SEC-AV-ENT', category: 'Security', unitPrice: 500, env: 'PROD' },
  // Additional Security
  { label: 'DDoS Protection', sku: 'CI-SECURITY-DDOS', internalCode: 'CI-SECURITY-DDOS', category: 'Security', unitPrice: 3500, env: 'PROD' },
  { label: 'Web Application Firewall', sku: 'CI-SECURITY-WAF', internalCode: 'CI-SECURITY-WAF', category: 'Security', unitPrice: 4000, env: 'PROD' },
  { label: 'SIEM Service', sku: 'CI-SECURITY-SIEM', internalCode: 'CI-SECURITY-SIEM', category: 'Security', unitPrice: 6000, env: 'PROD' },

  // DR Tools
  { label: 'DR Automation Tool', sku: 'CI-DR-TOOL-AUTO', internalCode: 'CI-DR-TOOL-AUTO', category: 'DR-TOOL', unitPrice: 8000, env: 'PROD' },
  { label: 'Replication Tool', sku: 'CI-DR-TOOL-REPL', internalCode: 'CI-DR-TOOL-REPL', category: 'DR-TOOL', unitPrice: 7000, env: 'PROD' },

  // PaaS
  { label: 'Managed Database (PaaS)', sku: 'CI-PAAS-DB', internalCode: 'CI-PAAS-DB', category: 'PAAS', unitPrice: 9000, env: 'PROD' },
  { label: 'App Service (PaaS)', sku: 'CI-PAAS-APP', internalCode: 'CI-PAAS-APP', category: 'PAAS', unitPrice: 6000, env: 'PROD' },
  { label: 'Managed Kubernetes (PaaS)', sku: 'CI-PAAS-K8S', internalCode: 'CI-PAAS-K8S', category: 'PAAS', unitPrice: 12000, env: 'PROD' },

  // Managed Services
  { label: 'Managed OS', sku: 'CI-MANAGED-OS', internalCode: 'CI-MANAGED-OS', category: 'MANAGED-SERVICES', unitPrice: 2000, env: 'PROD' },
  { label: 'Managed Backup', sku: 'CI-MANAGED-BKP', internalCode: 'CI-MANAGED-BKP', category: 'MANAGED-SERVICES', unitPrice: 2500, env: 'PROD' },
  { label: '24x7 Monitoring', sku: 'CI-MANAGED-MON', internalCode: 'CI-MANAGED-MON', category: 'MANAGED-SERVICES', unitPrice: 3000, env: 'PROD' },

  // Backup & DR
  { label: 'Standard Backup', sku: 'CI-BKP-STD', internalCode: 'CI-BKP-STD', category: 'Backup', unitPrice: 1000, env: 'PROD' },
  { label: 'Enterprise Backup', sku: 'CI-BKP-ENT', internalCode: 'CI-BKP-ENT', category: 'Backup', unitPrice: 2000, env: 'PROD' },
  { label: 'Basic Disaster Recovery', sku: 'CI-DR-BASIC', internalCode: 'CI-DR-BASIC', category: 'DR', unitPrice: 5000, env: 'PROD' },
];

export const FLOOR_UNIT_PRICES = {
  vcpu: 400, // per vCPU
  ram: 200,  // per GB RAM
  storage: 8, // per GB Storage
  network: 6000, // per unit (example)
  // Add more as needed
};

export const VM_OS_OPTIONS = [
  { label: 'Windows Server 2022', value: 'windows-2022', price: 800 },
  { label: 'Ubuntu 22.04 LTS', value: 'ubuntu', price: 0 },
  { label: 'Red Hat Enterprise Linux', value: 'rhel', price: 1200 }
];

export const VM_FEATURES = [
  { label: 'Antivirus', value: 'antivirus', price: 200 },
  { label: 'Backup', value: 'backup', price: 300 },
  { label: 'SQL Server', value: 'sql-server', price: 8000 }
]; 