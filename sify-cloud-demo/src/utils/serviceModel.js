import { Server, Database, Cloud, Network, Shield, HardDrive, Cpu, Globe, Key, MonitorSmartphone, Lock } from 'lucide-react';

export const SERVICE_CATEGORIES = {
  COMPUTE: {
    title: "Compute Services",
    icon: Cpu,
    services: [
      {
        sku: "CI-COMPUTE",
        label: "Compute Instance",
        description: "General purpose compute instance",
        configOptions: {
          vcpu: { min: 1, max: 64 },
          ram: { min: 1, max: 256 },
          storage: { min: 10, max: 2048 },
          os: ['Windows Server', 'Ubuntu', 'RHEL', 'CentOS'],
          features: ['antivirus', 'backup', 'sql-server'],
          public_ip: [true, false],
          firewall_enabled: [true, false],
          inbound_ports: ['80,443', '3389', '22', 'custom'],
          outbound_access: ['all', 'restricted']
        }
      },
      { 
        sku: "VM-BASIC", 
        label: "Virtual Machine", 
        description: "General purpose VMs",
        configOptions: {
          instance_count: { min: 1, max: 20 },
          cpu: { min: 1, max: 64 },
          ram: { min: 1, max: 256 },
          storage: { min: 10, max: 2048 },
          os: ['Windows Server', 'Ubuntu', 'RHEL', 'CentOS'],
          backup_retention: { min: 7, max: 90 },
          monitoring: ['basic', 'advanced'],
          public_ip: [true, false],
          firewall_enabled: [true, false],
          inbound_ports: ['80,443', '3389', '22', 'custom'],
          outbound_access: ['all', 'restricted']
        },
        templates: {
          'web-server': {
            label: 'Web Server',
            cpu: 2,
            ram: 4,
            storage: 50,
            os: 'Ubuntu',
            public_ip: true,
            firewall_enabled: true,
            inbound_ports: '80,443',
            outbound_access: 'all'
          },
          'db-server': {
            label: 'Database Server',
            cpu: 8,
            ram: 16,
            storage: 500,
            os: 'Windows Server',
            public_ip: false,
            firewall_enabled: true,
            inbound_ports: '3389',
            outbound_access: 'restricted'
          }
        }
      },
      { 
        sku: "VM-GPU", 
        label: "GPU Instance", 
        description: "GPU-enabled compute",
        configOptions: {
          gpu: { min: 1, max: 8 },
          gpu_memory: { min: 8, max: 80 },
          gpu_type: ['NVIDIA T4', 'NVIDIA A100', 'NVIDIA V100'],
          cpu: { min: 4, max: 96 },
          ram: { min: 16, max: 384 }
        }
      },
      { 
        sku: "CONTAINER", 
        label: "Container Service", 
        description: "Managed container platform",
        configOptions: {
          nodes: { min: 1, max: 100 },
          node_type: ['standard', 'compute-optimized', 'memory-optimized'],
          kubernetes_version: ['1.24', '1.25', '1.26', '1.27'],
          auto_scaling: [true, false],
          monitoring: ['basic', 'advanced']
        }
      }
    ]
  },
  STORAGE: {
    title: "Storage Solutions",
    icon: HardDrive,
    services: [
      {
        sku: "CI-STORAGE",
        label: "Block Storage",
        description: "General purpose block storage",
        configOptions: {
          size: { min: 10, max: 16384 },
          iops: { min: 100, max: 32000 },
          type: ['SSD', 'HDD'],
          encrypted: [true, false],
          snapshot_retention: { min: 1, max: 365 }
        }
      },
      { 
        sku: "OBJ-STD", 
        label: "Object Storage", 
        description: "Standard object storage",
        configOptions: {
          size: { min: 1, max: 1000000 },
          versioning: ['enabled', 'disabled'],
          lifecycle_rules: [true, false],
          replication: [true, false],
          access_tier: ['hot', 'cool', 'archive']
        }
      },
      { 
        sku: "FILE-NFS", 
        label: "File Storage", 
        description: "NFS-compatible storage",
        configOptions: {
          size: { min: 100, max: 102400 },
          protocol: ['nfs3', 'nfs4', 'smb'],
          throughput: { min: 16, max: 512 },
          snapshot_schedule: ['hourly', 'daily', 'weekly'],
          backup_enabled: [true, false]
        }
      }
    ]
  },
  PAAS: {
    title: "Platform Services",
    icon: Cloud,
    services: [
      {
        sku: "CI-PAAS",
        label: "Platform Service",
        description: "General purpose platform service",
        configOptions: {
          type: ['mysql', 'pgsql', 'redis', 'app-hosting'],
          size: ['small', 'medium', 'large'],
          ha: [true, false],
          backup_retention: { min: 7, max: 35 },
          storage: { min: 10, max: 4096 },
          auto_scaling: [true, false]
        }
      },
      { 
        sku: "DBAAS-MYSQL", 
        label: "MySQL Database", 
        description: "Managed MySQL service",
        configOptions: {
          version: ['5.7', '8.0'],
          size: ['small', 'medium', 'large'],
          ha: [true, false],
          backup_retention: { min: 7, max: 35 },
          storage: { min: 10, max: 4096 },
          auto_scaling: [true, false]
        }
      },
      { 
        sku: "DBAAS-PGSQL", 
        label: "PostgreSQL", 
        description: "Managed PostgreSQL service",
        configOptions: {
          version: ['11', '12', '13', '14', '15'],
          size: ['small', 'medium', 'large'],
          ha: [true, false],
          extensions: ['PostGIS', 'TimescaleDB', 'pgVector'],
          backup_retention: { min: 7, max: 35 }
        }
      },
      { 
        sku: "REDIS-CACHE", 
        label: "Redis Cache", 
        description: "In-memory caching service",
        configOptions: {
          size: ['small', 'medium', 'large'],
          cluster: [true, false],
          version: ['6.0', '6.2', '7.0'],
          persistence: [true, false],
          eviction_policy: ['noeviction', 'allkeys-lru', 'volatile-lru']
        }
      },
      { 
        sku: "APP-HOSTING", 
        label: "App Platform", 
        description: "Managed application platform",
        configOptions: {
          type: ['nodejs', 'python', 'java', 'dotnet', 'go', 'ruby'],
          size: ['small', 'medium', 'large'],
          auto_scaling: [true, false],
          custom_domain: [true, false],
          ci_cd: [true, false]
        }
      },
      { 
        sku: "KAFKA-STREAM", 
        label: "Kafka Service", 
        description: "Managed streaming platform",
        configOptions: {
          size: ['small', 'medium', 'large'],
          version: ['2.8', '3.0', '3.1', '3.2'],
          partitions: { min: 1, max: 100 },
          retention: { min: 1, max: 30 },
          monitoring: ['basic', 'advanced']
        }
      },
      {
        sku: "ELASTICSEARCH",
        label: "Elasticsearch Service",
        description: "Managed Elasticsearch cluster",
        configOptions: {
          version: ['7.10', '8.0', '8.4', '8.7'],
          size: ['small', 'medium', 'large'],
          nodes: { min: 1, max: 10 },
          plugins: ['analysis-icu', 'ingest-attachment'],
          monitoring: ['basic', 'advanced']
        }
      },
      {
        sku: "MONGODB",
        label: "MongoDB Service",
        description: "Managed MongoDB database",
        configOptions: {
          version: ['4.4', '5.0', '6.0'],
          size: ['small', 'medium', 'large'],
          replica_set: [true, false],
          backup_retention: { min: 1, max: 30 },
          sharding: [true, false]
        }
      },
      {
        sku: "AI-ML-PLATFORM",
        label: "AI/ML Platform",
        description: "Managed AI/ML development platform",
        configOptions: {
          frameworks: ['tensorflow', 'pytorch', 'scikit-learn'],
          gpu_support: [true, false],
          notebook_type: ['small', 'medium', 'large'],
          distributed_training: [true, false],
          model_serving: [true, false]
        }
      }
    ]
  },
  NETWORK: {
    title: "Networking",
    icon: Network,
    services: [
      {
        sku: "CI-NETWORK",
        label: "Network Service",
        description: "General purpose network service",
        configOptions: {
          bandwidth: { min: 10, max: 10000 },
          static_ip: [true, false],
          firewall: [true, false],
          vpn: [true, false],
          type: ['load-balancer', 'vpn', 'firewall']
        }
      },
      { 
        sku: "LB-STD", 
        label: "Load Balancer", 
        description: "Application load balancer",
        configOptions: {
          type: ['application', 'network'],
          throughput: { min: 1, max: 100 },
          ssl_offloading: [true, false],
          waf_enabled: [true, false],
          health_checks: ['tcp', 'http', 'https']
        }
      },
      { 
        sku: "VPN-S2S", 
        label: "VPN Gateway", 
        description: "Site-to-site VPN",
        configOptions: {
          bandwidth: { min: 10, max: 1000 },
          ha: [true, false],
          protocol: ['ikev1', 'ikev2'],
          monitoring: ['basic', 'advanced'],
          bgp: [true, false]
        }
      },
      { 
        sku: "WAF", 
        label: "Web Firewall", 
        description: "Web application firewall",
        configOptions: {
          rules: ['basic', 'advanced'],
          custom_rules: [true, false],
          ddos_protection: [true, false],
          bot_protection: [true, false],
          log_retention: { min: 30, max: 365 }
        }
      },
      {
        sku: "CDN",
        label: "Content Delivery Network",
        description: "Global content delivery network",
        configOptions: {
          optimization: ['web', 'large-file', 'media-streaming'],
          ssl: ['shared', 'dedicated'],
          rules_engine: [true, false],
          edge_locations: ['global', 'asia', 'europe', 'americas']
        }
      }
    ]
  },
  SECURITY: {
    title: "Security & Compliance",
    icon: Shield,
    services: [
      {
        sku: "CI-SECURITY",
        label: "Security Service",
        description: "General purpose security service",
        configOptions: {
          type: ['firewall', 'certificate', 'key-vault', 'iam'],
          auto_renewal: [true, false],
          monitoring: ['basic', 'advanced']
        }
      },
      { 
        sku: "CERT-MGT", 
        label: "Certificate Manager", 
        description: "SSL/TLS certificate management",
        configOptions: {
          type: ['standard', 'wildcard', 'multi-domain'],
          validation: ['dv', 'ov', 'ev'],
          auto_renewal: [true, false],
          monitoring: ['basic', 'advanced']
        }
      },
      { 
        sku: "KEY-VAULT", 
        label: "Key Vault", 
        description: "Secrets and key management",
        configOptions: {
          type: ['standard', 'premium'],
          hsm: [true, false],
          key_types: ['rsa-2048', 'rsa-4096', 'ec-p256', 'ec-p384'],
          access_policy: ['role-based', 'policy-based']
        }
      },
      { 
        sku: "IAM", 
        label: "Identity Service", 
        description: "Identity and access management",
        configOptions: {
          features: ['sso', 'mfa', 'rbac'],
          protocols: ['oauth2', 'saml', 'oidc'],
          directory_sync: [true, false],
          audit_logs: [true, false]
        }
      },
      {
        sku: "SIEM",
        label: "Security Information & Event Management",
        description: "Centralized security monitoring",
        configOptions: {
          retention: { min: 30, max: 365 },
          collectors: { min: 1, max: 10 },
          ai_detection: [true, false],
          compliance_reporting: ['pci', 'hipaa', 'gdpr', 'iso27001']
        }
      }
    ]
  },
  DEVOPS: {
    title: "DevOps & Management",
    icon: Cpu,
    services: [
      {
        sku: "CI-DEVOPS",
        label: "DevOps Service",
        description: "General purpose DevOps service",
        configOptions: {
          type: ['ci-cd', 'monitoring', 'log-analytics'],
          size: ['small', 'medium', 'large'],
          ha: [true, false],
          backup_retention: { min: 7, max: 90 },
          storage: { min: 50, max: 1000 },
          auto_scaling: [true, false]
        }
      },
      {
        sku: "CI-CD",
        label: "CI/CD Pipeline",
        description: "Managed CI/CD service",
        configOptions: {
          runners: { min: 1, max: 10 },
          concurrent_jobs: { min: 1, max: 20 },
          artifact_storage: { min: 50, max: 1000 },
          environments: ['dev', 'staging', 'prod']
        }
      },
      {
        sku: "MONITORING",
        label: "Monitoring & Alerting",
        description: "Infrastructure and application monitoring",
        configOptions: {
          retention: { min: 7, max: 90 },
          metrics_interval: ['30s', '1m', '5m'],
          alert_channels: ['email', 'slack', 'webhook'],
          dashboards: ['basic', 'advanced']
        }
      },
      {
        sku: "LOG-ANALYTICS",
        label: "Log Analytics",
        description: "Centralized logging and analysis",
        configOptions: {
          retention: { min: 7, max: 90 },
          ingestion_rate: { min: 1, max: 100 },
          analysis_tools: ['search', 'visualize', 'ml'],
          export: ['s3', 'elasticsearch']
        }
      }
    ]
  },
  BACKUP: {
    title: "Backup Services",
    icon: HardDrive,
    services: [
      {
        sku: "CI-BACKUP",
        label: "Backup Service",
        description: "General purpose backup service",
        configOptions: {
          retention: { min: 7, max: 365 },
          type: ['standard', 'premium'],
          encrypted: [true, false]
        }
      },
      {
        sku: "BLOCK-SSD",
        label: "Block Storage",
        description: "SSD-backed block storage",
        configOptions: {
          size: { min: 10, max: 16384 },
          iops: { min: 100, max: 32000 },
          throughput: { min: 128, max: 1024 },
          encryption: [true, false],
          snapshot_retention: { min: 1, max: 365 }
        }
      },
      {
        sku: "OBJ-STD",
        label: "Object Storage",
        description: "Standard object storage",
        configOptions: {
          size: { min: 1, max: 1000000 },
          versioning: ['enabled', 'disabled'],
          lifecycle_rules: [true, false],
          replication: [true, false],
          access_tier: ['hot', 'cool', 'archive']
        }
      },
      {
        sku: "FILE-NFS",
        label: "File Storage",
        description: "NFS-compatible storage",
        configOptions: {
          size: { min: 100, max: 102400 },
          protocol: ['nfs3', 'nfs4', 'smb'],
          throughput: { min: 16, max: 512 },
          snapshot_schedule: ['hourly', 'daily', 'weekly'],
          backup_enabled: [true, false]
        }
      }
    ]
  }
};

export const ENVIRONMENT_TYPES = {
  DEVELOPMENT: {
    name: "Development",
    shortName: "DEV",
    defaultScalingFactor: 0.5,
    description: "Development environment for building and testing",
    color: "#4CAF50",
    defaultHA: false,
    defaultBackup: false,
    defaultMonitoring: "basic",
    recommendedServices: ["VM-BASIC", "CONTAINER", "DBAAS-MYSQL", "APP-HOSTING"]
  },
  UAT: {
    name: "User Acceptance Testing",
    shortName: "UAT",
    defaultScalingFactor: 0.75,
    description: "UAT environment for client testing",
    color: "#2196F3",
    defaultHA: false,
    defaultBackup: true,
    defaultMonitoring: "standard",
    recommendedServices: ["VM-BASIC", "CONTAINER", "DBAAS-MYSQL", "APP-HOSTING", "LB-STD"]
  },
  STAGING: {
    name: "Staging",
    shortName: "STG",
    defaultScalingFactor: 1,
    description: "Pre-production staging environment",
    color: "#FF9800",
    defaultHA: true,
    defaultBackup: true,
    defaultMonitoring: "advanced",
    recommendedServices: ["VM-BASIC", "CONTAINER", "DBAAS-MYSQL", "APP-HOSTING", "LB-STD", "WAF"]
  },
  PRODUCTION: {
    name: "Production",
    shortName: "PROD",
    defaultScalingFactor: 1,
    description: "Production environment",
    color: "#F44336",
    defaultHA: true,
    defaultBackup: true,
    defaultMonitoring: "advanced",
    recommendedServices: ["VM-BASIC", "CONTAINER", "DBAAS-MYSQL", "APP-HOSTING", "LB-STD", "WAF", "CDN", "SIEM"]
  },
  DR: {
    name: "Disaster Recovery",
    shortName: "DR",
    defaultScalingFactor: 1,
    description: "Disaster recovery environment",
    color: "#9C27B0",
    defaultHA: true,
    defaultBackup: true,
    defaultMonitoring: "advanced",
    recommendedServices: ["VM-BASIC", "CONTAINER", "DBAAS-MYSQL", "APP-HOSTING", "LB-STD"]
  }
};

export const COMPLIANCE_REQUIREMENTS = {
  DATA_SOVEREIGNTY: {
    label: "Data Sovereignty",
    description: "Data must remain within specific geographic boundaries",
    options: ['India', 'EU', 'US', 'Asia Pacific'],
    affectedServices: ["OBJ-STD", "DBAAS-MYSQL", "DBAAS-PGSQL", "MONGODB"]
  },
  SECURITY_STANDARDS: {
    label: "Security Standards",
    description: "Required security certifications and standards",
    options: ['ISO27001', 'SOC2', 'PCI-DSS', 'HIPAA'],
    affectedServices: ["KEY-VAULT", "IAM", "SIEM"]
  },
  DATA_PROTECTION: {
    label: "Data Protection",
    description: "Data protection and encryption requirements",
    options: ['At-rest', 'In-transit', 'End-to-end'],
    affectedServices: ["BLOCK-SSD", "OBJ-STD", "KEY-VAULT"]
  },
  ACCESS_CONTROL: {
    label: "Access Control",
    description: "Access control and authentication requirements",
    options: ['MFA', 'SSO', 'IP Restrictions', 'Role-Based'],
    affectedServices: ["IAM", "KEY-VAULT", "APP-HOSTING"]
  },
  MONITORING: {
    label: "Monitoring & Auditing",
    description: "Monitoring and audit requirements",
    options: ['24x7 Monitoring', 'Audit Logging', 'Alert Management'],
    affectedServices: ["MONITORING", "LOG-ANALYTICS", "SIEM"]
  }
};

export const SERVICE_DEPENDENCIES = {
  "APP-HOSTING": ["DBAAS-MYSQL", "REDIS-CACHE", "LB-STD"],
  "DBAAS-MYSQL": ["BLOCK-SSD"],
  "KAFKA-STREAM": ["BLOCK-SSD"],
  "LB-STD": ["WAF"],
  "VM-BASIC": ["BLOCK-SSD", "VPN-S2S"],
  "CONTAINER": ["MONITORING", "LOG-ANALYTICS"],
  "WAF": ["LB-STD"],
  "SIEM": ["LOG-ANALYTICS"],
  "AI-ML-PLATFORM": ["BLOCK-SSD", "OBJ-STD"],
  "ELASTICSEARCH": ["BLOCK-SSD", "MONITORING"],
  "CDN": ["WAF", "CERT-MGT"]
};

// Utility to normalize a BoQ item for all categories
export function normalizeBoqItem(item) {
  // --- Internal code logic (short, CI- prefix for all) ---
  function getShortOsCode(os) {
    if (!os) return '';
    if (os.startsWith('win')) return 'WIN';
    if (os === 'ubuntu') return 'U';
    if (os === 'rhel') return 'R';
    return os[0].toUpperCase();
  }
  function getShortFeatureCode(feature) {
    if (feature === 'antivirus') return 'AV';
    if (feature === 'backup') return 'BKP';
    if (feature === 'sql-server') return 'SQL';
    return feature.slice(0, 3).toUpperCase();
  }
  const computed = { ...item };
  // Compute config objects from description if missing
  if (computed.category === 'Compute' && !computed.vmConfig && computed.description) {
    const vcpuMatch = computed.description.match(/(\d+)\s*vCPU/i);
    const ramMatch = computed.description.match(/(\d+)\s*GB/i);
    computed.vmConfig = {
      vcpu: vcpuMatch ? parseInt(vcpuMatch[1]) : 2,
      ram: ramMatch ? parseInt(ramMatch[1]) : 4,
      storage: 50,
      os: 'windows-2022',
      features: []
    };
  }
  if (computed.category === 'Network' && !computed.networkConfig && computed.description) {
    const bandwidthMatch = computed.description.match(/(\d+)\s*Mbps/i);
    computed.networkConfig = {
      bandwidth: bandwidthMatch ? parseInt(bandwidthMatch[1]) : 100,
      staticIp: /static ip/i.test(computed.description),
      firewall: /firewall/i.test(computed.description)
    };
  }
  if (computed.category === 'Backup' && !computed.backupConfig && computed.description) {
    computed.backupConfig = { type: /standard/i.test(computed.description) ? 'Standard' : 'Other' };
  }
  if (computed.category === 'Network' && computed.description && /vpn/i.test(computed.description)) {
    computed.vpnConfig = { type: /site-to-site/i.test(computed.description) ? 'Site-to-Site' : 'Other' };
  }
  // Internal code
  if (computed.category === 'Compute' && computed.vmConfig) {
    const { vcpu, ram, storage, os, features } = computed.vmConfig;
    const osTag = os ? `-${getShortOsCode(os)}` : '';
    const featTag = features && features.length ? '-' + features.map(getShortFeatureCode).join('') : '';
    computed.internalCode = `CI-${vcpu}C${ram}R${storage}S${osTag}${featTag}`;
  } else if (computed.category === 'Network' && (computed.networkConfig || computed.description)) {
    let bandwidth = computed.networkConfig?.bandwidth;
    if (!bandwidth && computed.description) {
      const match = computed.description.match(/(\d+)\s*Mbps/i);
      bandwidth = match ? match[1] : '100';
    }
    let code = `CI-NW-${bandwidth}M`;
    const staticIp = computed.networkConfig?.staticIp || /static ip/i.test(computed.description || '');
    const firewall = computed.networkConfig?.firewall || /firewall/i.test(computed.description || '');
    if (staticIp) code += '-SIP';
    if (firewall) code += '-FW';
    if (/vpn/i.test(computed.description || '')) code = 'CI-VPN-S2S';
    computed.internalCode = code;
  } else if (computed.category === 'Security') {
    if (computed.description && /firewall/i.test(computed.description)) computed.internalCode = 'CI-SEC-FW';
    else computed.internalCode = 'CI-SEC';
  } else if (computed.category === 'Backup') {
    if (computed.description && /standard/i.test(computed.description)) computed.internalCode = 'CI-BKP-STD';
    else computed.internalCode = 'CI-BKP';
  } else if (computed.category === 'Storage' && (computed.storageConfig || computed.description)) {
    let size = computed.storageConfig?.size;
    let type = computed.storageConfig?.type;
    if ((!size || !type) && computed.description) {
      const match = computed.description.match(/(\d+)\s*GB/i);
      size = match ? match[1] : '100';
      type = /ssd/i.test(computed.description) ? 'S' : 'H';
    }
    computed.internalCode = `CI-ST-${size}G-${type}`;
  } else if (computed.category === 'Custom') {
    if (computed.description && /vdi/i.test(computed.description)) {
      const match = computed.description.match(/(\d+)/);
      computed.internalCode = `CI-CUSTOM-VDI${match ? match[1] : ''}U`;
    } else {
      computed.internalCode = 'CI-CUSTOM';
    }
  } else {
    computed.internalCode = `CI-${computed.category?.toUpperCase() || 'GEN'}-${computed.sku || ''}`;
  }
  // --- Price logic ---
  // (You may want to import FLOOR_UNIT_PRICES, VM_OS_OPTIONS, VM_FEATURES from '../utils/constants' if needed)
  // For now, fallback to 5000 for non-compute
  if (!computed.unitPrice || computed.unitPrice === 0 || typeof computed.unitPrice !== 'number') {
    if (computed.category === 'Compute' && computed.vmConfig) {
      computed.unitPrice = computed.vmConfig.vcpu * 400 +
        computed.vmConfig.ram * 200 +
        computed.vmConfig.storage * 8 +
        (computed.vmConfig.os === 'windows-2022' ? 800 : computed.vmConfig.os === 'rhel' ? 1200 : 0) +
        (computed.vmConfig.features?.includes('antivirus') ? 200 : 0) +
        (computed.vmConfig.features?.includes('backup') ? 300 : 0);
    } else {
      computed.unitPrice = 5000;
    }
  }
  if (computed.askPrice === undefined || typeof computed.askPrice !== 'number') {
    computed.askPrice = computed.unitPrice;
  }
  computed.totalPrice = (computed.unitPrice || 0) * (computed.quantity || 1);
  // --- Environment normalization ---
  if (item.env) computed.env = item.env;
  else if (item.environment) computed.env = item.environment;
  else computed.env = 'PROD';
  return computed;
} 