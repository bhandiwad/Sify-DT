import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft, 
  Building2, 
  Calendar, 
  DollarSign, 
  User, 
  Mail, 
  Phone,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertCircle,
  Play,
  Eye
} from 'lucide-react'
import PersonaSwitcher from './PersonaSwitcher'
import { 
  getProject, 
  updateProject, 
  getCurrentPersona, 
  canUserActOnProject,
  getNextStatus,
  getStatusColor,
  PROJECT_STATUS,
  PERSONAS
} from '@/utils/dataModel'

const ProjectDetails = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [currentPersona, setCurrentPersona] = useState(getCurrentPersona())
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProject()
  }, [projectId])

  const loadProject = () => {
    try {
      if (!projectId) {
        setError('No project ID provided')
        setLoading(false)
        return
      }

      const projectData = getProject(projectId)
      if (!projectData) {
        setError('Project not found')
        setLoading(false)
        return
      }

      setProject(projectData)
      setLoading(false)
    } catch (err) {
      console.error('Error loading project:', err)
      setError('Failed to load project data')
      setLoading(false)
    }
  }

  const handlePersonaChange = (persona) => {
    setCurrentPersona(persona)
  }

  const handleBackToDashboard = () => {
    navigate('/dashboard')
  }

  const handleTakeAction = () => {
    if (!project || !canUserActOnProject(currentPersona, project.status)) {
      return
    }

    try {
      // Navigate based on current status and persona
      switch (project.status) {
        case PROJECT_STATUS.DRAFT:
          // Account Manager can continue to Excel upload
          navigate('/excel-upload', { state: { projectId: project.id } })
          break
        case PROJECT_STATUS.PENDING_PM_REVIEW:
          navigate('/product-manager-review', { state: { projectId: project.id } })
          break
        case PROJECT_STATUS.PENDING_SA_REVIEW:
          navigate('/solution-architect-vetting', { state: { projectId: project.id } })
          break
        case PROJECT_STATUS.PENDING_FINANCE_APPROVAL:
          navigate('/boq-generated', { state: { projectId: project.id } })
          break
        default:
          // For approved projects, just view
          break
      }
    } catch (err) {
      console.error('Error navigating:', err)
      setError('Failed to navigate to next step')
    }
  }

  const getActionButton = () => {
    if (!project) return null

    const canAct = canUserActOnProject(currentPersona, project.status)
    
    if (!canAct) {
      return (
        <Button variant="outline" disabled className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          View Only
        </Button>
      )
    }

    const actionText = {
      [PROJECT_STATUS.DRAFT]: 'Continue Setup',
      [PROJECT_STATUS.PENDING_PM_REVIEW]: 'Review Custom SKUs',
      [PROJECT_STATUS.PENDING_SA_REVIEW]: 'Vet Solution',
      [PROJECT_STATUS.PENDING_FINANCE_APPROVAL]: 'Approve Pricing'
    }

    if (project.status === PROJECT_STATUS.APPROVED) {
      return (
        <Button variant="outline" className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          Completed
        </Button>
      )
    }

    return (
      <Button 
        onClick={handleTakeAction}
        className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
      >
        <Play className="h-4 w-4" />
        {actionText[project.status] || 'Take Action'}
      </Button>
    )
  }

  const getStatusDescription = (status) => {
    const descriptions = {
      [PROJECT_STATUS.DRAFT]: 'Project created, ready for requirements upload',
      [PROJECT_STATUS.PENDING_PM_REVIEW]: 'Waiting for Product Manager to review custom SKUs',
      [PROJECT_STATUS.PENDING_SA_REVIEW]: 'Waiting for Solution Architect to vet the solution',
      [PROJECT_STATUS.PENDING_FINANCE_APPROVAL]: 'Waiting for Finance Admin to approve pricing',
      [PROJECT_STATUS.APPROVED]: 'Project approved and ready for deployment'
    }
    return descriptions[status] || 'Unknown status'
  }

  const getNextStepInfo = () => {
    if (!project) return null

    const nextSteps = {
      [PROJECT_STATUS.DRAFT]: {
        persona: PERSONAS.ACCOUNT_MANAGER,
        action: 'Upload requirements and match SKUs'
      },
      [PROJECT_STATUS.PENDING_PM_REVIEW]: {
        persona: PERSONAS.PRODUCT_MANAGER,
        action: 'Review and approve custom SKUs'
      },
      [PROJECT_STATUS.PENDING_SA_REVIEW]: {
        persona: PERSONAS.SOLUTION_ARCHITECT,
        action: 'Vet solution architecture and approve'
      },
      [PROJECT_STATUS.PENDING_FINANCE_APPROVAL]: {
        persona: PERSONAS.FINANCE_ADMIN,
        action: 'Review and approve pricing'
      }
    }

    return nextSteps[project.status]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
    )
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
            <Button onClick={handleBackToDashboard} className="w-full">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Project Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">The requested project could not be found.</p>
            <Button onClick={handleBackToDashboard} className="w-full">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const nextStep = getNextStepInfo()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={handleBackToDashboard}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Project Details</h1>
            </div>
            <PersonaSwitcher onPersonaChange={handlePersonaChange} />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Project Overview */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {project.customerName}
                </CardTitle>
                <CardDescription>{project.projectName}</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
                {getActionButton()}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Contact Information</Label>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {project.contactEmail}
                  </div>
                  {project.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      {project.phone}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Project Details</Label>
                <div className="space-y-1">
                  <div className="text-sm">
                    <span className="text-gray-500">Type:</span> {project.projectType}
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Timeline:</span> {project.timeline}
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Flow:</span> {project.flowType === 'standard' ? 'Standard' : 'Custom'}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Timeline</Label>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    Created: {new Date(project.createdDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    Modified: {new Date(project.lastModified).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className={getStatusColor(project.status)} variant="outline">
                  {project.status}
                </Badge>
                <span className="text-gray-600">{getStatusDescription(project.status)}</span>
              </div>

              {nextStep && (
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p><strong>Next Step:</strong> {nextStep.action}</p>
                      <p><strong>Assigned to:</strong> {nextStep.persona}</p>
                      {currentPersona === nextStep.persona && (
                        <p className="text-blue-700 font-medium">You can take action on this project</p>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Project Data Summary */}
        {(project.matchedItems?.length > 0 || project.unmatchedItems?.length > 0) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Requirements Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{project.matchedItems?.length || 0}</div>
                  <div className="text-sm text-green-700">Matched SKUs</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{project.unmatchedItems?.length || 0}</div>
                  <div className="text-sm text-orange-700">Custom SKUs</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {project.totals?.total ? `₹${project.totals.total.toLocaleString()}` : 'TBD'}
                  </div>
                  <div className="text-sm text-blue-700">Estimated Value</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comments/History */}
        {project.comments?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Project History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {project.comments.map((comment, index) => (
                  <div key={index} className="border-l-2 border-gray-200 pl-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <User className="h-4 w-4" />
                      {comment.author} • {new Date(comment.timestamp).toLocaleString()}
                    </div>
                    <p className="text-gray-700 mt-1">{comment.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Helper component for labels
const Label = ({ children, className = "" }) => (
  <label className={`block text-sm font-medium text-gray-700 ${className}`}>
    {children}
  </label>
)

export default ProjectDetails

