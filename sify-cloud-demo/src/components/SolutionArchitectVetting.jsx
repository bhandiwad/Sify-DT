import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
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
  ThumbsDown
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
  FLOW_TYPES
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

const SolutionArchitectVetting = () => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const [projectData, setProjectData] = useState(null)
  const [matchResults, setMatchResults] = useState(null)
  const [currentPersona, setCurrentPersona] = useState(getCurrentPersona())
  const [comments, setComments] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [isFinalReview, setIsFinalReview] = useState(false)
  const [boqItems, setBoqItems] = useState([])
  const [newlyAddedIndex, setNewlyAddedIndex] = useState(null)

  useEffect(() => {
    initializeComponent()
  }, [location])

  const initializeComponent = () => {
    try {
      const projectId = location.state?.projectId
      const isFinal = location.state?.isFinalReview || false
      setIsFinalReview(isFinal)
      if (projectId) {
        const project = getProject(projectId)
        if (project) {
          setProjectData(project)
          const matched = project.matchedItems || [];
          const unmatched = project.unmatchedItems || [];
          setMatchResults({ matched, unmatched })
          setBoqItems([...matched, ...unmatched])
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

  const handleApprove = async () => {
    if (!canUserActOnProject(currentPersona, projectData.status)) {
      setError('You do not have permission to perform this action')
      return
    }

    setIsSubmitting(true)
    try {
      let nextStatus
      
      if (isFinalReview) {
        // Final SA review - move to Finance
        nextStatus = PROJECT_STATUS.PENDING_FINANCE_APPROVAL
      } else {
        // Initial SA review - move to Product Manager
        nextStatus = PROJECT_STATUS.PENDING_PM_REVIEW
      }

      const updatedProject = updateProject(projectData.id, {
        status: nextStatus,
        comments: [...(projectData.comments || []), {
          author: currentPersona,
          text: comments || `Solution Architect ${isFinalReview ? 'final ' : ''}approval completed`,
          timestamp: new Date().toISOString(),
          type: 'approval'
        }],
        approvals: {
          ...projectData.approvals,
          [isFinalReview ? 'saFinal' : 'saInitial']: {
            approved: true,
            approver: currentPersona,
            timestamp: new Date().toISOString(),
            comments: comments
          }
        }
      })

      // Navigate based on next status
      if (nextStatus === PROJECT_STATUS.PENDING_PM_REVIEW) {
        navigate('/product-manager-review', { 
          state: { 
            projectId: updatedProject.id,
            fromSA: true
          } 
        })
      } else {
        navigate('/boq-generated', { 
          state: { 
            projectId: updatedProject.id
          } 
        })
      }
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
          [isFinalReview ? 'saFinal' : 'saInitial']: {
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

  const handleAddResource = (item) => {
    setBoqItems([...boqItems, item])
    setNewlyAddedIndex(boqItems.length)
  }

  const handleEditResource = (index, updatedItem) => {
    const newItems = [...boqItems]
    newItems[index] = updatedItem
    setBoqItems(newItems)
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Solution Architect {isFinalReview ? 'Final ' : ''}Review
              </h1>
              <p className="text-gray-600">
                {isFinalReview 
                  ? 'Final technical validation after Product Manager approval'
                  : 'Technical architecture review and validation'
                }
              </p>
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

        {/* Technical Assessment */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Technical Assessment & Comments
            </CardTitle>
            <CardDescription>
              {isFinalReview 
                ? 'Provide final technical validation and approval'
                : 'Provide technical review and recommendations'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder={isFinalReview 
                ? "Final technical validation comments..."
                : "Technical assessment, architecture recommendations, and any concerns..."
              }
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
              {isSubmitting ? 'Processing...' : (isFinalReview ? 'Final Approve' : 'Approve & Forward to PM')}
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

        {/* Unified BoQ Table for all items */}
        <BoQTable
          items={boqItems}
          setItems={setBoqItems}
          editable={canAct}
          highlightNew={newlyAddedIndex}
          onAddResource={handleAddResource}
          onEditResource={handleEditResource}
        />
      </div>
    </div>
  )
}

export default SolutionArchitectVetting

