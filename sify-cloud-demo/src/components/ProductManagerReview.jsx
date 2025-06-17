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
  getNextStatus,
  canUserActOnProject,
  PERSONAS,
  PROJECT_STATUS,
  FLOW_TYPES,
  PRICE_BOOK_SKUS
} from '@/utils/dataModel'
import { CATALOG, VM_OS_OPTIONS, VM_FEATURES, FLOOR_UNIT_PRICES } from './BoQGenerated'
import BoQTable from './BoQTable'

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
function getInternalCode(item) {
  if (item.category === 'Compute' && item.vmConfig) {
    const { vcpu, ram, storage, os, features } = item.vmConfig
    const osTag = os ? `-${os.split('-')[0].toUpperCase()}` : ''
    const featTag = features && features.length ? '-' + features.map(f => f.split('-')[0].toUpperCase()).join('') : ''
    return `CI-${vcpu}C${ram}R${storage}S${osTag}${featTag}`
  }
  if (item.category === 'Storage' && item.storageConfig) {
    const { size, iops, type } = item.storageConfig
    return `ST-${size}G-${type?.toUpperCase() || 'SSD'}-I${iops >= 1000 ? Math.round(iops/1000)+'K' : iops}`
  }
  if (item.category === 'Network' && item.networkConfig) {
    const { bandwidth, staticIp, firewall } = item.networkConfig
    return `NW-${bandwidth}M${staticIp ? '-SIP' : ''}${firewall ? '-FW' : ''}`
  }
  return item.internalCode
}

const ProductManagerReview = () => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const [projectData, setProjectData] = useState(null)
  const [matchResults, setMatchResults] = useState(null)
  const [currentPersona, setCurrentPersona] = useState(getCurrentPersona())
  const [comments, setComments] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [customSkuPricing, setCustomSkuPricing] = useState({})
  const [newlyAddedIndex, setNewlyAddedIndex] = useState(null)

  useEffect(() => {
    initializeComponent()
  }, [location])

  const initializeComponent = () => {
    try {
      const projectId = location.state?.projectId
      
      if (projectId) {
        const project = getProject(projectId)
        if (project) {
          setProjectData(project)
          const matched = project.matchedItems || [];
          const unmatched = project.unmatchedItems || [];
          setMatchResults({ matched, unmatched })
          
          // Initialize custom SKU pricing
          const initialPricing = {}
          project.unmatchedItems?.forEach((item, index) => {
            initialPricing[index] = {
              basePrice: 5000, // Default price
              unit: 'per month',
              leadTime: '2-3 weeks'
            }
          })
          setCustomSkuPricing(initialPricing)
        } else {
          setError('Project not found')
        }
      } else {
        setError('No project ID provided')
      }
    } catch (err) {
      console.error('Error initializing:', err)
      setError('Failed to load project data')
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
          internalCode: item.suggestedInternalCode,
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
  const allBoqItems = [...(matchResults?.matched || []), ...(matchResults?.unmatched || [])]
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
          editable={canAct}
          highlightNew={newlyAddedIndex}
          onAddResource={handleAddResource}
          onEditResource={handleEditResource}
        />
      </div>
    </div>
  )
}

export default ProductManagerReview

