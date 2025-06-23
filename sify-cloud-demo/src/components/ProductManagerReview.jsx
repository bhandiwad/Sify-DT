import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { PROJECT_STATUS } from '@/utils/dataModel'
import BoQTable from './BoQTable'

const ProductManagerReview = ({ projectDetails, onApproval }) => {
  const navigate = useNavigate()
  const [comments, setComments] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const projectData = projectDetails

  const handleApprove = () => {
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
        onApproval({
            status: PROJECT_STATUS.PENDING_SA_FINAL,
            comments: `Product Manager approved. ${comments}`
        })
        setIsSubmitting(false)
        navigate('/')
    }, 1000)
  }

  const handleReject = () => {
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
        onApproval({
            status: PROJECT_STATUS.REJECTED_BY_PM,
            comments: `Product Manager rejected. ${comments}`
        })
        setIsSubmitting(false)
        navigate('/')
    }, 1000)
  }
  
  if (!projectData) {
    return <div>Loading project details... or please go back and select a project.</div>
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Product Manager Review</CardTitle>
          <CardDescription>
            Review the generated Bill of Quantities (BoQ) for pricing, and approve or reject the proposal.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <Label>Customer</Label>
                <p className="font-semibold">{projectData.customerName}</p>
              </div>
              <div>
                <Label>Project</Label>
                <p className="font-semibold">{projectData.projectName}</p>
              </div>
            </div>
            
            <BoQTable items={projectData.boqItems || []} isReviewMode={true} />

            <div className="mt-6">
                <Label htmlFor="comments">Comments</Label>
                <Textarea 
                    id="comments"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Add approval or rejection comments here..."
                    className="mt-1"
                />
            </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end gap-4">
        <Button 
          variant="outline" 
          onClick={handleReject} 
          disabled={isSubmitting}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <ThumbsDown className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Rejecting...' : 'Reject'}
        </Button>
        <Button 
          onClick={handleApprove} 
          disabled={isSubmitting}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <ThumbsUp className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Approving...' : 'Approve & Finalize Prices'}
        </Button>
      </div>
    </div>
  )
}

export default ProductManagerReview

