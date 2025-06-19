import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Clock, ArrowRight, Info, AlertCircle } from 'lucide-react'
import PersonaSwitcher from './PersonaSwitcher'
import { 
  getProject, 
  updateProject, 
  getCurrentPersona,
  getNextStatus,
  FLOW_TYPES,
  PROJECT_STATUS,
  PRICE_BOOK_SKUS,
  ESSENTIAL_SERVICES
} from '@/utils/dataModel'

const ExcelUpload = () => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const [projectData, setProjectData] = useState(null)
  const [file, setFile] = useState(null)
  const [dealId, setDealId] = useState('DEAL-2025-001')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState('')
  const [progress, setProgress] = useState(0)
  const [skuMatchResults, setSkuMatchResults] = useState(null)
  const [currentPersona, setCurrentPersona] = useState(getCurrentPersona())
  const [error, setError] = useState(null)

  useEffect(() => {
    initializeComponent()
  }, [location])

  const initializeComponent = () => {
    try {
      // Get project data from location state or URL params
      const projectId = location.state?.projectId || new URLSearchParams(location.search).get('projectId')
      
      if (projectId) {
        const project = getProject(projectId)
        if (project) {
          setProjectData(project)
          setDealId(project.id)
        } else {
          setError('Project not found. Please start from the dashboard.')
          return
        }
      } else if (location.state?.projectData) {
        setProjectData(location.state.projectData)
        setDealId(location.state.projectData.id)
      } else {
        setError('No project data found. Please start from the dashboard.')
        return
      }
    } catch (err) {
      console.error('Error initializing component:', err)
      setError('Failed to load project data. Please try again.')
    }
  }

  const handlePersonaChange = (persona) => {
    setCurrentPersona(persona)
  }

  // Enhanced scenario data based on flow type
  const getScenarioExcelData = () => {
    if (projectData.flowType === FLOW_TYPES.STANDARD) {
      // Standard scenario - all items will match SKUs
      return [
        { description: 'Application Server Windows 4 vCPU 8GB RAM', quantity: 3, notes: 'For web application hosting' },
        { description: 'Database Server Windows 8 vCPU 16GB RAM', quantity: 1, notes: 'SQL Server hosting' },
        { description: 'Load Balancer Standard', quantity: 1, notes: 'Traffic distribution' },
        { description: 'Enterprise Firewall', quantity: 1, notes: 'Network security' },
        { description: 'SSD Storage 100GB', quantity: 4, notes: 'High-performance storage' },
        { description: 'Standard Antivirus', quantity: 4, notes: 'Security protection' }
      ]
    } else {
      // Custom scenario - mixed standard and custom items
      return [
        { description: 'Application Server Windows 4 vCPU 8GB RAM', quantity: 3, notes: 'For web application hosting' },
        { description: 'Database Server Windows 8 vCPU 16GB RAM', quantity: 1, notes: 'SQL Server hosting' },
        { description: 'Load Balancer Standard', quantity: 1, notes: 'Traffic distribution' },
        { description: 'Enterprise Firewall', quantity: 1, notes: 'Network security' },
        { description: 'VDI Desktop as a Service 50 users', quantity: 1, notes: 'Virtual desktop infrastructure for remote work' },
        { description: 'Custom AI/ML Analytics Platform with GPU acceleration', quantity: 1, notes: 'Machine learning workloads with NVIDIA A100 GPUs' },
        { description: 'Managed Kubernetes Service with auto-scaling', quantity: 1, notes: 'Container orchestration platform' }
      ]
    }
  }

  const matchSKUs = (excelData) => {
    const matched = []
    const unmatched = []

    excelData.forEach((row, index) => {
      const description = row.description.toLowerCase()
      let matchFound = false

      // Enhanced matching logic with internal SKU codes
      for (const sku of PRICE_BOOK_SKUS) {
        const skuName = sku.name.toLowerCase()
        
        let hasMatch = false
        
        if (description.includes('application server') && description.includes('4 vcpu') && skuName.includes('windows vm 4vcpu')) {
          hasMatch = true
        } else if (description.includes('database server') && description.includes('8 vcpu') && skuName.includes('windows vm 8vcpu')) {
          hasMatch = true
        } else if (description.includes('load balancer') && description.includes('standard') && skuName.includes('standard load balancer')) {
          hasMatch = true
        } else if (description.includes('enterprise firewall') && skuName.includes('enterprise firewall')) {
          hasMatch = true
        } else if (description.includes('standard antivirus') && skuName.includes('standard antivirus')) {
          hasMatch = true
        } else if (description.includes('ssd storage') && description.includes('100gb') && skuName.includes('ssd storage 100gb')) {
          hasMatch = true
        }

        if (hasMatch) {
          matched.push({
            ...row,
            matchedSKU: sku,
            confidence: 0.95,
            index,
            internalCode: sku.internalCode,
            category: sku.category
          })
          matchFound = true
          break
        }
      }

      if (!matchFound) {
        unmatched.push({
          ...row,
          reason: 'No matching SKU found in price book - requires custom SKU creation',
          index,
          category: 'Custom',
          suggestedInternalCode: `CUSTOM-${String(index + 1).padStart(3, '0')}`
        })
      }
    })

    return { matched, unmatched }
  }

  const addEssentialServices = (matchedItems) => {
    const essentials = []
    
    ESSENTIAL_SERVICES.forEach(essential => {
      const sku = PRICE_BOOK_SKUS.find(s => s.sku === essential.sku)
      if (sku) {
        essentials.push({
          description: sku.name,
          quantity: essential.quantity,
          notes: essential.reason,
          matchedSKU: sku,
          confidence: 1.0,
          internalCode: sku.internalCode,
          category: sku.category,
          autoAdded: true,
          essential: true
        })
      }
    })
    
    return [...matchedItems, ...essentials]
  }

  const processFile = async () => {
    if (!projectData) {
      setError('No project data available. Please start from the dashboard.')
      return
    }

    setIsProcessing(true)
    setProgress(0)
    setError(null)

    try {
      // Step 1: File Upload
      setProcessingStep('Uploading file...')
      setProgress(20)
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Step 2: Parse Excel
      setProcessingStep('Parsing Excel data...')
      setProgress(40)
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Step 3: SKU Matching
      setProcessingStep('Matching against price-book SKUs...')
      setProgress(60)
      await new Promise(resolve => setTimeout(resolve, 2000))

      const results = matchSKUs(getScenarioExcelData())
      
      // Step 4: Add Essential Services
      setProcessingStep('Adding essential services...')
      setProgress(80)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const enhancedMatched = addEssentialServices(results.matched)
      const finalResults = { matched: enhancedMatched, unmatched: results.unmatched }
      
      setSkuMatchResults(finalResults)

      // Step 5: Analysis Complete
      setProcessingStep('Analysis complete')
      setProgress(100)
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Update project with match results
      const customBoqItems = finalResults.unmatched.map(item => ({
        ...item,
        sku: 'CI-CUSTOM',
        category: 'CUSTOM',
        unitPrice: 5000,
        totalPrice: 5000 * (item.quantity || 1),
      }));
      const updatedProject = updateProject(projectData.id, {
        matchedItems: finalResults.matched,
        unmatchedItems: finalResults.unmatched,
        essentialServices: finalResults.matched.filter(item => item.essential),
        boqItems: [
          ...finalResults.matched.map(item => ({
            ...item,
            unitPrice: item.matchedSKU?.basePrice || 0,
            totalPrice: (item.matchedSKU?.basePrice || 0) * (item.quantity || 1)
          })),
          ...customBoqItems
        ],
        flowType: finalResults.unmatched.length > 0 ? FLOW_TYPES.CUSTOM : FLOW_TYPES.STANDARD,
        status: getNextStatus(PROJECT_STATUS.DRAFT, finalResults.unmatched.length > 0 ? FLOW_TYPES.CUSTOM : FLOW_TYPES.STANDARD)
      })

      setIsProcessing(false)

      // Auto-navigate based on results and workflow
      setTimeout(() => {
        try {
          const navigationState = {
            ...updatedProject,
            projectId: updatedProject.id,
            matchResults: finalResults,
            currentPersona: getCurrentPersona()
          }
          // Always go to BoQ Generated for AM review first
          navigate('/boq-generated', { state: navigationState })
        } catch (navError) {
          console.error('Navigation error:', navError)
          setError('Navigation failed. Please try again.')
          setIsProcessing(false)
        }
      }, 1500)

    } catch (error) {
      console.error('Processing error:', error)
      setIsProcessing(false)
      setProcessingStep('')
      setError('Failed to process requirements. Please try again.')
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!projectData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Requirement Intake</h1>
              <p className="text-gray-600">Upload customer requirements and match against price-book SKUs</p>
            </div>
            <PersonaSwitcher onPersonaChange={handlePersonaChange} />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Project Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              New Opportunity Workspace
            </CardTitle>
            <CardDescription>
              Upload Excel requirements and tag with deal ID for SKU matching
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer">Customer</Label>
                <Input 
                  id="customer" 
                  value={projectData.customerName} 
                  disabled 
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label htmlFor="dealId">Deal ID *</Label>
                <Input 
                  id="dealId" 
                  value={dealId} 
                  onChange={(e) => setDealId(e.target.value)}
                  placeholder="Enter deal ID"
                />
              </div>
              <div>
                <Label htmlFor="projectName">Project Name</Label>
                <Input 
                  id="projectName" 
                  value={projectData.projectName} 
                  disabled 
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label htmlFor="contractTerm">Contract Term</Label>
                <Input 
                  id="contractTerm" 
                  value={projectData.contractTerm?.replace('_', ' ').toUpperCase() || 'ANNUAL'} 
                  disabled 
                  className="bg-gray-50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle>Requirements Upload</CardTitle>
            <CardDescription>
              Upload Excel file with service requirements for automatic SKU matching
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isProcessing ? (
              <div className="space-y-6">
                {/* File Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Drop your Excel file here, or <button className="text-blue-600 hover:text-blue-700">browse</button>
                  </p>
                  <p className="text-sm text-gray-600">Supports .xlsx and .csv files up to 10MB</p>
                  
                  {/* Demo Info */}
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Demo Mode:</strong> {projectData.flowType === FLOW_TYPES.STANDARD ? 'Standard' : 'Custom'} workflow selected
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {projectData.flowType === FLOW_TYPES.STANDARD 
                        ? 'All services will match existing SKUs for fast processing'
                        : 'Mixed services will trigger full approval workflow'
                      }
                    </p>
                  </div>
                </div>

                {/* Process Button */}
                <Button 
                  onClick={processFile}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3"
                  size="lg"
                >
                  Process Requirements & Match SKUs
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Processing Status */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-blue-600 animate-spin" />
                    <span className="text-lg font-medium">{processingStep}</span>
                  </div>
                  <Progress value={progress} className="w-full h-3" />
                  <p className="text-sm text-gray-600 mt-2">{progress}% complete</p>
                </div>

                {/* Processing Steps */}
                <div className="space-y-3">
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${progress >= 20 ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-600'}`}>
                    {progress >= 20 ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                    <span>File Upload</span>
                  </div>
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${progress >= 40 ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-600'}`}>
                    {progress >= 40 ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                    <span>Excel Parsing</span>
                  </div>
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${progress >= 60 ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-600'}`}>
                    {progress >= 60 ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                    <span>SKU Matching</span>
                  </div>
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${progress >= 80 ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-600'}`}>
                    {progress >= 80 ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                    <span>Adding Essential Services</span>
                  </div>
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${progress >= 100 ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-600'}`}>
                    {progress >= 100 ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                    <span>Analysis Complete</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ExcelUpload

