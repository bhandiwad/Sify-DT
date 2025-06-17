import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  Loader2,
  Server,
  Network,
  Shield,
  Database,
  Monitor,
  ExternalLink
} from 'lucide-react'

const DeploymentFlow = ({ projectData }) => {
  const navigate = useNavigate()
  const [deploymentStage, setDeploymentStage] = useState('review') // review, deploying, completed
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [deploymentTime, setDeploymentTime] = useState(0)

  const deploymentSteps = [
    { 
      id: 1, 
      title: 'Network Infrastructure', 
      description: 'Creating VPC and security groups',
      duration: 3000,
      icon: Network
    },
    { 
      id: 2, 
      title: 'Security Configuration', 
      description: 'Setting up firewall and access controls',
      duration: 2000,
      icon: Shield
    },
    { 
      id: 3, 
      title: 'Virtual Machines', 
      description: 'Provisioning and configuring VMs',
      duration: 4000,
      icon: Server
    },
    { 
      id: 4, 
      title: 'Database Setup', 
      description: 'Installing and configuring database',
      duration: 3000,
      icon: Database
    },
    { 
      id: 5, 
      title: 'Load Balancer', 
      description: 'Configuring load balancer and SSL',
      duration: 2000,
      icon: Network
    },
    { 
      id: 6, 
      title: 'Final Configuration', 
      description: 'Running health checks and tests',
      duration: 2000,
      icon: CheckCircle
    }
  ]

  const resources = [
    { name: 'App-Server-01', status: 'pending', ip: '10.0.0.10' },
    { name: 'App-Server-02', status: 'pending', ip: '10.0.0.11' },
    { name: 'App-Server-03', status: 'pending', ip: '10.0.0.12' },
    { name: 'DB-Server-01', status: 'pending', ip: '10.0.0.20' },
    { name: 'Load Balancer', status: 'pending', ip: '203.0.113.10' },
    { name: 'Firewall', status: 'pending', ip: 'N/A' }
  ]

  const [resourceStatus, setResourceStatus] = useState(resources)

  useEffect(() => {
    if (deploymentStage === 'deploying') {
      let totalDuration = 0
      let currentDuration = 0

      // Start deployment timer
      const timer = setInterval(() => {
        setDeploymentTime(prev => prev + 1)
      }, 1000)

      deploymentSteps.forEach((step, index) => {
        totalDuration += step.duration
        setTimeout(() => {
          setCurrentStep(index + 1)
          currentDuration += step.duration
          setProgress((currentDuration / totalDuration) * 100)
          
          // Update resource status based on step
          if (index === 2) { // VMs step
            setResourceStatus(prev => prev.map((resource, i) => 
              i < 4 ? { ...resource, status: 'running' } : resource
            ))
          } else if (index === 4) { // Load balancer step
            setResourceStatus(prev => prev.map((resource, i) => 
              i === 4 || i === 5 ? { ...resource, status: 'running' } : resource
            ))
          }
        }, currentDuration)
      })

      // Complete deployment
      setTimeout(() => {
        setDeploymentStage('completed')
        clearInterval(timer)
      }, totalDuration + 500)

      return () => clearInterval(timer)
    }
  }, [deploymentStage])

  const handleDeploy = () => {
    setDeploymentStage('deploying')
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (deploymentStage === 'review') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-6">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/boq-generated')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to BoQ
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">🚀 Deploy Infrastructure</h1>
                <p className="text-gray-600">Review and deploy your cloud infrastructure</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Deployment Summary */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>📋 Deployment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">🖥️ Virtual Machines</h3>
                  <div className="space-y-2 text-sm">
                    <div>• 3x App Servers (4 vCPU, 8GB RAM each)</div>
                    <div>• 1x Database Server (8 vCPU, 16GB RAM)</div>
                    <div>• Windows Server 2022 + SQL Server</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">🌐 Network & Security</h3>
                  <div className="space-y-2 text-sm">
                    <div>• Load Balancer with SSL termination</div>
                    <div>• Enterprise Firewall with custom rules</div>
                    <div>• Private network (10.0.0.0/24)</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">🔒 Security & Compliance</h3>
                  <div className="space-y-2 text-sm">
                    <div>• Antivirus on all servers</div>
                    <div>• Daily automated backups</div>
                    <div>• SSL certificate for HTTPS</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900">💰 Total Monthly Cost</h4>
                    <p className="text-2xl font-bold text-blue-600">₹26,010</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-blue-700">🕐 Estimated Deployment Time</p>
                    <p className="text-lg font-semibold text-blue-600">15-20 minutes</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deployment Options */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>⚙️ Deployment Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 border border-blue-200 bg-blue-50 rounded-lg">
                  <input type="radio" id="deploy-now" name="deployment" defaultChecked />
                  <div>
                    <label htmlFor="deploy-now" className="font-medium text-blue-900">
                      🚀 Deploy Now
                    </label>
                    <p className="text-sm text-blue-700">Start provisioning immediately</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg opacity-50">
                  <input type="radio" id="schedule" name="deployment" disabled />
                  <div>
                    <label htmlFor="schedule" className="font-medium text-gray-500">
                      📅 Schedule Deployment
                    </label>
                    <p className="text-sm text-gray-400">Deploy at a specific date/time</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>📧 Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Email Updates</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Deployment started</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Deployment completed</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Monthly billing summary</span>
                    </label>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">SMS Alerts</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Critical system alerts</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" />
                      <span className="text-sm">Maintenance notifications</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Additional Recipients</label>
                <input 
                  type="email" 
                  placeholder="gomathi.s@edgecut.com"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  defaultValue="gomathi.s@edgecut.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => navigate('/vm-configuration')}>
              📝 Save as Draft
            </Button>
            <Button onClick={handleDeploy} className="bg-green-600 hover:bg-green-700 text-lg px-8 py-3">
              🚀 Deploy Infrastructure
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (deploymentStage === 'deploying') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">🚀 Deployment in Progress</h1>
                <p className="text-gray-600">
                  Started: {new Date().toLocaleString()} • Elapsed: {formatTime(deploymentTime)}
                </p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deploying...
              </Badge>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Overall Progress */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Overall Progress</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="mb-4" />
              <p className="text-sm text-gray-600">
                Estimated {Math.round((16 * (100 - progress)) / 100)} minutes remaining
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Deployment Steps */}
            <Card>
              <CardHeader>
                <CardTitle>🔄 Deployment Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deploymentSteps.map((step, index) => {
                    const isCompleted = currentStep > index + 1
                    const isCurrent = currentStep === index + 1
                    const StepIcon = step.icon

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
                        <div className="flex-shrink-0">
                          <StepIcon className={`h-5 w-5 ${
                            isCompleted ? 'text-green-600' : 
                            isCurrent ? 'text-blue-600' : 
                            'text-gray-400'
                          }`} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Resource Status */}
            <Card>
              <CardHeader>
                <CardTitle>📊 Live Resource Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {resourceStatus.map((resource, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {resource.name.includes('Server') ? (
                          <Server className="h-5 w-5 text-blue-600" />
                        ) : resource.name.includes('Load') ? (
                          <Network className="h-5 w-5 text-purple-600" />
                        ) : (
                          <Shield className="h-5 w-5 text-green-600" />
                        )}
                        <div>
                          <p className="font-medium">{resource.name}</p>
                          <p className="text-sm text-gray-500">{resource.ip}</p>
                        </div>
                      </div>
                      <Badge className={
                        resource.status === 'running' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }>
                        {resource.status === 'running' ? '✅ Running' : '⏳ Pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Deployment Completed
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-green-600">✅ Deployment Successful!</h1>
              <p className="text-gray-600">
                Completed: {new Date().toLocaleString()} • Total time: {formatTime(deploymentTime)}
              </p>
            </div>
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="h-4 w-4 mr-2" />
              Live
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Infrastructure Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>🌐 Your Infrastructure is Ready</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3">🔗 Public Access</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Load Balancer:</span>
                    <a href="#" className="text-blue-600 hover:underline flex items-center">
                      https://203.0.113.10
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">SSL Certificate:</span>
                    <Badge className="bg-green-100 text-green-800">✅ Active</Badge>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-3">🔐 Access Credentials</h3>
                <div className="space-y-2 text-sm">
                  <div>Admin Username: <code className="bg-gray-100 px-2 py-1 rounded">administrator</code></div>
                  <div className="flex items-center space-x-2">
                    <span>Password:</span>
                    <Button size="sm" variant="outline">Show</Button>
                    <Button size="sm" variant="outline">Reset</Button>
                  </div>
                  <div>
                    <Button size="sm" variant="outline">📥 Download SSH Key</Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>🎯 Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                <Monitor className="h-6 w-6 mb-2 text-blue-600" />
                <span className="font-medium">Setup Monitoring</span>
                <span className="text-sm text-gray-600">Configure alerts & dashboards</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                <Server className="h-6 w-6 mb-2 text-green-600" />
                <span className="font-medium">Deploy Applications</span>
                <span className="text-sm text-gray-600">Upload and configure your apps</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                <Database className="h-6 w-6 mb-2 text-purple-600" />
                <span className="font-medium">Database Setup</span>
                <span className="text-sm text-gray-600">Create databases and users</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Billing Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>💳 Billing Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <h4 className="font-medium text-blue-900">Monthly Billing</h4>
                <p className="text-2xl font-bold text-blue-600">₹26,010</p>
                <p className="text-sm text-blue-700">Billing starts from today</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-700">Invoice will be sent to:</p>
                <p className="font-medium text-blue-900">gomathi.s@edgecut.com</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between">
          <Button onClick={() => navigate('/dashboard')} className="bg-blue-600 hover:bg-blue-700">
            🏠 Go to Dashboard
          </Button>
          <div className="space-x-3">
            <Button variant="outline">📧 Share Success</Button>
            <Button variant="outline">📞 Contact Support</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeploymentFlow

