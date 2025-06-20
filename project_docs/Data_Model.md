# Data Model Specification

This document details the data structures used in the Sify Cloud Demo application, as defined in `src/utils/dataModel.js`. This model is concerned with the "business objects" of the application, such as projects, pricing, and workflow states.

## 1. Core Data Structures

### Personas
Defines the user roles within the application. These constants are used to control UI visibility and permissions.
```javascript
export const PERSONAS = {
  ACCOUNT_MANAGER: 'Account Manager',
  PRODUCT_MANAGER: 'Product Manager', 
  SOLUTION_ARCHITECT: 'Solution Architect',
  FINANCE_ADMIN: 'Finance Admin'
}
```

### Project Status
A finite state machine for projects. This is critical for driving the workflow logic.
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
Distinguishes between the simple 'standard' workflow and the more complex 'custom' workflow.
```javascript
export const FLOW_TYPES = {
  STANDARD: 'standard',
  CUSTOM: 'custom'
}
```

## 2. Price Book & SKUs (`PRICE_BOOK_SKUS`)

The `PRICE_BOOK_SKUS` array is the master price list. It maps a specific, sellable configuration of a service to a price and an internal code.

### Structure
- **`sku`**: A descriptive SKU, often including configuration details (e.g., `CI-2C4R50S-WINDOWS`). This is the key used for matching against incoming BoQ items from an Excel upload.
- **`internalCode`**: A simplified, unique internal identifier (e.g., `VM001`). Useful for internal reporting and linking to other systems.
- **`name`**: A human-readable name for the item, used for display in the UI.
- **`category`**: The service category (e.g., `Compute`, `Storage`). Used for grouping and filtering.
- **`basePrice`**: The price for the item, typically per month.
- **`unit`**: The unit of pricing (e.g., `per month`, `per instance`).

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

This is the central data object in the application. The `createProject` function is a factory that generates a new project object with default values.

### Field-by-Field Breakdown

| Field | Type | Description |
|---|---|---|
| `id` | `String` | A unique identifier for the project, typically `PROJ-` + timestamp. **Primary Key.** |
| `customerName` | `String` | The name of the end customer. |
| `projectName` | `String` | The name of the specific project or engagement. |
| `contactEmail` | `String` | The primary email contact for the project. |
| `status` | `String` | The current stage of the project in the workflow. Must be one of the values from `PROJECT_STATUS`. |
| `flowType` | `String` | Determines which workflow logic to apply. Must be `standard` or `custom`. |
| `boqItems` | `Array<Object>` | An array of BoQ line items. Each object in the array is a snapshot from the `PRICE_BOOK_SKUS` with an added `quantity` and `totalPrice`. |
| `totals` | `Object` | An object containing the calculated financial totals for the project (`subtotal`, `discount`, `tax`, `total`). |
| `comments` | `Array<Object>` | A history of comments, especially for rejections. Each comment object includes the `persona`, `text`, and `timestamp`. |
| `approvals` | `Object` | Tracks approvals from each persona in the custom flow. Not heavily used in the standard flow MVP. |
| `createdDate` | `String` | An ISO 8601 timestamp of when the project was created. |
| `lastModified` | `String` | An ISO 8601 timestamp that is updated whenever the project object is changed. |

## 4. Workflow Logic

The business logic for state transitions is encapsulated in helper functions within this file.

- **`canUserActOnProject(persona, projectStatus)`**: A permissions function that returns `true` or `false` depending on whether the current user persona is allowed to edit a project in its current status.
- **`getNextStatus(currentStatus, flowType)`**: A pure function that determines the next status of a project when a primary action is taken, based on the current status and the project's flow type. This is the core of the state machine.

### Standard Flow Logic:
- `Draft` -> `