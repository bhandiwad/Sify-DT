import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertTriangle, Clock, Loader2, ArrowRight } from 'lucide-react'

const SKUMatchingEngine = ({ projectData = {}, excelData = [] }) => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [matchedItems, setMatchedItems] = useState([])
  const [unmatchedItems, setUnmatchedItems] = useState([])
  const [processingComplete, setProcessingComplete] = useState(false)

  // Mock price book for SKU matching
  const priceBook = {
    'virtual machine': { sku: 'VM-CUSTOM', category: 'compute', matchable: true },
    'vm': { sku: 'VM-CUSTOM', category: 'compute', matchable: true },
    'server': { sku: 'VM-CUSTOM', category: 'compute', matchable: true },
    'database': { sku: 'DB-CUSTOM', category: 'database', matchable: true },
    'db': { sku: 'DB-CUSTOM', category: 'database', matchable: true },
    'load balancer': { sku: 'LB-STD', category: 'network', matchable: true },
    'firewall': { sku: 'FW-STD', category: 'security', matchable: true },
    'storage': { sku: 'STG-SSD', category: 'storage', matchable: true },
    'backup': { sku: 'BKP-STD', category: 'backup', matchable: true },
    'antivirus': { sku: 'AV-ENT', category: 'security', matchable: true },
    'windows': { sku: 'OS-WIN', category: 'software', matchable: true },
    'linux': { sku: 'OS-LNX', category: 'software', matchable: true },
    // Non-standard services that won't match
    'vdi': { sku: null, category: 'custom', matchable: false },
    'blockchain': { sku: null, category: 'custom', matchable: false },
    'quantum computing': { sku: null, category: 'custom', matchable: false },
    'ai training cluster': { sku: null, category: 'custom', matchable: false }
  }

  const steps = [
    { 
      id: 1, 
      title: 'Parsing Requirements', 
      description: 'Reading Excel data and extracting service requirements',
      duration: 1500
    },
    { 
      id: 2, 
      title: 'Rule Engine Processing', 
      description: 'Applying SKU matching rules against price book',
      duration: 2500
    },
    { 
      id: 3, 
      title: 'Categorizing Items', 
      description: 'Separating matched and unmatched services',
      duration: 1500
    },
    { 
      id: 4, 
      title: 'Validation & Routing', 
      description: 'Determining next workflow based on results',
      duration: 1000
    }
  ]

  // Mock Excel data based on demo scenario
  const getScenarioData = () => {
    if (projectData?.demoScenario === 'standard') {
      // Standard scenario - all items match
      return [
        { service: 'Virtual Machine', description: 'App Server', quantity: 3, specs: '4 vCPU, 8GB RAM' },
        { service: 'Virtual Machine', description: 'Database Server', quantity: 1, specs: '8 vCPU, 16GB RAM' },
        { service: 'Load Balancer', description: 'SSL Load Balancer', quantity: 1, specs: 'Standard' },
        { service: 'Firewall', description: 'Network Security', quantity: 1, specs: 'Standard' },
        { service: 'Storage', description: 'SSD Storage', quantity: 1, specs: '1TB SSD' },
        { service: 'Backup', description: 'Daily Backup Service', quantity: 1, specs: 'Standard' }
      ]
    } else if (projectData?.demoScenario === 'custom') {
      // Custom scenario - mixed items
      return [
        { service: 'Virtual Machine', description: 'App Server', quantity: 3, specs: '4 vCPU, 8GB RAM' },
        { service: 'Virtual Machine', description: 'Database Server', quantity: 1, specs: '8 vCPU, 16GB RAM' },
        { service: 'Load Balancer', description: 'SSL Load Balancer', quantity: 1, specs: 'Standard' },
        { service: 'Firewall', description: 'Network Security', quantity: 1, specs: 'Standard' },
        { service: 'VDI', description: 'Virtual Desktop Infrastructure', quantity: 50, specs: 'Custom VDI Solution' },
        { service: 'AI Training Cluster', description: 'GPU Cluster for ML', quantity: 1, specs: '8x NVIDIA A100' }
      ]
    } else {
      // Default mixed scenario
      return [
        { service: 'Virtual Machine', description: 'App Server', quantity: 3, specs: '4 vCPU, 8GB RAM' },
        { service: 'Virtual Machine', description: 'Database Server', quantity: 1, specs: '8 vCPU, 16GB RAM' },
        { service: 'Load Balancer', description: 'SSL Load Balancer', quantity: 1, specs: 'Standard' },
        { service: 'Firewall', description: 'Network Security', quantity: 1, specs: 'Standard' },
        { service: 'VDI', description: 'Virtual Desktop Infrastructure', quantity: 50, specs: 'Custom VDI Solution' },
        { service: 'AI Training Cluster', description: 'GPU Cluster for ML', quantity: 1, specs: '8x NVIDIA A100' }
      ]
    }
  }

  const dataToProcess = excelData.length > 0 ? excelData : getScenarioData()

  // SKU matching logic
  const matchSKUs = (items) => {
    const matched = []
    const unmatched = []

    items.forEach((item, index) => {
      const serviceName = item.service.toLowerCase()
      const match = priceBook[serviceName]

      if (match && match.matchable) {
        matched.push({
          ...item,
          id: `item-${index}`,
          sku: match.sku,
          category: match.category,
          status: 'matched',
          unitPrice: calculateUnitPrice(item, match.category)
        })
      } else {
        unmatched.push({
          ...item,
          id: `item-${index}`,
          sku: null,
          category: 'custom',
          status: 'unmatched',
          reason: 'No matching SKU in price book'
        })
      }
    })

    return { matched, unmatched }
  }

  const calculateUnitPrice = (item, category) => {
    // Mock pricing logic based on category
    switch (category) {
      case 'compute':
        if (item.specs.includes('4 vCPU')) return 4800
        if (item.specs.includes('8 vCPU')) return 9600
        return 2400
      case 'network':
        return 2000
      case 'security':
        return 1500
      case 'storage':
        return 800
      case 'software':
        return 1200
      default:
        return 0
    }
  }

  useEffect(() => {
    let totalDuration = 0
    let currentDuration = 0

    steps.forEach((step, index) => {
      totalDuration += step.duration
      setTimeout(() => {
        setCurrentStep(index + 1)
        currentDuration += step.duration
        setProgress((currentDuration / totalDuration) * 100)

        // Perform SKU matching at step 2
        if (index === 1) {
          const { matched, unmatched } = matchSKUs(dataToProcess)
          setMatchedItems(matched)
          setUnmatchedItems(unmatched)
        }
      }, currentDuration)
    })

    // Complete processing
    setTimeout(() => {
      setProcessingComplete(true)
    }, totalDuration + 500)
  }, [])

  const handleContinue = () => {
    if (unmatchedItems.length > 0) {
      // Navigate to custom product workflow
      navigate('/product-manager-review', { 
        state: { 
          projectData, 
          matchedItems, 
          unmatchedItems,
          dealStatus: 'NEEDS_CUSTOM_SKUS'
        }
      })
    } else {
      // Navigate to standard BoQ flow
      navigate('/boq-generated', { 
        state: { 
          projectData, 
          matchedItems,
          dealStatus: 'STANDARD_QUOTE'
        }
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">🔍 SKU Matching Engine</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Info */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  🏢 {projectData.customerName || 'Edgecut Technologies'}
                </h2>
                <p className="text-gray-600">{projectData.projectName || 'Web Application Infrastructure'}</p>
                <p className="text-sm text-gray-500 mt-1">Deal ID: DEAL-2024-{Math.floor(Math.random() * 1000)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Processing Items</p>
                <p className="text-lg font-semibold text-blue-600">{dataToProcess.length} services</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>SKU Matching Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Processing Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🔄 Rule Engine Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {steps.map((step, index) => {
                const isCompleted = currentStep > index + 1
                const isCurrent = currentStep === index + 1
                const isPending = currentStep < index + 1

                return (
                  <div key={step.id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : isCurrent ? (
                        <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                      ) : (
                        <Clock className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-medium ${
                        isCompleted ? 'text-green-900' : 
                        isCurrent ? 'text-blue-900' : 
                        'text-gray-500'
                      }`}>
                        {step.title}
                      </h3>
                      <p className={`text-sm ${
                        isCompleted ? 'text-green-600' : 
                        isCurrent ? 'text-blue-600' : 
                        'text-gray-400'
                      }`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {processingComplete && (
          <>
            {/* Summary */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>📊 Matching Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{matchedItems.length}</div>
                    <div className="text-sm text-gray-600">Matched Items</div>
                    <div className="text-xs text-green-600 mt-1">Standard SKUs Available</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">{unmatchedItems.length}</div>
                    <div className="text-sm text-gray-600">Unmatched Items</div>
                    <div className="text-xs text-orange-600 mt-1">Custom SKUs Required</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{dataToProcess.length}</div>
                    <div className="text-sm text-gray-600">Total Items</div>
                    <div className="text-xs text-blue-600 mt-1">From Excel Upload</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Matched Items */}
            {matchedItems.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    Matched Items (Standard SKUs)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {matchedItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                              {item.sku}
                            </Badge>
                            <span className="font-medium">{item.service}</span>
                            <span className="text-gray-600">×{item.quantity}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{item.description} - {item.specs}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">₹{item.unitPrice.toLocaleString()}/month</div>
                          <div className="text-sm text-gray-600">per unit</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Unmatched Items */}
            {unmatchedItems.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                    Unmatched Items (Custom SKUs Required)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {unmatchedItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                              CUSTOM
                            </Badge>
                            <span className="font-medium">{item.service}</span>
                            <span className="text-gray-600">×{item.quantity}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{item.description} - {item.specs}</p>
                          <p className="text-xs text-orange-600 mt-1">⚠️ {item.reason}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-orange-600">Pricing TBD</div>
                          <div className="text-sm text-gray-600">Requires PM Review</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>🚀 Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {unmatchedItems.length > 0 ? (
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <h3 className="font-semibold text-orange-900 mb-2">Custom Product Workflow Required</h3>
                      <p className="text-sm text-orange-700 mb-4">
                        This deal contains {unmatchedItems.length} non-standard service(s) that require custom SKU creation. 
                        The deal will be routed to Product Manager for review and approval.
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-orange-700">
                        <span>Deal Status:</span>
                        <Badge className="bg-orange-600 text-white">NEEDS_CUSTOM_SKUS</Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h3 className="font-semibold text-green-900 mb-2">Standard Quote Flow</h3>
                      <p className="text-sm text-green-700 mb-4">
                        All services have been successfully matched to existing SKUs. 
                        Proceeding with standard quote generation.
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-green-700">
                        <span>Deal Status:</span>
                        <Badge className="bg-green-600 text-white">STANDARD_QUOTE</Badge>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button onClick={handleContinue} className="flex items-center space-x-2">
                      <span>
                        {unmatchedItems.length > 0 ? 'Route to Product Manager' : 'Generate Standard Quote'}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

export default SKUMatchingEngine

