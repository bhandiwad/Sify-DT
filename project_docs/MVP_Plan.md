# MVP Plan: Standard Flow Implementation

## 1. Introduction & Goals

This document outlines the Minimum Viable Product (MVP) plan for implementing the "Standard Flow" of the Sify Cloud Demo application.

**Primary Goal:** To deliver a streamlined, end-to-end workflow for creating a new project, generating a Bill of Quantities (BoQ), getting finance approval, and marking the project as approved.

**Secondary Goals:**
- Validate the core business logic.
- Provide a solid foundation for future enhancements (like the Custom Flow).
- Gather user feedback on the core functionality.

## 2. Scope

### In Scope:
- **Project Creation:** A simple form to capture basic project details.
- **BoQ Generation:** For the standard flow, this will be a simplified process. We can use a predefined template or a simple Excel upload.
- **Finance Approval:** A dedicated view for the Finance Admin to approve or reject the project.
- **Workflow:** The linear progression: `Draft` -> `Pending Finance Approval` -> `Approved`.
- **Personas:** Account Manager and Finance Admin.
- **UI:** Clean, functional, and intuitive user interface for the defined flow.

### Out of Scope for MVP:
- **Custom Flow:** The multi-step review process involving Solution Architects and Product Managers.
- **Interactive BoQ Builder:** The `ManualEntryWorkspace` will be excluded from the standard flow MVP.
- **Complex SKU Matching:** Advanced SKU matching logic will be deferred.
- **Deployment Simulation:** The "Deploy Infrastructure" screen is not part of this MVP.

## 3. Key Features

| Feature ID | Description | Persona | Priority |
|------------|-------------|---------|----------|
| F01 | Create a new project with basic details | Account Manager | High |
| F02 | Upload an Excel file to generate a BoQ | Account Manager | High |
| F03 | View the generated BoQ and project details | Account Manager, Finance Admin | High |
| F04 | Submit the project for Finance Approval | Account Manager | High |
| F05 | View pending projects in a dashboard | Finance Admin | High |
| F06 | Approve or Reject a project with comments | Finance Admin | High |
| F07 | View the final approved project status | Account Manager | High |

## 4. High-Level Architecture

- **Frontend:** React with Vite.
- **UI Components:** Shadcn UI.
- **State Management:** React Context or a simple state management library. All data will be stored in `localStorage` for the MVP to simulate a backend.
- **Routing:** `react-router-dom` for navigation between different views.

## 5. Development Phases (Sprints)

### Sprint 1: Foundation & Project Creation
- Setup project structure.
- Implement UI for New Project creation.
- Implement state management for projects.

### Sprint 2: BoQ Generation & Viewing
- Implement Excel upload functionality.
- Implement simple SKU matching for the standard flow.
- Develop the BoQ display component.

### Sprint 3: Approval Workflow & Dashboard
- Implement the Finance Admin dashboard.
- Develop the approval/rejection logic.
- Implement project status changes and notifications (UI-based).

### Sprint 4: Testing & Refinement
- End-to-end testing of the standard flow.
- Bug fixing and UI polishing.
- Prepare for "demo" release.

## 6. Risks

| Risk | Mitigation |
|------|------------|
| Data model complexity | Start with a simplified version of the data model for the MVP. |
| Scope Creep | Strictly adhere to the "Out of Scope" list. |
| UI/UX Issues | Conduct internal reviews after each sprint. |

## 7. Success Metrics

- **Completion Rate:** Percentage of users who successfully create and get a project approved through the standard flow.
- **Time to Completion:** Average time taken to complete the flow.
- **User Feedback:** Qualitative feedback from internal demos. 