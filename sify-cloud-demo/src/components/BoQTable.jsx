import React, { useState } from 'react'
import { CATALOG, VM_OS_OPTIONS, VM_FEATURES, FLOOR_UNIT_PRICES } from '../utils/constants'
import { Tooltip } from './ui/tooltip'
import { SERVICE_CATEGORIES } from '../utils/serviceModel'

// Helper functions from BoQGenerated
function extractVMConfig(description) {
  const vcpuMatch = description.match(/(\d+)\s*vCPU/i)
  const ramMatch = description.match(/(\d+)\s*GB/i)
  return {
    vcpu: vcpuMatch ? parseInt(vcpuMatch[1]) : 0,
    ram: ramMatch ? parseInt(ramMatch[1]) : 0
  }
}
function extractStorageGB(description) {
  const match = description.match(/(\d+)\s*GB/i)
  return match ? parseInt(match[1]) : 0
}
function getShortOsCode(os) {
  if (!os) return '';
  if (os.startsWith('win')) return 'W';
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
function getInternalCode(item) {
  // Compute
  if ((item.category === 'Compute' || item.category === 'COMPUTE') && item.vmConfig) {
    const { vcpu, ram, storage, os, features } = item.vmConfig;
    const osTag = os ? `-${getShortOsCode(os)}` : '';
    const featTag = features && features.length ? '-' + features.map(getShortFeatureCode).join('') : '';
    return `CI-${vcpu}C${ram}R${storage}S${osTag}${featTag}`;
  }
  // Network
  if ((item.category === 'Network' || item.category === 'NETWORK') && (item.networkConfig || item.description)) {
    let bandwidth = item.networkConfig?.bandwidth;
    if (!bandwidth && item.description) {
      const match = item.description.match(/(\d+)\s*Mbps/i);
      bandwidth = match ? match[1] : '100';
    }
    let code = `CI-NW-${bandwidth}M`;
    const staticIp = item.networkConfig?.staticIp || /static ip/i.test(item.description || '');
    const firewall = item.networkConfig?.firewall || /firewall/i.test(item.description || '');
    if (staticIp) code += '-SIP';
    if (firewall) code += '-FW';
    if (/vpn/i.test(item.description || '')) code = 'CI-VPN-S2S';
    return code;
  }
  // Security
  if ((item.category === 'Security' || item.category === 'SECURITY')) {
    if (item.description && /firewall/i.test(item.description)) return 'CI-SEC-FW';
    return 'CI-SEC';
  }
  // Backup
  if ((item.category === 'Backup' || item.category === 'BACKUP')) {
    if (item.description && /standard/i.test(item.description)) return 'CI-BKP-STD';
    return 'CI-BKP';
  }
  // Storage
  if ((item.category === 'Storage' || item.category === 'STORAGE') && (item.storageConfig || item.description)) {
    let size = item.storageConfig?.size;
    let type = item.storageConfig?.type;
    if ((!size || !type) && item.description) {
      const match = item.description.match(/(\d+)\s*GB/i);
      size = match ? match[1] : '100';
      type = /ssd/i.test(item.description) ? 'S' : 'H';
    }
    return `CI-ST-${size}G-${type}`;
  }
  // Custom
  if ((item.category === 'Custom' || item.category === 'CUSTOM')) {
    if (item.description && /vdi/i.test(item.description)) {
      const match = item.description.match(/(\d+)/);
      return `CI-CUSTOM-VDI${match ? match[1] : ''}U`;
    }
    return 'CI-CUSTOM';
  }
  // Fallback
  return `CI-${item.category?.toUpperCase() || 'GEN'}-${item.sku || ''}`;
}
function getVmDescription(vmConfig) {
  if (!vmConfig) return '';
  const osLabel = getShortOsCode(vmConfig.os);
  const featuresLabel = vmConfig.features.map(getShortFeatureCode).join(', ');
  return `VM - ${vmConfig.vcpu} vCPU, ${vmConfig.ram}GB RAM, ${vmConfig.storage}GB SSD${osLabel ? ', ' + osLabel : ''}${featuresLabel ? ', ' + featuresLabel : ''}`;
}
function getStorageDescription(storageConfig) {
  if (!storageConfig) return '';
  return `Storage - ${storageConfig.size}GB ${storageConfig.type?.toUpperCase() || 'SSD'}${storageConfig.encrypted ? ' (Encrypted)' : ''}, ${storageConfig.iops} IOPS`;
}
function getNetworkDescription(networkConfig) {
  if (!networkConfig) return '';
  return `Network - ${networkConfig.bandwidth}Mbps${networkConfig.staticIp ? ', Static IP' : ''}${networkConfig.firewall ? ', Firewall' : ''}`;
}

// Helper to generate logical internal code for custom items
function getCustomInternalCode(item) {
  const label = (item.name || item.label || item.description || '').toLowerCase();
  if (label.includes('vdi')) return `CI-CUSTOM-VDI-${item.quantity || 1}U`;
  if (label.includes('ai') || label.includes('ml') || label.includes('gpu')) return 'CI-CUSTOM-AIML-GPU';
  if (label.includes('kubernetes')) return 'CI-CUSTOM-K8S';
  if (label.includes('backup')) return 'CI-CUSTOM-BKP';
  if (label.includes('firewall')) return 'CI-CUSTOM-FW';
  return `CI-CUSTOM-${label.replace(/\s+/g, '').slice(0,8).toUpperCase()}`;
}

const ENV_OPTIONS = [
  { value: 'PROD', label: 'Production' },
  { value: 'DEV', label: 'Development' },
  { value: 'UAT', label: 'UAT' },
  { value: 'STAGE', label: 'Staging' },
];

// 1. Add a helper to get default SKU for a category
export const DEFAULT_SKU = {
  'COMPUTE': 'CI-COMPUTE',
  'STORAGE': 'CI-STORAGE',
  'PAAS': 'CI-PAAS',
  'NETWORK': 'CI-NETWORK',
  'SECURITY': 'CI-SECURITY',
  'BACKUP': 'CI-BACKUP',
  'DR-TOOL': 'CI-DR-TOOL',
  'MANAGED-SERVICES': 'CI-MANAGED-OS',
  'CUSTOM': 'CI-CUSTOM',
};

// Helper: Parse description for Compute (VM)
function parseVmFromDescription(description) {
  const vcpuMatch = description.match(/(\d+)\s*vCPU/i);
  const ramMatch = description.match(/(\d+)\s*GB/i);
  const storageMatch = description.match(/(\d+)\s*GB.*SSD|HDD/i);
  return {
    vcpu: vcpuMatch ? parseInt(vcpuMatch[1]) : 2,
    ram: ramMatch ? parseInt(ramMatch[1]) : 4,
    storage: storageMatch ? parseInt(storageMatch[1]) : 50,
    os: /windows/i.test(description) ? 'windows-2022' : /linux|ubuntu|rhel/i.test(description) ? 'ubuntu' : 'windows-2022',
    features: []
  };
}
// Helper: Parse description for Storage
function parseStorageFromDescription(description) {
  const sizeMatch = description.match(/(\d+)\s*GB/i);
  const type = /ssd/i.test(description) ? 'SSD' : /hdd/i.test(description) ? 'HDD' : 'SSD';
  return {
    size: sizeMatch ? parseInt(sizeMatch[1]) : 100,
    type
  };
}
// Helper: Parse description for Network
function parseNetworkFromDescription(description) {
  const bandwidthMatch = description.match(/(\d+)\s*Mbps/i);
  return {
    bandwidth: bandwidthMatch ? parseInt(bandwidthMatch[1]) : 100
  };
}
// Helper: Find best matching SKU from catalog
function findSkuFromDescription(description, category) {
  const lowerDesc = description.toLowerCase();
  const candidates = CATALOG.filter(c => c.category === category);
  let best = candidates.find(c => lowerDesc.includes((c.label || '').toLowerCase()));
  if (!best && candidates.length > 0) best = candidates[0];
  return best ? best.sku : DEFAULT_SKU[category] || 'CI-COMPUTE';
}
// Helper: Get floor price for ask price validation
function getFloorPriceForItem(item) {
  if ((item.category === 'Compute' || item.category === 'COMPUTE') && item.vmConfig) {
    return item.vmConfig.vcpu * FLOOR_UNIT_PRICES.vcpu +
      item.vmConfig.ram * FLOOR_UNIT_PRICES.ram +
      item.vmConfig.storage * FLOOR_UNIT_PRICES.storage +
      (VM_OS_OPTIONS.find(o => o.value === item.vmConfig.os)?.price || 0) +
      (item.vmConfig.features?.reduce((sum, f) => sum + (VM_FEATURES.find(x => x.value === f)?.price || 0), 0) || 0);
  } else if ((item.category === 'Storage' || item.category === 'STORAGE') && item.storageConfig) {
    return item.storageConfig.size * FLOOR_UNIT_PRICES.storage;
  } else if ((item.category === 'Network' || item.category === 'NETWORK')) {
    return FLOOR_UNIT_PRICES.network;
  } else if (FLOOR_UNIT_PRICES[item.sku]) {
    return FLOOR_UNIT_PRICES[item.sku];
  }
  return item.unitPrice || 0;
}

// Helper: Get configOptions for a given category and SKU
function getConfigOptions(category, sku) {
  // Normalize category for lookup
  const normalizedCategory = (category || '').toUpperCase();
  const catKey = Object.keys(SERVICE_CATEGORIES).find(
    k => k.toUpperCase() === normalizedCategory
  );
  if (!catKey) {
    return {};
  }
  // Direct SKU lookup only
  let service = SERVICE_CATEGORIES[catKey].services.find(s => (s.sku || '').toLowerCase() === (sku || '').toLowerCase());
  if (!service) {
    return {};
  }
  return service.configOptions || {};
}

// Helper: Get default value for a config option
function getDefaultConfigValue(opt) {
  if (Array.isArray(opt)) return opt[0];
  if (typeof opt === 'object' && opt.min !== undefined) return opt.min;
  return '';
}

// Helper: Populate config fields for add/edit
function populateConfigFields(category, sku, description, existingConfig = {}) {
  const configOptions = getConfigOptions(category, sku);
  const config = {};
  Object.entries(configOptions).forEach(([key, opt]) => {
    if (existingConfig[key] !== undefined) {
      config[key] = existingConfig[key];
    } else if (description) {
      // Try to parse from description for common fields
      if (key === 'cpu' || key === 'vcpu') {
        const match = description.match(/(\d+)\s*vCPU/i);
        config[key] = match ? parseInt(match[1]) : getDefaultConfigValue(opt);
      } else if (key === 'ram') {
        const match = description.match(/(\d+)\s*GB/i);
        config[key] = match ? parseInt(match[1]) : getDefaultConfigValue(opt);
      } else if (key === 'storage' || key === 'size') {
        const match = description.match(/(\d+)\s*GB/i);
        config[key] = match ? parseInt(match[1]) : getDefaultConfigValue(opt);
      } else if (Array.isArray(opt)) {
        config[key] = opt[0];
      } else if (typeof opt === 'object' && opt.min !== undefined) {
        config[key] = opt.min;
      } else {
        config[key] = '';
      }
    } else {
      config[key] = getDefaultConfigValue(opt);
    }
  });
  return config;
}

// In the edit form rendering, dynamically render fields for the selected category/SKU
function renderConfigFields(category, sku, config, handleConfigChange) {
  const configOptions = getConfigOptions(category, sku);
  if (!configOptions || Object.keys(configOptions).length === 0) {
    return (
      <div style={{ color: '#b91c1c', background: '#fef2f2', padding: '1rem', borderRadius: 6, marginBottom: 16 }}>
        <strong>No editable options available for this resource.</strong><br />
        Please check that the SKU and category are correct and match the service catalog.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      {Object.entries(configOptions).map(([key, opt]) => (
        <div key={key}>
          <label className="block font-medium mb-1">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
          {Array.isArray(opt) ? (
            <select value={config[key]} onChange={e => handleConfigChange(key, e.target.value)} className="w-full border rounded px-2 py-1">
              {opt.map(val => <option key={val} value={val}>{val}</option>)}
            </select>
          ) : typeof opt === 'object' && opt.min !== undefined ? (
            <input type="number" min={opt.min} max={opt.max} value={config[key]} onChange={e => handleConfigChange(key, parseInt(e.target.value))} className="w-full border rounded px-2 py-1" />
          ) : (
            <input type="text" value={config[key]} onChange={e => handleConfigChange(key, e.target.value)} className="w-full border rounded px-2 py-1" />
          )}
        </div>
      ))}
    </div>
  );
}

// Helper function to normalize SKU
function normalizeSkuFormat(sku, category) {
  // Always use the simple category-based SKU
  return DEFAULT_SKU[category] || DEFAULT_SKU['COMPUTE'];
}

// Helper function to normalize category
function normalizeCategory(category) {
  return (category || 'COMPUTE').toUpperCase();
}

// Helper function to create a normalized item
function createNormalizedItem(values) {
  const category = normalizeCategory(values.category);
  const sku = normalizeSkuFormat(values.sku, category);
  
  // Start with basic normalized values
  const normalized = {
    ...values,
    category,
    sku,
    quantity: parseInt(values.quantity) || 1,
    unitPrice: parseInt(values.unitPrice) || 0,
    askPrice: parseInt(values.askPrice) || parseInt(values.unitPrice) || 0,
  };

  // Generate the internal code based on configuration
  normalized.internalCode = getInternalCode(normalized);
  
  // Calculate total price
  normalized.totalPrice = normalized.unitPrice * normalized.quantity;

  return normalized;
}

// Accept props: items, setItems, editable, highlightNew, etc.
const BoQTable = ({ items, setItems, editable, highlightNew, onAddResource, onEditResource, allowCustomSKU = true, restrictEditToStandardSkus = false, restrictEditToCustomSkus = false, onApprovalStatusChange, persona, workflow }) => {
  const [editingIndex, setEditingIndex] = useState(null)
  const [editValues, setEditValues] = useState({})
  const [adding, setAdding] = useState(false)
  const [addValues, setAddValues] = useState({ 
    sku: DEFAULT_SKU['COMPUTE'],
    quantity: 1,
    unitPrice: '',
    askPrice: '',
    description: '',
    custom: false,
    category: 'COMPUTE',
    env: 'PROD'
  })
  const [expandedIndex, setExpandedIndex] = useState(null)
  const [configState, setConfigState] = useState({});

  // Handle edit
  const startEdit = (idx) => {
    const item = items[idx];
    // Create a normalized version of the item
    const normalizedItem = createNormalizedItem(item);
    
    // Set up config state
    let initialConfig = {};
    if (normalizedItem.category === 'COMPUTE' && normalizedItem.vmConfig) {
      initialConfig = { ...normalizedItem.vmConfig };
    } else if (normalizedItem.category === 'STORAGE' && normalizedItem.storageConfig) {
      initialConfig = { ...normalizedItem.storageConfig };
    } else if (normalizedItem.category === 'NETWORK' && normalizedItem.networkConfig) {
      initialConfig = { ...normalizedItem.networkConfig };
    } else if (normalizedItem.category === 'SECURITY' && normalizedItem.securityConfig) {
      initialConfig = { ...normalizedItem.securityConfig };
    } else if (normalizedItem.config) {
      initialConfig = { ...normalizedItem.config };
    }

    const config = populateConfigFields(
      normalizedItem.category,
      normalizedItem.sku,
      normalizedItem.description,
      initialConfig
    );

    setEditingIndex(idx);
    setExpandedIndex(idx);
    setEditValues({ 
      ...normalizedItem,
      custom: !CATALOG.some(c => c.sku === normalizedItem.sku)
    });
    setConfigState(config);
  };

  const handleEditChange = (field, value) => {
    setEditValues(prev => {
      let next = { ...prev, [field]: value };
      
      // Always normalize category and SKU
      next.category = normalizeCategory(next.category);
      next.sku = normalizeSkuFormat(next.sku, next.category);

      if (["category", "sku", "description"].includes(field)) {
        // Get initial config based on current state
        let initialConfig = {};
        if (next.category === 'COMPUTE' && next.vmConfig) initialConfig = { ...next.vmConfig };
        else if (next.category === 'STORAGE' && next.storageConfig) initialConfig = { ...next.storageConfig };
        else if (next.category === 'NETWORK' && next.networkConfig) initialConfig = { ...next.networkConfig };
        else if (next.category === 'SECURITY' && next.securityConfig) initialConfig = { ...next.securityConfig };
        else if (next.config) initialConfig = { ...next.config };

        const config = populateConfigFields(
          next.category,
          next.sku,
          field === "description" ? value : next.description,
          initialConfig
        );
        
        setConfigState(config);
        next.config = config;
      }

      return next;
    });
  };

  const saveEdit = (idx) => {
    // Create a normalized version of the edited item
    let normalizedItem = createNormalizedItem(editValues);
    
    // Merge in the current config state
    if (normalizedItem.category === 'COMPUTE') {
      normalizedItem.vmConfig = { ...configState };
      normalizedItem.description = getVmDescription(normalizedItem.vmConfig);
    } else if (normalizedItem.category === 'STORAGE') {
      normalizedItem.storageConfig = { ...configState };
      normalizedItem.description = getStorageDescription(normalizedItem.storageConfig);
    } else if (normalizedItem.category === 'NETWORK') {
      normalizedItem.networkConfig = { ...configState };
      normalizedItem.description = getNetworkDescription(normalizedItem.networkConfig);
    } else if (normalizedItem.category === 'SECURITY') {
      normalizedItem.securityConfig = { ...configState };
    } else {
      normalizedItem.config = { ...configState };
    }

    // Recalculate derived values
    normalizedItem.internalCode = getInternalCode(normalizedItem);
    normalizedItem.unitPrice = getFloorPriceForItem(normalizedItem);
    normalizedItem.totalPrice = normalizedItem.unitPrice * (normalizedItem.quantity || 1);
    normalizedItem.requiresApproval = parseInt(normalizedItem.askPrice) < normalizedItem.unitPrice;

    // Update the items array
    const updated = [...items];
    updated[idx] = normalizedItem;
    
    setItems(updated);
    setEditingIndex(null);
    setEditValues({});
    setConfigState({});
    
    if (onEditResource) onEditResource(idx, normalizedItem);
    if (typeof onApprovalStatusChange === 'function') {
      onApprovalStatusChange(updated.some(i => i.requiresApproval));
    }
  };

  // Handle add
  const startAdd = () => {
    setAdding(true);
    setAddValues({ 
      sku: DEFAULT_SKU['COMPUTE'],
      quantity: 1,
      unitPrice: '',
      askPrice: '',
      description: '',
      custom: false,
      category: 'COMPUTE',
      env: 'PROD'
    });
  };

  const handleAddChange = (field, value) => {
    setAddValues(prev => {
      let next = { ...prev };

      // Handle the changed field
      if (field === 'category') {
        next.category = value.toUpperCase();
        next.sku = DEFAULT_SKU[next.category];
      } else if (field === 'sku') {
        const catalogItem = CATALOG.find(c => c.sku === value || c.internalCode === value);
        if (catalogItem) {
          next = {
            ...next,
            description: catalogItem.label,
            category: catalogItem.category.toUpperCase(),
            unitPrice: catalogItem.unitPrice,
            askPrice: catalogItem.unitPrice
          };
          
          // For compute items, parse VM config from description
          if (next.category === 'COMPUTE') {
            next.vmConfig = parseVmFromDescription(catalogItem.label);
          }
        }
        // Always ensure simple SKU
        next.sku = DEFAULT_SKU[next.category];
      } else {
        next[field] = value;
      }

      // Handle description parsing for configs
      if (field === 'description' && value) {
        if (next.category === 'COMPUTE') {
          next.vmConfig = parseVmFromDescription(value);
        } else if (next.category === 'STORAGE') {
          next.storageConfig = parseStorageFromDescription(value);
        } else if (next.category === 'NETWORK') {
          next.networkConfig = parseNetworkFromDescription(value);
        }
      }

      return next;
    });
  };

  const saveAdd = () => {
    if (!addValues.sku || !addValues.quantity) return;

    // Create base item
    const newItem = {
      ...addValues,
      category: addValues.category.toUpperCase(),
      sku: DEFAULT_SKU[addValues.category.toUpperCase()],
      quantity: parseInt(addValues.quantity) || 1,
      unitPrice: parseInt(addValues.unitPrice) || 0,
      askPrice: parseInt(addValues.askPrice) || parseInt(addValues.unitPrice) || 0
    };

    // Generate internal code based on configuration
    if (newItem.category === 'COMPUTE' && newItem.vmConfig) {
      newItem.internalCode = getInternalCode({
        category: 'COMPUTE',
        vmConfig: newItem.vmConfig,
        description: newItem.description
      });
    } else if (newItem.category === 'STORAGE' && newItem.storageConfig) {
      newItem.internalCode = getInternalCode({
        category: 'STORAGE',
        storageConfig: newItem.storageConfig,
        description: newItem.description
      });
    } else if (newItem.category === 'NETWORK' && newItem.networkConfig) {
      newItem.internalCode = getInternalCode({
        category: 'NETWORK',
        networkConfig: newItem.networkConfig,
        description: newItem.description
      });
    } else {
      newItem.internalCode = getInternalCode(newItem);
    }

    // Calculate total price
    newItem.totalPrice = newItem.unitPrice * newItem.quantity;

    // Check for duplicates using internal code
    const isDuplicate = items.some(item => item.internalCode === newItem.internalCode);
    if (isDuplicate) {
      alert('This item already exists in the BoQ.');
      return;
    }

    // Add the item
    setItems([...items, newItem]);
    setAdding(false);
    setAddValues({
      sku: DEFAULT_SKU['COMPUTE'],
      quantity: 1,
      unitPrice: '',
      askPrice: '',
      description: '',
      custom: false,
      category: 'COMPUTE',
      env: 'PROD'
    });

    if (onAddResource) onAddResource(newItem);
    if (typeof onApprovalStatusChange === 'function') {
      onApprovalStatusChange([...items, newItem].some(i => i.requiresApproval));
    }
  };

  const cancelAdd = () => {
    setAdding(false)
    setAddValues({ sku: DEFAULT_SKU['COMPUTE'], quantity: 1, unitPrice: '', askPrice: '', description: '', custom: false, category: 'COMPUTE', env: 'PROD' })
  }

  // Helper function to determine if a row is a custom SKU
  const isCustomSku = (item) => {
    const cat = (item.category || '').toString().toUpperCase();
    const sku = (item.sku || '').toString().toUpperCase();
    const result = cat === 'CUSTOM' || sku.includes('CUSTOM');
    return result;
  };

  // Helper function to determine if a row is editable
  const isRowEditable = (item) => {
    if (!editable) return false;
    if (restrictEditToStandardSkus) {
      const custom = isCustomSku(item);
      return !custom;
    }
    if (restrictEditToCustomSkus) {
      const custom = isCustomSku(item);
      return custom;
    }
    return true;
  };

  // Helper function to start editing
  const handleStartEdit = (idx, item) => {
    setEditingIndex(idx);
    setEditValues({
      ...item,
      askPrice: item.askPrice || item.unitPrice,
      custom: !CATALOG.some(c => c.sku === item.sku)
    });
    setExpandedIndex(idx);
  };

  return (
    <div style={{ background: 'white', borderRadius: 8, border: '1px solid #e5e7eb', marginBottom: 32, overflow: 'hidden' }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0, color: '#111827' }}>📝 BoQ Items</h2>
        {editable && (
          <button onClick={startAdd} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '0.5rem 1.25rem', borderRadius: 6, fontWeight: 500, cursor: 'pointer' }}>+ Add Resource</button>
        )}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
          <thead style={{ background: '#f3f4f6' }}>
            <tr>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Env</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Description</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Internal Code</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>SKU</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Category</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>Quantity</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>Ask Price</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>Unit Price</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>Total Price</th>
              <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600 }}>Approval</th>
              {editable && <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600 }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => [
              <tr key={idx} style={{ background: highlightNew === idx ? '#fef9c3' : 'white', transition: 'background 0.3s' }}>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
                  {/* Env icon */}
                  <span title={item.env} style={{
                    display: 'inline-block',
                    width: 18, height: 18, borderRadius: '50%',
                    background: item.env === 'PROD' ? '#F44336' : item.env === 'DEV' ? '#4CAF50' : item.env === 'UAT' ? '#2196F3' : item.env === 'STAGE' ? '#FF9800' : '#9C27B0',
                    border: '2px solid #e5e7eb',
                  }} />
                </td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>{item.description}</td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>{item.internalCode}</td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>{item.sku || DEFAULT_SKU[item.category?.toUpperCase()] || ''}</td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>{item.category}</td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>{item.quantity}</td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>
                  {editingIndex === idx ? (
                    <input type="number" value={editValues.askPrice} onChange={e => handleEditChange('askPrice', e.target.value)} />
                  ) : (
                    item.askPrice !== undefined ? `₹${item.askPrice}` : `₹${item.unitPrice}`
                  )}
                </td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>₹{item.unitPrice?.toLocaleString()}</td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>₹{item.totalPrice?.toLocaleString()}</td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
                  {item.requiresApproval && (
                    <Tooltip content="Finance Admin Approval Required">
                      <span style={{ color: '#F44336', fontWeight: 700, fontSize: 18 }} title="Finance Admin Approval Required">!</span>
                    </Tooltip>
                  )}
                  {item.requiresApproval && (
                    <div style={{ color: '#b91c1c', fontSize: 12, marginTop: 2 }}>Pending: Finance</div>
                  )}
                </td>
                {editable && (
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
                    {isRowEditable(item) ? (
                      <button onClick={() => { startEdit(idx); }} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 4, padding: '0.25rem 0.75rem', fontWeight: 500, cursor: 'pointer' }}>Edit</button>
                    ) : (
                      <button disabled style={{ background: '#e5e7eb', color: '#9ca3af', border: 'none', borderRadius: 4, padding: '0.25rem 0.75rem', fontWeight: 500, cursor: 'not-allowed', opacity: 0.7 }}>Edit</button>
                    )}
                  </td>
                )}
              </tr>,
              expandedIndex === idx && editingIndex === idx ? (
                <tr>
                  <td colSpan={editable ? 10 : 9} style={{ background: '#f9fafb', padding: 0 }}>
                    <div style={{ maxWidth: 900, margin: '2rem auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', padding: '2rem 2.5rem', display: 'flex', flexDirection: 'column', gap: 32 }}>
                      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, letterSpacing: 0.5 }}>{item.category} Configuration</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        {renderConfigFields(item.category, item.sku, configState, handleEditChange)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-gray-600">SKU</label>
                          <input type="text" value={editValues.sku || ''} disabled className="w-full border rounded px-2 py-1 bg-gray-100 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-gray-600">Quantity</label>
                          <input type="number" value={editValues.quantity} min={1} onChange={e => handleEditChange('quantity', e.target.value)} className="w-full border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-200" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-gray-600">Unit Price</label>
                          <input type="number" value={editValues.unitPrice} disabled className="w-full border rounded px-2 py-1 bg-gray-100 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-gray-600">Ask Price</label>
                          <input type="number" value={editValues.askPrice} onChange={e => handleEditChange('askPrice', e.target.value)} className="w-full border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-200" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-gray-600">Total Price</label>
                          <input type="number" value={editValues.totalPrice} disabled className="w-full border rounded px-2 py-1 bg-gray-100 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-gray-600">Internal Code</label>
                          <input type="text" value={editValues.internalCode} disabled className="w-full border rounded px-2 py-1 bg-gray-100 text-sm" />
                        </div>
                        <div className="col-span-2 md:col-span-4">
                          <label className="block text-xs font-semibold mb-1 text-gray-600">Description</label>
                          <input type="text" value={editValues.description} disabled className="w-full border rounded px-2 py-1 bg-gray-100 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-gray-600">Environment</label>
                          <span title={editValues.env} style={{ display: 'inline-block', width: 18, height: 18, borderRadius: '50%', background: editValues.env === 'PROD' ? '#F44336' : editValues.env === 'DEV' ? '#4CAF50' : editValues.env === 'UAT' ? '#2196F3' : editValues.env === 'STAGE' ? '#FF9800' : '#9C27B0', border: '2px solid #e5e7eb', marginRight: 6, verticalAlign: 'middle' }} />
                          <select value={editValues.env || 'PROD'} onChange={e => handleEditChange('env', e.target.value)} className="w-full border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-200" style={{ width: 120 }}>
                            {ENV_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <button onClick={() => saveEdit(idx)} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, padding: '0.5rem 1.5rem', fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 1px 4px rgba(37,99,235,0.08)', transition: 'background 0.2s' }}>
                          <span style={{ fontSize: 18, verticalAlign: 'middle' }}>✓</span> Save
                        </button>
                        <button onClick={() => setEditingIndex(null)} style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 6, padding: '0.5rem 1.5rem', fontWeight: 500, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 1px 4px rgba(55,65,81,0.06)', transition: 'background 0.2s' }}>
                          <span style={{ fontSize: 18, verticalAlign: 'middle' }}>×</span> Cancel
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : null
            ])}
            {adding && (
              <tr style={{ background: '#e0f2fe' }}>
                <td style={{ padding: '0.75rem' }}>
                  <input value={addValues.description} onChange={e => handleAddChange('description', e.target.value)} style={{ width: '100%' }} />
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <select value={addValues.sku} onChange={e => handleAddChange('sku', e.target.value)} style={{ width: '100%' }}>
                    <option value=''>Select SKU</option>
                    {CATALOG.map(cat => <option key={cat.sku} value={cat.sku}>{cat.sku}</option>)}
                    {allowCustomSKU && <option value='custom'>Custom</option>}
                  </select>
                  {addValues.custom && (
                    <input value={addValues.sku} onChange={e => handleAddChange('sku', e.target.value)} placeholder='Custom SKU' style={{ width: '100%', marginTop: 4 }} />
                  )}
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <input value={addValues.internalCode} onChange={e => handleAddChange('internalCode', e.target.value)} style={{ width: '100%' }} />
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <input value={addValues.category} onChange={e => handleAddChange('category', e.target.value)} style={{ width: '100%' }} />
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                  <input type='number' value={addValues.quantity} onChange={e => handleAddChange('quantity', e.target.value)} style={{ width: 60 }} />
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                  <input type='number' value={addValues.askPrice} onChange={e => handleAddChange('askPrice', e.target.value)} style={{ width: 100 }} />
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                  ₹{(addValues.quantity && addValues.unitPrice ? (addValues.quantity * addValues.unitPrice).toLocaleString() : '0')}
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <select value={addValues.env || 'PROD'} onChange={e => handleAddChange('env', e.target.value)} style={{ width: '100%' }}>
                    {ENV_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <button onClick={saveAdd} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 4, padding: '0.25rem 0.75rem', marginRight: 4 }}>Add</button>
                  <button onClick={cancelAdd} style={{ background: '#f3f4f6', border: 'none', borderRadius: 4, padding: '0.25rem 0.75rem' }}>Cancel</button>
                </td>
              </tr>
            )}
            {items.length === 0 && !adding && (
              <tr>
                <td colSpan={editable ? 8 : 7} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>No BoQ items found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default BoQTable
export { getInternalCode, getFloorPriceForItem }; 