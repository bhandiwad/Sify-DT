import React, { useState } from 'react'
import { CATALOG, VM_OS_OPTIONS, VM_FEATURES, FLOOR_UNIT_PRICES } from './BoQGenerated'

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
  if (item.category === 'Compute' && item.vmConfig) {
    const { vcpu, ram, storage, os, features } = item.vmConfig
    const osTag = os ? `-${getShortOsCode(os)}` : ''
    const featTag = features && features.length ? '-' + features.map(getShortFeatureCode).join('') : ''
    return `CI-${vcpu}C${ram}R${storage}S${osTag}${featTag}`
  }
  if (item.category === 'Storage' && item.storageConfig) {
    const { size, iops, type } = item.storageConfig
    return `ST-${size}G-${type?.toUpperCase() || 'SSD'}-I${iops >= 1000 ? Math.round(iops/1000)+'K' : iops}`
  }
  if (item.category === 'Network' && item.networkConfig) {
    const { bandwidth, staticIp, firewall } = item.networkConfig
    return `NW-${bandwidth}M${staticIp ? '-SIP' : ''}${firewall ? '-FW' : ''}`
  }
  return item.internalCode
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

// Accept props: items, setItems, editable, highlightNew, etc.
const BoQTable = ({ items, setItems, editable, highlightNew, onAddResource, onEditResource, allowCustomSKU = true, onApprovalStatusChange }) => {
  const [editingIndex, setEditingIndex] = useState(null)
  const [editValues, setEditValues] = useState({})
  const [adding, setAdding] = useState(false)
  const [addValues, setAddValues] = useState({ sku: '', quantity: 1, unitPrice: '', description: '', custom: false })
  const [expandedIndex, setExpandedIndex] = useState(null)

  // Handle edit
  const startEdit = (idx) => {
    const item = items[idx];
    // Compute missing fields
    let computed = { ...item };
    // Compute internal code
    computed.internalCode = getInternalCode(item);
    // Compute description
    if (item.category === 'Compute' && item.vmConfig) computed.description = getVmDescription(item.vmConfig);
    if (item.category === 'Storage' && item.storageConfig) computed.description = getStorageDescription(item.storageConfig);
    if (item.category === 'Network' && item.networkConfig) computed.description = getNetworkDescription(item.networkConfig);
    // Compute unit price
    if (!item.unitPrice || item.unitPrice === 0) {
      if (item.category === 'Compute' && item.vmConfig) {
        computed.unitPrice = item.vmConfig.vcpu * FLOOR_UNIT_PRICES.vcpu + item.vmConfig.ram * FLOOR_UNIT_PRICES.ram + item.vmConfig.storage * FLOOR_UNIT_PRICES.storage + (VM_OS_OPTIONS.find(o => o.value === item.vmConfig.os)?.price || 0) + (item.vmConfig.features?.reduce((sum, f) => sum + (VM_FEATURES.find(x => x.value === f)?.price || 0), 0) || 0);
      } else if (item.category === 'Storage' && item.storageConfig) {
        computed.unitPrice = item.storageConfig.size * FLOOR_UNIT_PRICES.storage;
      } else if (item.category === 'Network') {
        computed.unitPrice = FLOOR_UNIT_PRICES.network;
      } else {
        computed.unitPrice = 5000;
      }
    }
    setEditingIndex(idx);
    setEditValues({ ...computed, custom: !CATALOG.some(c => c.sku === item.sku) });
  };

  const handleEditChange = (field, value) => {
    setEditValues(prev => ({ ...prev, [field]: value }))
    if (field === 'sku') {
      const cat = CATALOG.find(c => c.sku === value)
      if (cat) {
        setEditValues(prev => ({
          ...prev,
          custom: false,
          unitPrice: cat.unitPrice,
          description: cat.label,
          category: cat.category,
          internalCode: cat.internalCode
        }))
      } else {
        setEditValues(prev => ({ ...prev, custom: true }))
      }
    }
  }
  const saveEdit = (idx) => {
    const updated = [...items];
    let item = { ...editValues };
    // Always recompute fields
    if (item.category === 'Compute' && item.vmConfig) {
      item.internalCode = getInternalCode(item);
      item.description = getVmDescription(item.vmConfig);
      if (!item.unitPrice || item.unitPrice === 0) {
        item.unitPrice = item.vmConfig.vcpu * FLOOR_UNIT_PRICES.vcpu + item.vmConfig.ram * FLOOR_UNIT_PRICES.ram + item.vmConfig.storage * FLOOR_UNIT_PRICES.storage + (VM_OS_OPTIONS.find(o => o.value === item.vmConfig.os)?.price || 0) + (item.vmConfig.features?.reduce((sum, f) => sum + (VM_FEATURES.find(x => x.value === f)?.price || 0), 0) || 0);
      }
    } else if (item.category === 'Storage' && item.storageConfig) {
      item.internalCode = getInternalCode(item);
      item.description = getStorageDescription(item.storageConfig);
      if (!item.unitPrice || item.unitPrice === 0) {
        item.unitPrice = item.storageConfig.size * FLOOR_UNIT_PRICES.storage;
      }
    } else if (item.category === 'Network' && item.networkConfig) {
      item.internalCode = getInternalCode(item);
      item.description = getNetworkDescription(item.networkConfig);
      if (!item.unitPrice || item.unitPrice === 0) {
        item.unitPrice = FLOOR_UNIT_PRICES.network;
      }
    } else if (item.category === 'Custom') {
      // Ensure customConfig is saved
      item.customConfig = editValues.customConfig || {};
      // Use custom logic for internal code/description
      const label = item.name || item.label || item.description || '';
      const lowerLabel = label.toLowerCase();
      const isVDI = lowerLabel.includes('vdi');
      const isStorage = lowerLabel.includes('storage');
      const isNetwork = lowerLabel.includes('network') || lowerLabel.includes('vpn');
      const isFirewall = lowerLabel.includes('firewall') || lowerLabel.includes('security');
      const isBackup = lowerLabel.includes('backup') || lowerLabel.includes('dr');
      const config = item.customConfig || {};
      function getCustomDescription(label, config) {
        if (isVDI) return `VDI - ${config.oem || ''} - ${config.users || ''} users, ${config.vcpu || ''} vCPU, ${config.ram || ''}GB RAM, ${config.storage || ''}GB, ${config.os || ''}`;
        if (isStorage) return `Storage - ${config.oem || ''} - ${config.size || ''}GB ${config.type || ''}, ${config.iops || ''} IOPS`;
        if (isNetwork) return `Network - ${config.oem || ''} - ${config.bandwidth || ''}Mbps, ${config.connections || ''} connections`;
        if (isFirewall) return `Firewall - ${config.oem || ''} - ${config.ruleSet || ''}, ${config.throughput || ''}Mbps`;
        if (isBackup) return `Backup - ${config.oem || ''} - ${config.frequency || ''}, ${config.retention || ''}d`;
        return label;
      }
      function getCustomInternalCode(label, config) {
        if (isVDI) return `VDI-${(config.oem || '').slice(0,3).toUpperCase()}-${config.users || ''}U`;
        if (isStorage) return `CST-ST-${(config.oem || '').slice(0,3).toUpperCase()}-${config.size || ''}G`;
        if (isNetwork) return `CST-NW-${(config.oem || '').slice(0,3).toUpperCase()}-${config.bandwidth || ''}M`;
        if (isFirewall) return `CST-FW-${(config.oem || '').slice(0,3).toUpperCase()}-${config.ruleSet || ''}`;
        if (isBackup) return `CST-BKP-${(config.oem || '').slice(0,3).toUpperCase()}-${config.frequency || ''}`;
        return `CST-${label.replace(/\s+/g, '').slice(0,8).toUpperCase()}`;
      }
      item.internalCode = getCustomInternalCode(label, config);
      item.description = getCustomDescription(label, config);
      if (!item.unitPrice || item.unitPrice === 0) item.unitPrice = 5000;
    } else {
      // Fallback for other categories
      item.internalCode = getInternalCode(item);
      if (!item.unitPrice || item.unitPrice === 0) item.unitPrice = 5000;
    }
    item.totalPrice = (item.quantity && item.unitPrice) ? item.quantity * item.unitPrice : 0;
    updated[idx] = item;
    setItems(updated);
    setEditingIndex(null);
    setEditValues({});
    if (onEditResource) onEditResource(idx, item);
    if (typeof onApprovalStatusChange === 'function') {
      onApprovalStatusChange(updated.some(i => i.requiresApproval));
    }
  };
  const cancelEdit = () => {
    setEditingIndex(null)
    setEditValues({})
  }

  // Handle add
  const startAdd = () => {
    setAdding(true)
    setAddValues({ sku: '', quantity: 1, unitPrice: '', description: '', custom: false })
  }
  const handleAddChange = (field, value) => {
    setAddValues(prev => ({ ...prev, [field]: value }))
    if (field === 'sku') {
      const cat = CATALOG.find(c => c.sku === value)
      if (cat) {
        setAddValues(prev => ({
          ...prev,
          custom: false,
          unitPrice: cat.unitPrice,
          description: cat.label,
          category: cat.category,
          internalCode: cat.internalCode
        }))
      } else {
        setAddValues(prev => ({ ...prev, custom: true }))
      }
    }
  }
  const saveAdd = () => {
    if (!addValues.sku || !addValues.quantity || !addValues.unitPrice) return
    const newItem = {
      ...addValues,
      internalCode: getInternalCode(addValues),
      totalPrice: parseInt(addValues.quantity) * parseInt(addValues.unitPrice)
    }
    setItems([...items, newItem])
    setAdding(false)
    setAddValues({ sku: '', quantity: 1, unitPrice: '', description: '', custom: false })
    if (onAddResource) onAddResource(newItem)
    if (typeof onApprovalStatusChange === 'function') {
      onApprovalStatusChange(items.some(i => i.requiresApproval));
    }
  }
  const cancelAdd = () => {
    setAdding(false)
    setAddValues({ sku: '', quantity: 1, unitPrice: '', description: '', custom: false })
  }

  // Helper: Render expanded row for a resource
  function renderExpandedRow(item, idx) {
    // VM/Compute
    if (item.category === 'Compute') {
      const vmConfig = editValues.vmConfig || item.vmConfig || { vcpu: 2, ram: 4, storage: 50, os: 'windows-2022', features: [] }
      const handleVmChange = (field, value) => {
        const newVmConfig = { ...vmConfig, [field]: value }
        setEditValues(prev => ({
          ...prev,
          vmConfig: newVmConfig,
          internalCode: getInternalCode({ ...prev, vmConfig: newVmConfig }),
          description: getVmDescription(newVmConfig)
        }))
      }
      const handleVmFeatureToggle = (feature) => {
        const features = vmConfig.features.includes(feature)
          ? vmConfig.features.filter(f => f !== feature)
          : [...vmConfig.features, feature]
        const newVmConfig = { ...vmConfig, features }
        setEditValues(prev => ({
          ...prev,
          vmConfig: newVmConfig,
          internalCode: getInternalCode({ ...prev, vmConfig: newVmConfig }),
          description: getVmDescription(newVmConfig)
        }))
      }
      const floorPrice = vmConfig.vcpu * FLOOR_UNIT_PRICES.vcpu + vmConfig.ram * FLOOR_UNIT_PRICES.ram + vmConfig.storage * FLOOR_UNIT_PRICES.storage + (VM_OS_OPTIONS.find(o => o.value === vmConfig.os)?.price || 0) + (vmConfig.features?.reduce((sum, f) => sum + (VM_FEATURES.find(x => x.value === f)?.price || 0), 0) || 0)
      const unitPrice = editValues.unitPrice !== undefined ? editValues.unitPrice : floorPrice
      const belowFloor = unitPrice < floorPrice
      return (
        <tr>
          <td colSpan={editable ? 8 : 7} style={{ background: '#f3f4f6', padding: 0 }}>
            <div style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: 24 }}>
              <div>
                <label>vCPU</label><br/>
                <input type='number' min={1} max={128} value={vmConfig.vcpu} onChange={e => handleVmChange('vcpu', parseInt(e.target.value))} style={{ width: 60 }} />
              </div>
              <div>
                <label>RAM (GB)</label><br/>
                <input type='number' min={1} max={1024} value={vmConfig.ram} onChange={e => handleVmChange('ram', parseInt(e.target.value))} style={{ width: 60 }} />
              </div>
              <div>
                <label>Storage (GB)</label><br/>
                <input type='number' min={10} max={4096} value={vmConfig.storage} onChange={e => handleVmChange('storage', parseInt(e.target.value))} style={{ width: 80 }} />
              </div>
              <div>
                <label>OS</label><br/>
                <select value={vmConfig.os} onChange={e => handleVmChange('os', e.target.value)}>
                  {VM_OS_OPTIONS.map(os => <option key={os.value} value={os.value}>{os.label}</option>)}
                </select>
              </div>
              <div>
                <label>Features</label><br/>
                {VM_FEATURES.map(f => (
                  <label key={f.value} style={{ marginRight: 8 }}>
                    <input type='checkbox' checked={vmConfig.features.includes(f.value)} onChange={() => handleVmFeatureToggle(f.value)} /> {f.label}
                  </label>
                ))}
              </div>
              <div>
                <label>Quantity</label><br/>
                <input type='number' min={1} value={editValues.quantity} onChange={e => setEditValues(prev => ({ ...prev, quantity: parseInt(e.target.value), description: getVmDescription(vmConfig) }))} style={{ width: 60 }} />
              </div>
              <div>
                <label>Unit Price</label><br/>
                <input type='number' value={unitPrice} onChange={e => setEditValues(prev => ({ ...prev, unitPrice: parseInt(e.target.value) }))} style={{ width: 100, background: belowFloor ? '#fef3c7' : '#e5e7eb' }} />
                {belowFloor && <div style={{ color: '#b45309', fontSize: 12 }}>Below floor price! Approval required.</div>}
              </div>
              <div>
                <label>Internal Code</label><br/>
                <input value={getInternalCode({ ...editValues, vmConfig })} readOnly style={{ width: 180, background: '#e5e7eb' }} />
              </div>
              <div>
                <label>Description</label><br/>
                <input value={getVmDescription(vmConfig)} readOnly style={{ width: 260, background: '#e5e7eb' }} />
              </div>
              <div>
                <label>Total Price</label><br/>
                <input value={editValues.quantity * unitPrice} readOnly style={{ width: 120, background: '#e5e7eb' }} />
              </div>
              <div style={{ alignSelf: 'end' }}>
                <button onClick={() => saveEdit(idx)} style={{ background: belowFloor ? '#d1d5db' : '#2563eb', color: belowFloor ? '#6b7280' : 'white', border: 'none', borderRadius: 4, padding: '0.5rem 1.25rem', marginRight: 8 }} disabled={belowFloor}>Save</button>
                <button onClick={cancelEdit} style={{ background: '#f3f4f6', border: 'none', borderRadius: 4, padding: '0.5rem 1.25rem' }}>Cancel</button>
              </div>
            </div>
          </td>
        </tr>
      )
    }
    // Storage
    if (item.category === 'Storage') {
      const storageConfig = editValues.storageConfig || item.storageConfig || { size: 100, iops: 3000, type: 'ssd', encrypted: false }
      const handleStorageChange = (field, value) => {
        const newStorageConfig = { ...storageConfig, [field]: value }
        setEditValues(prev => ({
          ...prev,
          storageConfig: newStorageConfig,
          internalCode: getInternalCode({ ...prev, storageConfig: newStorageConfig }),
          description: getStorageDescription(newStorageConfig)
        }))
      }
      const floorPrice = storageConfig.size * FLOOR_UNIT_PRICES.storage
      const unitPrice = editValues.unitPrice !== undefined ? editValues.unitPrice : floorPrice
      const belowFloor = unitPrice < floorPrice
      return (
        <tr>
          <td colSpan={editable ? 8 : 7} style={{ background: '#f3f4f6', padding: 0 }}>
            <div style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: 24 }}>
              <div>
                <label>Size (GB)</label><br/>
                <input type='number' min={1} max={4096} value={storageConfig.size} onChange={e => handleStorageChange('size', parseInt(e.target.value))} style={{ width: 80 }} />
              </div>
              <div>
                <label>IOPS</label><br/>
                <input type='number' min={100} max={100000} value={storageConfig.iops} onChange={e => handleStorageChange('iops', parseInt(e.target.value))} style={{ width: 80 }} />
              </div>
              <div>
                <label>Type</label><br/>
                <select value={storageConfig.type} onChange={e => handleStorageChange('type', e.target.value)}>
                  <option value='ssd'>SSD</option>
                  <option value='hdd'>HDD</option>
                </select>
              </div>
              <div>
                <label>Encrypted</label><br/>
                <input type='checkbox' checked={storageConfig.encrypted} onChange={e => handleStorageChange('encrypted', e.target.checked)} />
              </div>
              <div>
                <label>Quantity</label><br/>
                <input type='number' min={1} value={editValues.quantity} onChange={e => setEditValues(prev => ({ ...prev, quantity: parseInt(e.target.value), description: getStorageDescription(storageConfig) }))} style={{ width: 60 }} />
              </div>
              <div>
                <label>Unit Price</label><br/>
                <input type='number' value={unitPrice} onChange={e => setEditValues(prev => ({ ...prev, unitPrice: parseInt(e.target.value) }))} style={{ width: 100, background: belowFloor ? '#fef3c7' : '#e5e7eb' }} />
                {belowFloor && <div style={{ color: '#b45309', fontSize: 12 }}>Below floor price! Approval required.</div>}
              </div>
              <div>
                <label>Internal Code</label><br/>
                <input value={getInternalCode({ ...editValues, storageConfig })} readOnly style={{ width: 180, background: '#e5e7eb' }} />
              </div>
              <div>
                <label>Description</label><br/>
                <input value={getStorageDescription(storageConfig)} readOnly style={{ width: 260, background: '#e5e7eb' }} />
              </div>
              <div>
                <label>Total Price</label><br/>
                <input value={editValues.quantity * unitPrice} readOnly style={{ width: 120, background: '#e5e7eb' }} />
              </div>
              <div style={{ alignSelf: 'end' }}>
                <button onClick={() => saveEdit(idx)} style={{ background: belowFloor ? '#d1d5db' : '#2563eb', color: belowFloor ? '#6b7280' : 'white', border: 'none', borderRadius: 4, padding: '0.5rem 1.25rem', marginRight: 8 }} disabled={belowFloor}>Save</button>
                <button onClick={cancelEdit} style={{ background: '#f3f4f6', border: 'none', borderRadius: 4, padding: '0.5rem 1.25rem' }}>Cancel</button>
              </div>
            </div>
          </td>
        </tr>
      )
    }
    // Network
    if (item.category === 'Network') {
      const networkConfig = editValues.networkConfig || item.networkConfig || { bandwidth: 100, staticIp: false, firewall: false }
      const handleNetworkChange = (field, value) => {
        const newNetworkConfig = { ...networkConfig, [field]: value }
        setEditValues(prev => ({
          ...prev,
          networkConfig: newNetworkConfig,
          internalCode: getInternalCode({ ...prev, networkConfig: newNetworkConfig }),
          description: getNetworkDescription(newNetworkConfig)
        }))
      }
      const floorPrice = FLOOR_UNIT_PRICES.network
      const unitPrice = editValues.unitPrice !== undefined ? editValues.unitPrice : floorPrice
      const belowFloor = unitPrice < floorPrice
      return (
        <tr>
          <td colSpan={editable ? 8 : 7} style={{ background: '#f3f4f6', padding: 0 }}>
            <div style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: 24 }}>
              <div>
                <label>Bandwidth (Mbps)</label><br/>
                <input type='number' min={1} max={10000} value={networkConfig.bandwidth} onChange={e => handleNetworkChange('bandwidth', parseInt(e.target.value))} style={{ width: 100 }} />
              </div>
              <div>
                <label>Static IP</label><br/>
                <input type='checkbox' checked={networkConfig.staticIp} onChange={e => handleNetworkChange('staticIp', e.target.checked)} />
              </div>
              <div>
                <label>Firewall</label><br/>
                <input type='checkbox' checked={networkConfig.firewall} onChange={e => handleNetworkChange('firewall', e.target.checked)} />
              </div>
              <div>
                <label>Quantity</label><br/>
                <input type='number' min={1} value={editValues.quantity} onChange={e => setEditValues(prev => ({ ...prev, quantity: parseInt(e.target.value), description: getNetworkDescription(networkConfig) }))} style={{ width: 60 }} />
              </div>
              <div>
                <label>Unit Price</label><br/>
                <input type='number' value={unitPrice} onChange={e => setEditValues(prev => ({ ...prev, unitPrice: parseInt(e.target.value) }))} style={{ width: 100, background: belowFloor ? '#fef3c7' : '#e5e7eb' }} />
                {belowFloor && <div style={{ color: '#b45309', fontSize: 12 }}>Below floor price! Approval required.</div>}
              </div>
              <div>
                <label>Internal Code</label><br/>
                <input value={getInternalCode({ ...editValues, networkConfig })} readOnly style={{ width: 180, background: '#e5e7eb' }} />
              </div>
              <div>
                <label>Description</label><br/>
                <input value={getNetworkDescription(networkConfig)} readOnly style={{ width: 260, background: '#e5e7eb' }} />
              </div>
              <div>
                <label>Total Price</label><br/>
                <input value={editValues.quantity * unitPrice} readOnly style={{ width: 120, background: '#e5e7eb' }} />
              </div>
              <div style={{ alignSelf: 'end' }}>
                <button onClick={() => saveEdit(idx)} style={{ background: belowFloor ? '#d1d5db' : '#2563eb', color: belowFloor ? '#6b7280' : 'white', border: 'none', borderRadius: 4, padding: '0.5rem 1.25rem', marginRight: 8 }} disabled={belowFloor}>Save</button>
                <button onClick={cancelEdit} style={{ background: '#f3f4f6', border: 'none', borderRadius: 4, padding: '0.5rem 1.25rem' }}>Cancel</button>
              </div>
            </div>
          </td>
        </tr>
      )
    }
    // Firewall / Security
    if (item.category === 'Security' || item.category === 'Firewall') {
      const fwConfig = editValues.fwConfig || item.fwConfig || { ruleSet: 'Standard', throughput: 100, ha: false, name: item.description || '' };
      const handleFwChange = (field, value) => {
        const newFwConfig = { ...fwConfig, [field]: value };
        setEditValues(prev => ({
          ...prev,
          fwConfig: newFwConfig,
          description: `Firewall - ${newFwConfig.ruleSet}, ${newFwConfig.throughput}Mbps${newFwConfig.ha ? ', HA' : ''}`,
          internalCode: getInternalCode({ ...prev, fwConfig: newFwConfig })
        }));
      };
      const floorPrice = FLOOR_UNIT_PRICES[item.sku] || 0;
      const unitPrice = editValues.unitPrice !== undefined ? editValues.unitPrice : floorPrice;
      const belowFloor = unitPrice < floorPrice;
      return (
        <tr>
          <td colSpan={editable ? 8 : 7} style={{ background: '#f3f4f6', padding: 0 }}>
            <div style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: 24 }}>
              <div>
                <label>Rule Set</label><br/>
                <select value={fwConfig.ruleSet} onChange={e => handleFwChange('ruleSet', e.target.value)}>
                  <option value='Standard'>Standard</option>
                  <option value='Enterprise'>Enterprise</option>
                  <option value='Custom'>Custom</option>
                </select>
              </div>
              <div>
                <label>Throughput (Mbps)</label><br/>
                <input type='number' min={10} max={10000} value={fwConfig.throughput} onChange={e => handleFwChange('throughput', parseInt(e.target.value))} style={{ width: 100 }} />
              </div>
              <div>
                <label>High Availability</label><br/>
                <input type='checkbox' checked={fwConfig.ha} onChange={e => handleFwChange('ha', e.target.checked)} />
              </div>
              <div>
                <label>Quantity</label><br/>
                <input type='number' min={1} value={editValues.quantity} onChange={e => setEditValues(prev => ({ ...prev, quantity: parseInt(e.target.value) }))} style={{ width: 60 }} />
              </div>
              <div>
                <label>Unit Price</label><br/>
                <input type='number' value={unitPrice} onChange={e => setEditValues(prev => ({ ...prev, unitPrice: parseInt(e.target.value) }))} style={{ width: 100, background: belowFloor ? '#fef3c7' : '#e5e7eb' }} />
                {belowFloor && <div style={{ color: '#b45309', fontSize: 12 }}>Below floor price! Approval required.</div>}
              </div>
              <div>
                <label>Description</label><br/>
                <input value={editValues.description} readOnly style={{ width: 260, background: '#e5e7eb' }} />
              </div>
              <div>
                <label>Internal Code</label><br/>
                <input value={getInternalCode({ ...editValues, fwConfig })} readOnly style={{ width: 180, background: '#e5e7eb' }} />
              </div>
              <div>
                <label>Total Price</label><br/>
                <input value={editValues.quantity * unitPrice} readOnly style={{ width: 120, background: '#e5e7eb' }} />
              </div>
              <div style={{ alignSelf: 'end' }}>
                <button onClick={() => saveEdit(idx)} style={{ background: belowFloor ? '#d1d5db' : '#2563eb', color: belowFloor ? '#6b7280' : 'white', border: 'none', borderRadius: 4, padding: '0.5rem 1.25rem', marginRight: 8 }} disabled={belowFloor}>Save</button>
                <button onClick={cancelEdit} style={{ background: '#f3f4f6', border: 'none', borderRadius: 4, padding: '0.5rem 1.25rem' }}>Cancel</button>
              </div>
            </div>
          </td>
        </tr>
      );
    }
    // Backup
    if (item.category === 'Backup') {
      const backupConfig = editValues.backupConfig || item.backupConfig || { frequency: 'Daily', retention: 30, encrypted: false };
      const handleBackupChange = (field, value) => {
        const newBackupConfig = { ...backupConfig, [field]: value };
        setEditValues(prev => ({
          ...prev,
          backupConfig: newBackupConfig,
          description: `Backup - ${newBackupConfig.frequency}, ${newBackupConfig.retention}d${newBackupConfig.encrypted ? ', Encrypted' : ''}`,
          internalCode: getInternalCode({ ...prev, backupConfig: newBackupConfig })
        }));
      };
      const floorPrice = FLOOR_UNIT_PRICES[item.sku] || 0;
      const unitPrice = editValues.unitPrice !== undefined ? editValues.unitPrice : floorPrice;
      const belowFloor = unitPrice < floorPrice;
      return (
        <tr>
          <td colSpan={editable ? 8 : 7} style={{ background: '#f3f4f6', padding: 0 }}>
            <div style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: 24 }}>
              <div>
                <label>Frequency</label><br/>
                <select value={backupConfig.frequency} onChange={e => handleBackupChange('frequency', e.target.value)}>
                  <option value='Daily'>Daily</option>
                  <option value='Weekly'>Weekly</option>
                  <option value='Monthly'>Monthly</option>
                </select>
              </div>
              <div>
                <label>Retention (days)</label><br/>
                <input type='number' min={1} max={365} value={backupConfig.retention} onChange={e => handleBackupChange('retention', parseInt(e.target.value))} style={{ width: 80 }} />
              </div>
              <div>
                <label>Encrypted</label><br/>
                <input type='checkbox' checked={backupConfig.encrypted} onChange={e => handleBackupChange('encrypted', e.target.checked)} />
              </div>
              <div>
                <label>Quantity</label><br/>
                <input type='number' min={1} value={editValues.quantity} onChange={e => setEditValues(prev => ({ ...prev, quantity: parseInt(e.target.value) }))} style={{ width: 60 }} />
              </div>
              <div>
                <label>Unit Price</label><br/>
                <input type='number' value={unitPrice} onChange={e => setEditValues(prev => ({ ...prev, unitPrice: parseInt(e.target.value) }))} style={{ width: 100, background: belowFloor ? '#fef3c7' : '#e5e7eb' }} />
                {belowFloor && <div style={{ color: '#b45309', fontSize: 12 }}>Below floor price! Approval required.</div>}
              </div>
              <div>
                <label>Description</label><br/>
                <input value={editValues.description} readOnly style={{ width: 260, background: '#e5e7eb' }} />
              </div>
              <div>
                <label>Internal Code</label><br/>
                <input value={getInternalCode({ ...editValues, backupConfig })} readOnly style={{ width: 180, background: '#e5e7eb' }} />
              </div>
              <div>
                <label>Total Price</label><br/>
                <input value={editValues.quantity * unitPrice} readOnly style={{ width: 120, background: '#e5e7eb' }} />
              </div>
              <div style={{ alignSelf: 'end' }}>
                <button onClick={() => saveEdit(idx)} style={{ background: belowFloor ? '#d1d5db' : '#2563eb', color: belowFloor ? '#6b7280' : 'white', border: 'none', borderRadius: 4, padding: '0.5rem 1.25rem', marginRight: 8 }} disabled={belowFloor}>Save</button>
                <button onClick={cancelEdit} style={{ background: '#f3f4f6', border: 'none', borderRadius: 4, padding: '0.5rem 1.25rem' }}>Cancel</button>
              </div>
            </div>
          </td>
        </tr>
      );
    }
    // VPN
    if (item.category === 'VPN') {
      const vpnConfig = editValues.vpnConfig || item.vpnConfig || { type: 'Site-to-Site', connections: 10, encrypted: false };
      const handleVpnChange = (field, value) => {
        const newVpnConfig = { ...vpnConfig, [field]: value };
        setEditValues(prev => ({
          ...prev,
          vpnConfig: newVpnConfig,
          description: `VPN - ${newVpnConfig.type}, ${newVpnConfig.connections} connections${newVpnConfig.encrypted ? ', Encrypted' : ''}`,
          internalCode: getInternalCode({ ...prev, vpnConfig: newVpnConfig })
        }));
      };
      const floorPrice = FLOOR_UNIT_PRICES[item.sku] || 0;
      const unitPrice = editValues.unitPrice !== undefined ? editValues.unitPrice : floorPrice;
      const belowFloor = unitPrice < floorPrice;
      return (
        <tr>
          <td colSpan={editable ? 8 : 7} style={{ background: '#f3f4f6', padding: 0 }}>
            <div style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: 24 }}>
              <div>
                <label>Type</label><br/>
                <select value={vpnConfig.type} onChange={e => handleVpnChange('type', e.target.value)}>
                  <option value='Site-to-Site'>Site-to-Site</option>
                  <option value='Point-to-Site'>Point-to-Site</option>
                </select>
              </div>
              <div>
                <label>Connections</label><br/>
                <input type='number' min={1} max={1000} value={vpnConfig.connections} onChange={e => handleVpnChange('connections', parseInt(e.target.value))} style={{ width: 100 }} />
              </div>
              <div>
                <label>Encrypted</label><br/>
                <input type='checkbox' checked={vpnConfig.encrypted} onChange={e => handleVpnChange('encrypted', e.target.checked)} />
              </div>
              <div>
                <label>Quantity</label><br/>
                <input type='number' min={1} value={editValues.quantity} onChange={e => setEditValues(prev => ({ ...prev, quantity: parseInt(e.target.value) }))} style={{ width: 60 }} />
              </div>
              <div>
                <label>Unit Price</label><br/>
                <input type='number' value={unitPrice} onChange={e => setEditValues(prev => ({ ...prev, unitPrice: parseInt(e.target.value) }))} style={{ width: 100, background: belowFloor ? '#fef3c7' : '#e5e7eb' }} />
                {belowFloor && <div style={{ color: '#b45309', fontSize: 12 }}>Below floor price! Approval required.</div>}
              </div>
              <div>
                <label>Description</label><br/>
                <input value={editValues.description} readOnly style={{ width: 260, background: '#e5e7eb' }} />
              </div>
              <div>
                <label>Internal Code</label><br/>
                <input value={getInternalCode({ ...editValues, vpnConfig })} readOnly style={{ width: 180, background: '#e5e7eb' }} />
              </div>
              <div>
                <label>Total Price</label><br/>
                <input value={editValues.quantity * unitPrice} readOnly style={{ width: 120, background: '#e5e7eb' }} />
              </div>
              <div style={{ alignSelf: 'end' }}>
                <button onClick={() => saveEdit(idx)} style={{ background: belowFloor ? '#d1d5db' : '#2563eb', color: belowFloor ? '#6b7280' : 'white', border: 'none', borderRadius: 4, padding: '0.5rem 1.25rem', marginRight: 8 }} disabled={belowFloor}>Save</button>
                <button onClick={cancelEdit} style={{ background: '#f3f4f6', border: 'none', borderRadius: 4, padding: '0.5rem 1.25rem' }}>Cancel</button>
              </div>
            </div>
          </td>
        </tr>
      );
    }
    // Internet
    if (item.category === 'Internet') {
      const inetConfig = editValues.inetConfig || item.inetConfig || { bandwidth: 100, staticIp: false, ddos: false };
      const handleInetChange = (field, value) => {
        const newInetConfig = { ...inetConfig, [field]: value };
        setEditValues(prev => ({
          ...prev,
          inetConfig: newInetConfig,
          description: `Internet - ${newInetConfig.bandwidth}Mbps${newInetConfig.staticIp ? ', Static IP' : ''}${newInetConfig.ddos ? ', DDoS' : ''}`,
          internalCode: getInternalCode({ ...prev, inetConfig: newInetConfig })
        }));
      };
      const floorPrice = FLOOR_UNIT_PRICES[item.sku] || 0;
      const unitPrice = editValues.unitPrice !== undefined ? editValues.unitPrice : floorPrice;
      const belowFloor = unitPrice < floorPrice;
      return (
        <tr>
          <td colSpan={editable ? 8 : 7} style={{ background: '#f3f4f6', padding: 0 }}>
            <div style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: 24 }}>
              <div>
                <label>Bandwidth (Mbps)</label><br/>
                <input type='number' min={1} max={10000} value={inetConfig.bandwidth} onChange={e => handleInetChange('bandwidth', parseInt(e.target.value))} style={{ width: 100 }} />
              </div>
              <div>
                <label>Static IP</label><br/>
                <input type='checkbox' checked={inetConfig.staticIp} onChange={e => handleInetChange('staticIp', e.target.checked)} />
              </div>
              <div>
                <label>DDoS Protection</label><br/>
                <input type='checkbox' checked={inetConfig.ddos} onChange={e => handleInetChange('ddos', e.target.checked)} />
              </div>
              <div>
                <label>Quantity</label><br/>
                <input type='number' min={1} value={editValues.quantity} onChange={e => setEditValues(prev => ({ ...prev, quantity: parseInt(e.target.value) }))} style={{ width: 60 }} />
              </div>
              <div>
                <label>Unit Price</label><br/>
                <input type='number' value={unitPrice} onChange={e => setEditValues(prev => ({ ...prev, unitPrice: parseInt(e.target.value) }))} style={{ width: 100, background: belowFloor ? '#fef3c7' : '#e5e7eb' }} />
                {belowFloor && <div style={{ color: '#b45309', fontSize: 12 }}>Below floor price! Approval required.</div>}
              </div>
              <div>
                <label>Description</label><br/>
                <input value={editValues.description} readOnly style={{ width: 260, background: '#e5e7eb' }} />
              </div>
              <div>
                <label>Internal Code</label><br/>
                <input value={getInternalCode({ ...editValues, inetConfig })} readOnly style={{ width: 180, background: '#e5e7eb' }} />
              </div>
              <div>
                <label>Total Price</label><br/>
                <input value={editValues.quantity * unitPrice} readOnly style={{ width: 120, background: '#e5e7eb' }} />
              </div>
              <div style={{ alignSelf: 'end' }}>
                <button onClick={() => saveEdit(idx)} style={{ background: belowFloor ? '#d1d5db' : '#2563eb', color: belowFloor ? '#6b7280' : 'white', border: 'none', borderRadius: 4, padding: '0.5rem 1.25rem', marginRight: 8 }} disabled={belowFloor}>Save</button>
                <button onClick={cancelEdit} style={{ background: '#f3f4f6', border: 'none', borderRadius: 4, padding: '0.5rem 1.25rem' }}>Cancel</button>
              </div>
            </div>
          </td>
        </tr>
      );
    }
    // Custom Category (dynamic form)
    if (item.category === 'Custom') {
      // Try to infer type from name/label/description
      const label = editValues.name || editValues.label || item.name || item.label || item.description || '';
      const lowerLabel = label.toLowerCase();
      // Dynamic fields
      const isVDI = lowerLabel.includes('vdi');
      const isStorage = lowerLabel.includes('storage');
      const isNetwork = lowerLabel.includes('network') || lowerLabel.includes('vpn');
      const isFirewall = lowerLabel.includes('firewall') || lowerLabel.includes('security');
      const isBackup = lowerLabel.includes('backup') || lowerLabel.includes('dr');
      // State for dynamic fields
      const customConfig = editValues.customConfig || item.customConfig || {};
      const handleCustomChange = (field, value) => {
        setEditValues(prev => {
          const newConfig = { ...prev.customConfig, [field]: value };
          // Update description and internal code live
          return {
            ...prev,
            customConfig: newConfig,
            description: getCustomDescription(label, newConfig),
            internalCode: getCustomInternalCode(label, newConfig)
          };
        });
      };
      // Helper for description/internal code
      function getCustomDescription(label, config) {
        if (isVDI) return `VDI - ${config.oem || ''} - ${config.users || ''} users, ${config.vcpu || ''} vCPU, ${config.ram || ''}GB RAM, ${config.storage || ''}GB, ${config.os || ''}`;
        if (isStorage) return `Storage - ${config.oem || ''} - ${config.size || ''}GB ${config.type || ''}, ${config.iops || ''} IOPS`;
        if (isNetwork) return `Network - ${config.oem || ''} - ${config.bandwidth || ''}Mbps, ${config.connections || ''} connections`;
        if (isFirewall) return `Firewall - ${config.oem || ''} - ${config.ruleSet || ''}, ${config.throughput || ''}Mbps`;
        if (isBackup) return `Backup - ${config.oem || ''} - ${config.frequency || ''}, ${config.retention || ''}d`;
        return label;
      }
      function getCustomInternalCode(label, config) {
        if (isVDI) return `VDI-${(config.oem || '').slice(0,3).toUpperCase()}-${config.users || ''}U`;
        if (isStorage) return `CST-ST-${(config.oem || '').slice(0,3).toUpperCase()}-${config.size || ''}G`;
        if (isNetwork) return `CST-NW-${(config.oem || '').slice(0,3).toUpperCase()}-${config.bandwidth || ''}M`;
        if (isFirewall) return `CST-FW-${(config.oem || '').slice(0,3).toUpperCase()}-${config.ruleSet || ''}`;
        if (isBackup) return `CST-BKP-${(config.oem || '').slice(0,3).toUpperCase()}-${config.frequency || ''}`;
        return `CST-${label.replace(/\s+/g, '').slice(0,8).toUpperCase()}`;
      }
      const unitPrice = editValues.unitPrice !== undefined ? editValues.unitPrice : 5000;
      return (
        <tr>
          <td colSpan={editable ? 8 : 7} style={{ background: '#f3f4f6', padding: 0 }}>
            <div style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: 24 }}>
              <div>
                <label>Name/Label</label><br/>
                <input value={label} onChange={e => setEditValues(prev => ({ ...prev, name: e.target.value }))} style={{ width: 200 }} />
              </div>
              <div>
                <label>OEM/Brand</label><br/>
                <input value={customConfig.oem || ''} onChange={e => handleCustomChange('oem', e.target.value)} style={{ width: 120 }} />
              </div>
              {isVDI && <>
                <div>
                  <label>Number of Users</label><br/>
                  <input type='number' min={1} value={customConfig.users || ''} onChange={e => handleCustomChange('users', parseInt(e.target.value))} style={{ width: 80 }} />
                </div>
                <div>
                  <label>vCPU per User</label><br/>
                  <input type='number' min={1} value={customConfig.vcpu || ''} onChange={e => handleCustomChange('vcpu', parseInt(e.target.value))} style={{ width: 60 }} />
                </div>
                <div>
                  <label>RAM per User (GB)</label><br/>
                  <input type='number' min={1} value={customConfig.ram || ''} onChange={e => handleCustomChange('ram', parseInt(e.target.value))} style={{ width: 60 }} />
                </div>
                <div>
                  <label>Storage per User (GB)</label><br/>
                  <input type='number' min={1} value={customConfig.storage || ''} onChange={e => handleCustomChange('storage', parseInt(e.target.value))} style={{ width: 80 }} />
                </div>
                <div>
                  <label>OS Type</label><br/>
                  <input value={customConfig.os || ''} onChange={e => handleCustomChange('os', e.target.value)} style={{ width: 100 }} />
                </div>
              </>}
              {isStorage && <>
                <div>
                  <label>Size (GB)</label><br/>
                  <input type='number' min={1} value={customConfig.size || ''} onChange={e => handleCustomChange('size', parseInt(e.target.value))} style={{ width: 80 }} />
                </div>
                <div>
                  <label>Type</label><br/>
                  <input value={customConfig.type || ''} onChange={e => handleCustomChange('type', e.target.value)} style={{ width: 80 }} />
                </div>
                <div>
                  <label>IOPS</label><br/>
                  <input type='number' min={1} value={customConfig.iops || ''} onChange={e => handleCustomChange('iops', parseInt(e.target.value))} style={{ width: 80 }} />
                </div>
              </>}
              {isNetwork && <>
                <div>
                  <label>Bandwidth (Mbps)</label><br/>
                  <input type='number' min={1} value={customConfig.bandwidth || ''} onChange={e => handleCustomChange('bandwidth', parseInt(e.target.value))} style={{ width: 100 }} />
                </div>
                <div>
                  <label>Connections</label><br/>
                  <input type='number' min={1} value={customConfig.connections || ''} onChange={e => handleCustomChange('connections', parseInt(e.target.value))} style={{ width: 80 }} />
                </div>
              </>}
              {isFirewall && <>
                <div>
                  <label>Rule Set</label><br/>
                  <input value={customConfig.ruleSet || ''} onChange={e => handleCustomChange('ruleSet', e.target.value)} style={{ width: 100 }} />
                </div>
                <div>
                  <label>Throughput (Mbps)</label><br/>
                  <input type='number' min={1} value={customConfig.throughput || ''} onChange={e => handleCustomChange('throughput', parseInt(e.target.value))} style={{ width: 100 }} />
                </div>
              </>}
              {isBackup && <>
                <div>
                  <label>Frequency</label><br/>
                  <input value={customConfig.frequency || ''} onChange={e => handleCustomChange('frequency', e.target.value)} style={{ width: 100 }} />
                </div>
                <div>
                  <label>Retention (days)</label><br/>
                  <input type='number' min={1} value={customConfig.retention || ''} onChange={e => handleCustomChange('retention', parseInt(e.target.value))} style={{ width: 80 }} />
                </div>
              </>}
              {/* Always show these */}
              <div>
                <label>Quantity</label><br/>
                <input type='number' min={1} value={editValues.quantity} onChange={e => setEditValues(prev => ({ ...prev, quantity: parseInt(e.target.value) }))} style={{ width: 60 }} />
              </div>
              <div>
                <label>Unit Price</label><br/>
                <input type='number' value={unitPrice} onChange={e => setEditValues(prev => ({ ...prev, unitPrice: parseInt(e.target.value) }))} style={{ width: 100 }} />
              </div>
              <div>
                <label>Internal Code</label><br/>
                <input value={getCustomInternalCode(label, customConfig)} readOnly style={{ width: 180, background: '#e5e7eb' }} />
              </div>
              <div>
                <label>Description</label><br/>
                <input value={getCustomDescription(label, customConfig)} readOnly style={{ width: 260, background: '#e5e7eb' }} />
              </div>
              <div>
                <label>Notes/Specs</label><br/>
                <input value={customConfig.notes || ''} onChange={e => handleCustomChange('notes', e.target.value)} style={{ width: 220 }} />
              </div>
              <div>
                <label>Total Price</label><br/>
                <input value={editValues.quantity * unitPrice} readOnly style={{ width: 120, background: '#e5e7eb' }} />
              </div>
              <div style={{ alignSelf: 'end' }}>
                <button onClick={() => saveEdit(idx)} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 4, padding: '0.5rem 1.25rem', marginRight: 8 }}>Save</button>
                <button onClick={cancelEdit} style={{ background: '#f3f4f6', border: 'none', borderRadius: 4, padding: '0.5rem 1.25rem' }}>Cancel</button>
              </div>
            </div>
          </td>
        </tr>
      );
    }
    // For all other catalog items (default case)
    const simpleServiceCategories = ['Security', 'Backup', 'VPN', 'Internet', 'Firewall'];
    if (simpleServiceCategories.includes(item.category)) {
      const floorPrice = FLOOR_UNIT_PRICES[item.sku] || 0;
      const unitPrice = editValues.unitPrice !== undefined ? editValues.unitPrice : floorPrice;
      const belowFloor = unitPrice < floorPrice;
      return (
        <tr>
          <td colSpan={editable ? 8 : 7} style={{ background: '#f3f4f6', padding: 0 }}>
            <div style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: 24 }}>
              <div>
                <label>Quantity</label><br/>
                <input type='number' min={1} value={editValues.quantity} onChange={e => setEditValues(prev => ({ ...prev, quantity: parseInt(e.target.value) }))} style={{ width: 60 }} />
              </div>
              <div>
                <label>Unit Price</label><br/>
                <input type='number' value={unitPrice} onChange={e => setEditValues(prev => ({ ...prev, unitPrice: parseInt(e.target.value) }))} style={{ width: 100, background: belowFloor ? '#fef3c7' : '#e5e7eb' }} />
                {belowFloor && <div style={{ color: '#b45309', fontSize: 12 }}>Below floor price! Approval required.</div>}
              </div>
              <div>
                <label>Description</label><br/>
                <input value={editValues.description} onChange={e => setEditValues(prev => ({ ...prev, description: e.target.value }))} style={{ width: 260 }} />
              </div>
              <div>
                <label>Internal Code</label><br/>
                <input value={getInternalCode(editValues)} readOnly style={{ width: 180, background: '#e5e7eb' }} />
              </div>
              <div>
                <label>Total Price</label><br/>
                <input value={editValues.quantity * unitPrice} readOnly style={{ width: 120, background: '#e5e7eb' }} />
              </div>
              <div style={{ alignSelf: 'end' }}>
                <button onClick={() => saveEdit(idx)} style={{ background: belowFloor ? '#d1d5db' : '#2563eb', color: belowFloor ? '#6b7280' : 'white', border: 'none', borderRadius: 4, padding: '0.5rem 1.25rem', marginRight: 8 }} disabled={belowFloor}>Save</button>
                <button onClick={cancelEdit} style={{ background: '#f3f4f6', border: 'none', borderRadius: 4, padding: '0.5rem 1.25rem' }}>Cancel</button>
              </div>
            </div>
          </td>
        </tr>
      );
    }
    return null
  }

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
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Description</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>SKU</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Internal Code</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Category</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>Quantity</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>Unit Price</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>Total Price</th>
              {editable && <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600 }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => [
              <tr key={idx} style={{ background: highlightNew === idx ? '#fef9c3' : 'white', transition: 'background 0.3s' }}>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>{item.description}</td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>{item.sku}</td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>{item.internalCode}</td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>{item.category}</td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>{item.quantity}</td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>₹{item.unitPrice?.toLocaleString()}</td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>₹{item.totalPrice?.toLocaleString()}</td>
                {editable && (
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
                    <button onClick={() => { setEditingIndex(idx); setEditValues(item); setExpandedIndex(idx); }} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 4, padding: '0.25rem 0.75rem', cursor: 'pointer', fontWeight: 500 }}>Edit</button>
                  </td>
                )}
              </tr>,
              expandedIndex === idx && editingIndex === idx ? renderExpandedRow(item, idx) : null
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
                  <input type='number' value={addValues.unitPrice} onChange={e => handleAddChange('unitPrice', e.target.value)} style={{ width: 100 }} />
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                  ₹{(addValues.quantity && addValues.unitPrice ? (addValues.quantity * addValues.unitPrice).toLocaleString() : '0')}
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