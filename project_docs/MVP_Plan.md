# MVP Plan: Standard Flow Implementation

## 1. Introduction & Goals

This document outlines the Minimum Viable Product (MVP) plan for implementing the "Standard Flow" of the Sify Cloud Demo application.

**Primary Goal:** To deliver a streamlined, end-to-end workflow for creating a new project, generating a Bill of Quantities (BoQ) from a simple file upload, getting finance approval, and marking the project as approved. This flow will serve as the core transactional backbone of the application.

**Secondary Goals:**
- Validate the core business logic and approval sequence with stakeholders.
- Provide a solid, extensible foundation for future enhancements, particularly the "Custom Flow" and interactive BoQ builder.
- Gather early user feedback on the core functionality and user experience from internal teams.

## 2. Scope

### In Scope:
- **Project Creation:** A simple, single-view form to capture essential project details (Customer Name, Project Name, Contact Email).
- **BoQ Generation (Standard Flow):** A simplified process limited to uploading a pre-formatted Excel file. The system will perform a basic, direct mapping of SKUs from the file to the price book.
- **Finance Approval:** A dedicated, read-only view for the Finance Admin persona to review project details and the BoQ, and to approve or reject the project.
- **Workflow:** A strict, linear progression: `Draft` -> `Pending Finance Approval` -> `Approved`/`Draft` (if rejected).
- **Personas:** Limited to the Account Manager and Finance Admin roles.
- **UI:** A clean, functional, and intuitive user interface built with pre-selected components for the defined flow.
- **Data Persistence:** All project data will be stored in the browser's `localStorage` to simulate a backend for demo purposes.

### Out of Scope for MVP:
- **Custom Flow:** The multi-step review process involving Solution Architects and Product Managers is explicitly excluded.
- **Interactive BoQ Builder:** The `ManualEntryWorkspace` component and its associated interactive service configuration will not be part of the standard flow MVP.
- **Complex SKU Matching:** Fuzzy logic, partial matching, or suggestion engines for SKU matching are deferred. Matching will be exact.
- **Deployment Simulation:** The "Deploy Infrastructure" screen and its associated logic are not part of this MVP.
- **User Authentication:** A login/logout system is not required; persona switching will be handled by a simple UI control.

## 3. Key Features

| Feature ID | Description | Acceptance Criteria | Persona | Priority |
|------------|-------------|-------------------|---------|----------|
| F01 | **Create a new project** | A form exists to input Customer Name, Project Name, etc. On submission, a new project is created in `localStorage` with `Draft` status. | Account Manager | High |
| F02 | **Upload an Excel BoQ** | The project details view has an "Upload Excel" button. The user can select a `.xlsx` file. The file is parsed, and matching SKUs are added to the project's `boqItems`. | Account Manager | High |
| F03 | **View Project Details & BoQ** | Users can click on a project to see a detailed view, including all project fields and a table of the generated BoQ items with quantities and prices. | Account Manager, Finance Admin | High |
| F04 | **Submit for Finance Approval** | A "Submit for Approval" button is available on `Draft` projects. Clicking it changes the project status to `Pending Finance Approval`. | Account Manager | High |
| F05 | **View Finance Dashboard** | When logged in as a Finance Admin, the main dashboard view is filtered to show only projects with `Pending Finance Approval` status. | Finance Admin | High |
| F06 | **Approve or Reject Project** | In the project details view, the Finance Admin sees "Approve" and "Reject" buttons. Rejecting requires a comment. The status changes to `Approved` or `Draft` accordingly. | Finance Admin | High |
| F07 | **View Final Status** | An approved or rejected project's final status is clearly visible on the dashboard. The project becomes read-only after approval. | Account Manager, Finance Admin | High |

## 4. High-Level Architecture

- **Frontend:** React with Vite for a fast development experience.
- **UI Components:** Shadcn UI for a consistent and modern look and feel.
- **State Management:** React Context will manage global state (e.g., the current persona). `localStorage` will be wrapped in a service module (`src/utils/projectService.js`) to act as a mock backend API.
- **Routing:** `react-router-dom` will manage navigation between the dashboard, project details, and new project views.

## 5. Development Phases (Sprints)

### Sprint 1: Foundation & Project Creation
- **Tasks:**
  - Initialize React project with Vite and configure with TypeScript/ESLint.
  - Install core dependencies: `react-router-dom`, `shadcn-ui`.
  - Set up basic project structure: `components`, `pages`, `utils`.
  - Implement the `PersonaSwitcher` component.
  - Create the `Dashboard` page to display a static list of projects.
  - Implement the `NewProject` page/modal with a functional form.
  - Create the `projectService.js` module to handle `localStorage` interactions (`getProjects`, `addProject`).

### Sprint 2: BoQ Generation & Viewing
- **Tasks:**
  - Integrate a library for Excel parsing (e.g., `xlsx`).
  - Implement the `ExcelUpload` component and its logic.
  - Create the `BoQTable` component for displaying BoQ items.
  - Develop the `ProjectDetails` page to show project info and the `BoQTable`.
  - Implement the "Submit for Approval" button functionality to update the project status.

### Sprint 3: Approval Workflow & Dashboard
- **Tasks:**
  - Enhance the `Dashboard` page to filter projects based on the current persona.
  - Add "Approve" and "Reject" buttons to the `ProjectDetails` page, visible only to the Finance Admin.
  - Implement the logic for approval, rejection (with comments), and status changes in `projectService.js`.
  - Make the UI for approved projects read-only.
  - Display comments in the project details view.

### Sprint 4: Testing & Refinement
- **Tasks:**
  - Write unit tests for critical utility functions (e.g., `projectService`, BoQ calculation).
  - Perform end-to-end manual testing of the complete standard flow.
  - Address all identified bugs.
  - Polish the UI/UX based on internal feedback (e.g., add loading states, notifications).
  - Prepare a final demo script and record a video walkthrough.

## 6. Risks

| Risk | Mitigation |
|------|------------|
| Data model complexity | Start with a simplified version of the data model for the MVP. The models in `src/utils` are robust, but we will only use the fields necessary for the standard flow. |
| Scope Creep | Strictly adhere to the "Out of Scope" list. All new feature requests will be added to a backlog for consideration post-MVP. |
| UI/UX Issues | Conduct short, informal usability reviews with a small group of internal users at the end of each sprint. |

## 7. Success Metrics

- **Completion Rate:** >95% of users can successfully create and get a project approved through the standard flow without errors.
- **Time to Completion:** Average time from project creation to final approval is under 10 minutes (excluding wait time for approval).
- **User Feedback:** Qualitative feedback from internal demos is captured and categorized for future sprints. A short survey will be sent to demo participants.
- **Bugs:** Fewer than 5 critical bugs reported during the final testing phase. 