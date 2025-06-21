import { useState } from 'react'
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

function App() {
  const [currentPersona, setCurrentPersona] = useState(PERSONAS.SOLUTION_ARCHITECT);
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <ErrorBoundary>
      <Router>
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
          <Toaster />
          <div className="flex-1 flex flex-col overflow-hidden">
            <header className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 border-b">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Sify Cloud Demo Portal</h1>
              <PersonaSwitcher
                currentPersona={currentPersona}
                setCurrentPersona={setCurrentPersona}
              />
            </header>
            <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard currentPersona={currentPersona} />} />
                <Route path="/new-project" element={<NewProject />} />
                <Route path="/excel-upload" element={<ExcelUpload />} />
                <Route path="/project-details/:projectId" element={<ProjectDetails />} />
                <Route path="/product-manager-review" element={<ProductManagerReview />} />
                <Route path="/solution-architect-vetting" element={<SolutionArchitectVetting />} />
                <Route path="/boq-generated" element={<BoQGenerated />} />
                <Route path="/proposal-generated" element={<ProposalGenerated />} />
                <Route path="/manual-entry" element={<ManualEntryWorkspace />} />
                <Route path="/deployment" element={<DeploymentFlow />} />
                <Route path="/portal" element={<PortalLayout />}>
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

