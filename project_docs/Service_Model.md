# Service Model Specification

This document details the service catalog structure used in the Sify Cloud Demo application, as defined in `src/utils/serviceModel.js`. This model's primary purpose is to define the *technical capabilities* of the services offered. It answers the questions: "What services can we provide?" and "How can each service be configured?".

This model is distinct from the `dataModel`, which handles pricing and business workflows. The `serviceModel` is the backbone of the **interactive/manual BoQ builder flow** (`ManualEntryWorkspace.jsx`), where users graphically select and configure services.

## 1. Service Categories

Services are grouped into logical categories. This structure is used to build the primary navigation (e.g., tabs or an accordion) in the service selection UI.

### Top-Level Categories:
- `COMPUTE`: All services related to virtual compute power (VMs, Containers).
- `STORAGE`: All data persistence options (Block, Object, File).
- `PAAS`: Managed "Platform-as-a-Service" offerings where the underlying infrastructure is abstracted (Databases, Caches, Application Runtimes).
- `NETWORK`: Services related to connectivity and traffic management.
- `SECURITY`: Services focused on protecting the infrastructure.

### Example Category Structure:
```javascript
export const SERVICE_CATEGORIES = {
  COMPUTE: {
    title: "Compute Services",
    icon: Cpu, // A Lucide icon component used for visual representation in the UI.
    services: [
      // ... array of service objects
    ]
  },
  // ... other categories
}
```

## 2. Service Object

Each service within a category is an object that represents a configurable resource.

- **`sku`**: A unique identifier for the *type* of service (e.g., `VM-BASIC`, `CONTAINER`). This SKU is abstract and represents the service itself, not a specific purchasable configuration.
- **`label`**: A human-readable name for the service (e.g., "Virtual Machine"), used as the title on UI cards.
- **`description`**: A brief description of the service's purpose, used as body text on UI cards.
- **`configOptions`**: A crucial object defining the user-configurable parameters for this service. This object's structure directly dictates the form fields generated in the UI.

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
    backup_retention: { min: 7, max: 90 },
    monitoring: ['basic', 'advanced']
  }
}
```

## 3. Configuration Options (`configOptions`)

The `configOptions` object is a schema that the `ServiceConfigModal.jsx` component interprets to render an appropriate input form.

### Interpreting Option Types:
- **Range (`{ min: number, max: number }`):** Renders as an `<input type="number">` or a slider component.
  - *Example:* `cpu: { min: 1, max: 64 }` becomes a number input for vCPUs.
- **Array of choices (`Array<string | number>`):** Renders as a `<select>` dropdown menu.
  - *Example:* `os: ['Windows Server', 'Ubuntu', ...]` becomes a dropdown list of operating systems.
- **Boolean (`[true, false]`):** Renders as a Switch or Checkbox component.
  - *Example:* `public_ip: [true, false]` becomes a toggle for enabling a public IP address.

## 4. Relationship to Data Model

The `serviceModel` and `dataModel` are two sides of the same coin, used at different stages of the process.

- **`serviceModel` (The "What"):** Defines the technical catalog. It's used when a user is **building** a solution from scratch, specifying technical needs like "I need a VM with 8 CPUs and 32GB of RAM."
- **`dataModel` (The "How Much"):** Defines the financial catalog. It's used to **price** a solution. The configuration from the `serviceModel` (8 CPUs, 32GB RAM) would be matched against the `PRICE_BOOK_SKUS` in the `dataModel` to find the corresponding item (e.g., `CI-8C32R100S-LINUX`) and its price.

In the standard flow (Excel upload), the `serviceModel` is bypassed, and matching happens directly against the `dataModel`. In the interactive flow, the `serviceModel` is used first to create a configuration, which is then priced using the `dataModel`. 