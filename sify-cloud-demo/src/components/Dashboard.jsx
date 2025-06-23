import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
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
import { useInventory } from '@/context/InventoryContext'
import { maxHealthSifyInventory } from '@/utils/mockSifyInventory'
import { maxHealthAwsInventory } from '@/utils/mockAwsInventory'
import { maxHealthGcpInventory } from '@/utils/mockGcpInventory'

const Dashboard = () => {
  const [projects, setProjects] = useState([])
  const [currentPersona, setCurrentPersonaState] = useState(getCurrentPersona())
  const [selectedDemoType, setSelectedDemoType] = useState(FLOW_TYPES.STANDARD)
  const navigate = useNavigate()
  const { setInventory } = useInventory();

  useEffect(() => {
    setCurrentPersona(PERSONAS.ACCOUNT_MANAGER);
    loadProjects()
  }, [])

  const loadProjects = () => {
    const allProjects = getProjects()
    setProjects(allProjects)
  }

  const handlePersonaChange = (persona) => {
    setCurrentPersona(persona)
    setCurrentPersonaState(persona)
    loadProjects() // Reload to update action buttons
  }

  const handleResetDemo = () => {
    if (clearDemoData()) {
      setProjects([])
      window.location.reload()
    }
  }

  const handleNewProject = () => {
    localStorage.setItem('selectedDemoType', selectedDemoType)
    navigate('/new-project');
  }

  const handleViewInventory = (inventoryData, path) => {
    setInventory(inventoryData);
    navigate(path);
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

  const stats = {
    activeProjects: projects.filter(p => p.status !== PROJECT_STATUS.APPROVED).length,
    monthlyRevenue: '₹2.4M',
    avgProcessingTime: '8 min',
    successRate: '99.2%'
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
              <PersonaSwitcher onPersonaChange={handlePersonaChange} currentPersona={currentPersona} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.monthlyRevenue}</div>
              <p className="text-xs text-muted-foreground">+5.2% this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Processing Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgProcessingTime}</div>
              <p className="text-xs text-muted-foreground">-1 min from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successRate}</div>
              <p className="text-xs text-muted-foreground">99%+ is the goal</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Active Projects</CardTitle>
                <CardDescription>
                  Overview of all ongoing projects and their current status.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {projects.length > 0 ? (
                  <ul className="space-y-4">
                    {projects.map(project => (
                      <li key={project.id} className="p-4 border rounded-lg flex justify-between items-center hover:bg-gray-50">
                        <div>
                          <p className="font-semibold text-lg">{project.name} for {project.customerName}</p>
                          <p className="text-sm text-gray-600">
                            Created: {project.createdDate} | Last Update: {project.lastUpdated}
                          </p>
                          <Badge className={`mt-2 ${getStatusColor(project.status)}`}>
                            {project.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {getActionButton(project)}
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/project-details/${project.id}`)}>
                             <Edit className="h-4 w-4 mr-1" /> Details
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                   <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No active projects. Click "Create New Project" to get started.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-1 space-y-6">
             <Card className="col-span-1 md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle>Enterprise Customer View: Max Health</CardTitle>
                <CardDescription>
                  Simulate viewing a large, existing customer's hybrid cloud inventory.
                </CardDescription>
              </CardHeader>
              <CardContent>
                 <p className="text-sm text-gray-600">
                    Max Health uses a hybrid model with a primary data center at Sify (Mumbai), disaster recovery at Sify (Chennai), and specific AI/ML workloads running on AWS and GCP, all interconnected via Sify Cloud Connect.
                 </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => handleViewInventory(maxHealthSifyInventory, '/inventory/sify')}>
                  <Eye className="mr-2 h-4 w-4" /> View Sify Inventory
                </Button>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => handleViewInventory(maxHealthAwsInventory, '/inventory/aws')}>
                    AWS
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleViewInventory(maxHealthGcpInventory, '/inventory/gcp')}>
                    GCP
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

