import React, { useState, useEffect } from 'react'
import { PRICE_BOOK_SKUS, getCurrentPersona, PERSONAS } from '@/utils/dataModel'
import { useLocation, useNavigate } from 'react-router-dom'
import { getProject } from '@/utils/dataModel'
import BoQTable from './BoQTable'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'
import { ENVIRONMENT_TYPES, SERVICE_CATEGORIES, COMPLIANCE_REQUIREMENTS } from '../utils/serviceModel'
import { Badge } from './ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Download, ArrowLeft, Shield, Server, Database, ArrowRight, CheckCircle } from 'lucide-react'
import { normalizeBoqItem } from '../utils/serviceModel'
import { CATALOG, FLOOR_UNIT_PRICES, VM_OS_OPTIONS, VM_FEATURES } from '../utils/constants'
import { DEFAULT_SKU } from './BoQTable'

const FLOOR_PRICES = {
  'CI-COMPUTE': 12000,
  'CI-STORAGE': 40,
  'CI-NETWORK': 6000,
  'CI-SECURITY': 9000,
  'CI-BACKUP': 4000,
  'CI-VPN': 2000,
  'CI-INTERNET': 5000,
}

// Helper to extract vCPU and RAM from description (e.g., '4 vCPU, 16GB RAM')
function extractVMConfig(description) {
  const vcpuMatch = description.match(/(\d+)\s*vCPU/i)
  const ramMatch = description.match(/(\d+)\s*GB/i)
  return {
    vcpu: vcpuMatch ? parseInt(vcpuMatch[1]) : 0,
    ram: ramMatch ? parseInt(ramMatch[1]) : 0
  }
}
// Helper to extract storage GB from description (e.g., '500 GB')
function extractStorageGB(description) {
  const match = description.match(/(\d+)\s*GB/i)
  return match ? parseInt(match[1]) : 0
}

// Helper to generate internal code for VMs
function getVmInternalCode(vmConfig) {
  if (!vmConfig) return 'CI-1VCPU-1GB'
  return `CI-1VCPU-1GB-${vmConfig.vcpu}VCPU-${vmConfig.ram}GBRAM`
}

// Shorter internal code generator
function getInternalCode(item) {
  if (item.category === 'Compute' && item.vmConfig) {
    const { vcpu, ram, storage, os, features } = item.vmConfig
    const osTag = os ? `-${os.split('-')[0].toUpperCase()}` : ''
    const featTag = features && features.length ? '-' + features.map(f => f.split('-')[0].toUpperCase()).join('') : ''
    return `CI-${vcpu}C${ram}R${storage}S${osTag}${featTag}`
  }
  if (item.category === 'Storage' && item.storageConfig) {
    const { size, iops, type } = item.storageConfig
    return `ST-${size}G-${type?.toUpperCase() || 'SSD'}-I${iops >= 1000 ? Math.round(iops/1000)+'K' : iops}`
  }
  if (item.category === 'Network' && item.networkConfig) {
    const { bandwidth, staticIp, firewall } = item.networkConfig
    return `NW-${bandwidth}M${staticIp ? '-SIP' : ''}${firewall ? '-FW' : ''}`
  }
  return item.internalCode
}

// Helper to parse VM config from description and set defaults
function parseVmConfigFromDescription(description) {
  const { vcpu, ram } = extractVMConfig(description)
  return {
    vcpu: vcpu || 2,
    ram: ram || 4,
    storage: 50,
    os: 'windows-2022',
    features: []
  }
}

// Helper to get floor price for an item
function getFloorPrice(item) {
  if (item.category === 'Compute' && item.vmConfig) {
    return item.vmConfig.vcpu * FLOOR_UNIT_PRICES.vcpu +
      item.vmConfig.ram * FLOOR_UNIT_PRICES.ram +
      item.vmConfig.storage * FLOOR_UNIT_PRICES.storage +
      (VM_OS_OPTIONS.find(o => o.value === item.vmConfig.os)?.price || 0) +
      (item.vmConfig.features?.reduce((sum, f) => sum + (VM_FEATURES.find(x => x.value === f)?.price || 0), 0) || 0);
  } else if (item.category === 'Storage' && item.storageConfig) {
    return item.storageConfig.size * FLOOR_UNIT_PRICES.storage;
  } else if (item.category === 'Network') {
    return FLOOR_UNIT_PRICES.network;
  } else if (FLOOR_UNIT_PRICES[item.sku]) {
    return FLOOR_UNIT_PRICES[item.sku];
  }
  return item.unitPrice || 0;
}

const BoQGenerated = ({ items, projectDetails, onProvision }) => {
  const navigate = useNavigate()
  
  const [projectData, setProjectData] = useState(projectDetails)
  const [currentPersona, setCurrentPersona] = useState(() => {
    // Get persona from location state or localStorage, and map to short form
    const persona = getCurrentPersona()
    switch(persona) {
      case PERSONAS.ACCOUNT_MANAGER:
        return 'AM'
      case PERSONAS.SOLUTION_ARCHITECT:
        return 'SA'
      case PERSONAS.PRODUCT_MANAGER:
        return 'PM'
      default:
        return 'AM'
    }
  })
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize boqItems from the passed data or use defaults
  const [boqItems, setBoqItems] = useState(items || [])

  useEffect(() => {
    // This effect now primarily serves to sync if external `items` prop changes.
    // Initial state is now set directly from props.
    if (items) {
      setBoqItems(items);
    }
    if (projectDetails) {
      setProjectData(projectDetails);
    }
  }, [items, projectDetails]);

  const [editingIndex, setEditingIndex] = useState(null)
  const [editValues, setEditValues] = useState({})
  const [showAdd, setShowAdd] = useState(false)
  const [addValues, setAddValues] = useState({ sku: '', quantity: 1, unitPrice: '', description: '' })
  const [approvalRequired, setApprovalRequired] = useState(false)
  const [isFinanceAdmin, setIsFinanceAdmin] = useState(false)
  const [editedRows, setEditedRows] = useState([])
  const [expandedRows, setExpandedRows] = useState([])
  const [newlyAddedIndex, setNewlyAddedIndex] = useState(null)

  // Calculate totals
  const subtotal = boqItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
  const contractDiscount = 15
  const discountAmount = subtotal * (contractDiscount / 100)
  const afterDiscount = subtotal - discountAmount
  const tax = afterDiscount * 0.18
  const total = afterDiscount + tax

  const totals = {
    subtotal,
    contractDiscount,
    discountAmount,
    tax,
    total,
    monthlyTotal: total,
    annualTotal: total * 12
  }

  const resources = {
    totalVMs: boqItems.filter(i => i.category === 'COMPUTE').reduce((a, b) => a + (b.quantity || 0), 0),
    totalCPU: boqItems.filter(i => i.category === 'COMPUTE' && i.vmConfig).reduce((a, b) => a + ((b.quantity || 0) * (b.vmConfig.vcpu || 0)), 0),
    totalRAM: boqItems.filter(i => i.category === 'COMPUTE' && i.vmConfig).reduce((a, b) => a + ((b.quantity || 0) * (b.vmConfig.ram || 0)), 0),
    totalStorage: boqItems.filter(i => i.category === 'STORAGE').reduce((a, b) => a + (b.quantity || 0), 0)
  }

  // Add approveAskPrice handler
  const approveAskPrice = () => {
    setBoqItems(prev => prev.map(item => {
      if (item.askPrice !== undefined && item.askPrice !== item.unitPrice) {
        const newUnitPrice = parseInt(item.askPrice) || item.unitPrice;
        return {
          ...item,
          unitPrice: newUnitPrice,
          totalPrice: newUnitPrice * (item.quantity || 1)
        };
      }
      return item;
    }));
  };

  // Determine workflow
  const workflow = (projectData?.flowType && projectData.flowType !== 'STANDARD') ? 'custom' : 'standard';

  // Check if any item is below floor price
  const hasBelowFloor = boqItems.some(item => {
    const ask = parseInt(item.askPrice) || 0;
    const floor = getFloorPrice(item);
    return ask < floor;
  });

  if (!projectData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card className="max-w-7xl mx-auto shadow-lg">
        <CardHeader className="bg-gray-100/50">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl text-gray-800">Bill of Quantities</CardTitle>
              <CardDescription>Project: {projectData?.projectName || 'N/A'}</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
              <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
              <Button onClick={() => navigate('/proposal', { state: { ...projectData, boqItems: boqItems } })}>Generate Proposal <ArrowRight className="ml-2 h-4 w-4" /></Button>
              <Button onClick={onProvision} variant="success" className="bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle className="mr-2 h-4 w-4" /> Provision Customer
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="technical">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="technical">Technical</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>
            <TabsContent value="technical">
              <BoQTable
                items={boqItems}
                setItems={setBoqItems}
                editable={projectData?.flowType === 'custom'
                  ? (currentPersona === 'AM' && (projectData?.status === 'Draft' || projectData?.status === 'Pending Solution Architect Review'))
                    || (currentPersona === 'PM' && projectData?.status === 'Pending Product Manager Review')
                  : true}
                allowCustomSKU={projectData?.flowType !== 'custom'}
                restrictEditToStandardSkus={projectData?.flowType === 'custom' && currentPersona === 'AM'}
                restrictEditToCustomSkus={projectData?.flowType === 'custom' && currentPersona === 'PM'}
                highlightNew={newlyAddedIndex}
                onAddResource={(item) => {
                  setBoqItems(prev => [...prev, item]);
                  setNewlyAddedIndex(boqItems.length);
                  setTimeout(() => setNewlyAddedIndex(null), 2000);
                }}
                onEditResource={(idx, item) => {
                  const updated = [...boqItems];
                  updated[idx] = item;
                  setBoqItems(updated);
                }}
                onApprovalStatusChange={setApprovalRequired}
                persona={currentPersona}
                workflow={workflow}
              />
            </TabsContent>
            <TabsContent value="pricing">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>Subtotal</TableCell>
                    <TableCell className="text-right">₹{totals.subtotal.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Contract Discount ({totals.contractDiscount}%)</TableCell>
                    <TableCell className="text-right">-₹{totals.discountAmount.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Tax (18%)</TableCell>
                    <TableCell className="text-right">₹{totals.tax.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold">Total (Monthly)</TableCell>
                    <TableCell className="text-right font-bold">₹{totals.monthlyTotal.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold">Total (Annual)</TableCell>
                    <TableCell className="text-right font-bold">₹{totals.annualTotal.toLocaleString()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="resources">
              <Card style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.07)', borderRadius: 16, marginBottom: 32 }}>
                <CardHeader>
                  <CardTitle>Resource Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Total VMs</p>
                      <p className="text-2xl font-bold">{resources.totalVMs}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Total vCPUs</p>
                      <p className="text-2xl font-bold">{resources.totalCPU}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Total RAM (GB)</p>
                      <p className="text-2xl font-bold">{resources.totalRAM}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Total Storage (GB)</p>
                      <p className="text-2xl font-bold">{resources.totalStorage}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="summary">
              <Card style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.07)', borderRadius: 16, marginBottom: 120 }}>
                <CardHeader>
                  <CardTitle>Pricing Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell>Subtotal</TableCell>
                        <TableCell className="text-right">₹{totals.subtotal.toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Contract Discount ({totals.contractDiscount}%)</TableCell>
                        <TableCell className="text-right">-₹{totals.discountAmount.toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Tax (18%)</TableCell>
                        <TableCell className="text-right">₹{totals.tax.toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-bold">Total (Monthly)</TableCell>
                        <TableCell className="text-right font-bold">₹{totals.monthlyTotal.toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-bold">Total (Annual)</TableCell>
                        <TableCell className="text-right font-bold">₹{totals.annualTotal.toLocaleString()}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default BoQGenerated

