# Requirement Specification: Standard Flow

## 1. Introduction

This document provides the detailed requirements for the "Standard Flow" MVP of the Sify Cloud Demo application. It covers functional and non-functional requirements, as well as user stories.

## 2. User Personas

- **Account Manager (AM):** Responsible for creating projects and managing them until they are approved.
- **Finance Admin (FA):** Responsible for reviewing the financial aspects of a project and providing final approval.

## 3. Functional Requirements

### 3.1. Project Management

| Req ID | Requirement | Details |
|--------|-------------|---------|
| FR01 | **Create New Project** | The AM must be able to create a new project by providing a Customer Name, Project Name, and Contact Email. |
| FR02 | **Upload BoQ** | The AM must be able to upload an Excel file containing a list of required services. The system should parse this file to generate BoQ items. |
| FR03 | **View Project List** | The AM should see a list of all projects they have created, along with their current status. |
| FR04 | **Submit for Approval** | After a BoQ is generated, the AM must be able to submit the project for finance approval. The project status should change from `Draft` to `Pending Finance Approval`. |

### 3.2. Approval Workflow

| Req ID | Requirement | Details |
|--------|-------------|---------|
| FR05 | **Finance Dashboard** | The FA must have a dashboard that lists all projects pending their approval. |
| FR06 | **Review Project** | The FA must be able to view the full project details, including the generated BoQ and total cost. |
| FR07 | **Approve/Reject** | The FA must be able to approve or reject a project. A comment is required for rejection. On approval, the status changes to `Approved`. On rejection, it goes back to `Draft`. |

### 3.3. Data & State

| Req ID | Requirement | Details |
|--------|-------------|---------|
| FR08 | **Persist State** | All project data must be persisted in the browser's `localStorage` to simulate a database. |
| FR09 | **Status Updates** | The project status must be clearly displayed and updated in real-time based on workflow actions. |

## 4. Non-Functional Requirements

| Req ID | Requirement | Details |
|--------|-------------|---------|
| NFR01 | **Performance** | The application should load quickly, and UI interactions should be smooth. Page load time should be under 3 seconds. |
| NFR02 | **Usability** | The interface must be intuitive and require minimal training for the defined personas. |
| NFR03 | **Reliability** | The application should handle errors gracefully (e.g., invalid file format for upload). |

## 5. User Stories

- **As an Account Manager,** I want to create a new project so that I can start the sales process for a customer.
- **As an Account Manager,** I want to upload a BoQ from an Excel file to quickly generate the project requirements.
- **As an Account Manager,** I want to see the status of all my projects so I can track their progress.
- **As a Finance Admin,** I want to see all projects that need my approval in one place so I can manage my workload.
- **As a Finance Admin,** I want to approve projects that are financially sound so that they can proceed.
- **As a Finance Admin,** I want to reject projects with clear reasons if they do not meet financial criteria. 