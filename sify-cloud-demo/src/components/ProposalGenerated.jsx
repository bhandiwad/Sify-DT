import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Download, 
  Share, 
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Mail,
  Calendar,
  User
} from 'lucide-react'

const ProposalGenerated = ({ projectData }) => {
  const navigate = useNavigate()
  
  const proposalData = {
    proposalNumber: 'PROP-2024-001234',
    generatedDate: new Date().toLocaleDateString(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    totalCost: 25650,
    setupCost: 5000,
    monthlyCost: 25650,
    annualCost: 307800,
    paymentTerms: '30 days',
    deliveryTimeline: '2-3 weeks post approval'
  }

  const handleEmailProposal = () => {
    alert('Proposal emailed to customer for approval!')
  }

  const handleDownloadPDF = () => {
    alert('Proposal PDF downloaded!')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/boq-generated')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to BoQ
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">📄 Proposal Generated</h1>
                <p className="text-gray-600">Ready for customer approval</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button onClick={handleEmailProposal} className="bg-blue-600 hover:bg-blue-700">
                <Mail className="h-4 w-4 mr-2" />
                Email to Customer
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="text-lg font-semibold text-green-600">Ready to Send</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Proposal #</p>
                  <p className="text-lg font-semibold text-blue-600">{proposalData.proposalNumber}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Valid Until</p>
                  <p className="text-lg font-semibold text-purple-600">{proposalData.validUntil}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Monthly Cost</p>
                  <p className="text-lg font-semibold text-green-600">₹{proposalData.monthlyCost.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Proposal Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>📋 Proposal Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Company:</span>
                    <span className="font-medium">{projectData?.customerName || 'Edgecut Technologies'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Project:</span>
                    <span className="font-medium">{projectData?.projectName || 'Web Application Infrastructure'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contact:</span>
                    <span className="font-medium">{projectData?.contactEmail || 'gomathi.s@edgecut.com'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Timeline:</span>
                    <Badge variant="outline" className="capitalize">
                      {projectData?.timeline || 'urgent'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Proposal Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Generated:</span>
                    <span className="font-medium">{proposalData.generatedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valid Until:</span>
                    <span className="font-medium">{proposalData.validUntil}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Terms:</span>
                    <span className="font-medium">{proposalData.paymentTerms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery:</span>
                    <span className="font-medium">{proposalData.deliveryTimeline}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Infrastructure Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>🏗️ Infrastructure Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">4</div>
                <div className="text-sm text-gray-600">Virtual Machines</div>
                <div className="text-xs text-gray-500">3 App + 1 DB</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">20</div>
                <div className="text-sm text-gray-600">Total vCPUs</div>
                <div className="text-xs text-gray-500">High Performance</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">40</div>
                <div className="text-sm text-gray-600">Total RAM (GB)</div>
                <div className="text-xs text-gray-500">Optimized Config</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Breakdown */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>💰 Pricing Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Monthly Costs</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Virtual Machines:</span>
                      <span>₹25,600</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Network & Security:</span>
                      <span>₹2,300</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Storage & Backup:</span>
                      <span>₹600</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>₹28,500</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Volume Discount (10%):</span>
                      <span>-₹2,850</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Monthly Total:</span>
                      <span>₹{proposalData.monthlyCost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Investment Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Setup Cost (One-time):</span>
                      <span>₹{proposalData.setupCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Annual Cost:</span>
                      <span>₹{proposalData.annualCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">3-Year Total:</span>
                      <span>₹{(proposalData.annualCost * 3 + proposalData.setupCost).toLocaleString()}</span>
                    </div>
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="text-sm text-green-800">
                        <strong>Cost Savings:</strong> 35% less than on-premise infrastructure
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>🚀 Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-lg font-semibold text-blue-600 mb-2">1. Customer Review</div>
                <div className="text-sm text-gray-600">Customer reviews and approves the proposal</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-lg font-semibold text-green-600 mb-2">2. Contract Signing</div>
                <div className="text-sm text-gray-600">Finalize terms and sign service agreement</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-lg font-semibold text-purple-600 mb-2">3. Infrastructure Deployment</div>
                <div className="text-sm text-gray-600">Deploy and configure infrastructure (2-3 weeks)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between">
          <div className="space-x-3">
            <Button variant="outline" onClick={() => navigate('/boq-generated')}>
              ← Back to BoQ
            </Button>
            <Button variant="outline">
              📋 Create Follow-up Task
            </Button>
          </div>
          <div className="space-x-3">
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button onClick={handleEmailProposal} className="bg-blue-600 hover:bg-blue-700">
              <Mail className="h-4 w-4 mr-2" />
              Email to Customer
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProposalGenerated

