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

// Auto-add essential services using the modern service catalog SKUs
export const ESSENTIAL_SERVICES = [
  { sku: 'BACKUP-BASIC', quantity: 1, autoAdded: true, reason: 'Data protection compliance' },
  { sku: 'VPN-S2S', quantity: 1, autoAdded: true, reason: 'Secure connectivity' },
  { sku: 'INTERNET-BASIC', quantity: 1, autoAdded: true, reason: 'Internet connectivity' }
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
  
  // Allow AM to act in Solution Architect Review status
  if (persona === PERSONAS.ACCOUNT_MANAGER && projectStatus === PROJECT_STATUS.PENDING_SA_REVIEW) {
    return true;
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
    // Debug logs
    console.log('[updateProject] updates:', updates)
    // Patch: Only overwrite boqItems if updates.boqItems is a non-empty array
    let mergedProject = {
      ...projects[projectIndex],
      ...updates,
      lastModified: new Date().toISOString()
    }
    if (Array.isArray(updates.boqItems) && updates.boqItems.length > 0) {
      mergedProject.boqItems = updates.boqItems
    } else if (updates.boqItems !== undefined) {
      // If explicitly set to empty, keep as is (for deletions)
      mergedProject.boqItems = updates.boqItems
    } else {
      // Otherwise, retain existing
      mergedProject.boqItems = projects[projectIndex].boqItems
    }
    console.log('[updateProject] mergedProject:', mergedProject)
    projects[projectIndex] = mergedProject
    
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

// Map full persona names to short forms
const PERSONA_SHORT_FORMS = {
  [PERSONAS.ACCOUNT_MANAGER]: 'AM',
  [PERSONAS.PRODUCT_MANAGER]: 'PM',
  [PERSONAS.SOLUTION_ARCHITECT]: 'SA',
  [PERSONAS.FINANCE_ADMIN]: 'FA'
}

// Map short forms back to full names
const PERSONA_FULL_NAMES = {
  'AM': PERSONAS.ACCOUNT_MANAGER,
  'PM': PERSONAS.PRODUCT_MANAGER,
  'SA': PERSONAS.SOLUTION_ARCHITECT,
  'FA': PERSONAS.FINANCE_ADMIN
}

export const getCurrentPersona = () => {
  const storedPersona = localStorage.getItem('currentPersona')
  if (!storedPersona) {
    // Set default persona if none exists
    localStorage.setItem('currentPersona', PERSONAS.ACCOUNT_MANAGER)
    return PERSONAS.ACCOUNT_MANAGER
  }
  return storedPersona
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

