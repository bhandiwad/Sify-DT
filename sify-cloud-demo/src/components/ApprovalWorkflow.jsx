import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  User, 
  DollarSign,
  MessageSquare,
  Send,
  Eye
} from 'lucide-react'
import BoQTable from './BoQTable'

const ApprovalWorkflow = () => {
  const navigate = useNavigate()
  const [comments, setComments] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [discountItems, setDiscountItems] = useState([
    {
      id: 'vm-app-001',
      description: 'Application Server (4 vCPU, 8GB RAM)',
      quantity: 3,
      standardPrice: 4800,
      floorPrice: 4320,
      ceilingPrice: 5280,
      requestedPrice: 4200,
      reason: 'Competitive pricing to match AWS offer',
      status: 'requires_approval',
      exceedsLimit: true
    },
    {
      id: 'vm-db-001',
      description: 'Database Server (8 vCPU, 16GB RAM)',
      quantity: 1,
      standardPrice: 11200,
      floorPrice: 10080,
      ceilingPrice: 12320,
      requestedPrice: 10500,
      reason: 'Long-term customer loyalty discount',
      status: 'auto_approved',
      exceedsLimit: false
    },
    {
      id: 'lb-ssl-001',
      description: 'Load Balancer with SSL',
      quantity: 1,
      standardPrice: 1500,
      floorPrice: 1350,
      ceilingPrice: 1650,
      requestedPrice: 1500,
      reason: 'No discount applied',
      status: 'auto_approved',
      exceedsLimit: false
    }
  ])

  const approvalData = {
    requestId: 'REQ-2024-001',
    customer: 'Edgecut Technologies',
    project: 'Web Application Infrastructure',
    accountManager: 'Rajesh Kumar',
    requestedBy: 'Rajesh Kumar',
    requestDate: '2024-06-13',
    totalValue: '₹28,500/month',
    discountedValue: '₹25,200/month',
    totalDiscount: '₹3,300/month (11.6%)',
    status: 'pending_finance_approval'
  }

  const handleSubmitForApproval = async () => {
    setSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false)
      navigate('/approval-submitted')
    }, 2000)
  }

  const handleViewDetails = (itemId) => {
    // Navigate to detailed view
    console.log('View details for:', itemId)
  }

  const calculateDiscount = (standard, requested) => {
    const discount = standard - requested
    const percentage = ((discount / standard) * 100).toFixed(1)
    return { amount: discount, percentage }
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
                <h1 className="text-2xl font-bold text-gray-900">⚠️ Finance Approval Required</h1>
                <p className="text-gray-600">Discount request exceeds auto-approval limits</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              <Clock className="h-4 w-4 mr-1" />
              Pending Approval
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Request Summary */}
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-900">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Approval Request Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-orange-700">Request ID</p>
                <p className="font-medium text-orange-900">{approvalData.requestId}</p>
              </div>
              <div>
                <p className="text-sm text-orange-700">Customer</p>
                <p className="font-medium text-orange-900">{approvalData.customer}</p>
              </div>
              <div>
                <p className="text-sm text-orange-700">Account Manager</p>
                <p className="font-medium text-orange-900">{approvalData.accountManager}</p>
              </div>
              <div>
                <p className="text-sm text-orange-700">Request Date</p>
                <p className="font-medium text-orange-900">{approvalData.requestDate}</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-orange-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-orange-700">Standard Value</p>
                  <p className="text-lg font-semibold text-orange-900">{approvalData.totalValue}</p>
                </div>
                <div>
                  <p className="text-sm text-orange-700">Discounted Value</p>
                  <p className="text-lg font-semibold text-green-700">{approvalData.discountedValue}</p>
                </div>
                <div>
                  <p className="text-sm text-orange-700">Total Discount</p>
                  <p className="text-lg font-semibold text-red-600">{approvalData.totalDiscount}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Discount Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>💰 Discount Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {discountItems.map((item, index) => {
                const discount = calculateDiscount(item.standardPrice, item.requestedPrice)
                return (
                  <Card key={index} className={`border ${item.exceedsLimit ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h4 className="font-medium text-gray-900 mr-3">{item.description}</h4>
                            <Badge 
                              variant={item.exceedsLimit ? "destructive" : "default"}
                              className={item.exceedsLimit ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}
                            >
                              {item.exceedsLimit ? 'Requires Approval' : 'Auto-Approved'}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Standard Price</p>
                              <p className="font-medium">₹{item.standardPrice.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Requested Price</p>
                              <p className="font-medium text-blue-600">₹{item.requestedPrice.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Discount</p>
                              <p className="font-medium text-red-600">
                                ₹{discount.amount.toLocaleString()} ({discount.percentage}%)
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Approved Range</p>
                              <p className="font-medium text-gray-700">
                                ₹{item.floorPrice.toLocaleString()} - ₹{item.ceilingPrice.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          {item.reason && (
                            <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                              <p className="text-sm text-gray-700">
                                <strong>Reason:</strong> {item.reason}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="ml-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewDetails(item.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Finance Admin BoQ View */}
        <BoQTable items={discountItems} setItems={setDiscountItems} editable={false} highlightNew={null} />

        {/* Approval Workflow */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>🔄 Approval Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Current Step */}
              <div className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="font-medium text-blue-900">Step 1: Finance Team Review</h4>
                  <p className="text-sm text-blue-700">
                    Waiting for finance team approval for discounts exceeding auto-approval limits
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Assigned to: Finance Admin • SLA: 24 hours
                  </p>
                </div>
              </div>

              {/* Next Steps */}
              <div className="flex items-center p-4 bg-gray-50 border border-gray-200 rounded-lg opacity-60">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="font-medium text-gray-700">Step 2: BU Head Approval</h4>
                  <p className="text-sm text-gray-600">
                    If discount &gt; 15%, requires Business Unit Head approval
                  </p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-50 border border-gray-200 rounded-lg opacity-60">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="font-medium text-gray-700">Step 3: Final Approval & Deployment</h4>
                  <p className="text-sm text-gray-600">
                    Order approved and ready for infrastructure deployment
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Additional Comments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Add any additional context or justification for the discount request..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              className="mb-4"
            />
            <p className="text-sm text-gray-500">
              These comments will be visible to the finance team and help expedite the approval process.
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate('/boq-generated')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Modify Discounts
          </Button>
          
          <Button 
            onClick={handleSubmitForApproval}
            disabled={submitting}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {submitting ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit for Finance Approval
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ApprovalWorkflow

