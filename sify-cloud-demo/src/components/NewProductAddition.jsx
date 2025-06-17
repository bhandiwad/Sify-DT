import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowLeft, 
  Plus, 
  Upload, 
  FileText, 
  Users, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Send,
  Eye,
  MessageSquare
} from 'lucide-react'

const NewProductAddition = () => {
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    description: '',
    businessJustification: '',
    targetMarket: '',
    estimatedDemand: '',
    competitorAnalysis: '',
    technicalRequirements: '',
    pricingModel: '',
    estimatedPrice: '',
    implementationTimeline: '',
    resourceRequirements: '',
    riskAssessment: '',
    requestedBy: 'Rajesh Kumar',
    customerName: 'Edgecut Technologies',
    urgency: 'high'
  })
  
  const [attachments, setAttachments] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const productCategories = [
    'Virtual Desktop Infrastructure (VDI)',
    'Database as a Service (DBaaS)',
    'Container Platform',
    'AI/ML Platform',
    'IoT Platform',
    'Blockchain Services',
    'Edge Computing',
    'Disaster Recovery',
    'Security Services',
    'Analytics Platform',
    'Other'
  ]

  const pricingModels = [
    'Per User/Month',
    'Per Instance/Hour',
    'Per GB/Month',
    'Per Transaction',
    'Flat Rate/Month',
    'Usage-based',
    'Tiered Pricing',
    'Custom Enterprise'
  ]

  const urgencyLevels = [
    { value: 'low', label: 'Low - Nice to have', color: 'bg-gray-100 text-gray-800' },
    { value: 'medium', label: 'Medium - Business need', color: 'bg-blue-100 text-blue-800' },
    { value: 'high', label: 'High - Customer waiting', color: 'bg-orange-100 text-orange-800' },
    { value: 'critical', label: 'Critical - Deal at risk', color: 'bg-red-100 text-red-800' }
  ]

  const approvalWorkflow = [
    {
      step: 1,
      role: 'Product Manager',
      action: 'Initial Review & Feasibility',
      sla: '2 business days',
      status: 'pending',
      description: 'Review product request for market fit and technical feasibility'
    },
    {
      step: 2,
      role: 'Technical Architect',
      action: 'Technical Assessment',
      sla: '3 business days',
      status: 'pending',
      description: 'Evaluate technical requirements and implementation complexity'
    },
    {
      step: 3,
      role: 'Finance Team',
      action: 'Business Case Review',
      sla: '2 business days',
      status: 'pending',
      description: 'Assess financial viability and pricing strategy'
    },
    {
      step: 4,
      role: 'BU Head',
      action: 'Final Approval',
      sla: '1 business day',
      status: 'pending',
      description: 'Strategic approval and resource allocation'
    }
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files)
    setAttachments(prev => [...prev, ...files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type
    }))])
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false)
      navigate('/product-request-submitted')
    }, 2000)
  }

  const isFormValid = formData.productName && formData.category && formData.description && 
                     formData.businessJustification && formData.pricingModel

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">➕ New Product Request</h1>
                <p className="text-gray-600">Request addition of new service to Sify Cloud catalog</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Plus className="h-4 w-4 mr-1" />
              Product Addition
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>📋 Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Product/Service Name *</Label>
                    <Input
                      placeholder="e.g., VDI as a Service"
                      value={formData.productName}
                      onChange={(e) => handleInputChange('productName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {productCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Product Description *</Label>
                  <Textarea
                    placeholder="Describe the product/service, its features, and capabilities..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Requested By</Label>
                    <Input
                      value={formData.requestedBy}
                      onChange={(e) => handleInputChange('requestedBy', e.target.value)}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Customer Name</Label>
                    <Input
                      value={formData.customerName}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Case */}
            <Card>
              <CardHeader>
                <CardTitle>💼 Business Case</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Business Justification *</Label>
                  <Textarea
                    placeholder="Why is this product needed? What business problem does it solve?"
                    value={formData.businessJustification}
                    onChange={(e) => handleInputChange('businessJustification', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Target Market</Label>
                    <Input
                      placeholder="e.g., SMBs, Enterprises, Specific industries"
                      value={formData.targetMarket}
                      onChange={(e) => handleInputChange('targetMarket', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Estimated Demand</Label>
                    <Input
                      placeholder="e.g., 50 customers in first year"
                      value={formData.estimatedDemand}
                      onChange={(e) => handleInputChange('estimatedDemand', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Competitor Analysis</Label>
                  <Textarea
                    placeholder="How do competitors offer this service? What's our differentiation?"
                    value={formData.competitorAnalysis}
                    onChange={(e) => handleInputChange('competitorAnalysis', e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Technical Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>⚙️ Technical Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Technical Requirements</Label>
                  <Textarea
                    placeholder="Infrastructure, software, integrations, compliance requirements..."
                    value={formData.technicalRequirements}
                    onChange={(e) => handleInputChange('technicalRequirements', e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Implementation Timeline</Label>
                    <Input
                      placeholder="e.g., 3-6 months"
                      value={formData.implementationTimeline}
                      onChange={(e) => handleInputChange('implementationTimeline', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Resource Requirements</Label>
                    <Input
                      placeholder="e.g., 2 developers, 1 architect"
                      value={formData.resourceRequirements}
                      onChange={(e) => handleInputChange('resourceRequirements', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Risk Assessment</Label>
                  <Textarea
                    placeholder="Technical risks, market risks, implementation challenges..."
                    value={formData.riskAssessment}
                    onChange={(e) => handleInputChange('riskAssessment', e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing Strategy */}
            <Card>
              <CardHeader>
                <CardTitle>💰 Pricing Strategy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pricing Model *</Label>
                    <Select value={formData.pricingModel} onValueChange={(value) => handleInputChange('pricingModel', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pricing model" />
                      </SelectTrigger>
                      <SelectContent>
                        {pricingModels.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Estimated Price Range</Label>
                    <Input
                      placeholder="e.g., ₹2000-5000/user/month"
                      value={formData.estimatedPrice}
                      onChange={(e) => handleInputChange('estimatedPrice', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attachments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Supporting Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Upload RFPs, technical specs, market research, or other supporting documents
                    </p>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button variant="outline" onClick={() => document.getElementById('file-upload').click()}>
                      Choose Files
                    </Button>
                  </div>

                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Uploaded Files:</h4>
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-sm">{file.name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {(file.size / 1024 / 1024).toFixed(1)} MB
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Request Priority */}
            <Card>
              <CardHeader>
                <CardTitle>🚨 Request Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {urgencyLevels.map((level) => (
                    <Card 
                      key={level.value}
                      className={`cursor-pointer transition-colors ${
                        formData.urgency === level.value 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleInputChange('urgency', level.value)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{level.label}</span>
                          <Badge className={level.color}>
                            {level.value.toUpperCase()}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Approval Workflow */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Approval Workflow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {approvalWorkflow.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step.status === 'completed' ? 'bg-green-600' :
                          step.status === 'in-progress' ? 'bg-blue-600' :
                          'bg-gray-400'
                        }`}>
                          {step.status === 'completed' ? (
                            <CheckCircle className="h-4 w-4 text-white" />
                          ) : step.status === 'in-progress' ? (
                            <Clock className="h-4 w-4 text-white" />
                          ) : (
                            <span className="text-white text-xs font-bold">{step.step}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900">{step.role}</h4>
                        <p className="text-xs text-gray-600">{step.action}</p>
                        <p className="text-xs text-gray-500">SLA: {step.sla}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Estimated Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Estimated Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Approval Process:</span>
                    <span className="font-medium">5-8 business days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Development:</span>
                    <span className="font-medium">3-6 months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Testing & Launch:</span>
                    <span className="font-medium">1-2 months</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-900 font-medium">Total Timeline:</span>
                    <span className="font-bold">4-8 months</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button 
              onClick={handleSubmit}
              disabled={!isFormValid || submitting}
              className="w-full"
              size="lg"
            >
              {submitting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Product Request
                </>
              )}
            </Button>

            {!isFormValid && (
              <div className="text-xs text-gray-500 text-center">
                Please fill in all required fields (marked with *)
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewProductAddition

