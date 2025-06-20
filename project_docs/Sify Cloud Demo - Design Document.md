# Sify Cloud Demo - Design Document

## 1. **System Architecture Overview**

### 1.1 **High-Level Architecture**


```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │  Dashboard  │ │   Workflow  │ │   BoQ Gen   │           │
│  │ Components  │ │ Components  │ │ Components  │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ Workflow    │ │ SKU Matching│ │ Pricing     │           │
│  │ Engine      │ │ Engine      │ │ Engine      │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ Session     │ │ Price Book  │ │ Project     │           │
│  │ Storage     │ │ Data        │ │ Data        │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 **Technology Stack**

#### **Frontend Framework**
- **React 18.3.1**: Modern functional components with hooks
- **React Router 6.x**: Client-side routing and navigation
- **Vite 5.x**: Fast build tool and development server

#### **Styling and UI**
- **Tailwind CSS 3.x**: Utility-first CSS framework
- **Lucide React**: Consistent icon library
- **Custom Components**: Reusable UI component library

#### **State Management**
- **React Hooks**: useState, useEffect, useContext
- **Session Storage**: Browser-based data persistence
- **Custom Hooks**: Encapsulated business logic

#### **Development Tools**
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Vite**: Hot module replacement and fast builds

## 2. **Component Architecture**

### 2.1 **Component Hierarchy**

```
App.jsx
├── ErrorBoundary.jsx
├── PersonaSwitcher.jsx
└── Router
    ├── Dashboard.jsx
    │   ├── DemoControls.jsx
    │   └── ProjectList
    ├── NewProject.jsx
    │   └── EnvironmentSelection.jsx
    ├── ExcelUpload.jsx
    │   └── ProcessingScreen.jsx
    ├── BoQGenerated.jsx
    │   ├── BoQTable.jsx
    │   └── ServiceConfigModal.jsx
    ├── ApprovalWorkflow.jsx
    │   ├── ProductManagerReview.jsx
    │   ├── SolutionArchitectVetting.jsx
    │   └── DeploymentFlow.jsx
    └── ProposalGenerated.jsx
```

### 2.2 **Core Components**

#### **2.2.1 App.jsx**
- **Purpose**: Root application component and routing
- **Responsibilities**:
  - Global error boundary setup
  - Route configuration and navigation
  - Global state initialization
- **Key Features**:
  - React Router setup
  - Error boundary integration
  - Global CSS imports

#### **2.2.2 PersonaSwitcher.jsx**
- **Purpose**: Role-based access control and persona management
- **Responsibilities**:
  - User role switching (AM, PM, SA, Finance)
  - Permission validation
  - Visual role indicators
- **State Management**:
  - Current persona state
  - Available actions per role
  - Role-based UI rendering

#### **2.2.3 Dashboard.jsx**
- **Purpose**: Main landing page and project overview
- **Responsibilities**:
  - Project list display
  - Demo configuration
  - Quick actions and navigation
- **Features**:
  - Demo type selection (Standard/Custom)
  - Project status overview
  - Role-based action buttons

#### **2.2.4 NewProject.jsx**
- **Purpose**: Project creation and initial configuration
- **Responsibilities**:
  - Customer information capture
  - Contract terms selection
  - Project metadata setup
- **Validation**:
  - Required field validation
  - Business rule enforcement
  - Data format validation

#### **2.2.5 ExcelUpload.jsx**
- **Purpose**: Requirements file upload and processing
- **Responsibilities**:
  - File upload handling
  - Excel parsing and validation
  - SKU matching initiation
- **Processing Flow**:
  - File validation
  - Data extraction
  - SKU matching engine invocation
  - Essential services addition

#### **2.2.6 BoQGenerated.jsx**
- **Purpose**: Bill of Quantities display and editing
- **Responsibilities**:
  - BoQ table rendering
  - Edit functionality
  - Pricing calculations
- **Features**:
  - Real-time editing
  - Category-based organization
  - Bulk resource summaries
  - Contract term integration

### 2.3 **Utility Components**

#### **2.3.1 BoQTable.jsx**
- **Purpose**: Reusable table component for BoQ display
- **Features**:
  - Sortable columns
  - Inline editing
  - Category grouping
  - Export functionality

#### **2.3.2 ErrorBoundary.jsx**
- **Purpose**: Global error handling and recovery
- **Features**:
  - Error catching and logging
  - Graceful error display
  - Recovery mechanisms
  - User-friendly error messages

#### **2.3.3 DemoControls.jsx**
- **Purpose**: Demo management and reset functionality
- **Features**:
  - Demo data reset
  - Export/import capabilities
  - Session management
  - Debug information

## 3. **Data Architecture**

### 3.1 **Data Models**

#### **3.1.1 Project Data Model**
```javascript
{
  id: "PROJ-{timestamp}",
  customerName: "string",
  projectName: "string",
  contactEmail: "string",
  contractTerm: "monthly|quarterly|annual|three_year",
  demoType: "standard|custom",
  status: "draft|pending_sa_review|pending_pm_review|...",
  createdAt: "timestamp",
  updatedAt: "timestamp",
  createdBy: "persona",
  requirements: [...],
  boqItems: [...],
  approvals: [...]
}
```

#### **3.1.2 SKU Data Model**
```javascript
{
  sku: "CI-{category}-{type}",
  internalCode: "{category}{number}",
  name: "string",
  category: "Compute|Storage|Network|Security|Backup",
  basePrice: "number",
  unit: "monthly|hourly|one_time",
  specifications: {...}
}
```

#### **3.1.3 BoQ Item Model**
```javascript
{
  id: "string",
  sku: "string",
  internalCode: "string",
  name: "string",
  category: "string",
  quantity: "number",
  unitPrice: "number",
  totalPrice: "number",
  isCustom: "boolean",
  isEssential: "boolean",
  notes: "string"
}
```

### 3.2 **Data Storage Strategy**

#### **3.2.1 Session Storage**
- **Purpose**: Browser-based persistence for demo data
- **Scope**: Single browser session
- **Data Types**:
  - Project information
  - BoQ items
  - User preferences
  - Demo state

#### **3.2.2 In-Memory State**
- **Purpose**: Real-time application state
- **Scope**: Component lifecycle
- **Data Types**:
  - UI state
  - Form data
  - Temporary calculations
  - Navigation state

### 3.3 **Data Flow Patterns**

#### **3.3.1 Unidirectional Data Flow**
```
User Action → Component State → Business Logic → Data Update → UI Re-render
```

#### **3.3.2 State Management Pattern**
```
Local State (useState) → Shared State (Context) → Persistent State (Session Storage)
```

## 4. **Business Logic Design**

### 4.1 **Workflow Engine**

#### **4.1.1 State Machine Design**
```javascript
const WORKFLOW_STATES = {
  DRAFT: {
    allowedTransitions: ['PENDING_SA_REVIEW'],
    allowedPersonas: ['ACCOUNT_MANAGER']
  },
  PENDING_SA_REVIEW: {
    allowedTransitions: ['PENDING_PM_REVIEW', 'DRAFT'],
    allowedPersonas: ['SOLUTION_ARCHITECT']
  },
  PENDING_PM_REVIEW: {
    allowedTransitions: ['PENDING_SA_FINAL', 'PENDING_SA_REVIEW'],
    allowedPersonas: ['PRODUCT_MANAGER']
  },
  // ... additional states
}
```

#### **4.1.2 Workflow Routing Logic**
- **Standard Flow**: Direct routing for matched SKUs
- **Custom Flow**: Multi-stage approval for custom SKUs
- **Hybrid Flow**: Mixed routing based on SKU analysis

### 4.2 **SKU Matching Engine**

#### **4.2.1 Matching Algorithm**
```javascript
function matchSKUs(requirements) {
  const matched = [];
  const unmatched = [];
  
  requirements.forEach(req => {
    const match = findBestMatch(req, PRICE_BOOK_SKUS);
    if (match.confidence > MATCH_THRESHOLD) {
      matched.push({...req, sku: match.sku});
    } else {
      unmatched.push(req);
    }
  });
  
  return { matched, unmatched };
}
```

#### **4.2.2 Matching Criteria**
- **Exact Name Match**: 100% confidence
- **Fuzzy Name Match**: 80-99% confidence
- **Specification Match**: 70-89% confidence
- **Category Match**: 50-69% confidence

### 4.3 **Pricing Engine**

#### **4.3.1 Pricing Calculation**
```javascript
function calculatePricing(items, contractTerm) {
  const baseTotal = items.reduce((sum, item) => 
    sum + (item.quantity * item.unitPrice), 0);
  
  const discount = getContractDiscount(contractTerm);
  const discountedTotal = baseTotal * (1 - discount);
  const gst = discountedTotal * GST_RATE;
  
  return {
    baseTotal,
    discount: baseTotal * discount,
    discountedTotal,
    gst,
    finalTotal: discountedTotal + gst
  };
}
```

#### **4.3.2 Discount Structure**
- **Contract-based**: Automatic discounts based on term length
- **Volume-based**: Additional discounts for large orders
- **Approval-based**: Manual discounts requiring approval

## 5. **User Interface Design**

### 5.1 **Design System**

#### **5.1.1 Color Palette**
- **Primary**: Blue (#3B82F6) - Trust and professionalism
- **Secondary**: Green (#10B981) - Success and approval
- **Warning**: Yellow (#F59E0B) - Attention and caution
- **Error**: Red (#EF4444) - Errors and rejection
- **Neutral**: Gray (#6B7280) - Text and backgrounds

#### **5.1.2 Typography**
- **Font Family**: Inter (system font fallback)
- **Headings**: Bold weights (600-700)
- **Body Text**: Regular weight (400)
- **Code/SKUs**: Monospace font

#### **5.1.3 Spacing System**
- **Base Unit**: 4px (0.25rem)
- **Common Spacing**: 8px, 12px, 16px, 24px, 32px
- **Layout Spacing**: 48px, 64px, 96px

### 5.2 **Responsive Design**

#### **5.2.1 Breakpoints**
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

#### **5.2.2 Layout Patterns**
- **Mobile**: Single column, stacked components
- **Tablet**: Two-column layout, collapsible sidebar
- **Desktop**: Multi-column layout, fixed sidebar

### 5.3 **Accessibility Design**

#### **5.3.1 WCAG 2.1 Compliance**
- **Color Contrast**: Minimum 4.5:1 ratio
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: Proper ARIA labels and roles
- **Focus Management**: Visible focus indicators

#### **5.3.2 Inclusive Design**
- **Language**: Clear, simple language
- **Icons**: Meaningful icons with text labels
- **Errors**: Descriptive error messages
- **Help**: Contextual help and tooltips

## 6. **Security Design**

### 6.1 **Client-Side Security**

#### **6.1.1 Data Protection**
- **Sensitive Data**: No sensitive data stored in browser
- **Session Management**: Secure session handling
- **Input Validation**: Client-side validation for UX
- **XSS Prevention**: Proper data sanitization

#### **6.1.2 Access Control**
- **Role-Based**: Persona-based access control
- **Route Protection**: Protected routes for sensitive areas
- **Action Authorization**: Permission checks for actions
- **UI Masking**: Hide unauthorized functionality

### 6.2 **Data Security**

#### **6.2.1 Data Handling**
- **Encryption**: All data encrypted in transit
- **Storage**: Minimal data storage in browser
- **Cleanup**: Automatic data cleanup on session end
- **Audit**: User action logging

## 7. **Performance Design**

### 7.1 **Optimization Strategies**

#### **7.1.1 Code Splitting**
- **Route-based**: Lazy loading of route components
- **Component-based**: Dynamic imports for large components
- **Vendor Splitting**: Separate vendor bundles

#### **7.1.2 Rendering Optimization**
- **React.memo**: Prevent unnecessary re-renders
- **useMemo/useCallback**: Expensive calculation caching
- **Virtual Scrolling**: Large list optimization

### 7.2 **Loading Strategies**

#### **7.2.1 Progressive Loading**
- **Critical Path**: Load essential components first
- **Lazy Loading**: Load components on demand
- **Prefetching**: Preload likely next components

#### **7.2.2 Caching Strategy**
- **Browser Cache**: Static asset caching
- **Memory Cache**: Component state caching
- **Session Cache**: User data caching

## 8. **Error Handling Design**

### 8.1 **Error Boundaries**

#### **8.1.1 Component-Level**
- **Local Errors**: Component-specific error handling
- **Graceful Degradation**: Fallback UI for errors
- **Recovery**: Error recovery mechanisms

#### **8.1.2 Global Error Handling**
- **Unhandled Errors**: Global error boundary
- **Error Reporting**: Error logging and reporting
- **User Feedback**: User-friendly error messages

### 8.2 **Validation Design**

#### **8.2.1 Input Validation**
- **Real-time**: Immediate feedback on input
- **Form-level**: Complete form validation
- **Business Rules**: Domain-specific validation

#### **8.2.2 Error Recovery**
- **Retry Mechanisms**: Automatic retry for transient errors
- **Fallback Options**: Alternative paths for failures
- **User Guidance**: Clear instructions for error resolution

## 9. **Testing Strategy**

### 9.1 **Testing Pyramid**

#### **9.1.1 Unit Tests**
- **Components**: Individual component testing
- **Utilities**: Business logic testing
- **Hooks**: Custom hook testing

#### **9.1.2 Integration Tests**
- **Component Integration**: Multi-component workflows
- **Data Flow**: End-to-end data flow testing
- **User Interactions**: User journey testing

### 9.2 **Testing Tools**

#### **9.2.1 Testing Framework**
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing
- **MSW**: API mocking for tests

## 10. **Deployment Architecture**

### 10.1 **Build Process**

#### **10.1.1 Development Build**
- **Hot Reload**: Fast development iteration
- **Source Maps**: Debugging support
- **Dev Server**: Local development server

#### **10.1.2 Production Build**
- **Minification**: Code size optimization
- **Tree Shaking**: Unused code removal
- **Asset Optimization**: Image and asset optimization

### 10.2 **Deployment Strategy**

#### **10.2.1 Static Hosting**
- **CDN Distribution**: Global content delivery
- **Caching**: Aggressive caching for static assets
- **Compression**: Gzip/Brotli compression

#### **10.2.2 Environment Configuration**
- **Environment Variables**: Configuration management
- **Feature Flags**: Feature toggle support
- **Monitoring**: Performance and error monitoring

