# Service Model Specification

This document details the service catalog structure used in the Sify Cloud Demo application, as defined in `src/utils/serviceModel.js`. This model defines *what* services are available and *how* they can be configured.

## 1. Service Categories

Services are grouped into logical categories. Each category has a title, an icon, and a list of services.

### Top-Level Categories:
- `COMPUTE`: Virtual Machines, Containers, etc.
- `STORAGE`: Block, Object, and File storage.
- `PAAS`: Managed Platform services like databases and caches.
- `NETWORK`: Networking services.
- `SECURITY`: Security-related services.
- ... and so on.

### Example Category Structure:
```javascript
export const SERVICE_CATEGORIES = {
  COMPUTE: {
    title: "Compute Services",
    icon: Cpu, // React component for the icon
    services: [
      // ... array of service objects
    ]
  },
  // ... other categories
}
```

## 2. Service Object

Each service within a category is an object with the following structure:

- **`sku`**: A unique identifier for the service type (e.g., `VM-BASIC`, `CI-COMPUTE`). This is different from the pricing SKUs in `dataModel.js`.
- **`label`**: A human-readable name for the service (e.g., "Virtual Machine").
- **`description`**: A brief description of the service.
- **`configOptions`**: An object defining the configurable parameters for the service.

### Example Service Object:
```javascript
{ 
  sku: "VM-BASIC", 
  label: "Virtual Machine", 
  description: "General purpose VMs",
  configOptions: {
    instance_count: { min: 1, max: 20 },
    cpu: { min: 1, max: 64 },
    ram: { min: 1, max: 256 },
    os: ['Windows Server', 'Ubuntu', 'RHEL', 'CentOS'],
    // ... other options
  }
}
```

## 3. Configuration Options

The `configOptions` object defines the parameters that a user can customize for a service. The format of the options determines how they are rendered in the UI (e.g., in the `ManualEntryWorkspace` component).

### Types of Options:
- **Range (`min`/`max`):** For numerical inputs like CPU, RAM, or storage size.
  ```javascript
  cpu: { min: 1, max: 64 }
  ```
- **Array of choices:** For dropdowns or radio buttons, like selecting an Operating System.
  ```javascript
  os: ['Windows Server', 'Ubuntu', 'RHEL', 'CentOS']
  ```
- **Boolean:** For checkboxes, like enabling a feature.
  ```javascript
  public_ip: [true, false]
  ```

## 4. Relationship to Data Model

- The **Service Model** defines the *technical catalog* of services and their possible configurations. It is used in the interactive/manual flow to build a solution.
- The **Data Model** defines the *pricing and internal codes* for specific configurations of those services. It is used for generating the BoQ and for financial calculations.

The two models are linked during the BoQ generation process, where a configured service from the `serviceModel` is matched to a priced SKU in the `dataModel`. 