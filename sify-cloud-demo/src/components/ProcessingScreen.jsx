import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Clock, Loader2 } from 'lucide-react'

const ProcessingScreen = ({ projectData = {} }) => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  const steps = [
    { 
      id: 1, 
      title: 'Parsing Excel File', 
      description: 'Reading and validating requirements data',
      duration: 2000
    },
    { 
      id: 2, 
      title: 'AI Analysis', 
      description: 'Analyzing requirements and mapping to SKUs',
      duration: 3000
    },
    { 
      id: 3, 
      title: 'SKU Mapping', 
      description: 'Generating product codes and configurations',
      duration: 2000
    },
    { 
      id: 4, 
      title: 'Cost Calculation', 
      description: 'Computing pricing and generating BoQ',
      duration: 2000
    },
    { 
      id: 5, 
      title: 'Optimization', 
      description: 'Applying best practices and cost optimization',
      duration: 1500
    }
  ]

  useEffect(() => {
    let totalDuration = 0
    let currentDuration = 0

    steps.forEach((step, index) => {
      totalDuration += step.duration
      setTimeout(() => {
        setCurrentStep(index + 1)
        currentDuration += step.duration
        setProgress((currentDuration / totalDuration) * 100)
      }, currentDuration)
    })

    // Navigate to BoQ after all steps complete
    setTimeout(() => {
      navigate('/boq-generated')
    }, totalDuration + 500)
  }, [navigate])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">🤖 Processing Requirements</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Info */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  🏢 {projectData.customerName || 'Edgecut Technologies'}
                </h2>
                <p className="text-gray-600">{projectData.projectName || 'Web Application Infrastructure'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Processing Time</p>
                <p className="text-lg font-semibold text-blue-600">~10 seconds</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Overall Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Processing Steps */}
        <Card>
          <CardHeader>
            <CardTitle>🔄 Processing Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {steps.map((step, index) => {
                const isCompleted = currentStep > index + 1
                const isCurrent = currentStep === index + 1
                const isPending = currentStep < index + 1

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
                      {isCompleted && (
                        <span className="text-xs text-green-600 font-medium">✓ Complete</span>
                      )}
                      {isCurrent && (
                        <span className="text-xs text-blue-600 font-medium">⏳ Processing...</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Live Updates */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>📊 Live Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              {currentStep >= 1 && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Detected 4 virtual machines in requirements
                </div>
              )}
              {currentStep >= 2 && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mapped to SKUs: VM-A4G8, VM-D8G16, LB-SSL, FW-STD
                </div>
              )}
              {currentStep >= 3 && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Generated 12 line items with proper configurations
                </div>
              )}
              {currentStep >= 4 && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Calculated total cost: ₹26,010/month
                </div>
              )}
              {currentStep >= 5 && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Applied 10% volume discount for multiple VMs
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Fun Facts */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="font-medium text-gray-900 mb-2">💡 Did you know?</h3>
              <p className="text-sm text-gray-600">
                Our AI processes requirements 50x faster than manual SKU mapping, 
                reducing quote generation time from hours to minutes!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ProcessingScreen

