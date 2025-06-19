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
import { Download, ArrowLeft, Shield, Server, Database, ArrowRight } from 'lucide-react'
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

const BoQGenerated = () => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const [projectData, setProjectData] = useState(null)
  const [currentPersona, setCurrentPersona] = useState(() => {
    // Get persona from location state or localStorage, and map to short form
    const persona = location.state?.currentPersona || getCurrentPersona()
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
  const [boqItems, setBoqItems] = useState([])

  useEffect(() => {
    // Robust project loading: always prefer main projects list
    let projectId = location.state?.projectId;
    if (!projectId) {
      // Try URL params
      const params = new URLSearchParams(window.location.search);
      projectId = params.get('projectId');
    }
    if (!projectId) {
      // Try localStorage currentProject
      const currentProject = localStorage.getItem('currentProject');
      if (currentProject) {
        try {
          const parsed = JSON.parse(currentProject);
          projectId = parsed.id;
        } catch (e) { /* ignore */ }
      }
    }
    let loadedProject = null;
    if (projectId) {
      loadedProject = getProject(projectId);
      if (loadedProject) {
        setProjectData(loadedProject);
        if (loadedProject.boqItems) {
          const newItems = loadedProject.boqItems.map(item => {
            const category = (item.category || 'COMPUTE').toUpperCase();
            return {
              ...normalizeBoqItem(item),
              category,
              sku: item.sku || DEFAULT_SKU[category] || DEFAULT_SKU['COMPUTE']
            };
          });
          setBoqItems(newItems);
          console.log('BoQGenerated: loaded project from main list', loadedProject);
          console.log('BoQGenerated: loaded boqItems', newItems);
          return;
        }
      }
    }
    // Fallback to location.state
    if (location.state) {
      setProjectData(location.state);
      if (location.state.boqItems) {
        const newItems = location.state.boqItems.map(item => {
          const category = (item.category || 'COMPUTE').toUpperCase();
          return {
            ...normalizeBoqItem(item),
            category,
            sku: item.sku || DEFAULT_SKU[category] || DEFAULT_SKU['COMPUTE']
          };
        });
        setBoqItems(newItems);
        console.log('BoQGenerated: initialized boqItems from location.state', newItems);
      }
    }
  }, [location.state]);

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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bill of Quantities</h1>
          <p className="text-muted-foreground">Review and finalize your infrastructure configuration</p>
        </div>
        <div className="flex items-center gap-4">
          <span style={{ fontWeight: 500, color: '#374151', background: '#f3f4f6', borderRadius: 6, padding: '0.25rem 0.75rem', fontSize: 15 }}>
            Role: {currentPersona === 'AM' ? 'Account Manager' : currentPersona === 'SA' ? 'Solution Architect' : currentPersona === 'PM' ? 'Product Manager' : currentPersona}
          </span>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Customer Name</p>
              <p className="text-muted-foreground">{projectData.customerName}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Project Name</p>
              <p className="text-muted-foreground">{projectData.projectName}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Deal ID</p>
              <p className="text-muted-foreground">{projectData.dealId}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resource Configuration</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <Card style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.07)', borderRadius: 16, marginBottom: 32 }}>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
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

      {projectData?.flowType === 'custom' && currentPersona === 'AM' && (projectData?.status === 'Draft' || projectData?.status === 'Pending Solution Architect Review') && (
        <div className="flex justify-end mt-8 mb-4">
          <Button
            onClick={() => {
              // Update project status and navigate
              const updatedProject = { ...projectData, status: 'Pending Solution Architect Review', boqItems };
              localStorage.setItem('currentProject', JSON.stringify(updatedProject));
              navigate('/solution-architect-vetting', { state: { projectId: updatedProject.id, currentPersona: 'SA' } });
            }}
            style={{ background: '#2563eb', color: 'white', fontWeight: 800, fontSize: 20, borderRadius: 10, padding: '1.25rem 3rem', boxShadow: '0 4px 16px rgba(37,99,235,0.15)', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 12 }}
          >
            <ArrowRight className="w-6 h-6 mr-2" />
            Send to Solution Architect for Review
          </Button>
        </div>
      )}

      {/* Sticky bottom bar for actions */}
      <div style={{
        position: 'fixed',
        left: 0,
        bottom: 0,
        width: '100%',
        background: 'rgba(255,255,255,0.98)',
        boxShadow: '0 -2px 16px rgba(0,0,0,0.07)',
        padding: '1rem 0',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'center',
        gap: 16,
      }}>
        <Button variant="outline" style={{ minWidth: 120, fontWeight: 500, fontSize: 16 }}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        {boqItems.some(item => item.askPrice !== undefined && item.askPrice !== item.unitPrice) && (
          <Button variant="secondary" onClick={approveAskPrice} style={{ minWidth: 180, fontWeight: 500, fontSize: 16 }}>
            Approve Ask Price
          </Button>
        )}
        <Button
          onClick={() => navigate('/proposal-generated', { state: { ...projectData, boqItems, totals, projectId: projectData.id } })}
          disabled={projectData?.flowType === 'custom' && projectData?.status !== 'Approved' && projectData?.status !== 'Pending Finance Approval'}
          style={{ minWidth: 240, fontWeight: 700, fontSize: 18, background: '#2563eb', color: 'white', borderRadius: 8, boxShadow: '0 2px 8px rgba(37,99,235,0.08)', opacity: (projectData?.flowType === 'custom' && projectData?.status !== 'Approved' && projectData?.status !== 'Pending Finance Approval') ? 0.6 : 1, cursor: (projectData?.flowType === 'custom' && projectData?.status !== 'Approved' && projectData?.status !== 'Pending Finance Approval') ? 'not-allowed' : 'pointer' }}
          title={projectData?.flowType === 'custom' && projectData?.status !== 'Approved' && projectData?.status !== 'Pending Finance Approval' ? 'Complete the workflow and get all approvals before generating the proposal.' : ''}
        >
          Generate Proposal
        </Button>
      </div>
    </div>
  )
}

export default BoQGenerated

