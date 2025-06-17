// Enhanced Data Model with proper workflow and SKU codes
export const PERSONAS = {
  ACCOUNT_MANAGER: 'Account Manager',
  PRODUCT_MANAGER: 'Product Manager', 
  SOLUTION_ARCHITECT: 'Solution Architect',
  FINANCE_ADMIN: 'Finance Admin'
}

export const PROJECT_STATUS = {
  DRAFT: 'Draft',
  PENDING_SA_REVIEW: 'Pending Solution Architect Review',
  PENDING_PM_REVIEW: 'Pending Product Manager Review', 
  PENDING_SA_FINAL: 'Pending Solution Architect Final Review',
  PENDING_FINANCE_APPROVAL: 'Pending Finance Approval',
  APPROVED: 'Approved'
}

export const FLOW_TYPES = {
  STANDARD: 'standard',
  CUSTOM: 'custom'
}

export const CONTRACT_TERMS = {
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  ANNUAL: 'annual',
  THREE_YEAR: 'three_year'
}

// Enhanced price-book with internal SKU codes
export const PRICE_BOOK_SKUS = [
  // Compute
  { sku: 'SIFY-VM-WIN-2C4G', internalCode: 'VM001', name: 'Windows VM 2vCPU 4GB', category: 'Compute', basePrice: 2400, unit: 'per month' },
  { sku: 'SIFY-VM-WIN-4C8G', internalCode: 'VM002', name: 'Windows VM 4vCPU 8GB', category: 'Compute', basePrice: 4800, unit: 'per month' },
  { sku: 'SIFY-VM-WIN-8C16G', internalCode: 'VM003', name: 'Windows VM 8vCPU 16GB', category: 'Compute', basePrice: 9600, unit: 'per month' },
  { sku: 'SIFY-VM-LIN-2C4G', internalCode: 'VM004', name: 'Linux VM 2vCPU 4GB', category: 'Compute', basePrice: 2000, unit: 'per month' },
  { sku: 'SIFY-VM-LIN-4C8G', internalCode: 'VM005', name: 'Linux VM 4vCPU 8GB', category: 'Compute', basePrice: 4000, unit: 'per month' },
  { sku: 'SIFY-VM-LIN-8C16G', internalCode: 'VM006', name: 'Linux VM 8vCPU 16GB', category: 'Compute', basePrice: 8000, unit: 'per month' },
  
  // Storage
  { sku: 'SIFY-STOR-SSD-100G', internalCode: 'ST001', name: 'SSD Storage 100GB', category: 'Storage', basePrice: 800, unit: 'per month' },
  { sku: 'SIFY-STOR-SSD-500G', internalCode: 'ST002', name: 'SSD Storage 500GB', category: 'Storage', basePrice: 3500, unit: 'per month' },
  { sku: 'SIFY-STOR-HDD-1TB', internalCode: 'ST003', name: 'HDD Storage 1TB', category: 'Storage', basePrice: 2000, unit: 'per month' },
  
  // Network
  { sku: 'SIFY-LB-STD', internalCode: 'NW001', name: 'Standard Load Balancer', category: 'Network', basePrice: 2000, unit: 'per month' },
  { sku: 'SIFY-LB-ADV', internalCode: 'NW002', name: 'Advanced Load Balancer', category: 'Network', basePrice: 4000, unit: 'per month' },
  { sku: 'SIFY-VPN-SITE', internalCode: 'NW003', name: 'Site-to-Site VPN', category: 'Network', basePrice: 1500, unit: 'per month' },
  { sku: 'SIFY-INET-100M', internalCode: 'NW004', name: 'Internet 100Mbps', category: 'Network', basePrice: 5000, unit: 'per month' },
  { sku: 'SIFY-INET-1G', internalCode: 'NW005', name: 'Internet 1Gbps', category: 'Network', basePrice: 15000, unit: 'per month' },
  
  // Security
  { sku: 'SIFY-FW-STD', internalCode: 'SEC001', name: 'Standard Firewall', category: 'Security', basePrice: 2500, unit: 'per month' },
  { sku: 'SIFY-FW-ENT', internalCode: 'SEC002', name: 'Enterprise Firewall', category: 'Security', basePrice: 5000, unit: 'per month' },
  { sku: 'SIFY-AV-STD', internalCode: 'SEC003', name: 'Standard Antivirus', category: 'Security', basePrice: 300, unit: 'per instance' },
  { sku: 'SIFY-AV-ENT', internalCode: 'SEC004', name: 'Enterprise Antivirus', category: 'Security', basePrice: 500, unit: 'per instance' },
  
  // Backup & DR
  { sku: 'SIFY-BKP-STD', internalCode: 'BKP001', name: 'Standard Backup', category: 'Backup', basePrice: 1000, unit: 'per 100GB' },
  { sku: 'SIFY-BKP-ENT', internalCode: 'BKP002', name: 'Enterprise Backup', category: 'Backup', basePrice: 2000, unit: 'per 100GB' },
  { sku: 'SIFY-DR-BASIC', internalCode: 'DR001', name: 'Basic Disaster Recovery', category: 'DR', basePrice: 5000, unit: 'per month' }
]

// Auto-add essential services
export const ESSENTIAL_SERVICES = [
  { sku: 'SIFY-BKP-STD', quantity: 1, autoAdded: true, reason: 'Data protection compliance' },
  { sku: 'SIFY-VPN-SITE', quantity: 1, autoAdded: true, reason: 'Secure connectivity' },
  { sku: 'SIFY-INET-100M', quantity: 1, autoAdded: true, reason: 'Internet connectivity' }
]

// Project data model with contract terms
export const createProject = (data) => ({
  id: `PROJ-${Date.now()}`,
  customerName: data.customerName || '',
  projectName: data.projectName || '',
  contactEmail: data.contactEmail || '',
  phone: data.phone || '',
  timeline: data.timeline || 'Normal (2-4 weeks)',
  projectType: data.projectType || 'New Infrastructure',
  flowType: data.flowType || FLOW_TYPES.STANDARD,
  contractTerm: data.contractTerm || CONTRACT_TERMS.ANNUAL,
  status: PROJECT_STATUS.DRAFT,
  createdDate: new Date().toISOString(),
  matchedItems: [],
  unmatchedItems: [],
  boqItems: [],
  essentialServices: [],
  totals: {
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
    monthlyTotal: 0,
    annualTotal: 0
  },
  comments: [],
  approvals: {},
  lastModified: new Date().toISOString(),
  bulkConfig: {
    totalCPU: 0,
    totalRAM: 0,
    vmCount: 0
  }
})

// Updated workflow - AM -> SA -> PM -> SA -> Finance
export const canUserActOnProject = (persona, projectStatus) => {
  const permissions = {
    [PERSONAS.ACCOUNT_MANAGER]: [PROJECT_STATUS.DRAFT, PROJECT_STATUS.PENDING_SA_FINAL],
    [PERSONAS.SOLUTION_ARCHITECT]: [PROJECT_STATUS.PENDING_SA_REVIEW, PROJECT_STATUS.PENDING_SA_FINAL],
    [PERSONAS.PRODUCT_MANAGER]: [PROJECT_STATUS.PENDING_PM_REVIEW],
    [PERSONAS.FINANCE_ADMIN]: [PROJECT_STATUS.PENDING_FINANCE_APPROVAL]
  }
  
  return permissions[persona]?.includes(projectStatus) || false
}

export const getNextStatus = (currentStatus, flowType, persona) => {
  if (flowType === FLOW_TYPES.STANDARD) {
    // Standard flow: Draft -> Finance -> Approved
    switch (currentStatus) {
      case PROJECT_STATUS.DRAFT:
        return PROJECT_STATUS.PENDING_FINANCE_APPROVAL
      case PROJECT_STATUS.PENDING_FINANCE_APPROVAL:
        return PROJECT_STATUS.APPROVED
      default:
        return currentStatus
    }
  } else {
    // Custom flow: Draft -> SA -> PM -> SA Final -> Finance -> Approved
    switch (currentStatus) {
      case PROJECT_STATUS.DRAFT:
        return PROJECT_STATUS.PENDING_SA_REVIEW
      case PROJECT_STATUS.PENDING_SA_REVIEW:
        return PROJECT_STATUS.PENDING_PM_REVIEW
      case PROJECT_STATUS.PENDING_PM_REVIEW:
        return PROJECT_STATUS.PENDING_SA_FINAL
      case PROJECT_STATUS.PENDING_SA_FINAL:
        return PROJECT_STATUS.PENDING_FINANCE_APPROVAL
      case PROJECT_STATUS.PENDING_FINANCE_APPROVAL:
        return PROJECT_STATUS.APPROVED
      default:
        return currentStatus
    }
  }
}

// Contract term utilities
export const getContractMultiplier = (contractTerm) => {
  const multipliers = {
    [CONTRACT_TERMS.MONTHLY]: 1,
    [CONTRACT_TERMS.QUARTERLY]: 3,
    [CONTRACT_TERMS.ANNUAL]: 12,
    [CONTRACT_TERMS.THREE_YEAR]: 36
  }
  return multipliers[contractTerm] || 12
}

export const getContractDiscount = (contractTerm) => {
  const discounts = {
    [CONTRACT_TERMS.MONTHLY]: 0,
    [CONTRACT_TERMS.QUARTERLY]: 5,
    [CONTRACT_TERMS.ANNUAL]: 15,
    [CONTRACT_TERMS.THREE_YEAR]: 25
  }
  return discounts[contractTerm] || 0
}

export const getContractLabel = (contractTerm) => {
  const labels = {
    [CONTRACT_TERMS.MONTHLY]: 'Monthly',
    [CONTRACT_TERMS.QUARTERLY]: 'Quarterly (3 months)',
    [CONTRACT_TERMS.ANNUAL]: 'Annual (12 months)',
    [CONTRACT_TERMS.THREE_YEAR]: '3-Year Contract'
  }
  return labels[contractTerm] || 'Annual'
}

// Bulk CPU/RAM calculation
export const calculateBulkResources = (items) => {
  let totalCPU = 0
  let totalRAM = 0
  let vmCount = 0

  items.forEach(item => {
    if (item.category === 'Compute') {
      const cpuMatch = item.name.match(/(\d+)vCPU/)
      const ramMatch = item.name.match(/(\d+)GB/)
      
      if (cpuMatch && ramMatch) {
        const cpu = parseInt(cpuMatch[1])
        const ram = parseInt(ramMatch[1])
        const quantity = item.quantity || 1
        
        totalCPU += cpu * quantity
        totalRAM += ram * quantity
        vmCount += quantity
      }
    }
  })

  return { totalCPU, totalRAM, vmCount }
}

// All existing utility functions remain the same
export const getProjects = () => {
  try {
    const data = localStorage.getItem('sify_demo_data')
    return data ? JSON.parse(data).projects || [] : []
  } catch (error) {
    console.error('Error loading projects:', error)
    return []
  }
}

export const addProject = (project) => {
  try {
    const projects = getProjects()
    const newProject = createProject(project)
    projects.push(newProject)
    
    localStorage.setItem('sify_demo_data', JSON.stringify({ 
      projects,
      lastUpdated: new Date().toISOString()
    }))
    
    return newProject
  } catch (error) {
    console.error('Error adding project:', error)
    throw new Error('Failed to save project')
  }
}

export const updateProject = (projectId, updates) => {
  try {
    const projects = getProjects()
    const projectIndex = projects.findIndex(p => p.id === projectId)
    
    if (projectIndex === -1) {
      throw new Error('Project not found')
    }
    
    projects[projectIndex] = {
      ...projects[projectIndex],
      ...updates,
      lastModified: new Date().toISOString()
    }
    
    localStorage.setItem('sify_demo_data', JSON.stringify({
      projects,
      lastUpdated: new Date().toISOString()
    }))
    
    return projects[projectIndex]
  } catch (error) {
    console.error('Error updating project:', error)
    throw new Error('Failed to update project')
  }
}

export const getProject = (projectId) => {
  const projects = getProjects()
  return projects.find(p => p.id === projectId)
}

export const clearDemoData = () => {
  try {
    localStorage.removeItem('sify_demo_data')
    localStorage.removeItem('currentPersona')
    return true
  } catch (error) {
    console.error('Error clearing demo data:', error)
    return false
  }
}

export const getCurrentPersona = () => {
  return localStorage.getItem('currentPersona') || PERSONAS.ACCOUNT_MANAGER
}

export const setCurrentPersona = (persona) => {
  localStorage.setItem('currentPersona', persona)
}

export const getStatusColor = (status) => {
  const colors = {
    [PROJECT_STATUS.DRAFT]: 'bg-gray-100 text-gray-800',
    [PROJECT_STATUS.PENDING_SA_REVIEW]: 'bg-blue-100 text-blue-800',
    [PROJECT_STATUS.PENDING_PM_REVIEW]: 'bg-yellow-100 text-yellow-800',
    [PROJECT_STATUS.PENDING_SA_FINAL]: 'bg-purple-100 text-purple-800',
    [PROJECT_STATUS.PENDING_FINANCE_APPROVAL]: 'bg-orange-100 text-orange-800',
    [PROJECT_STATUS.APPROVED]: 'bg-green-100 text-green-800'
  }
  
  return colors[status] || 'bg-gray-100 text-gray-800'
}

