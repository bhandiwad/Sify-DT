# Sify Cloud Demo - Logic and Flow Documentation

## 1. **System Overview and Architecture**

### 1.1 **High-Level System Flow**

The Sify Cloud Demo implements a sophisticated workflow management system for cloud resource ordering, designed to handle both standard and custom service requirements through automated and manual approval processes.

### 1.2 **Core System Components**

#### **1.2.1 Workflow Engine**
- **State Machine**: Manages project status transitions
- **Role-Based Routing**: Routes tasks based on user personas
- **Business Rules**: Enforces approval thresholds and requirements
- **Audit Trail**: Tracks all state changes and user actions

#### **1.2.2 SKU Matching Engine**
- **Rule-Based Matching**: Matches requirements against price book
- **Fuzzy Logic**: Handles variations in service descriptions
- **Confidence Scoring**: Assigns match confidence levels
- **Essential Services**: Automatically adds compliance services

#### **1.2.3 Pricing Engine**
- **Contract-Based Pricing**: Applies discounts based on contract terms
- **Volume Calculations**: Handles bulk resource pricing
- **Tax Calculations**: Applies GST and other applicable taxes
- **Real-Time Updates**: Recalculates pricing on changes

## 2. **Persona Design and Role-Based Logic**

### 2.1 **Persona Architecture**

#### **2.1.1 Account Manager (AM)**
```javascript
const ACCOUNT_MANAGER = {
  role: 'ACCOUNT_MANAGER',
  permissions: {
    canCreateProjects: true,
    canUploadRequirements: true,
    canViewAllProjects: true,
    canEditCustomerInfo: true,
    canSubmitForApproval: true
  },
  workflows: {
    initiateStandardFlow: true,
    initiateCustomFlow: true,
    viewProjectStatus: true,
    communicateWithCustomer: true
  },
  restrictions: {
    cannotApprovePricing: true,
    cannotCreateCustomSKUs: true,
    cannotModifyPriceBook: true
  }
};
```

#### **2.1.2 Product Manager (PM)**
```javascript
const PRODUCT_MANAGER = {
  role: 'PRODUCT_MANAGER',
  permissions: {
    canReviewCustomSKUs: true,
    canApprovePricing: true,
    canModifyPriceBook: true,
    canCreateNewSKUs: true,
    canSetDiscountLimits: true
  },
  workflows: {
    reviewCustomSKURequests: true,
    validateBusinessCase: true,
    setPricingForCustomItems: true,
    approveRejectCustomSKUs: true
  },
  approvalThresholds: {
    maxDiscountWithoutEscalation: 15,
    maxCustomSKUValue: 100000,
    requiresJustification: true
  }
};
```

#### **2.1.3 Solution Architect (SA)**
```javascript
const SOLUTION_ARCHITECT = {
  role: 'SOLUTION_ARCHITECT',
  permissions: {
    canReviewTechnicalSpecs: true,
    canValidateArchitecture: true,
    canModifyResourceSizing: true,
    canApproveTechnicalFeasibility: true
  },
  workflows: {
    validateTechnicalRequirements: true,
    designSolutionArchitecture: true,
    estimateResourceRequirements: true,
    provideTechnicalApproval: true
  },
  expertise: {
    cloudArchitecture: true,
    resourceOptimization: true,
    securityCompliance: true,
    performanceEngineering: true
  }
};
```

#### **2.1.4 Finance Admin**
```javascript
const FINANCE_ADMIN = {
  role: 'FINANCE_ADMIN',
  permissions: {
    canApprovePricing: true,
    canModifyDiscounts: true,
    canViewFinancialReports: true,
    canSetApprovalThresholds: true
  },
  workflows: {
    reviewPricingProposals: true,
    validateContractTerms: true,
    approveDiscounts: true,
    generateFinancialReports: true
  },
  approvalLimits: {
    unlimitedDiscountApproval: true,
    contractValueLimit: null,
    requiresDocumentation: true
  }
};
```

### 2.2 **Role-Based Access Control Logic**

#### **2.2.1 Permission Validation**
```javascript
function validateUserAction(user, action, resource) {
  const persona = getPersonaConfig(user.role);
  
  // Check basic permission
  if (!persona.permissions[action]) {
    throw new UnauthorizedError(`${user.role} cannot perform ${action}`);
  }
  
  // Check resource-specific permissions
  if (resource.status && !canAccessStatus(user.role, resource.status)) {
    throw new UnauthorizedError(`${user.role} cannot access ${resource.status} projects`);
  }
  
  // Check approval thresholds
  if (action === 'approve' && resource.value > persona.approvalLimits?.maxValue) {
    throw new UnauthorizedError(`Approval value exceeds ${user.role} limit`);
  }
  
  return true;
}
```

#### **2.2.2 Workflow State Access Matrix**
```javascript
const WORKFLOW_ACCESS_MATRIX = {
  DRAFT: {
    allowedPersonas: ['ACCOUNT_MANAGER'],
    allowedActions: ['edit', 'submit', 'delete']
  },
  PENDING_SA_REVIEW: {
    allowedPersonas: ['SOLUTION_ARCHITECT', 'ACCOUNT_MANAGER'],
    allowedActions: ['review', 'approve', 'reject', 'view']
  },
  PENDING_PM_REVIEW: {
    allowedPersonas: ['PRODUCT_MANAGER', 'ACCOUNT_MANAGER'],
    allowedActions: ['review', 'approve', 'reject', 'price', 'view']
  },
  PENDING_SA_FINAL: {
    allowedPersonas: ['SOLUTION_ARCHITECT', 'ACCOUNT_MANAGER'],
    allowedActions: ['review', 'approve', 'reject', 'view']
  },
  PENDING_FINANCE_APPROVAL: {
    allowedPersonas: ['FINANCE_ADMIN', 'ACCOUNT_MANAGER'],
    allowedActions: ['approve', 'reject', 'view']
  },
  APPROVED: {
    allowedPersonas: ['ACCOUNT_MANAGER', 'FINANCE_ADMIN'],
    allowedActions: ['view', 'generate_proposal']
  }
};
```

## 3. **SKU Logic and Matching Algorithm**

### 3.1 **SKU Data Structure**

#### **3.1.1 Standard SKU Format**
```javascript
const SKU_STRUCTURE = {
  sku: 'CI-{CATEGORY}-{TYPE}-{VARIANT}',
  internalCode: '{CATEGORY}{SEQUENCE}',
  categories: {
    'CI-2C4R50S': 'Compute - 2vCPU 4GB RAM 50GB Storage',
    'CI-ST-100G': 'Storage - 100GB',
    'CI-NW-STD': 'Network - Standard',
    'CI-SEC-FW': 'Security - Firewall',
    'CI-BKP-STD': 'Backup - Standard'
  }
};
```

#### **3.1.2 Price Book Structure**
```javascript
const PRICE_BOOK_SKUS = [
  {
    sku: 'CI-2C4R50S-WINDOWS',
    internalCode: 'VM001',
    name: 'Windows VM 2vCPU 4GB',
    category: 'Compute',
    basePrice: 2000,
    unit: 'monthly',
    specifications: {
      cpu: 2,
      ram: 4,
      storage: 50,
      os: 'windows'
    },
    matchingKeywords: ['windows', 'vm', '2vcpu', '4gb', 'virtual machine']
  }
  // ... more SKUs
];
```

### 3.2 **SKU Matching Algorithm**

#### **3.2.1 Multi-Stage Matching Process**
```javascript
function performSKUMatching(requirements) {
  const results = {
    matched: [],
    unmatched: [],
    confidence: []
  };
  
  requirements.forEach(requirement => {
    // Stage 1: Exact SKU match
    let match = findExactSKUMatch(requirement);
    if (match) {
      results.matched.push({...requirement, ...match, confidence: 100});
      return;
    }
    
    // Stage 2: Name-based fuzzy matching
    match = findFuzzyNameMatch(requirement);
    if (match && match.confidence > 80) {
      results.matched.push({...requirement, ...match});
      return;
    }
    
    // Stage 3: Specification-based matching
    match = findSpecificationMatch(requirement);
    if (match && match.confidence > 70) {
      results.matched.push({...requirement, ...match});
      return;
    }
    
    // Stage 4: Category-based matching
    match = findCategoryMatch(requirement);
    if (match && match.confidence > 60) {
      results.matched.push({...requirement, ...match});
      return;
    }
    
    // No match found - mark as custom
    results.unmatched.push(requirement);
  });
  
  return results;
}
```

#### **3.2.2 Fuzzy Matching Logic**
```javascript
function calculateMatchConfidence(requirement, sku) {
  let confidence = 0;
  
  // Name similarity (40% weight)
  const nameSimilarity = calculateStringSimilarity(
    requirement.serviceName.toLowerCase(),
    sku.name.toLowerCase()
  );
  confidence += nameSimilarity * 0.4;
  
  // Keyword matching (30% weight)
  const keywordMatches = sku.matchingKeywords.filter(keyword =>
    requirement.serviceName.toLowerCase().includes(keyword)
  ).length;
  confidence += (keywordMatches / sku.matchingKeywords.length) * 0.3;
  
  // Specification matching (30% weight)
  if (requirement.specifications && sku.specifications) {
    const specSimilarity = calculateSpecificationSimilarity(
      requirement.specifications,
      sku.specifications
    );
    confidence += specSimilarity * 0.3;
  }
  
  return Math.min(confidence * 100, 100);
}
```

### 3.3 **Essential Services Logic**

#### **3.3.1 Auto-Addition Rules**
```javascript
const ESSENTIAL_SERVICES_RULES = {
  backup: {
    condition: (project) => project.hasComputeResources || project.hasStorage,
    service: 'CI-BKP-STD',
    reason: 'Data protection compliance',
    quantity: 1
  },
  vpn: {
    condition: (project) => project.requiresSecureConnectivity,
    service: 'CI-VPN-S2S',
    reason: 'Secure connectivity requirement',
    quantity: 1
  },
  internet: {
    condition: (project) => !project.hasInternetConnectivity,
    service: 'CI-INET-100M',
    reason: 'Basic internet connectivity',
    quantity: 1
  }
};

function addEssentialServices(boqItems, project) {
  const essentialServices = [];
  
  Object.entries(ESSENTIAL_SERVICES_RULES).forEach(([key, rule]) => {
    if (rule.condition(project)) {
      const service = PRICE_BOOK_SKUS.find(sku => sku.sku === rule.service);
      if (service) {
        essentialServices.push({
          ...service,
          quantity: rule.quantity,
          isEssential: true,
          autoAdded: true,
          reason: rule.reason
        });
      }
    }
  });
  
  return [...boqItems, ...essentialServices];
}
```

## 4. **Pricing Logic and Calculations**

### 4.1 **Contract-Based Pricing Model**

#### **4.1.1 Discount Structure**
```javascript
const CONTRACT_DISCOUNTS = {
  monthly: {
    discount: 0,
    multiplier: 1,
    description: 'No discount'
  },
  quarterly: {
    discount: 0.05,
    multiplier: 3,
    description: '5% discount for quarterly payment'
  },
  annual: {
    discount: 0.15,
    multiplier: 12,
    description: '15% discount for annual payment'
  },
  three_year: {
    discount: 0.25,
    multiplier: 36,
    description: '25% discount for 3-year commitment'
  }
};
```

#### **4.1.2 Pricing Calculation Engine**
```javascript
function calculatePricing(boqItems, contractTerm) {
  const contractConfig = CONTRACT_DISCOUNTS[contractTerm];
  
  // Calculate base pricing
  const baseCalculation = boqItems.reduce((acc, item) => {
    const itemTotal = item.quantity * item.unitPrice;
    const contractTotal = itemTotal * contractConfig.multiplier;
    
    acc.baseTotal += itemTotal;
    acc.contractTotal += contractTotal;
    
    return acc;
  }, { baseTotal: 0, contractTotal: 0 });
  
  // Apply contract discount
  const discountAmount = baseCalculation.contractTotal * contractConfig.discount;
  const discountedTotal = baseCalculation.contractTotal - discountAmount;
  
  // Calculate GST
  const gstAmount = discountedTotal * 0.18;
  const finalTotal = discountedTotal + gstAmount;
  
  return {
    baseMonthlyTotal: baseCalculation.baseTotal,
    contractTotal: baseCalculation.contractTotal,
    discountPercentage: contractConfig.discount * 100,
    discountAmount: discountAmount,
    discountedTotal: discountedTotal,
    gstAmount: gstAmount,
    finalTotal: finalTotal,
    contractTerm: contractTerm,
    contractMultiplier: contractConfig.multiplier
  };
}
```

### 4.2 **Bulk Resource Calculations**

#### **4.2.1 Resource Aggregation Logic**
```javascript
function calculateBulkResources(boqItems) {
  const bulkSummary = {
    totalVMs: 0,
    totalvCPUs: 0,
    totalRAM: 0,
    totalStorage: 0,
    categories: {
      compute: { count: 0, value: 0 },
      storage: { count: 0, value: 0 },
      network: { count: 0, value: 0 },
      security: { count: 0, value: 0 },
      backup: { count: 0, value: 0 }
    }
  };
  
  boqItems.forEach(item => {
    // Aggregate compute resources
    if (item.category === 'Compute') {
      bulkSummary.totalVMs += item.quantity;
      if (item.specifications?.cpu) {
        bulkSummary.totalvCPUs += item.quantity * item.specifications.cpu;
      }
      if (item.specifications?.ram) {
        bulkSummary.totalRAM += item.quantity * item.specifications.ram;
      }
    }
    
    // Aggregate storage
    if (item.category === 'Storage' && item.specifications?.capacity) {
      bulkSummary.totalStorage += item.quantity * item.specifications.capacity;
    }
    
    // Category-wise aggregation
    const category = item.category.toLowerCase();
    if (bulkSummary.categories[category]) {
      bulkSummary.categories[category].count += item.quantity;
      bulkSummary.categories[category].value += item.quantity * item.unitPrice;
    }
  });
  
  return bulkSummary;
}
```

### 4.3 **Approval Threshold Logic**

#### **4.3.1 Automatic Approval Rules**
```javascript
const APPROVAL_THRESHOLDS = {
  autoApproval: {
    maxDiscountPercentage: 10,
    maxOrderValue: 50000,
    standardSKUsOnly: true
  },
  financeApproval: {
    discountRange: [10, 15],
    maxOrderValue: 200000,
    requiresJustification: true
  },
  buHeadApproval: {
    discountThreshold: 15,
    orderValueThreshold: 200000,
    requiresBusinessCase: true
  }
};

function determineApprovalRequired(pricing, boqItems) {
  const discountPercentage = pricing.discountPercentage;
  const orderValue = pricing.finalTotal;
  const hasCustomSKUs = boqItems.some(item => item.isCustom);
  
  // Check for auto-approval
  if (discountPercentage <= APPROVAL_THRESHOLDS.autoApproval.maxDiscountPercentage &&
      orderValue <= APPROVAL_THRESHOLDS.autoApproval.maxOrderValue &&
      !hasCustomSKUs) {
    return { level: 'auto', required: false };
  }
  
  // Check for finance approval
  if (discountPercentage <= APPROVAL_THRESHOLDS.financeApproval.discountRange[1] &&
      orderValue <= APPROVAL_THRESHOLDS.financeApproval.maxOrderValue) {
    return { level: 'finance', required: true };
  }
  
  // Requires BU Head approval
  return { level: 'bu_head', required: true };
}
```

## 5. **Approval Workflow Logic**

### 5.1 **Workflow State Machine**

#### **5.1.1 State Definitions**
```javascript
const WORKFLOW_STATES = {
  DRAFT: {
    description: 'Initial project creation',
    allowedTransitions: ['PENDING_SA_REVIEW', 'PENDING_FINANCE_APPROVAL'],
    requiredActions: ['complete_project_info', 'upload_requirements'],
    timeoutDays: 7
  },
  PENDING_SA_REVIEW: {
    description: 'Awaiting Solution Architect technical review',
    allowedTransitions: ['PENDING_PM_REVIEW', 'DRAFT'],
    requiredActions: ['technical_validation', 'architecture_review'],
    timeoutDays: 3
  },
  PENDING_PM_REVIEW: {
    description: 'Awaiting Product Manager pricing and SKU approval',
    allowedTransitions: ['PENDING_SA_FINAL', 'PENDING_SA_REVIEW'],
    requiredActions: ['pricing_approval', 'custom_sku_creation'],
    timeoutDays: 2
  },
  PENDING_SA_FINAL: {
    description: 'Awaiting final Solution Architect approval',
    allowedTransitions: ['PENDING_FINANCE_APPROVAL', 'PENDING_PM_REVIEW'],
    requiredActions: ['final_technical_approval'],
    timeoutDays: 1
  },
  PENDING_FINANCE_APPROVAL: {
    description: 'Awaiting Finance approval for pricing',
    allowedTransitions: ['APPROVED', 'PENDING_SA_FINAL'],
    requiredActions: ['financial_approval'],
    timeoutDays: 2
  },
  APPROVED: {
    description: 'Final approval completed',
    allowedTransitions: [],
    requiredActions: ['generate_proposal'],
    timeoutDays: null
  }
};
```

#### **5.1.2 State Transition Logic**
```javascript
function transitionWorkflowState(project, newState, actor, reason) {
  const currentState = WORKFLOW_STATES[project.status];
  
  // Validate transition is allowed
  if (!currentState.allowedTransitions.includes(newState)) {
    throw new InvalidTransitionError(
      `Cannot transition from ${project.status} to ${newState}`
    );
  }
  
  // Validate actor has permission
  if (!canActorTransitionState(actor, project.status, newState)) {
    throw new UnauthorizedError(
      `${actor.role} cannot transition project to ${newState}`
    );
  }
  
  // Record transition
  const transition = {
    from: project.status,
    to: newState,
    actor: actor.id,
    reason: reason,
    timestamp: new Date().toISOString()
  };
  
  // Update project
  project.status = newState;
  project.transitions = [...(project.transitions || []), transition];
  project.updatedAt = new Date().toISOString();
  
  // Trigger notifications
  triggerWorkflowNotifications(project, transition);
  
  return project;
}
```

### 5.2 **Custom SKU Workflow**

#### **5.2.1 Custom SKU Creation Process**
```javascript
function processCustomSKUWorkflow(unmatchedItems, project) {
  const customSKUs = unmatchedItems.map(item => ({
    id: generateCustomSKUId(),
    originalRequirement: item,
    status: 'PENDING_SA_REVIEW',
    technicalSpecs: null,
    pricing: null,
    businessJustification: null,
    createdAt: new Date().toISOString()
  }));
  
  // Update project with custom SKUs
  project.customSKUs = customSKUs;
  project.status = 'PENDING_SA_REVIEW';
  
  // Create SA review tasks
  customSKUs.forEach(sku => {
    createSAReviewTask(sku, project);
  });
  
  return project;
}
```

#### **5.2.2 SA Technical Review Process**
```javascript
function processSATechnicalReview(customSKU, technicalSpecs, approval) {
  if (approval === 'approved') {
    customSKU.technicalSpecs = technicalSpecs;
    customSKU.status = 'PENDING_PM_REVIEW';
    customSKU.saApproval = {
      approvedBy: getCurrentUser().id,
      approvedAt: new Date().toISOString(),
      technicalNotes: technicalSpecs.notes
    };
    
    // Create PM review task
    createPMReviewTask(customSKU);
    
  } else {
    customSKU.status = 'REJECTED_BY_SA';
    customSKU.rejectionReason = approval.reason;
    
    // Notify AM of rejection
    notifyAMOfRejection(customSKU);
  }
  
  return customSKU;
}
```

#### **5.2.3 PM Pricing Review Process**
```javascript
function processPMPricingReview(customSKU, pricing, businessCase) {
  // Validate pricing within PM authority
  if (pricing.unitPrice > PM_PRICING_LIMIT) {
    throw new ExceedsAuthorityError('Pricing exceeds PM approval limit');
  }
  
  customSKU.pricing = pricing;
  customSKU.businessCase = businessCase;
  customSKU.status = 'PENDING_SA_FINAL';
  customSKU.pmApproval = {
    approvedBy: getCurrentUser().id,
    approvedAt: new Date().toISOString(),
    pricingNotes: pricing.notes
  };
  
  // Create final SA review task
  createSAFinalReviewTask(customSKU);
  
  return customSKU;
}
```

## 6. **Data Models and Service Architecture**

### 6.1 **Core Data Models**

#### **6.1.1 Project Data Model**
```javascript
const ProjectSchema = {
  id: 'string', // PROJ-{timestamp}
  customerInfo: {
    companyName: 'string',
    contactName: 'string',
    contactEmail: 'string',
    contactPhone: 'string'
  },
  projectInfo: {
    name: 'string',
    description: 'string',
    expectedTimeline: 'string',
    budget: 'number'
  },
  contractTerms: {
    term: 'monthly|quarterly|annual|three_year',
    startDate: 'date',
    endDate: 'date',
    autoRenewal: 'boolean'
  },
  workflow: {
    demoType: 'standard|custom',
    status: 'string',
    currentAssignee: 'string',
    transitions: 'array'
  },
  requirements: {
    originalFile: 'file',
    parsedData: 'array',
    matchingResults: 'object'
  },
  boq: {
    items: 'array',
    pricing: 'object',
    bulkResources: 'object'
  },
  approvals: {
    sa: 'object',
    pm: 'object',
    finance: 'object'
  },
  metadata: {
    createdAt: 'timestamp',
    updatedAt: 'timestamp',
    createdBy: 'string',
    version: 'number'
  }
};
```

#### **6.1.2 SKU Data Model**
```javascript
const SKUSchema = {
  sku: 'string', // CI-{category}-{type}
  internalCode: 'string', // {category}{number}
  name: 'string',
  description: 'string',
  category: 'Compute|Storage|Network|Security|Backup|DR',
  subcategory: 'string',
  pricing: {
    basePrice: 'number',
    currency: 'INR',
    unit: 'monthly|hourly|one_time',
    minimumQuantity: 'number',
    maximumQuantity: 'number'
  },
  specifications: {
    cpu: 'number',
    ram: 'number',
    storage: 'number',
    bandwidth: 'number',
    // ... other specs
  },
  availability: {
    regions: 'array',
    zones: 'array',
    isActive: 'boolean'
  },
  matching: {
    keywords: 'array',
    aliases: 'array',
    tags: 'array'
  },
  metadata: {
    createdAt: 'timestamp',
    updatedAt: 'timestamp',
    version: 'string'
  }
};
```

### 6.2 **Service Architecture**

#### **6.2.1 Data Service Layer**
```javascript
class DataService {
  constructor() {
    this.storage = new SessionStorageAdapter();
    this.cache = new Map();
  }
  
  // Project management
  async createProject(projectData) {
    const project = {
      id: this.generateProjectId(),
      ...projectData,
      createdAt: new Date().toISOString(),
      status: 'DRAFT'
    };
    
    await this.storage.save(`project_${project.id}`, project);
    return project;
  }
  
  async updateProject(projectId, updates) {
    const project = await this.getProject(projectId);
    const updatedProject = {
      ...project,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await this.storage.save(`project_${projectId}`, updatedProject);
    return updatedProject;
  }
  
  // SKU management
  async searchSKUs(query) {
    const allSKUs = await this.getAllSKUs();
    return allSKUs.filter(sku => 
      this.matchesSKUQuery(sku, query)
    );
  }
}
```

#### **6.2.2 Workflow Service Layer**
```javascript
class WorkflowService {
  constructor(dataService) {
    this.dataService = dataService;
    this.notificationService = new NotificationService();
  }
  
  async processWorkflowTransition(projectId, newState, actor, reason) {
    const project = await this.dataService.getProject(projectId);
    
    // Validate transition
    this.validateTransition(project, newState, actor);
    
    // Execute transition
    const updatedProject = await this.executeTransition(
      project, newState, actor, reason
    );
    
    // Send notifications
    await this.notificationService.sendTransitionNotifications(
      updatedProject, newState
    );
    
    return updatedProject;
  }
  
  async assignTask(projectId, taskType, assignee) {
    const project = await this.dataService.getProject(projectId);
    
    const task = {
      id: this.generateTaskId(),
      type: taskType,
      assignee: assignee,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      dueDate: this.calculateDueDate(taskType)
    };
    
    project.tasks = [...(project.tasks || []), task];
    
    return await this.dataService.updateProject(projectId, project);
  }
}
```

## 7. **Data Entry Types and Validation**

### 7.1 **Excel Upload Processing**

#### **7.1.1 Supported Excel Formats**
```javascript
const EXCEL_SCHEMA = {
  requiredColumns: [
    'Service Name',
    'Quantity',
    'Specifications',
    'Duration'
  ],
  optionalColumns: [
    'Notes',
    'Priority',
    'Category',
    'Preferred Region'
  ],
  validation: {
    maxRows: 1000,
    maxFileSize: '10MB',
    supportedFormats: ['.xlsx', '.xls']
  }
};
```

#### **7.1.2 Excel Parsing Logic**
```javascript
function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Validate and transform data
        const validatedData = validateExcelData(jsonData);
        const transformedData = transformExcelData(validatedData);
        
        resolve(transformedData);
      } catch (error) {
        reject(new ExcelParsingError('Failed to parse Excel file', error));
      }
    };
    
    reader.readAsArrayBuffer(file);
  });
}
```

### 7.2 **Form Validation Rules**

#### **7.2.1 Project Information Validation**
```javascript
const PROJECT_VALIDATION_RULES = {
  customerName: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-\.]+$/
  },
  projectName: {
    required: true,
    minLength: 3,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9\s\-]+$/
  },
  contactEmail: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  contractTerm: {
    required: true,
    enum: ['monthly', 'quarterly', 'annual', 'three_year']
  }
};
```

#### **7.2.2 BoQ Item Validation**
```javascript
const BOQ_VALIDATION_RULES = {
  quantity: {
    required: true,
    type: 'number',
    min: 1,
    max: 1000
  },
  unitPrice: {
    required: true,
    type: 'number',
    min: 0,
    max: 1000000
  },
  notes: {
    required: false,
    maxLength: 500
  }
};

function validateBoQItem(item) {
  const errors = [];
  
  Object.entries(BOQ_VALIDATION_RULES).forEach(([field, rules]) => {
    const value = item[field];
    
    if (rules.required && !value) {
      errors.push(`${field} is required`);
    }
    
    if (value && rules.type === 'number' && isNaN(value)) {
      errors.push(`${field} must be a number`);
    }
    
    if (value && rules.min && value < rules.min) {
      errors.push(`${field} must be at least ${rules.min}`);
    }
    
    if (value && rules.max && value > rules.max) {
      errors.push(`${field} must be at most ${rules.max}`);
    }
  });
  
  return errors;
}
```

### 7.3 **Real-Time Validation**

#### **7.3.1 Form Field Validation**
```javascript
function useFormValidation(initialValues, validationRules) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const validateField = useCallback((name, value) => {
    const rules = validationRules[name];
    if (!rules) return null;
    
    const fieldErrors = [];
    
    if (rules.required && !value) {
      fieldErrors.push(`${name} is required`);
    }
    
    if (value && rules.pattern && !rules.pattern.test(value)) {
      fieldErrors.push(`${name} format is invalid`);
    }
    
    if (value && rules.minLength && value.length < rules.minLength) {
      fieldErrors.push(`${name} must be at least ${rules.minLength} characters`);
    }
    
    return fieldErrors.length > 0 ? fieldErrors : null;
  }, [validationRules]);
  
  const handleChange = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const fieldErrors = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: fieldErrors }));
    }
  }, [touched, validateField]);
  
  return { values, errors, touched, handleChange, validateField };
}
```

## 8. **Error Handling and Recovery**

### 8.1 **Error Classification**

#### **8.1.1 Error Types**
```javascript
const ERROR_TYPES = {
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    severity: 'warning',
    recoverable: true,
    userAction: 'fix_input'
  },
  BUSINESS_RULE_ERROR: {
    code: 'BUSINESS_RULE_ERROR',
    severity: 'error',
    recoverable: true,
    userAction: 'contact_support'
  },
  SYSTEM_ERROR: {
    code: 'SYSTEM_ERROR',
    severity: 'critical',
    recoverable: false,
    userAction: 'retry_later'
  },
  AUTHORIZATION_ERROR: {
    code: 'AUTHORIZATION_ERROR',
    severity: 'error',
    recoverable: false,
    userAction: 'contact_admin'
  }
};
```

#### **8.1.2 Error Recovery Strategies**
```javascript
class ErrorRecoveryService {
  constructor() {
    this.retryAttempts = new Map();
    this.maxRetries = 3;
  }
  
  async handleError(error, context) {
    const errorType = this.classifyError(error);
    
    switch (errorType.code) {
      case 'VALIDATION_ERROR':
        return this.handleValidationError(error, context);
      
      case 'BUSINESS_RULE_ERROR':
        return this.handleBusinessRuleError(error, context);
      
      case 'SYSTEM_ERROR':
        return this.handleSystemError(error, context);
      
      default:
        return this.handleUnknownError(error, context);
    }
  }
  
  async handleSystemError(error, context) {
    const retryKey = `${context.operation}_${context.resourceId}`;
    const attempts = this.retryAttempts.get(retryKey) || 0;
    
    if (attempts < this.maxRetries) {
      this.retryAttempts.set(retryKey, attempts + 1);
      
      // Exponential backoff
      const delay = Math.pow(2, attempts) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return { action: 'retry', delay };
    } else {
      this.retryAttempts.delete(retryKey);
      return { action: 'fail', message: 'Maximum retry attempts exceeded' };
    }
  }
}
```

This comprehensive documentation provides a complete technical overview of the Sify Cloud Demo system, covering all aspects of the logic, flow, personas, SKU matching, pricing, approval workflows, data models, and validation systems.

