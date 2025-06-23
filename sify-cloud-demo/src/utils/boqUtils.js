import { SERVICE_CATEGORIES as SERVICE_CATALOG } from './serviceModel';

export function parseVmConfig(description) {
  const vcpuMatch = description.match(/(\d+)\s*vCPU/i);
  const ramMatch = description.match(/(\d+)\s*GB/i);
  const osMatch = description.match(/windows/i) ? 'windows-2022' : 'rhel'; // Simplified
  return {
    vcpu: vcpuMatch ? parseInt(vcpuMatch[1], 10) : null,
    ram: ramMatch ? parseInt(ramMatch[1], 10) : null,
    os: osMatch,
    storage: 50, // Default storage
  };
}

export function generateInternalCode(service, config) {
  if (service.sku.includes('COMPUTE') && config.vcpu && config.ram) {
    const osTag = (config.os || 'linux').split('-')[0].toUpperCase();
    const storage = config.storage || 50;
    return `CI-${config.vcpu}C${config.ram}R${storage}S-${osTag}`;
  }
  if (service.sku.includes('STORAGE') && config.size) {
    return `ST-${config.size}G-${config.type?.toUpperCase() || 'SSD'}`;
  }
  if (service.sku === 'FIREWALL-ENT') {
    return `FW-ENT-01`;
  }
  return service.sku; // Fallback
}

export function getPrice(service, config) {
    // In a real app, this would be a complex calculation based on a price book.
    // Here, we'll use a simplified version based on configuration.
    let price = 0;
    const basePrice = service.basePrice || 0;

    if (service.sku.includes('COMPUTE') && config.vcpu && config.ram) {
        price = basePrice + (config.vcpu * 800) + (config.ram * 400);
        if(config.os?.includes('windows')) price += 500;
        price += (config.storage || 50) * 5;
    } else if (service.sku.includes('STORAGE') && config.size) {
        price = basePrice + config.size * 8;
    } else {
        price = basePrice;
    }
    return price || 50; // a fallback price
}

export const findServiceByKeywords = (desc) => {
    const lowerDesc = desc.toLowerCase();
    for (const category of Object.values(SERVICE_CATALOG)) {
      for (const service of category.services) {
        const keywords = service.label.toLowerCase().split(' ');
        if (keywords.some(k => lowerDesc.includes(k))) {
          return service;
        }
      }
    }
    return null;
}; 