# Data Model Specification

This document details the data structures used in the Sify Cloud Demo application, as defined in `src/utils/dataModel.js`.

## 1. Core Data Structures

### Personas
Defines the user roles within the application.
```javascript
export const PERSONAS = {
  ACCOUNT_MANAGER: 'Account Manager',
  PRODUCT_MANAGER: 'Product Manager', 
  SOLUTION_ARCHITECT: 'Solution Architect',
  FINANCE_ADMIN: 'Finance Admin'
}
```

### Project Status
Defines the possible statuses a project can have.
```javascript
export const PROJECT_STATUS = {
  DRAFT: 'Draft',
  PENDING_SA_REVIEW: 'Pending Solution Architect Review',
  PENDING_PM_REVIEW: 'Pending Product Manager Review', 
  PENDING_SA_FINAL: 'Pending Solution Architect Final Review',
  PENDING_FINANCE_APPROVAL: 'Pending Finance Approval',
  APPROVED: 'Approved'
}
```

### Flow Types
Distinguishes between the standard and custom workflows.
```javascript
export const FLOW_TYPES = {
  STANDARD: 'standard',
  CUSTOM: 'custom'
}
```

## 2. Price Book & SKUs

The `PRICE_BOOK_SKUS` array is the master list of all sellable items. Each item contains an external-facing `sku` and an `internalCode`.

### Structure
- **`sku`**: A descriptive SKU, often including configuration details. Used for matching.
- **`internalCode`**: A simplified, unique internal identifier.
- **`name`**: A human-readable name for the item.
- **`category`**: The service category (e.g., Compute, Storage).
- **`basePrice`**: The monthly base price for the item.
- **`unit`**: The unit of pricing (e.g., per month, per instance).

### Example
```javascript
{ 
  sku: 'CI-2C4R50S-WINDOWS', 
  internalCode: 'VM001', 
  name: 'Windows VM 2vCPU 4GB', 
  category: 'Compute', 
  basePrice: 2400, 
  unit: 'per month' 
}
```

## 3. Project Data Object

The `createProject` function generates a new project object with the following structure.

```javascript
{
  id: 'PROJ-1672531200000',
  customerName: '',
  projectName: '',
  contactEmail: '',
  status: 'Draft',
  flowType: 'standard', // or 'custom'
  boqItems: [], // Array of items from the price book
  totals: {
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0
  },
  comments: [], // For approval/rejection comments
  approvals: {}, // To track approvals from each persona
  createdDate: '2023-01-01T00:00:00.000Z',
  lastModified: '2023-01-01T00:00:00.000Z'
}
```

## 4. Workflow Logic

The `getNextStatus` function in `dataModel.js` defines the state transitions for the workflows.

### Standard Flow Logic:
- `Draft` -> `Pending Finance Approval`
- `Pending Finance Approval` -> `Approved`

### Custom Flow Logic:
- `Draft` -> `Pending SA Review`
- `Pending SA Review` -> `Pending PM Review`
- `Pending PM Review` -> `Pending SA Final`
- `Pending SA Final` -> `Pending Finance Approval`
- `Pending Finance Approval` -> `Approved` 