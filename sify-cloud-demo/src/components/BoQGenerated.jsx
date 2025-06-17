import React from 'react'
import { PRICE_BOOK_SKUS } from '@/utils/dataModel'
import { useLocation } from 'react-router-dom'
import { getProject } from '@/utils/dataModel'
import BoQTable from './BoQTable'

const FLOOR_PRICES = {
  'CI-COMPUTE': 12000,
  'CI-STORAGE': 40,
  'CI-NETWORK': 6000,
  'CI-SECURITY': 9000,
  'CI-BACKUP': 4000,
  'CI-VPN': 2000,
  'CI-INTERNET': 5000,
}

export const CATALOG = [
  { label: 'Compute (VM)', sku: 'CI-COMPUTE', internalCode: 'CI-1VCPU-1GB+AddOn', category: 'Compute', unitPrice: 15000 },
  { label: 'Storage', sku: 'CI-STORAGE', internalCode: 'CI-STORAGE-1GB+AddOn', category: 'Storage', unitPrice: 50 },
  { label: 'Network', sku: 'CI-NETWORK', internalCode: 'CI-LB+AddOn', category: 'Network', unitPrice: 8000 },
  { label: 'Security', sku: 'CI-SECURITY', internalCode: 'CI-FW+AddOn', category: 'Security', unitPrice: 12000 },
  { label: 'Backup', sku: 'CI-BACKUP', internalCode: 'CI-BKP+AddOn', category: 'Backup', unitPrice: 5000 },
  { label: 'VPN', sku: 'CI-VPN', internalCode: 'CI-VPN+AddOn', category: 'VPN', unitPrice: 3000 },
  { label: 'Internet', sku: 'CI-INTERNET', internalCode: 'CI-INET+AddOn', category: 'Internet', unitPrice: 7000 },
]

// Per-unit floor prices
export const FLOOR_UNIT_PRICES = {
  vcpu: 400, // per vCPU
  ram: 200,  // per GB RAM
  storage: 8, // per GB Storage
  network: 6000, // per unit (example)
  // Add more as needed
}

// Helper to extract vCPU and RAM from description (e.g., '4 vCPU, 16GB RAM')
function extractVMConfig(description) {
  const vcpuMatch = description.match(/(\d+)\s*vCPU/i)
  const ramMatch = description.match(/(\d+)\s*GB/i)
  return {
    vcpu: vcpuMatch ? parseInt(vcpuMatch[1]) : 0,
    ram: ramMatch ? parseInt(ramMatch[1]) : 0
  }
}
// Helper to extract storage GB from description (e.g., '500 GB')
function extractStorageGB(description) {
  const match = description.match(/(\d+)\s*GB/i)
  return match ? parseInt(match[1]) : 0
}

export const VM_OS_OPTIONS = [
  { label: 'Windows Server 2022', value: 'windows-2022', price: 800 },
  { label: 'Ubuntu 22.04 LTS', value: 'ubuntu', price: 0 },
  { label: 'Red Hat Enterprise Linux', value: 'rhel', price: 1200 }
]
export const VM_FEATURES = [
  { label: 'Antivirus', value: 'antivirus', price: 200 },
  { label: 'Backup', value: 'backup', price: 300 },
  { label: 'SQL Server', value: 'sql-server', price: 8000 }
]

// Helper to generate internal code for VMs
function getVmInternalCode(vmConfig) {
  if (!vmConfig) return 'CI-1VCPU-1GB'
  return `CI-1VCPU-1GB-${vmConfig.vcpu}VCPU-${vmConfig.ram}GBRAM`
}

// Shorter internal code generator
function getInternalCode(item) {
  if (item.category === 'Compute' && item.vmConfig) {
    const { vcpu, ram, storage, os, features } = item.vmConfig
    const osTag = os ? `-${os.split('-')[0].toUpperCase()}` : ''
    const featTag = features && features.length ? '-' + features.map(f => f.split('-')[0].toUpperCase()).join('') : ''
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

// Helper to parse VM config from description and set defaults
function parseVmConfigFromDescription(description) {
  const { vcpu, ram } = extractVMConfig(description)
  return {
    vcpu: vcpu || 2,
    ram: ram || 4,
    storage: 50,
    os: 'windows-2022',
    features: []
  }
}

const BoQGenerated = () => {
  const location = useLocation()
  let projectData = null
  let projectId = null
  if (location.state && location.state.projectId) {
    projectId = location.state.projectId
    projectData = getProject(projectId)
  }
  // Fallback mock for demo
  if (!projectData) {
    projectData = {
      customerName: 'Edgecut Technologies Ltd',
      projectName: 'Web Application Infrastructure',
      contractTerm: 'ANNUAL',
      dealId: 'PROJ-1750049645141'
    }
  }
  const [boqItems, setBoqItems] = React.useState([
    { description: 'Virtual Machine - Standard (4 vCPU, 16GB RAM)', sku: 'CI-COMPUTE', internalCode: 'CI-1VCPU-1GB+AddOn', category: 'Compute', quantity: 3, unitPrice: 15000, totalPrice: 45000, type: 'standard' },
    { description: 'Load Balancer - Application Layer', sku: 'CI-NETWORK', internalCode: 'CI-LB+AddOn', category: 'Network', quantity: 1, unitPrice: 8000, totalPrice: 8000, type: 'standard' },
    { description: 'Storage - SSD Premium', sku: 'CI-STORAGE', internalCode: 'CI-STORAGE-1GB+AddOn', category: 'Storage', quantity: 500, unitPrice: 50, totalPrice: 25000, type: 'standard' },
    { description: 'Firewall Service - Enterprise', sku: 'CI-SECURITY', internalCode: 'CI-FW+AddOn', category: 'Security', quantity: 1, unitPrice: 12000, totalPrice: 12000, type: 'standard' },
    { description: 'Backup Service - Daily', sku: 'CI-BACKUP', internalCode: 'CI-BKP+AddOn', category: 'Backup', quantity: 1, unitPrice: 5000, totalPrice: 5000, type: 'standard', essential: true, autoAdded: true },
    { description: 'VPN Access - Site-to-Site', sku: 'CI-VPN', internalCode: 'CI-VPN+AddOn', category: 'VPN', quantity: 1, unitPrice: 3000, totalPrice: 3000, type: 'standard', essential: true, autoAdded: true },
    { description: 'Internet Connectivity - Dedicated', sku: 'CI-INTERNET', internalCode: 'CI-INET+AddOn', category: 'Internet', quantity: 1, unitPrice: 7000, totalPrice: 7000, type: 'standard', essential: true, autoAdded: true }
  ])
  const [editingIndex, setEditingIndex] = React.useState(null)
  const [editValues, setEditValues] = React.useState({})
  const [showAdd, setShowAdd] = React.useState(false)
  const [addValues, setAddValues] = React.useState({ sku: '', quantity: 1, unitPrice: '', description: '' })
  const [approvalRequired, setApprovalRequired] = React.useState(false)
  const [isFinanceAdmin, setIsFinanceAdmin] = React.useState(false)
  const [editedRows, setEditedRows] = React.useState([])
  const [vmConfig, setVmConfig] = React.useState({ vcpu: 2, ram: 4, storage: 50, os: 'windows-2022', features: [] })
  const [storageConfig, setStorageConfig] = React.useState({ size: 100, iops: 3000, type: 'ssd', encrypted: false })
  const [networkConfig, setNetworkConfig] = React.useState({ bandwidth: 100, staticIp: false, firewall: false })
  const [expandedRows, setExpandedRows] = React.useState([])
  const [newlyAddedIndex, setNewlyAddedIndex] = React.useState(null)

  // Calculate totals
  const subtotal = boqItems.reduce((sum, item) => sum + item.totalPrice, 0)
  const contractDiscount = 15
  const discountAmount = subtotal * (contractDiscount / 100)
  const afterDiscount = subtotal - discountAmount
  const tax = afterDiscount * 0.18
  const total = afterDiscount + tax

  const totals = {
    subtotal,
    contractDiscount,
    discountAmount,
    tax,
    total,
    monthlyTotal: total,
    annualTotal: total * 12
  }

  const resources = {
    totalVMs: boqItems.filter(i => i.category === 'Compute').reduce((a, b) => a + b.quantity, 0),
    totalCPU: boqItems.filter(i => i.category === 'Compute').reduce((a, b) => a + (b.quantity * 4), 0),
    totalRAM: boqItems.filter(i => i.category === 'Compute').reduce((a, b) => a + (b.quantity * 16), 0),
    totalStorage: boqItems.filter(i => i.category === 'Storage').reduce((a, b) => a + b.quantity, 0)
  }

  // Edit handlers
  const handleEdit = (idx) => {
    setEditingIndex(idx)
    setEditValues({
      quantity: boqItems[idx].quantity,
      unitPrice: boqItems[idx].unitPrice
    })
  }
  const handleEditChange = (field, value) => {
    setEditValues(prev => ({ ...prev, [field]: value }))
  }
  const handleEditSave = (idx) => {
    const updated = [...boqItems]
    const newQty = parseInt(editValues.quantity)
    const newPrice = parseInt(editValues.unitPrice)
    updated[idx].quantity = newQty
    updated[idx].unitPrice = newPrice
    updated[idx].totalPrice = newQty * newPrice
    // If VM config exists, update internal code
    if (updated[idx].category === 'Compute' && updated[idx].vmConfig) {
      updated[idx].internalCode = getInternalCode(updated[idx])
    }
    setBoqItems(updated)
    setEditingIndex(null)
    setEditedRows(prev => prev.includes(idx) ? prev : [...prev, idx])
    // Dynamic floor price check
    let floor = 0
    const item = updated[idx]
    if (item.category === 'Compute' && item.vmConfig) {
      floor = getVmUnitPrice() * newQty
    } else if (item.category === 'Compute') {
      const { vcpu, ram } = extractVMConfig(item.description)
      floor = (vcpu * FLOOR_UNIT_PRICES.vcpu + ram * FLOOR_UNIT_PRICES.ram) * newQty
    } else if (item.category === 'Storage') {
      const gb = extractStorageGB(item.description)
      floor = gb * FLOOR_UNIT_PRICES.storage * newQty
    } else if (item.category === 'Network') {
      floor = FLOOR_UNIT_PRICES.network * newQty
    } else {
      floor = 0 // fallback for other categories
    }
    if (floor > 0 && (newPrice * newQty) < floor) {
      setApprovalRequired(true)
    } else {
      setApprovalRequired(false)
    }
  }
  const handleEditCancel = () => {
    setEditingIndex(null)
    setEditValues({})
  }

  // Add resource handlers
  const handleAddResource = () => {
    setShowAdd(true)
    setAddValues({ sku: '', quantity: 1, unitPrice: '', description: '' })
  }
  const handleAddChange = (field, value) => {
    setAddValues(prev => ({ ...prev, [field]: value }))
    if (field === 'sku') {
      const cat = CATALOG.find(c => c.sku === value)
      if (cat) {
        setAddValues(prev => ({ ...prev, unitPrice: cat.unitPrice, description: cat.label }))
      }
      if (value === 'CI-COMPUTE') {
        setVmConfig({ vcpu: 2, ram: 4, storage: 50, os: 'windows-2022', features: [] })
      }
    }
  }
  const handleVmConfigChange = (field, value) => {
    setVmConfig(prev => ({ ...prev, [field]: value }))
  }
  const handleVmFeatureToggle = (feature) => {
    setVmConfig(prev => ({ ...prev, features: prev.features.includes(feature) ? prev.features.filter(f => f !== feature) : [...prev.features, feature] }))
  }
  const getVmDescription = () => {
    const osLabel = VM_OS_OPTIONS.find(o => o.value === vmConfig.os)?.label || ''
    const featuresLabel = vmConfig.features.map(f => VM_FEATURES.find(x => x.value === f)?.label).filter(Boolean).join(', ')
    return `VM - ${vmConfig.vcpu} vCPU, ${vmConfig.ram}GB RAM, ${vmConfig.storage}GB SSD, ${osLabel}${featuresLabel ? ', ' + featuresLabel : ''}`
  }
  const getVmUnitPrice = () => {
    let price = vmConfig.vcpu * FLOOR_UNIT_PRICES.vcpu + vmConfig.ram * FLOOR_UNIT_PRICES.ram + vmConfig.storage * FLOOR_UNIT_PRICES.storage
    price += VM_OS_OPTIONS.find(o => o.value === vmConfig.os)?.price || 0
    price += vmConfig.features.reduce((sum, f) => sum + (VM_FEATURES.find(x => x.value === f)?.price || 0), 0)
    return price
  }
  const handleAddSave = () => {
    if (!addValues.sku || !addValues.quantity || !addValues.unitPrice) return
    let newItem
    if (addValues.sku === 'CI-COMPUTE') {
      newItem = {
        description: getVmDescription(),
        sku: addValues.sku,
        internalCode: getInternalCode({ category: 'Compute', vmConfig }),
        category: 'Compute',
        quantity: parseInt(addValues.quantity),
        unitPrice: parseInt(addValues.unitPrice),
        totalPrice: parseInt(addValues.quantity) * parseInt(addValues.unitPrice),
        type: 'standard',
        vmConfig: { ...vmConfig }
      }
    } else if (addValues.sku === 'CI-STORAGE') {
      newItem = {
        description: `Storage - ${storageConfig.size}GB ${storageConfig.type.toUpperCase()}${storageConfig.encrypted ? ' (Encrypted)' : ''}, ${storageConfig.iops} IOPS`,
        sku: addValues.sku,
        internalCode: getInternalCode({ category: 'Storage', storageConfig }),
        category: 'Storage',
        quantity: parseInt(addValues.quantity),
        unitPrice: parseInt(addValues.unitPrice),
        totalPrice: parseInt(addValues.quantity) * parseInt(addValues.unitPrice),
        type: 'standard',
        storageConfig: { ...storageConfig }
      }
    } else if (addValues.sku === 'CI-NETWORK') {
      newItem = {
        description: `Network - ${networkConfig.bandwidth}Mbps${networkConfig.staticIp ? ', Static IP' : ''}${networkConfig.firewall ? ', Firewall' : ''}`,
        sku: addValues.sku,
        internalCode: getInternalCode({ category: 'Network', networkConfig }),
        category: 'Network',
        quantity: parseInt(addValues.quantity),
        unitPrice: parseInt(addValues.unitPrice),
        totalPrice: parseInt(addValues.quantity) * parseInt(addValues.unitPrice),
        type: 'standard',
        networkConfig: { ...networkConfig }
      }
    } else {
      const cat = CATALOG.find(c => c.sku === addValues.sku)
      newItem = {
        description: addValues.description,
        sku: addValues.sku,
        internalCode: cat.internalCode,
        category: cat.category,
        quantity: parseInt(addValues.quantity),
        unitPrice: parseInt(addValues.unitPrice),
        totalPrice: parseInt(addValues.quantity) * parseInt(addValues.unitPrice),
        type: 'standard'
      }
    }
    setBoqItems(prev => {
      const updated = [...prev, newItem]
      setNewlyAddedIndex(updated.length - 1)
      setTimeout(() => setNewlyAddedIndex(null), 2000)
      return updated
    })
    setShowAdd(false)
    // Dynamic floor price check
    let floor = 0
    if (newItem.category === 'Compute') {
      floor = getVmUnitPrice() * newItem.quantity
    } else if (newItem.category === 'Storage') {
      const gb = extractStorageGB(newItem.description)
      floor = gb * FLOOR_UNIT_PRICES.storage * newItem.quantity
    } else if (newItem.category === 'Network') {
      floor = FLOOR_UNIT_PRICES.network * newItem.quantity
    } else {
      floor = 0
    }
    if (floor > 0 && (newItem.unitPrice * newItem.quantity) < floor) {
      setApprovalRequired(true)
    } else {
      setApprovalRequired(false)
    }
  }
  const handleAddCancel = () => {
    setShowAdd(false)
    setAddValues({ sku: '', quantity: 1, unitPrice: '', description: '' })
  }

  const toggleExpand = idx => setExpandedRows(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx])

  // On initial load or when BoQ items change, attach vmConfig to Compute items if missing
  React.useEffect(() => {
    setBoqItems(items => items.map(item => {
      if (item.category === 'Compute' && !item.vmConfig) {
        return { ...item, vmConfig: parseVmConfigFromDescription(item.description), internalCode: getInternalCode({ ...item, vmConfig: parseVmConfigFromDescription(item.description) }) }
      }
      if (item.category === 'Compute' && item.vmConfig) {
        return { ...item, internalCode: getInternalCode(item) }
      }
      if (item.category === 'Storage' && item.storageConfig) {
        return { ...item, internalCode: getInternalCode(item) }
      }
      if (item.category === 'Network' && item.networkConfig) {
        return { ...item, internalCode: getInternalCode(item) }
      }
      return item
    }))
  }, [])

  // Expanded row for Compute: show and allow editing of VM specs
  const handleVmSpecEdit = (idx, field, value) => {
    setBoqItems(items => items.map((item, i) => {
      if (i === idx && item.category === 'Compute') {
        const newVmConfig = { ...item.vmConfig, [field]: value }
        // Update internal code and price
        const newUnitPrice = newVmConfig.vcpu * FLOOR_UNIT_PRICES.vcpu + newVmConfig.ram * FLOOR_UNIT_PRICES.ram + newVmConfig.storage * FLOOR_UNIT_PRICES.storage + (VM_OS_OPTIONS.find(o => o.value === newVmConfig.os)?.price || 0) + (newVmConfig.features?.reduce((sum, f) => sum + (VM_FEATURES.find(x => x.value === f)?.price || 0), 0) || 0)
        return {
          ...item,
          vmConfig: newVmConfig,
          internalCode: getInternalCode({ ...item, vmConfig: newVmConfig }),
          unitPrice: newUnitPrice,
          totalPrice: newUnitPrice * item.quantity
        }
      }
      return item
    }))
  }
  const handleVmFeatureToggleRow = (idx, feature) => {
    setBoqItems(items => items.map((item, i) => {
      if (i === idx && item.category === 'Compute') {
        const features = item.vmConfig.features.includes(feature)
          ? item.vmConfig.features.filter(f => f !== feature)
          : [...item.vmConfig.features, feature]
        const newVmConfig = { ...item.vmConfig, features }
        const newUnitPrice = newVmConfig.vcpu * FLOOR_UNIT_PRICES.vcpu + newVmConfig.ram * FLOOR_UNIT_PRICES.ram + newVmConfig.storage * FLOOR_UNIT_PRICES.storage + (VM_OS_OPTIONS.find(o => o.value === newVmConfig.os)?.price || 0) + (features.reduce((sum, f) => sum + (VM_FEATURES.find(x => x.value === f)?.price || 0), 0) || 0)
        return {
          ...item,
          vmConfig: newVmConfig,
          internalCode: getInternalCode({ ...item, vmConfig: newVmConfig }),
          unitPrice: newUnitPrice,
          totalPrice: newUnitPrice * item.quantity
        }
      }
      return item
    }))
  }

  const handleApprovalStatusChange = (anyRequireApproval) => {
    setApprovalRequired(anyRequireApproval)
  }

  const handleApproveAll = () => {
    setBoqItems(items => items.map(item => ({ ...item, requiresApproval: false })))
    setApprovalRequired(false)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '1rem 2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', color: '#111827' }}>
          Bill of Quantities (BoQ)
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Generated pricing proposal for {projectData.customerName}
        </p>
        <div style={{ position: 'absolute', top: '1rem', right: '2rem' }}>
          <span style={{ 
            backgroundColor: '#dbeafe', 
            color: '#1e40af', 
            padding: '0.25rem 0.75rem', 
            borderRadius: '0.375rem',
            fontSize: '0.875rem'
          }}>
            Account Manager
          </span>
        </div>
      </div>

      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1.5rem' }}>
        {/* Project Summary */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '0.5rem', 
          border: '1px solid #e5e7eb',
          marginBottom: '1.5rem',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0 0 0.5rem 0', color: '#111827' }}>
              📄 Project Summary
            </h2>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.25rem 0' }}>Customer</p>
                <p style={{ fontWeight: '500', margin: 0, color: '#111827' }}>{projectData.customerName}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.25rem 0' }}>Project</p>
                <p style={{ fontWeight: '500', margin: 0, color: '#111827' }}>{projectData.projectName}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.25rem 0' }}>Contract Term</p>
                <p style={{ fontWeight: '500', margin: 0, color: '#111827' }}>{projectData.contractTerm}</p>
                <p style={{ fontSize: '0.75rem', color: '#059669', margin: '0.25rem 0 0 0' }}>15% discount applied</p>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.25rem 0' }}>Deal ID</p>
                <p style={{ fontWeight: '500', margin: 0, color: '#111827' }}>{projectData.dealId}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Resource Summary (no Bulk) */}
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #e5e7eb', marginBottom: '1.5rem', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0 0 0.5rem 0', color: '#111827' }}>
              🧮 Resource Summary
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
              Simplified CPU/RAM configuration overview
            </p>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ backgroundColor: '#dbeafe', padding: '1rem', borderRadius: '0.5rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#1e40af', margin: '0 0 0.5rem 0' }}>Total VMs</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e3a8a', margin: '0 0 0.25rem 0' }}>{resources.totalVMs}</p>
                <p style={{ fontSize: '0.75rem', color: '#1e40af', margin: 0 }}>Standard instances</p>
              </div>
              <div style={{ backgroundColor: '#dcfce7', padding: '1rem', borderRadius: '0.5rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#166534', margin: '0 0 0.5rem 0' }}>Total vCPUs</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#14532d', margin: '0 0 0.25rem 0' }}>{resources.totalCPU}</p>
                <p style={{ fontSize: '0.75rem', color: '#166534', margin: 0 }}>High performance</p>
              </div>
              <div style={{ backgroundColor: '#f3e8ff', padding: '1rem', borderRadius: '0.5rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#7c3aed', margin: '0 0 0.5rem 0' }}>Total RAM</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6b21a8', margin: '0 0 0.25rem 0' }}>{resources.totalRAM} GB</p>
                <p style={{ fontSize: '0.75rem', color: '#7c3aed', margin: 0 }}>DDR4 memory</p>
              </div>
              <div style={{ backgroundColor: '#fed7aa', padding: '1rem', borderRadius: '0.5rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#ea580c', margin: '0 0 0.5rem 0' }}>Total Storage</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#c2410c', margin: '0 0 0.25rem 0' }}>{resources.totalStorage} GB</p>
                <p style={{ fontSize: '0.75rem', color: '#ea580c', margin: 0 }}>SSD premium</p>
              </div>
            </div>
          </div>
        </div>

        {/* BoQ Items Table */}
        <BoQTable
          items={boqItems}
          setItems={setBoqItems}
          editable={true}
          highlightNew={newlyAddedIndex}
          onAddResource={handleAddResource}
          onEditResource={(idx, updatedItem) => {
            // Optionally handle side effects here
          }}
          onApprovalStatusChange={handleApprovalStatusChange}
        />

        {/* Pricing Summary */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '0.5rem', 
          border: '1px solid #e5e7eb',
          marginBottom: '1.5rem',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0 0 0.5rem 0', color: '#111827' }}>
              📈 Pricing Summary
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
              Contract terms and pricing breakdown with GST
            </p>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal</span>
                <span>₹{totals.subtotal?.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                <span>Annual Contract Discount ({totals.contractDiscount}%)</span>
                <span>-₹{totals.discountAmount?.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>GST (18%)</span>
                <span>₹{totals.tax?.toLocaleString()}</span>
              </div>
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.125rem' }}>
                  <span>Monthly Total</span>
                  <span>₹{totals.monthlyTotal?.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280' }}>
                  <span>Annual Total (12 months)</span>
                  <span>₹{totals.annualTotal?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Approval Required Banner */}
        {approvalRequired && (
          <div style={{ background: '#fef3c7', color: '#92400e', padding: 16, borderRadius: 8, marginBottom: 24, border: '1px solid #fde68a', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>⚠️ One or more items are priced below floor. Finance Admin approval required before proposal can be sent.</span>
            {isFinanceAdmin && (
              <button onClick={handleApproveAll} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 4, padding: '0.5rem 1.25rem', marginLeft: 16 }}>Approve All</button>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button style={{ 
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            padding: '0.75rem 1.5rem', 
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            ← Back to Dashboard
          </button>
          <button style={{ 
            backgroundColor: approvalRequired ? '#d1d5db' : '#2563eb',
            color: approvalRequired ? '#6b7280' : 'white',
            border: 'none',
            padding: '0.75rem 1.5rem', 
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            cursor: approvalRequired ? 'not-allowed' : 'pointer',
            flex: 1
          }} disabled={approvalRequired}>
            Submit for Approval
          </button>
        </div>
      </div>
    </div>
  )
}

export default BoQGenerated

