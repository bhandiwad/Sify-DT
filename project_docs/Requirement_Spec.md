# Requirement Specification: Standard Flow

## 1. Introduction

This document provides the detailed requirements for the "Standard Flow" MVP of the Sify Cloud Demo application. It is intended for project managers, developers, and QA testers to understand the expected functionality and constraints of the system.

## 2. User Personas

- **Account Manager (AM):** The primary user responsible for initiating and managing a customer project. Their main goal is to get a project from a draft state to financial approval as efficiently as possible.
- **Finance Admin (FA):** A stakeholder responsible for reviewing the financial viability of a project. They are the gatekeeper for final approval and need clear, concise information to make a decision.

## 3. Functional Requirements

### 3.1. Project Management

| Req ID | Requirement | Details & Acceptance Criteria |
|--------|-------------|---------|
| FR01 | **Create New Project** | **Details:** The AM needs a simple way to initiate a project. <br/> **Acceptance Criteria:** <br/> 1. A "New Project" button is visible on the main dashboard. <br/> 2. A form (modal or page) appears with fields for 'Customer Name', 'Project Name', and 'Contact Email'. <br/> 3. All fields are required. <br/> 4. On submission, a new project object is created in `localStorage` with a unique ID, the provided details, and a status of `Draft`. |
| FR02 | **Upload BoQ** | **Details:** The AM needs to populate the project with services and pricing via an Excel upload. <br/> **Acceptance Criteria:** <br/> 1. In the project details view, an "Upload BoQ" button is present for projects in `Draft` status. <br/> 2. Clicking the button opens a file selector, accepting only `.xlsx` files. <br/> 3. The uploaded Excel file must have columns: `SKU`, `Quantity`. <br/> 4. The system parses the file, matches the `SKU` against the `PRICE_BOOK_SKUS`, and populates the project's `boqItems` with the matched items, calculating `totalPrice` (`basePrice` * `Quantity`). <br/> 5. If a SKU is not found, it is ignored (for MVP). An error message may be shown. |
| FR03 | **View Project List** | **Details:** The AM needs an overview of all their projects. <br/> **Acceptance Criteria:** <br/> 1. The dashboard displays a list/table of all created projects. <br/> 2. Each item in the list shows at least the Project Name, Customer Name, and current Status. <br/> 3. The status is color-coded for easy identification (e.g., Draft is gray, Pending is yellow, Approved is green). |
| FR04 | **Submit for Approval** | **Details:** Once the BoQ is ready, the AM must formally submit it for review. <br/> **Acceptance Criteria:** <br/> 1. A "Submit for Approval" button is visible and enabled only for projects in `Draft` status that have at least one BoQ item. <br/> 2. Clicking the button changes the project's status to `Pending Finance Approval`. <br/> 3. The button becomes disabled after being clicked. |

### 3.2. Approval Workflow

| Req ID | Requirement | Details & Acceptance Criteria |
|--------|-------------|---------|
| FR05 | **Finance Dashboard** | **Details:** The FA needs a focused view of projects awaiting their action. <br/> **Acceptance Criteria:** <br/> 1. When the persona is switched to Finance Admin, the dashboard automatically filters to show only projects with the status `Pending Finance Approval`. |
| FR06 | **Review Project** | **Details:** The FA must be able to inspect all relevant project information. <br/> **Acceptance Criteria:** <br/> 1. The FA can click on any project in their dashboard to navigate to a read-only detailed view. <br/> 2. This view shows all project information and the complete BoQ with totals. |
| FR07 | **Approve/Reject** | **Details:** The FA provides the final decision on the project. <br/> **Acceptance Criteria:** <br/> 1. "Approve" and "Reject" buttons are visible to the FA on projects pending their approval. <br/> 2. Clicking "Approve" changes the project status to `Approved`. The project becomes read-only for all users. <br/> 3. Clicking "Reject" requires a comment to be entered in a text field. <br/> 4. Upon submitting the rejection, the project status reverts to `Draft`, and the comment is saved in the project's `comments` array. |

### 3.3. Data & State

| Req ID | Requirement | Details & Acceptance Criteria |
|--------|-------------|---------|
| FR08 | **Persist State** | **Details:** Project data must not be lost on browser refresh. <br/> **Acceptance Criteria:** <br/> 1. The entire list of projects is saved to `localStorage` whenever a change is made (add, update, delete). <br/> 2. When the application loads, it rehydrates its state from `localStorage`. |
| FR09 | **Status Updates** | **Details:** The current status of a project must be accurate and clearly communicated. <br/> **Acceptance Criteria:** <br/> 1. The project status is updated immediately in the UI after any workflow action. <br/> 2. The correct status is displayed on both the dashboard and the project details page. |

## 4. Non-Functional Requirements

| Req ID | Requirement | Details |
|--------|-------------|---------|
| NFR01 | **Performance** | The application UI must be responsive. Page loads and state transitions should feel instantaneous, with a target of <200ms for UI updates and <3s for initial load. |
| NFR02 | **Usability** | The interface must be simple and intuitive. A new user representing a persona should be able to complete their tasks without prior training or documentation. |
| NFR03 | **Reliability** | The application must handle expected errors gracefully. For example, uploading a malformed Excel file should display a user-friendly error message rather than crashing the application. |
| NFR04 | **Browser Compatibility** | The application must be fully functional on the latest versions of modern web browsers (Chrome, Firefox, Safari, Edge). |

## 5. User Stories

- **As an Account Manager,** I want to create a new project with a customer's details, so that I can formally begin the sales and solutioning process.
- **As an Account Manager,** I want to upload a BoQ from a standard Excel template, so I can quickly and accurately populate the project without manual data entry.
- **As an Account Manager,** I want to see the real-time status of all my projects on a dashboard, so I can track their progress and know when to follow up.
- **As a Finance Admin,** I want a dedicated queue of projects awaiting my approval, so I can efficiently manage my workload and not miss any requests.
- **As a Finance Admin,** I want to approve financially sound projects with a single click, so that the sales process can continue without delay.
- **As a Finance Admin,** I want to reject projects that don't meet financial criteria and provide clear, mandatory feedback, so the Account Manager knows exactly what needs to be corrected. 