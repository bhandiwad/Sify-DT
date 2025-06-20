# Sify Cloud Demo - Requirements Specification

## 1. **Executive Summary**

The Sify Cloud Demo is an enterprise-grade cloud resource ordering system designed to streamline the procurement process for cloud infrastructure services. The system addresses the complexity of cloud resource ordering by providing automated workflows, role-based approvals, and intelligent SKU matching.

## 2. **Business Context**

### 2.1 **Current Challenges**
- **Manual Process Inefficiency**: Traditional cloud ordering involves multiple manual steps and email chains
- **Lack of Transparency**: Customers have limited visibility into pricing and approval status
- **Complex Approval Workflows**: Enterprise customers require multi-level approvals for compliance
- **SKU Management Complexity**: Difficulty in matching customer requirements to available services
- **Pricing Inconsistency**: Manual pricing calculations lead to errors and delays

### 2.2 **Business Objectives**
- **Reduce Order Processing Time** from weeks to days
- **Improve Customer Experience** with self-service capabilities
- **Ensure Compliance** with enterprise approval workflows
- **Standardize Pricing** with automated calculations
- **Increase Sales Efficiency** through streamlined processes

## 3. **Functional Requirements**

### 3.1 **User Management and Personas**

#### 3.1.1 **Account Manager (AM)**
- **Primary Role**: Customer-facing sales representative
- **Responsibilities**:
  - Create new projects for customers
  - Upload customer requirements (Excel files)
  - Monitor project status and progress
  - Communicate with customers on pricing and timelines
- **Access Rights**: Can create projects, view all projects, initiate workflows

#### 3.1.2 **Product Manager (PM)**
- **Primary Role**: Product catalog and pricing authority
- **Responsibilities**:
  - Review and approve custom SKU requests
  - Set pricing for non-standard services
  - Validate business cases for custom products
  - Maintain product catalog integrity
- **Access Rights**: Can review custom SKUs, approve/reject pricing, access product catalog

#### 3.1.3 **Solution Architect (SA)**
- **Primary Role**: Technical validation and architecture design
- **Responsibilities**:
  - Validate technical feasibility of custom services
  - Design solution architecture
  - Estimate resource requirements
  - Provide technical approval for complex solutions
- **Access Rights**: Can review technical specifications, approve/reject technical designs

#### 3.1.4 **Finance Admin**
- **Primary Role**: Financial approval and compliance
- **Responsibilities**:
  - Approve pricing above threshold limits
  - Ensure contract compliance
  - Validate discount applications
  - Final financial sign-off
- **Access Rights**: Can approve pricing, view financial summaries, access contract terms

### 3.2 **Project Management**

#### 3.2.1 **Project Creation**
- **Customer Information Capture**:
  - Company name and contact details
  - Project name and description
  - Expected timeline and budget
  - Contract terms (Monthly, Quarterly, Annual, 3-Year)
- **Demo Type Selection**:
  - Standard Infrastructure Demo (all SKUs match)
  - Custom SKU Workflow Demo (mixed standard and custom)

#### 3.2.2 **Project Status Tracking**
- **Status States**:
  - `DRAFT` - Initial project creation
  - `PENDING_SA_REVIEW` - Awaiting Solution Architect review
  - `PENDING_PM_REVIEW` - Awaiting Product Manager review
  - `PENDING_SA_FINAL` - Awaiting final SA approval
  - `PENDING_FINANCE_APPROVAL` - Awaiting finance approval
  - `APPROVED` - Final approval completed

### 3.3 **Requirements Processing**

#### 3.3.1 **Excel Upload and Parsing**
- **Supported Formats**: .xlsx, .xls files
- **Required Columns**:
  - Service Name/Description
  - Quantity
  - Specifications (CPU, RAM, Storage)
  - Duration/Contract Term
- **Validation Rules**:
  - File size limit: 10MB
  - Maximum 1000 line items
  - Required fields validation

#### 3.3.2 **SKU Matching Engine**
- **Automatic Matching**:
  - Rule-based matching against price book
  - Fuzzy matching for similar service names
  - Specification-based matching for compute resources
- **Classification**:
  - **Matched Items**: Direct price book matches
  - **Unmatched Items**: Require custom SKU creation
- **Essential Services Auto-Addition**:
  - Standard Backup (CI-BKP-STD)
  - Site-to-Site VPN (CI-VPN-S2S)
  - Internet Connectivity (CI-INET-100M)

### 3.4 **Workflow Management**

#### 3.4.1 **Standard Flow** (All SKUs Match)
1. **AM** uploads requirements
2. **System** matches all items to existing SKUs
3. **System** generates BoQ automatically
4. **AM** reviews and submits for approval
5. **Finance** approves if within limits
6. **System** generates final proposal

#### 3.4.2 **Custom Flow** (Mixed SKUs)
1. **AM** uploads requirements
2. **System** identifies custom items
3. **SA** reviews technical feasibility
4. **PM** reviews and prices custom SKUs
5. **SA** provides final technical approval
6. **Finance** approves pricing
7. **System** generates final proposal

### 3.5 **Bill of Quantities (BoQ) Management**

#### 3.5.1 **BoQ Generation**
- **Automatic Generation** from matched SKUs
- **Category Organization**:
  - Compute (VMs, Containers)
  - Storage (SSD, HDD, Object Storage)
  - Network (Load Balancers, VPN, Internet)
  - Security (Firewalls, Antivirus)
  - Backup & DR (Backup, Disaster Recovery)
- **Internal SKU Codes** displayed for all items

#### 3.5.2 **BoQ Editing Capabilities**
- **Quantity Modification**: Real-time quantity updates
- **Unit Price Editing**: Authorized users can modify pricing
- **Notes Addition**: Comments and specifications
- **Real-time Calculations**: Automatic total updates
- **Bulk Operations**: Mass quantity updates for similar items

### 3.6 **Pricing and Contract Management**

#### 3.6.1 **Pricing Model**
- **Base Pricing** from price book
- **Contract Discounts**:
  - Monthly: 0% discount
  - Quarterly: 5% discount
  - Annual: 15% discount
  - 3-Year: 25% discount
- **Volume Discounts**: Based on total contract value
- **GST Calculation**: 18% GST on all services

#### 3.6.2 **Approval Thresholds**
- **Auto-Approval**: Discounts ≤ 10%
- **Finance Approval**: Discounts 10-15%
- **BU Head Approval**: Discounts > 15%

## 4. **Non-Functional Requirements**

### 4.1 **Performance Requirements**
- **Page Load Time**: < 3 seconds for all pages
- **File Upload**: Support up to 10MB Excel files
- **Concurrent Users**: Support 50+ simultaneous users
- **Response Time**: < 1 second for most operations

### 4.2 **Security Requirements**
- **Role-Based Access Control**: Strict persona-based permissions
- **Data Encryption**: All data encrypted in transit and at rest
- **Audit Trail**: Complete logging of all user actions
- **Session Management**: Secure session handling with timeouts

### 4.3 **Usability Requirements**
- **Responsive Design**: Mobile and tablet compatibility
- **Intuitive Navigation**: Clear workflow progression
- **Error Handling**: Graceful error messages and recovery
- **Accessibility**: WCAG 2.1 AA compliance

### 4.4 **Reliability Requirements**
- **Uptime**: 99.9% availability
- **Data Backup**: Daily automated backups
- **Disaster Recovery**: 4-hour RTO, 1-hour RPO
- **Error Recovery**: Automatic retry mechanisms

## 5. **Integration Requirements**

### 5.1 **External Systems**
- **CRM Integration**: Salesforce/HubSpot for customer data
- **ERP Integration**: SAP/Oracle for financial data
- **Email System**: Automated notifications and alerts
- **Document Management**: PDF generation and storage

### 5.2 **API Requirements**
- **RESTful APIs**: For external system integration
- **Webhook Support**: Real-time status updates
- **Rate Limiting**: API usage controls
- **Authentication**: OAuth 2.0 / JWT tokens

## 6. **Compliance and Regulatory Requirements**

### 6.1 **Data Protection**
- **GDPR Compliance**: EU data protection regulations
- **Data Residency**: Customer data stored in specified regions
- **Privacy Controls**: Data anonymization and deletion

### 6.2 **Financial Compliance**
- **SOX Compliance**: Financial reporting controls
- **Audit Requirements**: Complete audit trails
- **Approval Controls**: Segregation of duties

## 7. **Success Criteria**

### 7.1 **Business Metrics**
- **Order Processing Time**: Reduce from 2 weeks to 3 days
- **Customer Satisfaction**: > 90% satisfaction score
- **Sales Efficiency**: 50% increase in quotes processed
- **Error Reduction**: 80% reduction in pricing errors

### 7.2 **Technical Metrics**
- **System Availability**: 99.9% uptime
- **Performance**: < 3 second page loads
- **User Adoption**: 90% of sales team using system
- **Data Accuracy**: 99% SKU matching accuracy

## 8. **Assumptions and Dependencies**

### 8.1 **Assumptions**
- Users have basic computer literacy
- Stable internet connectivity available
- Customer requirements provided in standardized format
- Approval workflows remain consistent

### 8.2 **Dependencies**
- Price book data availability and accuracy
- User training and change management
- Integration with existing systems
- Infrastructure provisioning and setup

## 9. **Risks and Mitigation**

### 9.1 **Technical Risks**
- **Data Migration**: Risk of data loss during migration
  - *Mitigation*: Comprehensive backup and testing procedures
- **Integration Complexity**: Challenges with legacy system integration
  - *Mitigation*: Phased integration approach with fallback options

### 9.2 **Business Risks**
- **User Adoption**: Resistance to new system
  - *Mitigation*: Comprehensive training and change management
- **Process Changes**: Disruption to existing workflows
  - *Mitigation*: Gradual rollout with parallel systems

## 10. **Future Enhancements**

### 10.1 **Phase 2 Features**
- **AI-Powered Recommendations**: Intelligent service suggestions
- **Advanced Analytics**: Detailed reporting and insights
- **Mobile Application**: Native mobile app for field sales
- **Multi-Language Support**: Localization for global markets

### 10.2 **Long-term Vision**
- **Marketplace Integration**: Third-party service integration
- **Automated Provisioning**: Direct cloud resource deployment
- **Predictive Analytics**: Demand forecasting and capacity planning
- **Customer Self-Service Portal**: Direct customer access

