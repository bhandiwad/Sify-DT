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
import './App.css'

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/new-project" element={<NewProject />} />
            <Route path="/excel-upload" element={<ExcelUpload />} />
            <Route path="/project-details/:projectId" element={<ProjectDetails />} />
            <Route path="/product-manager-review" element={<ProductManagerReview />} />
            <Route path="/solution-architect-vetting" element={<SolutionArchitectVetting />} />
            <Route path="/boq-generated" element={<BoQGenerated />} />
            <Route path="/proposal-generated" element={<ProposalGenerated />} />
            <Route path="/manual-entry" element={<ManualEntryWorkspace />} />
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App

