import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  Save, 
  RotateCcw, 
  Server, 
  Cpu, 
  HardDrive, 
  Shield,
  Calendar,
  TrendingDown,
  Info,
  Globe,
  Lock
} from 'lucide-react'

const VMConfiguration = () => {
  const navigate = useNavigate()
  
  const [selectedVM, setSelectedVM] = useState('app-server-01')
  const [riTerm, setRiTerm] = useState('monthly') // monthly, 1year, 3year, 5year
  
  const [vmConfigs, setVmConfigs] = useState({
    'app-server-01': {
      name: 'App-Server-01',
      cpu: 4,
      ram: 8,
      storage: { ssd: 100, hdd: 0 },
      os: 'windows-2022',
      features: ['antivirus', 'backup'],
      riTerm: 'monthly',
      network: {
        publicIp: false,
        firewall: true,
        inboundRules: [],
        outboundRules: []
      }
    },
    'app-server-02': {
      name: 'App-Server-02',
      cpu: 4,
      ram: 8,
      storage: { ssd: 100, hdd: 0 },
      os: 'windows-2022',
      features: ['antivirus', 'backup'],
      riTerm: 'monthly'
    },
    'app-server-03': {
      name: 'App-Server-03',
      cpu: 4,
      ram: 8,
      storage: { ssd: 100, hdd: 0 },
      os: 'windows-2022',
      features: ['antivirus', 'backup'],
      riTerm: 'monthly'
    },
    'db-server-01': {
      name: 'DB-Server-01',
      cpu: 8,
      ram: 16,
      storage: { ssd: 500, hdd: 0 },
      os: 'windows-2022',
      features: ['sql-server', 'antivirus', 'backup'],
      riTerm: 'monthly'
    }
  })

  const addNewVM = () => {
    const vmCount = Object.keys(vmConfigs).length + 1
    const newVMId = `new-vm-${vmCount}`
    const newVM = {
      name: `New-VM-${vmCount}`,
      cpu: 2,
      ram: 4,
      storage: { ssd: 50, hdd: 0 },
      os: 'windows-2022',
      features: ['antivirus'],
      riTerm: 'monthly',
      network: {
        publicIp: false,
        firewall: true,
        inboundRules: [],
        outboundRules: []
      }
    }
    
    setVmConfigs(prev => ({
      ...prev,
      [newVMId]: newVM
    }))
    setSelectedVM(newVMId)
  }

  const addMultipleVMs = (count, template) => {
    const currentCount = Object.keys(vmConfigs).length
    const newConfigs = { ...vmConfigs }
    
    for (let i = 0; i < count; i++) {
      const newVMId = `new-vm-${currentCount + i + 1}`
      newConfigs[newVMId] = {
        ...template,
        name: `${template.name}-${i + 1}`,
        network: {
          publicIp: false,
          firewall: true,
          inboundRules: [],
          outboundRules: []
        }
      }
    }
    
    setVmConfigs(newConfigs)
    setSelectedVM(Object.keys(newConfigs)[Object.keys(newConfigs).length - 1])
  }

  const removeVM = (vmId) => {
    if (Object.keys(vmConfigs).length <= 1) {
      alert('Cannot remove the last VM. At least one VM is required.')
      return
    }
    
    const newConfigs = { ...vmConfigs }
    delete newConfigs[vmId]
    setVmConfigs(newConfigs)
    
    // Select the first available VM
    const remainingVMs = Object.keys(newConfigs)
    if (remainingVMs.length > 0) {
      setSelectedVM(remainingVMs[0])
    }
  }

  // Pricing structure with RI discounts
  const pricing = {
    cpu: { price: 400, unit: 'vCPU/month' },
    ram: { price: 200, unit: 'GB/month' },
    ssd: { price: 8, unit: 'GB/month' },
    hdd: { price: 4, unit: 'GB/month' },
    os: {
      'windows-2022': { price: 800, unit: 'license/month' },
      'windows-2019': { price: 800, unit: 'license/month' },
      'ubuntu': { price: 0, unit: 'license/month' },
      'rhel': { price: 1200, unit: 'license/month' }
    },
    features: {
      'antivirus': { price: 200, unit: 'license/month' },
      'backup': { price: 300, unit: 'service/month' },
      'sql-server': { price: 8000, unit: 'license/month' }
    }
  }

  // Reserved Instance discount rates
  const riDiscounts = {
    'monthly': { discount: 0, label: 'Pay-as-you-go', commitment: 'No commitment' },
    '1year': { discount: 0.15, label: '1 Year Reserved', commitment: '12 months upfront' },
    '3year': { discount: 0.35, label: '3 Year Reserved', commitment: '36 months upfront' },
    '5year': { discount: 0.50, label: '5 Year Reserved', commitment: '60 months upfront' }
  }

  const updateVMConfig = (vmId, field, value) => {
    setVmConfigs(prev => ({
      ...prev,
      [vmId]: {
        ...prev[vmId],
        [field]: value
      }
    }))
  }

  const calculateVMCost = (config) => {
    const cpuCost = config.cpu * pricing.cpu.price
    const ramCost = config.ram * pricing.ram.price
    const storageCost = (config.storage.ssd * pricing.ssd.price) + (config.storage.hdd * pricing.hdd.price)
    const osCost = pricing.os[config.os]?.price || 0
    const featuresCost = config.features.reduce((sum, feature) => 
      sum + (pricing.features[feature]?.price || 0), 0
    )
    
    const baseCost = cpuCost + ramCost + storageCost + osCost + featuresCost
    const riDiscount = riDiscounts[config.riTerm]?.discount || 0
    const discountedCost = baseCost * (1 - riDiscount)
    
    return {
      base: baseCost,
      discounted: discountedCost,
      savings: baseCost - discountedCost,
      breakdown: {
        cpu: cpuCost,
        ram: ramCost,
        storage: storageCost,
        os: osCost,
        features: featuresCost
      }
    }
  }

  const calculateTotalCost = () => {
    return Object.values(vmConfigs).reduce((total, config) => {
      const cost = calculateVMCost(config)
      return {
        base: total.base + cost.base,
        discounted: total.discounted + cost.discounted,
        savings: total.savings + cost.savings
      }
    }, { base: 0, discounted: 0, savings: 0 })
  }

  const currentConfig = vmConfigs[selectedVM]
  const currentCost = calculateVMCost(currentConfig)
  const totalCost = calculateTotalCost()
  const volumeDiscount = Math.round(totalCost.discounted * 0.1)
  const finalTotal = totalCost.discounted - volumeDiscount

  const handleSave = () => {
    navigate('/boq-generated')
  }

  const handleReset = () => {
    // Reset to default configurations
    setVmConfigs({
      'app-server-01': {
        name: 'App-Server-01',
        cpu: 4,
        ram: 8,
        storage: { ssd: 100, hdd: 0 },
        os: 'windows-2022',
        features: ['antivirus', 'backup'],
        riTerm: 'monthly',
        network: {
          publicIp: false,
          firewall: true,
          inboundRules: [],
          outboundRules: []
        }
      },
      'app-server-02': {
        name: 'App-Server-02',
        cpu: 4,
        ram: 8,
        storage: { ssd: 100, hdd: 0 },
        os: 'windows-2022',
        features: ['antivirus', 'backup'],
        riTerm: 'monthly'
      },
      'app-server-03': {
        name: 'App-Server-03',
        cpu: 4,
        ram: 8,
        storage: { ssd: 100, hdd: 0 },
        os: 'windows-2022',
        features: ['antivirus', 'backup'],
        riTerm: 'monthly'
      },
      'db-server-01': {
        name: 'DB-Server-01',
        cpu: 8,
        ram: 16,
        storage: { ssd: 500, hdd: 0 },
        os: 'windows-2022',
        features: ['sql-server', 'antivirus', 'backup'],
        riTerm: 'monthly'
      }
    })
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
                <h1 className="text-2xl font-bold text-gray-900">🔧 Modify Configuration</h1>
                <p className="text-gray-600">Customize your virtual machines with Reserved Instance options</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* VM List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Server className="h-5 w-5 mr-2" />
                    Virtual Machines
                    <Badge variant="outline" className="ml-2">{Object.keys(vmConfigs).length}</Badge>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={addNewVM}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    + Add VM
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* VM List */}
                <div className="space-y-2">
                  {Object.entries(vmConfigs).map(([vmId, config]) => (
                    <div
                      key={vmId}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                        selectedVM === vmId ? 'bg-primary/10' : 'hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedVM(vmId)}
                    >
                      <div className="flex items-center">
                        <Server className="h-4 w-4 mr-2" />
                        <span className="text-sm">{config.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeVM(vmId)
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Bulk VM Addition */}
                <div className="mt-4 pt-4 border-t">
                  <Label className="text-sm font-medium mb-2">Quick Add Multiple VMs</Label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        defaultValue="3"
                        className="w-20"
                        id="webServerCount"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const count = parseInt(document.getElementById('webServerCount').value) || 1
                          addMultipleVMs(count, {
                            name: 'Web-Server',
                            cpu: 2,
                            ram: 4,
                            storage: { ssd: 50, hdd: 0 },
                            os: 'ubuntu',
                            features: ['antivirus'],
                            riTerm: 'monthly'
                          })
                        }}
                        className="flex-1"
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Add Web Servers
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        defaultValue="2"
                        className="w-20"
                        id="dbServerCount"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const count = parseInt(document.getElementById('dbServerCount').value) || 1
                          addMultipleVMs(count, {
                            name: 'DB-Server',
                            cpu: 8,
                            ram: 16,
                            storage: { ssd: 500, hdd: 0 },
                            os: 'windows-2022',
                            features: ['sql-server', 'antivirus', 'backup'],
                            riTerm: 'monthly'
                          })
                        }}
                        className="flex-1"
                      >
                        <HardDrive className="h-4 w-4 mr-2" />
                        Add DB Servers
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cost Summary */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  💰 Cost Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">₹{Math.round(totalCost.discounted).toLocaleString()}/mo</span>
                  </div>
                  {totalCost.savings > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>RI Savings:</span>
                      <span>-₹{Math.round(totalCost.savings).toLocaleString()}/mo</span>
                    </div>
                  )}
                  <div className="flex justify-between text-green-600">
                    <span>Volume Discount:</span>
                    <span>-₹{volumeDiscount.toLocaleString()}/mo</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>₹{Math.round(finalTotal).toLocaleString()}/mo</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Configuration Panel */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Cpu className="h-5 w-5 mr-2" />
                  Configure {currentConfig.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="compute" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="compute">Compute</TabsTrigger>
                    <TabsTrigger value="storage">Storage</TabsTrigger>
                    <TabsTrigger value="network">Network</TabsTrigger>
                    <TabsTrigger value="software">Software</TabsTrigger>
                    <TabsTrigger value="reserved">Reserved Instance</TabsTrigger>
                  </TabsList>

                  {/* Compute Tab */}
                  <TabsContent value="compute" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* VM Name */}
                      <div className="space-y-2">
                        <Label>VM Name</Label>
                        <Input
                          value={currentConfig.name}
                          onChange={(e) => updateVMConfig(selectedVM, 'name', e.target.value)}
                        />
                      </div>

                      {/* vCPU */}
                      <div className="space-y-2">
                        <Label className="flex items-center">
                          <Cpu className="h-4 w-4 mr-1" />
                          vCPU Cores
                          <Badge variant="outline" className="ml-2">{currentConfig.cpu} cores</Badge>
                        </Label>
                        <div className="space-y-2">
                          <input
                            type="range"
                            min="1"
                            max="64"
                            value={currentConfig.cpu}
                            onChange={(e) => updateVMConfig(selectedVM, 'cpu', parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>1 core</span>
                            <span>64 cores</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            💰 Cost: ₹{(currentConfig.cpu * pricing.cpu.price).toLocaleString()}/month
                          </p>
                        </div>
                      </div>

                      {/* RAM */}
                      <div className="space-y-2">
                        <Label className="flex items-center">
                          RAM (GB)
                          <Badge variant="outline" className="ml-2">{currentConfig.ram} GB</Badge>
                        </Label>
                        <div className="space-y-2">
                          <input
                            type="range"
                            min="1"
                            max="512"
                            value={currentConfig.ram}
                            onChange={(e) => updateVMConfig(selectedVM, 'ram', parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>1 GB</span>
                            <span>512 GB</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            💰 Cost: ₹{(currentConfig.ram * pricing.ram.price).toLocaleString()}/month
                          </p>
                          {currentConfig.cpu && currentConfig.ram && (
                            <div className="text-xs">
                              {currentConfig.ram / currentConfig.cpu === 2 && (
                                <span className="text-green-600">✓ Balanced (1:2 ratio)</span>
                              )}
                              {currentConfig.ram / currentConfig.cpu < 2 && (
                                <span className="text-orange-600">⚠ CPU-optimized</span>
                              )}
                              {currentConfig.ram / currentConfig.cpu > 2 && (
                                <span className="text-blue-600">📊 Memory-optimized</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Storage Tab */}
                  <TabsContent value="storage" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* SSD Storage */}
                      <div className="space-y-2">
                        <Label className="flex items-center">
                          <HardDrive className="h-4 w-4 mr-1" />
                          SSD Storage
                          <Badge variant="outline" className="ml-2">{currentConfig.storage.ssd} GB SSD</Badge>
                        </Label>
                        <div className="space-y-2">
                          <input
                            type="range"
                            min="20"
                            max="2000"
                            step="10"
                            value={currentConfig.storage.ssd}
                            onChange={(e) => updateVMConfig(selectedVM, 'storage', {
                              ...currentConfig.storage,
                              ssd: parseInt(e.target.value)
                            })}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>20 GB</span>
                            <span>2 TB</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary">SSD (₹8/GB)</Badge>
                            <span className="text-sm text-gray-600">
                              💰 Cost: ₹{(currentConfig.storage.ssd * pricing.ssd.price).toLocaleString()}/month
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* HDD Storage */}
                      <div className="space-y-2">
                        <Label className="flex items-center">
                          <HardDrive className="h-4 w-4 mr-1" />
                          HDD Storage
                          <Badge variant="outline" className="ml-2">{currentConfig.storage.hdd} GB HDD</Badge>
                        </Label>
                        <div className="space-y-2">
                          <input
                            type="range"
                            min="0"
                            max="5000"
                            step="50"
                            value={currentConfig.storage.hdd}
                            onChange={(e) => updateVMConfig(selectedVM, 'storage', {
                              ...currentConfig.storage,
                              hdd: parseInt(e.target.value)
                            })}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>0 GB</span>
                            <span>5 TB</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary">HDD (₹4/GB)</Badge>
                            <span className="text-sm text-gray-600">
                              💰 Cost: ₹{(currentConfig.storage.hdd * pricing.hdd.price).toLocaleString()}/month
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Network Tab */}
                  <TabsContent value="network" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Public IP */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center justify-between">
                            <div className="flex items-center">
                              <Globe className="h-4 w-4 mr-2" />
                              Public IP Address
                            </div>
                            <Badge variant="outline">₹1000/month</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <Label>Enable Public IP</Label>
                            <input
                              type="checkbox"
                              checked={currentConfig.network?.publicIp}
                              onChange={(e) => updateVMConfig(selectedVM, 'network', {
                                ...currentConfig.network,
                                publicIp: e.target.checked
                              })}
                              className="h-4 w-4"
                            />
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            Assign a public IP address to allow direct internet access
                          </p>
                        </CardContent>
                      </Card>

                      {/* Firewall */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center justify-between">
                            <div className="flex items-center">
                              <Lock className="h-4 w-4 mr-2" />
                              Firewall Protection
                            </div>
                            <Badge variant="outline">₹2000/month</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <Label>Enable Firewall</Label>
                            <input
                              type="checkbox"
                              checked={currentConfig.network?.firewall}
                              onChange={(e) => updateVMConfig(selectedVM, 'network', {
                                ...currentConfig.network,
                                firewall: e.target.checked
                              })}
                              className="h-4 w-4"
                            />
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            Enable advanced firewall protection and traffic filtering
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Firewall Rules */}
                    {currentConfig.network?.firewall && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Firewall Rules</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Inbound Rules */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label>Inbound Rules</Label>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newRules = [...(currentConfig.network.inboundRules || []), {
                                    port: '',
                                    protocol: 'tcp',
                                    source: ''
                                  }]
                                  updateVMConfig(selectedVM, 'network', {
                                    ...currentConfig.network,
                                    inboundRules: newRules
                                  })
                                }}
                              >
                                Add Rule
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {currentConfig.network.inboundRules?.map((rule, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                  <Input
                                    placeholder="Port (e.g., 80, 443)"
                                    value={rule.port}
                                    onChange={(e) => {
                                      const newRules = [...currentConfig.network.inboundRules]
                                      newRules[idx] = { ...rule, port: e.target.value }
                                      updateVMConfig(selectedVM, 'network', {
                                        ...currentConfig.network,
                                        inboundRules: newRules
                                      })
                                    }}
                                    className="w-1/3"
                                  />
                                  <Select
                                    value={rule.protocol}
                                    onValueChange={(value) => {
                                      const newRules = [...currentConfig.network.inboundRules]
                                      newRules[idx] = { ...rule, protocol: value }
                                      updateVMConfig(selectedVM, 'network', {
                                        ...currentConfig.network,
                                        inboundRules: newRules
                                      })
                                    }}
                                  >
                                    <SelectTrigger className="w-1/3">
                                      <SelectValue placeholder="Protocol" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="tcp">TCP</SelectItem>
                                      <SelectItem value="udp">UDP</SelectItem>
                                      <SelectItem value="icmp">ICMP</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Input
                                    placeholder="Source (e.g., 0.0.0.0/0)"
                                    value={rule.source}
                                    onChange={(e) => {
                                      const newRules = [...currentConfig.network.inboundRules]
                                      newRules[idx] = { ...rule, source: e.target.value }
                                      updateVMConfig(selectedVM, 'network', {
                                        ...currentConfig.network,
                                        inboundRules: newRules
                                      })
                                    }}
                                    className="w-1/3"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const newRules = currentConfig.network.inboundRules.filter((_, i) => i !== idx)
                                      updateVMConfig(selectedVM, 'network', {
                                        ...currentConfig.network,
                                        inboundRules: newRules
                                      })
                                    }}
                                  >
                                    ×
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Common Presets */}
                          <div className="pt-4 border-t">
                            <Label className="mb-2">Quick Add Common Rules</Label>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newRules = [...(currentConfig.network.inboundRules || []), {
                                    port: '80,443',
                                    protocol: 'tcp',
                                    source: '0.0.0.0/0'
                                  }]
                                  updateVMConfig(selectedVM, 'network', {
                                    ...currentConfig.network,
                                    inboundRules: newRules
                                  })
                                }}
                              >
                                HTTP/HTTPS
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newRules = [...(currentConfig.network.inboundRules || []), {
                                    port: '3389',
                                    protocol: 'tcp',
                                    source: '0.0.0.0/0'
                                  }]
                                  updateVMConfig(selectedVM, 'network', {
                                    ...currentConfig.network,
                                    inboundRules: newRules
                                  })
                                }}
                              >
                                RDP
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newRules = [...(currentConfig.network.inboundRules || []), {
                                    port: '22',
                                    protocol: 'tcp',
                                    source: '0.0.0.0/0'
                                  }]
                                  updateVMConfig(selectedVM, 'network', {
                                    ...currentConfig.network,
                                    inboundRules: newRules
                                  })
                                }}
                              >
                                SSH
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  {/* Software Tab */}
                  <TabsContent value="software" className="space-y-6">
                    {/* Operating System */}
                    <div className="space-y-2">
                      <Label>Operating System</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: 'windows-2022', name: 'Windows Server 2022', price: '₹800/mo' },
                          { id: 'windows-2019', name: 'Windows Server 2019', price: '₹800/mo' },
                          { id: 'ubuntu', name: 'Ubuntu 22.04 LTS', price: 'Free' },
                          { id: 'rhel', name: 'Red Hat Enterprise Linux', price: '₹1200/mo' }
                        ].map((os) => (
                          <Card 
                            key={os.id}
                            className={`cursor-pointer transition-colors ${
                              currentConfig.os === os.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                            }`}
                            onClick={() => updateVMConfig(selectedVM, 'os', os.id)}
                          >
                            <CardContent className="p-3">
                              <h4 className="font-medium text-sm">{os.name}</h4>
                              <p className="text-xs text-gray-600">{os.price}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Software & Services */}
                    <div className="space-y-2">
                      <Label className="flex items-center">
                        <Shield className="h-4 w-4 mr-1" />
                        Software & Services
                      </Label>
                      <div className="space-y-3">
                        {[
                          { id: 'antivirus', name: 'Antivirus Protection', desc: 'Real-time threat protection', price: 200 },
                          { id: 'backup', name: 'Automatic Backups', desc: 'Daily backups with 30-day retention', price: 300 },
                          { id: 'sql-server', name: 'SQL Server Standard', desc: 'Database engine with management tools', price: 8000 }
                        ].map((service) => (
                          <Card key={service.id} className="border">
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <input
                                    type="checkbox"
                                    checked={currentConfig.features.includes(service.id)}
                                    onChange={(e) => {
                                      const newFeatures = e.target.checked
                                        ? [...currentConfig.features, service.id]
                                        : currentConfig.features.filter(f => f !== service.id)
                                      updateVMConfig(selectedVM, 'features', newFeatures)
                                    }}
                                    className="rounded"
                                  />
                                  <div>
                                    <h4 className="font-medium text-sm">{service.name}</h4>
                                    <p className="text-xs text-gray-600">{service.desc}</p>
                                  </div>
                                </div>
                                <Badge variant="outline">₹{service.price}/month</Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Reserved Instance Tab */}
                  <TabsContent value="reserved" className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold">Reserved Instance Options</h3>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Save up to 50%
                        </Badge>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start space-x-2">
                          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-blue-900">What are Reserved Instances?</h4>
                            <p className="text-sm text-blue-700 mt-1">
                              Reserved Instances provide significant cost savings in exchange for a commitment to use specific instance types for a set period. 
                              The longer the commitment, the greater the savings.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(riDiscounts).map(([term, details]) => {
                          const isSelected = currentConfig.riTerm === term
                          const vmCost = calculateVMCost({ ...currentConfig, riTerm: term })
                          
                          return (
                            <Card 
                              key={term}
                              className={`cursor-pointer transition-all ${
                                isSelected 
                                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                                  : 'hover:bg-gray-50 hover:shadow-sm'
                              }`}
                              onClick={() => updateVMConfig(selectedVM, 'riTerm', term)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-semibold text-gray-900">{details.label}</h4>
                                  {details.discount > 0 && (
                                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                                      <TrendingDown className="h-3 w-3 mr-1" />
                                      {Math.round(details.discount * 100)}% OFF
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Monthly Cost:</span>
                                    <span className="font-medium">₹{Math.round(vmCost.discounted).toLocaleString()}</span>
                                  </div>
                                  
                                  {details.discount > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                      <span>Monthly Savings:</span>
                                      <span className="font-medium">₹{Math.round(vmCost.savings).toLocaleString()}</span>
                                    </div>
                                  )}
                                  
                                  <div className="text-xs text-gray-500 pt-2 border-t">
                                    <p><strong>Commitment:</strong> {details.commitment}</p>
                                    {term !== 'monthly' && (
                                      <p className="mt-1">
                                        <strong>Total Savings:</strong> ₹{Math.round(vmCost.savings * 12 * (term === '1year' ? 1 : term === '3year' ? 3 : 5)).toLocaleString()} 
                                        over {term === '1year' ? '1 year' : term === '3year' ? '3 years' : '5 years'}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>

                      {/* Current Selection Summary */}
                      <Card className="bg-gray-50 border-gray-200">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Current Selection: {riDiscounts[currentConfig.riTerm].label}</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Base Monthly Cost:</p>
                              <p className="font-medium">₹{Math.round(currentCost.base).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Discounted Cost:</p>
                              <p className="font-medium text-blue-600">₹{Math.round(currentCost.discounted).toLocaleString()}</p>
                            </div>
                            {currentCost.savings > 0 && (
                              <>
                                <div>
                                  <p className="text-gray-600">Monthly Savings:</p>
                                  <p className="font-medium text-green-600">₹{Math.round(currentCost.savings).toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Annual Savings:</p>
                                  <p className="font-medium text-green-600">₹{Math.round(currentCost.savings * 12).toLocaleString()}</p>
                                </div>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Live Cost Calculation */}
                <Card className="mt-6 bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-blue-900 mb-3">💡 Live Cost Calculation</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                      <div>
                        <p className="text-blue-700">• {currentConfig.cpu} vCPU × ₹400</p>
                        <p className="font-medium">₹{currentCost.breakdown.cpu.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-blue-700">• {currentConfig.ram} GB RAM × ₹200</p>
                        <p className="font-medium">₹{currentCost.breakdown.ram.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-blue-700">• {currentConfig.storage.ssd} GB SSD</p>
                        <p className="font-medium">₹{currentCost.breakdown.storage.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-blue-700">• OS License</p>
                        <p className="font-medium">₹{currentCost.breakdown.os.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-blue-700">• Software & Services</p>
                        <p className="font-medium">₹{currentCost.breakdown.features.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <div className="flex justify-between items-center">
                        <span className="text-blue-700">VM Total:</span>
                        <span className="text-xl font-bold text-blue-900">₹{Math.round(currentCost.discounted).toLocaleString()}/month</span>
                      </div>
                      {currentCost.savings > 0 && (
                        <div className="flex justify-between items-center text-green-600 mt-1">
                          <span>RI Savings:</span>
                          <span className="font-medium">-₹{Math.round(currentCost.savings).toLocaleString()}/month</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VMConfiguration

