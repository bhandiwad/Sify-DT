import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  User, 
  Clock,
  FileText,
  Settings,
  AlertCircle,
  Eye,
  ThumbsUp,
  ThumbsDown,
  DollarSign,
  Package
} from 'lucide-react'
import PersonaSwitcher from './PersonaSwitcher'
import { 
  getProject, 
  updateProject, 
  getCurrentPersona,
  setCurrentPersona,
  getNextStatus,
  canUserActOnProject,
  PERSONAS,
  PROJECT_STATUS,
  FLOW_TYPES,
  PRICE_BOOK_SKUS
} from '@/utils/dataModel'
import { CATALOG, VM_OS_OPTIONS, VM_FEATURES, FLOOR_UNIT_PRICES } from '../utils/constants'
import BoQTable, { getInternalCode, getFloorPriceForItem } from './BoQTable'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { ScrollArea } from './ui/scroll-area'
import { ENVIRONMENT_TYPES } from '../utils/serviceModel'
import { normalizeBoqItem } from '../utils/serviceModel'

// Mock pricing data - in production, this would come from a pricing service
const MOCK_PRICING = {
  "VM-BASIC": { base: 5000, unit: "per vCPU" },
  "VM-GPU": { base: 25000, unit: "per GPU" },
  "CONTAINER": { base: 8000, unit: "per node" },
  "BLOCK-SSD": { base: 2, unit: "per GB" },
  "OBJ-STD": { base: 1, unit: "per GB" },
  "FILE-NFS": { base: 3, unit: "per GB" },
  "DBAAS-MYSQL": { base: 15000, unit: "per instance" },
  "DBAAS-PGSQL": { base: 15000, unit: "per instance" },
  "REDIS-CACHE": { base: 10000, unit: "per instance" },
  "APP-HOSTING": { base: 12000, unit: "per app" },
  "KAFKA-STREAM": { base: 20000, unit: "per cluster" },
  "LB-STD": { base: 5000, unit: "per instance" },
  "VPN-S2S": { base: 8000, unit: "per connection" },
  "WAF": { base: 12000, unit: "per instance" },
  "CERT-MGT": { base: 2000, unit: "per certificate" },
  "KEY-VAULT": { base: 5000, unit: "per vault" },
  "IAM": { base: 3000, unit: "per user" }
};

// Helper to extract vCPU and RAM from description (e.g., '4 vCPU, 16GB RAM')
function extractVMConfig(description) {
  const vcpuMatch = description.match(/(\d+)\s*vCPU/i)
  const ramMatch = description.match(/(\d+)\s*GB/i)
  return {
    vcpu: vcpuMatch ? parseInt(vcpuMatch[1]) : 0,
    ram: ramMatch ? parseInt(ramMatch[1]) : 0
  }
}
function parseVmConfigFromDescription(description) {
  const { vcpu, ram } = extractVMConfig(description)
  return {
    vcpu: vcpu || 2,
    ram: ram || 4,
    storage: 50,
    os: 'windows-2022',
    features: []
  }
}

const ProductManagerReview = () => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const [projectData, setProjectData] = useState(null)
  const [matchResults, setMatchResults] = useState(null)
  const [currentPersona, setCurrentPersonaState] = useState(getCurrentPersona())
  const [comments, setComments] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [customSkuPricing, setCustomSkuPricing] = useState({})
  const [newlyAddedIndex, setNewlyAddedIndex] = useState(null)
  const { environments = {} } = location.state || {}

  const [pricing, setPricing] = useState(() => {
    const initial = {}
    if (environments && typeof environments === 'object') {
      Object.entries(environments).forEach(([envKey, env]) => {
        initial[envKey] = {}
        if (env && Array.isArray(env.services)) {
          env.services.forEach(service => {
            initial[envKey][service.sku] = {
              basePrice: MOCK_PRICING[service.sku]?.base || 0,
              quantity: 1,
              discount: 0
            }
          })
        }
      })
    }
    return initial
  })

  // Always set persona to PM on mount
  useEffect(() => {
    setCurrentPersona(PERSONAS.PRODUCT_MANAGER);
    setCurrentPersonaState(PERSONAS.PRODUCT_MANAGER);
    console.log('[Auto Persona Switch] Set persona to Product Manager');
    initializeComponent();
  }, [location])

  const initializeComponent = () => {
    let projectId = location.state?.projectId;
    if (!projectId) {
      // Try URL params
      const params = new URLSearchParams(window.location.search);
      projectId = params.get('projectId');
    }
    if (!projectId) {
      // Try localStorage currentProject
      const currentProject = localStorage.getItem('currentProject');
      if (currentProject) {
        try {
          const parsed = JSON.parse(currentProject);
          projectId = parsed.id;
        } catch (e) { /* ignore */ }
      }
    }
    if (!projectId) {
      setError('No project ID provided');
      console.error('[PM Review] No project ID found');
      return;
    }
    console.log('[PM Review] Loading project with ID:', projectId);
    const project = getProject(projectId);
    if (project) {
      setProjectData(project);
      setCurrentPersona(PERSONAS.PRODUCT_MANAGER);
      setCurrentPersonaState(PERSONAS.PRODUCT_MANAGER);
      const matched = project.matchedItems || [];
      const unmatched = project.unmatchedItems || [];
      setMatchResults({ matched, unmatched });
      // Initialize custom SKU pricing
      const initialPricing = {};
      project.unmatchedItems?.forEach((item, index) => {
        initialPricing[index] = {
          basePrice: 5000, // Default price
          unit: 'per month',
          leadTime: '2-3 weeks'
        }
      });
      setCustomSkuPricing(initialPricing);
    } else {
      setError('Project not found');
      console.error('[PM Review] Project not found for ID:', projectId);
    }
  }

  const handlePersonaChange = (persona) => {
    setCurrentPersona(persona)
  }

  const handlePricingChange = (itemIndex, field, value) => {
    setCustomSkuPricing(prev => ({
      ...prev,
      [itemIndex]: {
        ...prev[itemIndex],
        [field]: field === 'basePrice' ? parseInt(value) || 0 : value
      }
    }))
  }

  const handleApprove = async () => {
    if (!canUserActOnProject(currentPersona, projectData.status)) {
      setError('You do not have permission to perform this action')
      return
    }

    setIsSubmitting(true)
    try {
      // Create custom SKUs with pricing
      const customSkus = matchResults.unmatched.map((item, index) => ({
        ...item,
        customSku: {
          sku: `CUSTOM-${projectData.id}-${String(index + 1).padStart(3, '0')}`,
          internalCode: getInternalCode(item),
          name: item.description,
          category: 'Custom',
          basePrice: customSkuPricing[index]?.basePrice || 5000,
          unit: customSkuPricing[index]?.unit || 'per month',
          leadTime: customSkuPricing[index]?.leadTime || '2-3 weeks',
          approved: true,
          approver: currentPersona,
          approvalDate: new Date().toISOString()
        }
      }))

      const updatedProject = updateProject(projectData.id, {
        status: PROJECT_STATUS.PENDING_SA_FINAL, // Move to SA final review
        unmatchedItems: customSkus,
        comments: [...(projectData.comments || []), {
          author: currentPersona,
          text: comments || 'Product Manager approval completed for custom SKUs',
          timestamp: new Date().toISOString(),
          type: 'approval'
        }],
        approvals: {
          ...projectData.approvals,
          productManager: {
            approved: true,
            approver: currentPersona,
            timestamp: new Date().toISOString(),
            comments: comments,
            customSkuPricing: customSkuPricing
          }
        }
      })

      // Navigate back to Solution Architect for final review
      navigate('/solution-architect-vetting', { 
        state: { 
          projectId: updatedProject.id,
          isFinalReview: true
        } 
      })
    } catch (error) {
      console.error('Error approving:', error)
      setError('Failed to approve. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!canUserActOnProject(currentPersona, projectData.status)) {
      setError('You do not have permission to perform this action')
      return
    }

    if (!comments.trim()) {
      setError('Please provide comments for rejection')
      return
    }

    setIsSubmitting(true)
    try {
      const updatedProject = updateProject(projectData.id, {
        status: PROJECT_STATUS.DRAFT, // Send back to Account Manager
        comments: [...(projectData.comments || []), {
          author: currentPersona,
          text: comments,
          timestamp: new Date().toISOString(),
          type: 'rejection'
        }],
        approvals: {
          ...projectData.approvals,
          productManager: {
            approved: false,
            approver: currentPersona,
            timestamp: new Date().toISOString(),
            comments: comments
          }
        }
      })

      navigate('/dashboard')
    } catch (error) {
      console.error('Error rejecting:', error)
      setError('Failed to reject. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddResource = (resource) => {
    setMatchResults(prev => ({
      ...prev,
      unmatched: [...prev.unmatched, resource]
    }))
    setNewlyAddedIndex(prev.unmatched.length)
  }

  const handleEditResource = (index, updatedResource) => {
    setMatchResults(prev => ({
      ...prev,
      unmatched: prev.unmatched.map((item, i) => i === index ? updatedResource : item)
    }))
  }

  const calculateTotals = () => {
    const totals = {
      subtotal: 0,
      discount: 0,
      tax: 0,
      total: 0
    }

    Object.entries(environments).forEach(([envKey, env]) => {
      const scalingFactor = env.scalingFactor
      env.services.forEach(service => {
        const servicePrice = pricing[envKey][service.sku]
        const lineTotal = servicePrice.basePrice * servicePrice.quantity * scalingFactor
        const lineDiscount = lineTotal * (servicePrice.discount / 100)
        
        totals.subtotal += lineTotal
        totals.discount += lineDiscount
      })
    })

    totals.tax = (totals.subtotal - totals.discount) * 0.18 // 18% GST
    totals.total = totals.subtotal - totals.discount + totals.tax

    return totals
  }

  const handlePriceChange = (envKey, sku, field, value) => {
    setPricing(prev => ({
      ...prev,
      [envKey]: {
        ...prev[envKey],
        [sku]: {
          ...prev[envKey][sku],
          [field]: parseFloat(value) || 0
        }
      }
    }))
  }

  const handleSubmit = () => {
    navigate('/solution-architect-vetting', {
      state: {
        projectData,
        environments,
        pricing,
        totals: calculateTotals()
      }
    })
  }

  const totals = calculateTotals()

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

  if (!projectData || !matchResults) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project data...</p>
        </div>
      </div>
    )
  }

  const canAct = canUserActOnProject(currentPersona, projectData.status)

  // Merge matched and unmatched for the table
  const allBoqItems = [...(matchResults?.matched || []), ...(matchResults?.unmatched || [])].map(normalizeBoqItem)
  const setAllBoqItems = (newItems) => {
    // Optionally, split back into matched/unmatched if needed for workflow logic
    // For now, just update matchResults in-place for UI
    const matched = newItems.filter(i => i.category !== 'Custom')
    const unmatched = newItems.filter(i => i.category === 'Custom')
    setMatchResults({ ...matchResults, matched, unmatched })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Product Manager Review</h1>
              <p className="text-gray-600">Review and approve custom SKUs with pricing</p>
            </div>
            <PersonaSwitcher onPersonaChange={handlePersonaChange} />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Project Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Project: {projectData.customerName} - {projectData.projectName}
            </CardTitle>
            <CardDescription>
              Deal ID: {projectData.id} | Status: {projectData.status}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Permission Check */}
        {!canAct && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-yellow-800">
              You do not have permission to act on this project in its current status.
            </AlertDescription>
          </Alert>
        )}

        {/* Business Case & Comments */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Business Case & Comments
            </CardTitle>
            <CardDescription>
              Provide business justification and approval comments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Business case evaluation, market analysis, competitive pricing considerations..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="min-h-[120px]"
              disabled={!canAct}
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {canAct && (
          <div className="flex justify-end gap-4">
            <Button 
              variant="outline" 
              onClick={handleReject}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <ThumbsDown className="h-4 w-4" />
              {isSubmitting ? 'Processing...' : 'Reject & Send Back'}
            </Button>
            <Button 
              onClick={handleApprove}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              <ThumbsUp className="h-4 w-4" />
              {isSubmitting ? 'Processing...' : 'Approve Custom SKUs'}
            </Button>
          </div>
        )}

        {!canAct && (
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View Only - Return to Dashboard
            </Button>
          </div>
        )}

        {/* Resource Table */}
        <BoQTable
          items={allBoqItems}
          setItems={setAllBoqItems}
          editable={currentPersona === 'PM' && projectData?.status === 'Pending Product Manager Review'}
          allowCustomSKU={true}
          restrictEditToCustomSkus={(() => { 
            const val = currentPersona === 'PM' && projectData?.status === 'Pending Product Manager Review';
            console.log('[BoQTable] PM restrictEditToCustomSkus:', { currentPersona, status: projectData?.status, restrict: val });
            return val;
          })()}
          highlightNew={newlyAddedIndex}
          onAddResource={handleAddResource}
          onEditResource={handleEditResource}
        />

        {currentPersona === 'PM' && projectData?.status === 'Pending Product Manager Review' && (
          <div className="flex justify-end gap-4 mt-6">
            <Button
              onClick={() => {
                // Update project status and navigate
                const updatedProject = { ...projectData, status: 'Pending Solution Architect Final Review', boqItems: allBoqItems };
                localStorage.setItem('currentProject', JSON.stringify(updatedProject));
                navigate('/solution-architect-vetting', { state: { projectId: updatedProject.id, currentPersona: 'SA', isFinalReview: true } });
              }}
              style={{ background: '#2563eb', color: 'white', fontWeight: 600, fontSize: 16, borderRadius: 8 }}
            >
              Approve & Forward to SA Final Review
            </Button>
          </div>
        )}

        <div className="mt-6">
          <Button onClick={handleSubmit}>Submit for Solution Architect Review</Button>
        </div>
      </div>
    </div>
  )
}

export default ProductManagerReview

