import React, { useState, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import Dashboard from './components/Dashboard'
import NewProject from './components/NewProject'
import ExcelUpload from './components/ExcelUpload'
import ProjectDetails from './components/ProjectDetails'
import ProductManagerReview from './components/ProductManagerReview'
import SolutionArchitectVetting from './components/SolutionArchitectVetting'
import BoQGenerated from './components/BoQGenerated'
import ProposalGenerated from './components/ProposalGenerated'
import ManualEntryWorkspace from './components/ManualEntryWorkspace'
import DeploymentFlow from './components/DeploymentFlow'
import InventoryDashboard from './pages/portal/InventoryDashboard'
import ResourceTopology from './pages/portal/ResourceTopology'
import CostManagement from './pages/portal/CostManagement'
import ServiceRequest from './pages/portal/ServiceRequest'
import PortalLayout from './pages/portal/PortalLayout'
import './App.css'
import { Toaster } from "@/components/ui/sonner"
import PersonaSwitcher from './components/PersonaSwitcher'
import { PERSONAS } from './utils/dataModel'
import DemoControls from './components/DemoControls'
import { v4 as uuidv4 } from 'uuid'
import { SERVICE_CATEGORIES as SERVICE_CATALOG } from './utils/serviceModel'

// This component will represent the main view after a customer is provisioned
const ProvisionedCustomerView = ({ customer, onViewInventory }) => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Customer Provisioned</h2>
      <p className="mb-2"><strong>Customer:</strong> {customer.name}</p>
      <p className="mb-6"><strong>Subscription ID:</strong> {customer.subscriptions[0].id}</p>
      <button 
        onClick={onViewInventory}
        className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition-colors"
      >
        View Inventory Portal
      </button>
    </div>
  </div>
)

function App() {
  const [currentPersona, setCurrentPersona] = useState(PERSONAS.SOLUTION_ARCHITECT);
  const [currentStep, setCurrentStep] = useState(0);
  const [boqItems, setBoqItems] = useState([]);
  const [projectDetails, setProjectDetails] = useState(null);
  const [customerInventory, setCustomerInventory] = useState(null);

  const handleBoQFinalized = (items) => {
    setBoqItems(items);
    setCurrentStep(1); // Move to BoQ Generated view
  };

  const transformBoqToInventory = (boq) => {
    const services = {};

    boq.forEach(item => {
      // Find the service definition from the catalog
      let itemServiceDef;
      let itemCategoryKey;

      for (const catKey in SERVICE_CATALOG) {
        const foundService = SERVICE_CATALOG[catKey].services.find(s => s.sku === item.sku);
        if (foundService) {
          itemServiceDef = foundService;
          itemCategoryKey = catKey;
          break;
        }
      }

      if (!itemServiceDef) {
        console.warn(`SKU ${item.sku} not found in service catalog. Skipping.`);
        return;
      }
      
      const category = SERVICE_CATALOG[itemCategoryKey].title;

      if (!services[category]) {
        services[category] = {
          id: uuidv4(),
          name: `${category} Services`,
          category: category,
          resources: [],
        };
      }

      // Create a resource for each quantity
      for (let i = 0; i < item.quantity; i++) {
        services[category].resources.push({
          id: uuidv4(),
          name: `${item.description} #${i + 1}`,
          category: category,
          type: itemServiceDef.label,
          cloudType: 'Shared Cloud', // Default
          location: 'Mumbai (DC1)', // Default
          status: 'Active',
          specs: item.config,
          mrr: item.totalPrice / item.quantity,
          dependsOn: [],
        });
      }
    });

    return {
      id: `CUST-${projectDetails?.customerName.toUpperCase().slice(0,4) || 'ACME'}`,
      name: projectDetails?.customerName || 'ACME Corporation',
      subscriptions: [{
        id: `SUB-${new Date().getFullYear()}-001`,
        name: 'Initial Infrastructure Order',
        startDate: new Date().toISOString().split('T')[0],
        term: '12 Months',
        services: Object.values(services),
        amendments: [],
        get totalMrr() {
          return this.services.reduce((total, service) =>
            total + service.resources.reduce((subTotal, resource) => subTotal + resource.mrr, 0), 0
          );
        }
      }]
    };
  };

  const handleProvision = () => {
    const inventory = transformBoqToInventory(boqItems);
    setCustomerInventory(inventory);
  };

  const resetAll = () => {
    setBoqItems([]);
    setProjectDetails(null);
    setCurrentStep(0);
    setCustomerInventory(null);
  };

  return (
    <ErrorBoundary>
      <Router>
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
          <Toaster />
          <div className="flex-1 flex flex-col overflow-hidden">
            <header className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 border-b">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Sify Cloud Demo Portal</h1>
              <div className="flex items-center gap-4">
                <PersonaSwitcher
                  currentPersona={currentPersona}
                  setCurrentPersona={setCurrentPersona}
                />
                <button onClick={resetAll} className="text-sm text-gray-500 hover:text-gray-800">Reset Demo</button>
              </div>
            </header>
            <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard currentPersona={currentPersona} />} />
                <Route path="/new-project" element={<NewProject />} />
                <Route path="/excel-upload" element={<ExcelUpload onBoQFinalized={handleBoQFinalized} onProjectCreate={setProjectDetails} />} />
                <Route path="/project-details/:projectId" element={<ProjectDetails />} />
                <Route path="/product-manager-review" element={<ProductManagerReview />} />
                <Route path="/solution-architect-vetting" element={<SolutionArchitectVetting />} />
                <Route path="/boq-generated" element={<BoQGenerated />} />
                <Route path="/proposal-generated" element={<ProposalGenerated />} />
                <Route path="/manual-entry" element={<ManualEntryWorkspace onBoQFinalized={handleBoQFinalized} onProjectCreate={setProjectDetails} />} />
                <Route path="/deployment" element={<DeploymentFlow />} />
                <Route path="/portal" element={<PortalLayout inventory={customerInventory} />}>
                  <Route index element={<InventoryDashboard />} />
                  <Route path="topology" element={<ResourceTopology />} />
                  <Route path="costs" element={<CostManagement />} />
                  <Route path="request-service" element={<ServiceRequest />} />
                </Route>
                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App

