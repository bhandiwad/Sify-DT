import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { 
  Plus, 
  Building2, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Edit,
  Play,
  RotateCcw,
  Settings,
  Zap,
  Layers
} from 'lucide-react'
import PersonaSwitcher from './PersonaSwitcher'
import { 
  getProjects, 
  clearDemoData, 
  getCurrentPersona, 
  setCurrentPersona,
  canUserActOnProject,
  getStatusColor,
  PROJECT_STATUS,
  PERSONAS,
  FLOW_TYPES
} from '@/utils/dataModel'

const Dashboard = ({ onNewProject }) => {
  const [projects, setProjects] = useState([])
  const [currentPersona, setCurrentPersona] = useState(getCurrentPersona())
  const [selectedDemoType, setSelectedDemoType] = useState(FLOW_TYPES.STANDARD)
  const navigate = useNavigate()

  useEffect(() => {
    setCurrentPersona(PERSONAS.ACCOUNT_MANAGER);
    setCurrentPersona(PERSONAS.ACCOUNT_MANAGER); // set in localStorage
    loadProjects()
  }, [])

  const loadProjects = () => {
    const allProjects = getProjects()
    setProjects(allProjects)
  }

  const handlePersonaChange = (persona) => {
    setCurrentPersona(persona)
    loadProjects() // Reload to update action buttons
  }

  const handleResetDemo = () => {
    if (clearDemoData()) {
      setProjects([])
      // Show success message or reload
      window.location.reload()
    }
  }

  const handleNewProject = () => {
    // Store selected demo type for the new project
    localStorage.setItem('selectedDemoType', selectedDemoType)
    // Call the handler from App.jsx to change the view
    onNewProject();
  }

  const handleProjectAction = (project) => {
    if (!canUserActOnProject(currentPersona, project.status)) {
      return
    }

    // Navigate based on current status and persona
    switch (project.status) {
      case PROJECT_STATUS.DRAFT:
        navigate(`/project-details/${project.id}`)
        break
      case PROJECT_STATUS.PENDING_SA_REVIEW:
        navigate('/solution-architect-vetting', { state: { projectId: project.id } })
        break
      case PROJECT_STATUS.PENDING_PM_REVIEW:
        navigate('/product-manager-review', { state: { projectId: project.id } })
        break
      case PROJECT_STATUS.PENDING_SA_FINAL:
        navigate('/solution-architect-vetting', { state: { projectId: project.id, isFinalReview: true } })
        break
      case PROJECT_STATUS.PENDING_FINANCE_APPROVAL:
        navigate('/boq-generated', { state: { projectId: project.id } })
        break
      default:
        navigate(`/project-details/${project.id}`)
    }
  }

  const getActionButton = (project) => {
    const canAct = canUserActOnProject(currentPersona, project.status)
    
    if (!canAct) {
      return (
        <Button variant="outline" size="sm" disabled>
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
      )
    }

    const actionText = {
      [PROJECT_STATUS.DRAFT]: 'Continue',
      [PROJECT_STATUS.PENDING_SA_REVIEW]: 'Review Architecture',
      [PROJECT_STATUS.PENDING_PM_REVIEW]: 'Review Custom SKUs',
      [PROJECT_STATUS.PENDING_SA_FINAL]: 'Final Review',
      [PROJECT_STATUS.PENDING_FINANCE_APPROVAL]: 'Approve Pricing'
    }

    return (
      <Button 
        size="sm" 
        onClick={() => handleProjectAction(project)}
        className="bg-blue-600 hover:bg-blue-700"
      >
        <Play className="h-4 w-4 mr-1" />
        {actionText[project.status] || 'View'}
      </Button>
    )
  }

  // Mock statistics
  const stats = {
    activeProjects: projects.filter(p => p.status !== PROJECT_STATUS.APPROVED).length,
    monthlyRevenue: '₹2.4M',
    avgProcessingTime: '8 min',
    successRate: '99.2%'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">☁️ Sify Cloud Ordering Platform</h1>
              <p className="text-gray-600">Enterprise cloud infrastructure ordering and management</p>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={handleResetDemo}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Demo
              </Button>
              <PersonaSwitcher onPersonaChange={handlePersonaChange} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Demo Type Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Demo Configuration
            </CardTitle>
            <CardDescription>
              Choose the type of demo workflow for your next project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={selectedDemoType} 
              onValueChange={setSelectedDemoType}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-gray-50">
                <RadioGroupItem value={FLOW_TYPES.STANDARD} id="standard" />
                <div className="flex-1">
                  <Label htmlFor="standard" className="flex items-center gap-2 font-medium cursor-pointer">
                    <Zap className="h-4 w-4 text-green-600" />
                    Standard Infrastructure Demo
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    All services match existing SKUs → Fast track processing (5-10 minutes)
                  </p>
                  <Badge className="mt-2 bg-green-100 text-green-800">Fast Track</Badge>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-gray-50">
                <RadioGroupItem value={FLOW_TYPES.CUSTOM} id="custom" />
                <div className="flex-1">
                  <Label htmlFor="custom" className="flex items-center gap-2 font-medium cursor-pointer">
                    <Layers className="h-4 w-4 text-blue-600" />
                    Custom SKU Workflow Demo
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Mixed services requiring Solution Architect and Product Manager review (15-20 minutes)
                  </p>
                  <Badge className="mt-2 bg-blue-100 text-blue-800">Full Workflow</Badge>
                </div>
              </div>
            </RadioGroup>
            
            <div className="mt-4 flex justify-end">
              <Button 
                onClick={handleNewProject}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create New Project
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeProjects}</div>
              <p className="text-xs text-muted-foreground">+2 this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.monthlyRevenue}</div>
              <p className="text-xs text-muted-foreground">+15% this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Processing Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgProcessingTime}</div>
              <p className="text-xs text-muted-foreground">-65% improvement</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successRate}</div>
              <p className="text-xs text-muted-foreground">+12% this quarter</p>
            </CardContent>
          </Card>
        </div>

        {/* Projects List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              My Customer Projects
            </CardTitle>
            <CardDescription>
              Manage and track your customer projects across different workflow stages
            </CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-600 mb-4">Create your first project to get started with the demo</p>
                <Button onClick={handleNewProject} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Project
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Building2 className="h-5 w-5 text-gray-400" />
                          <h3 className="font-medium text-gray-900">{project.customerName}</h3>
                          <Badge className={getStatusColor(project.status)}>
                            {project.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {project.flowType === FLOW_TYPES.STANDARD ? 'Standard' : 'Custom'} Flow
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{project.projectName}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Created: {new Date(project.createdDate).toLocaleDateString()}
                          </span>
                          {project.totals.total > 0 && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              Estimated: ₹{project.totals.total.toLocaleString()}/month
                            </span>
                          )}
                          {project.contractTerm && (
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {project.contractTerm.replace('_', ' ').toUpperCase()} Contract
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getActionButton(project)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard

