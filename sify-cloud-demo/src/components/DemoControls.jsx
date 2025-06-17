import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Settings, 
  RotateCcw, 
  Download, 
  Upload, 
  Database,
  Users,
  BarChart3,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { 
  clearDemoData, 
  getProjects, 
  getCurrentPersona,
  PERSONAS,
  PROJECT_STATUS 
} from '@/utils/dataModel'

const DemoControls = ({ onDataChange }) => {
  const [isResetting, setIsResetting] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleResetDemo = async () => {
    setIsResetting(true)
    
    try {
      const success = clearDemoData()
      if (success) {
        // Notify parent component about data change
        if (onDataChange) {
          onDataChange()
        }
        
        // Show success message briefly
        setTimeout(() => {
          setIsResetting(false)
          window.location.reload()
        }, 1000)
      } else {
        setIsResetting(false)
        alert('Failed to reset demo data')
      }
    } catch (error) {
      console.error('Error resetting demo:', error)
      setIsResetting(false)
      alert('Error occurred while resetting demo')
    }
  }

  const handleExportData = () => {
    try {
      const projects = getProjects()
      const demoData = {
        projects,
        exportDate: new Date().toISOString(),
        version: '1.0'
      }
      
      const dataStr = JSON.stringify(demoData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `sify-demo-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Failed to export demo data')
    }
  }

  const handleImportData = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result)
        
        if (importedData.projects && Array.isArray(importedData.projects)) {
          localStorage.setItem('sify_demo_data', JSON.stringify({
            projects: importedData.projects,
            lastUpdated: new Date().toISOString()
          }))
          
          if (onDataChange) {
            onDataChange()
          }
          
          alert('Demo data imported successfully!')
          window.location.reload()
        } else {
          alert('Invalid data format')
        }
      } catch (error) {
        console.error('Error importing data:', error)
        alert('Failed to import demo data')
      }
    }
    reader.readAsText(file)
  }

  const getDemoStats = () => {
    const projects = getProjects()
    const uploadCount = parseInt(localStorage.getItem('demoUploadCount') || '0')
    const currentPersona = getCurrentPersona()
    
    return {
      totalProjects: projects.length,
      uploadCount,
      currentPersona,
      statusBreakdown: {
        draft: projects.filter(p => p.status === PROJECT_STATUS.DRAFT).length,
        pendingPM: projects.filter(p => p.status === PROJECT_STATUS.PENDING_PM_REVIEW).length,
        pendingSA: projects.filter(p => p.status === PROJECT_STATUS.PENDING_SA_REVIEW).length,
        pendingFinance: projects.filter(p => p.status === PROJECT_STATUS.PENDING_FINANCE_APPROVAL).length,
        approved: projects.filter(p => p.status === PROJECT_STATUS.APPROVED).length
      }
    }
  }

  const stats = getDemoStats()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Demo Controls
        </CardTitle>
        <CardDescription>
          Manage demo data and view current session statistics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Actions */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Quick Actions</h4>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={handleResetDemo}
              disabled={isResetting}
              className="flex items-center gap-2"
            >
              <RotateCcw className={`h-4 w-4 ${isResetting ? 'animate-spin' : ''}`} />
              {isResetting ? 'Resetting...' : 'Reset Demo'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleExportData}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Data
            </Button>
            
            <label className="cursor-pointer">
              <Button 
                variant="outline"
                className="flex items-center gap-2"
                asChild
              >
                <span>
                  <Upload className="h-4 w-4" />
                  Import Data
                </span>
              </Button>
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Current Session Stats */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Current Session</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-blue-600">{stats.totalProjects}</div>
              <div className="text-xs text-blue-700">Total Projects</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-green-600">{stats.uploadCount}</div>
              <div className="text-xs text-green-700">Upload Count</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-purple-600">{stats.statusBreakdown.approved}</div>
              <div className="text-xs text-purple-700">Completed</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-orange-600">
                {stats.totalProjects - stats.statusBreakdown.approved}
              </div>
              <div className="text-xs text-orange-700">In Progress</div>
            </div>
          </div>
        </div>

        {/* Current Persona */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Current Persona</h4>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            <Badge variant="outline">{stats.currentPersona}</Badge>
          </div>
        </div>

        {/* Advanced Controls */}
        <div className="space-y-3">
          <Button
            variant="ghost"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm"
          >
            <BarChart3 className="h-4 w-4" />
            {showAdvanced ? 'Hide' : 'Show'} Advanced Stats
          </Button>
          
          {showAdvanced && (
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
              <h5 className="font-medium text-gray-900">Project Status Breakdown</h5>
              <div className="space-y-2">
                {Object.entries(stats.statusBreakdown).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center text-sm">
                    <span className="capitalize">{status.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <h5 className="font-medium text-gray-900 mb-2">Storage Info</h5>
                <div className="text-sm text-gray-600">
                  <div>Storage Key: sify_demo_data</div>
                  <div>Last Updated: {new Date().toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Demo Instructions */}
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Demo Instructions:</p>
              <ul className="text-sm space-y-1">
                <li>• First upload → Standard flow (all SKUs match)</li>
                <li>• Second upload → Custom flow (mixed workflow)</li>
                <li>• Use role switcher to test different personas</li>
                <li>• Reset demo to start fresh between presentations</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        {/* Reset Confirmation */}
        {isResetting && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Demo data has been reset successfully. Reloading...
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

export default DemoControls

