import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ArrowLeft, Building2, User, Mail, Phone, Calendar, FileSpreadsheet, AlertCircle } from 'lucide-react'
import PersonaSwitcher from './PersonaSwitcher'
import { 
  addProject, 
  getCurrentPersona,
  FLOW_TYPES,
  PROJECT_STATUS,
  CONTRACT_TERMS,
  getContractLabel 
} from '@/utils/dataModel'

const NewProject = ({ onProjectCreate }) => {
  const [formData, setFormData] = useState({
    customerName: 'Acme Technologies',
    projectName: 'Web Application Infrastructure',
    contactEmail: 'suresh@acme.com',
    phone: '+91 9876543210',
    projectType: 'New Infrastructure',
    timeline: 'Normal (2-4 weeks)',
    requirementsSource: 'Upload Template',
    contractTerm: CONTRACT_TERMS.ANNUAL,
    flowType: FLOW_TYPES.STANDARD
  })
  
  const [currentPersona, setCurrentPersona] = useState(getCurrentPersona())
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Get selected demo type from localStorage
    const selectedDemoType = localStorage.getItem('selectedDemoType') || FLOW_TYPES.STANDARD
    setFormData(prev => ({
      ...prev,
      flowType: selectedDemoType
    }))
  }, [])

  const handlePersonaChange = (persona) => {
    setCurrentPersona(persona)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required'
    }
    
    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Project name is required'
    }
    
    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Contact email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    // Call the handler from App.jsx to set project details
    onProjectCreate(formData);

    // Navigate to the appropriate page
    if (formData.requirementsSource === 'Interactive Entry') {
      navigate('/manual');
    } else {
      navigate('/upload');
    }
  }

  const handleCancel = () => {
    // This should likely reset the state in App.jsx as well
    navigate('/dashboard')
  }

  const getDemoTypeInfo = () => {
    if (formData.flowType === FLOW_TYPES.STANDARD) {
      return {
        title: 'Standard Infrastructure Demo',
        description: 'All services will match existing SKUs → Fast track processing',
        badge: 'Fast Track',
        color: 'bg-green-50 border-green-200 text-green-800',
        timeline: '5-10 minutes'
      }
    } else {
      return {
        title: 'Custom SKU Workflow Demo', 
        description: 'Mixed services requiring Solution Architect and Product Manager review',
        badge: 'Full Workflow',
        color: 'bg-blue-50 border-blue-200 text-blue-800',
        timeline: '15-20 minutes'
      }
    }
  }

  const demoInfo = getDemoTypeInfo()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={handleCancel}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
            </div>
            <PersonaSwitcher onPersonaChange={handlePersonaChange} />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Demo Type Indicator */}
        <Alert className={`mb-6 ${demoInfo.color}`}>
          <FileSpreadsheet className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>{demoInfo.title}</strong> - {demoInfo.description}
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-white/20">{demoInfo.badge}</Badge>
                <span className="text-sm">Expected: {demoInfo.timeline}</span>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
            <CardDescription>
              Enter the basic details for your new cloud infrastructure project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer and Project Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="customerName"
                      placeholder="Enter customer name"
                      value={formData.customerName}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                      className={`pl-10 ${errors.customerName ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.customerName && (
                    <p className="text-sm text-red-600">{errors.customerName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name *</Label>
                  <div className="relative">
                    <FileSpreadsheet className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="projectName"
                      placeholder="Enter project name"
                      value={formData.projectName}
                      onChange={(e) => handleInputChange('projectName', e.target.value)}
                      className={`pl-10 ${errors.projectName ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.projectName && (
                    <p className="text-sm text-red-600">{errors.projectName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="Enter contact email"
                      value={formData.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                      className={`pl-10 ${errors.contactEmail ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.contactEmail && (
                    <p className="text-sm text-red-600">{errors.contactEmail}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Contract Terms */}
              <div className="space-y-3">
                <Label>Contract Terms</Label>
                <RadioGroup 
                  value={formData.contractTerm} 
                  onValueChange={(value) => handleInputChange('contractTerm', value)}
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                  {Object.values(CONTRACT_TERMS).map((term) => (
                    <div key={term} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50">
                      <RadioGroupItem value={term} id={term} />
                      <Label htmlFor={term} className="cursor-pointer text-sm">
                        {getContractLabel(term)}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Project Type */}
              <div className="space-y-3">
                <Label>Project Type</Label>
                <RadioGroup 
                  value={formData.projectType} 
                  onValueChange={(value) => handleInputChange('projectType', value)}
                  className="flex flex-wrap gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="New Infrastructure" id="new-infra" />
                    <Label htmlFor="new-infra">New Infrastructure</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Migration Project" id="migration" />
                    <Label htmlFor="migration">Migration Project</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Infrastructure Expansion" id="expansion" />
                    <Label htmlFor="expansion">Infrastructure Expansion</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Timeline */}
              <div className="space-y-3">
                <Label>Timeline</Label>
                <RadioGroup 
                  value={formData.timeline} 
                  onValueChange={(value) => handleInputChange('timeline', value)}
                  className="flex flex-wrap gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Urgent (Within 2 weeks)" id="urgent" />
                    <Label htmlFor="urgent">Urgent (Within 2 weeks)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Normal (2-4 weeks)" id="normal" />
                    <Label htmlFor="normal">Normal (2-4 weeks)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Flexible (1-2 months)" id="flexible" />
                    <Label htmlFor="flexible">Flexible (1-2 months)</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Requirements Source */}
              <div className="space-y-3">
                <Label>Requirements Source</Label>
                <RadioGroup 
                  value={formData.requirementsSource} 
                  onValueChange={(value) => handleInputChange('requirementsSource', value)}
                  className="flex flex-wrap gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Upload Template" id="excel" />
                    <Label htmlFor="excel">Upload Template</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Interactive Entry" id="manual" />
                    <Label htmlFor="manual">Interactive Entry</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Error Display */}
              {errors.submit && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-800">
                    {errors.submit}
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Next: Upload Requirements
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default NewProject

