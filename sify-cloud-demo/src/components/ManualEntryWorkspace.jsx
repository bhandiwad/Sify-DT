import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ServiceCard } from './ui/service-card';
import { EnvironmentSelector } from './ui/environment-selector';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle, Info } from 'lucide-react';
import { SERVICE_CATEGORIES, ENVIRONMENT_TYPES, COMPLIANCE_REQUIREMENTS, SERVICE_DEPENDENCIES } from '../utils/serviceModel';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Search, Filter, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui/resizable";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import DeploymentArchitecture from './DeploymentArchitecture';
import ServiceConfigModal from './ServiceConfigModal';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_SKU } from './BoQTable';

export default function ManualEntryWorkspace() {
  const location = useLocation();
  const navigate = useNavigate();
  const projectData = location.state?.projectData || {};
  
  const [selectedEnvironments, setSelectedEnvironments] = useState([]);
  const [selectedServices, setSelectedServices] = useState({});
  const [currentTab, setCurrentTab] = useState("environments");
  const [complianceRequirements, setComplianceRequirements] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Add environments state
  const [environments, setEnvironments] = useState({});
  
  const [configModal, setConfigModal] = useState({ open: false, envKey: null, service: null });
  
  const findServiceDetails = (sku) => {
    for (const category of Object.values(SERVICE_CATEGORIES)) {
      const service = category.services.find(s => s.sku === sku);
      if (service) {
        return { ...service, category };
      }
    }
    return null;
  };
  
  const handleEnvironmentSelect = (envKey) => {
    setSelectedEnvironments(prev => {
      const newSelection = prev.includes(envKey)
        ? prev.filter(e => e !== envKey)
        : [...prev, envKey];
        
      // Update environments state
      setEnvironments(current => {
        const newEnv = { ...current };
        if (newSelection.includes(envKey)) {
          newEnv[envKey] = {
            name: ENVIRONMENT_TYPES[envKey].name,
            scalingFactor: ENVIRONMENT_TYPES[envKey].scalingFactor,
            color: ENVIRONMENT_TYPES[envKey].color
          };
        } else {
          delete newEnv[envKey];
          // Also clean up services for this environment
          setSelectedServices(current => {
            const newServices = { ...current };
            delete newServices[envKey];
            return newServices;
          });
        }
        return newEnv;
      });
      
      return newSelection;
    });
  };
  
  const handleServiceSelect = (service, envKey) => {
    const envServices = selectedServices[envKey] || [];
    const alreadyAdded = envServices.some(s => s.sku === service.sku);
    if (alreadyAdded) {
      // Remove service
      setSelectedServices(prev => ({
        ...prev,
        [envKey]: envServices.filter(s => s.sku !== service.sku)
      }));
    } else {
      // Open config modal
      setConfigModal({ open: true, envKey, service });
    }
  };
  
  const handleAddServiceInstance = (service, envKey) => {
    setConfigModal({ open: true, envKey, service, initialConfig: null, instanceId: uuidv4() });
  };
  
  const handleConfigure = (service, envKey, instance) => {
    setConfigModal({ open: true, envKey, service, initialConfig: instance?.config, instanceId: instance?.id });
  };
  
  const handleConfigSave = (envKey, service, config) => {
    setSelectedServices(prev => {
      const envServices = prev[envKey] || [];
      // If editing, update the instance; if adding, add new
      const idx = envServices.findIndex(s => s.id === configModal.instanceId);
      if (idx > -1) {
        // Update
        const updated = [...envServices];
        updated[idx] = { ...updated[idx], config };
        return { ...prev, [envKey]: updated };
      } else {
        // Add new
        return {
          ...prev,
          [envKey]: [...envServices, { id: configModal.instanceId, sku: service.sku, config }]
        };
      }
    });
    setConfigModal({ open: false, envKey: null, service: null, initialConfig: null, instanceId: null });
  };
  
  const handleConfigCancel = () => {
    setConfigModal({ open: false, envKey: null, service: null });
  };
  
  const getAffectedServices = (requirement) => {
    return COMPLIANCE_REQUIREMENTS[requirement]?.affectedServices || [];
  };
  
  const handleComplianceChange = (requirement, options) => {
    setComplianceRequirements(prev => ({
      ...prev,
      [requirement]: options
    }));
  };
  
  const getMissingComplianceServices = () => {
    const requiredServices = new Set();
    Object.entries(complianceRequirements).forEach(([req, options]) => {
      if (options && options.length > 0) {
        getAffectedServices(req).forEach(service => requiredServices.add(service));
      }
    });
    
    const missing = new Set();
    selectedEnvironments.forEach(envKey => {
      const envServices = selectedServices[envKey] || [];
      requiredServices.forEach(service => {
        if (!envServices.includes(service)) {
          missing.add(service);
        }
      });
    });
    
    return Array.from(missing);
  };
  
  const handleSubmit = () => {
    const boqItems = [];
    
    // Process each environment's services
    selectedEnvironments.forEach(envKey => {
      const services = selectedServices[envKey] || [];
      services.forEach(instance => {
        const serviceDetails = findServiceDetails(instance.sku);
        if (!serviceDetails) return;
        
        // Base item
        let category = serviceDetails.category?.title || 'Other';
        let sku = instance.sku;
        // Standardize category and SKU
        if (category && DEFAULT_SKU[category.toUpperCase()]) {
          category = category.toUpperCase();
          sku = DEFAULT_SKU[category];
        } else if (category === 'Other' || !DEFAULT_SKU[category?.toUpperCase()]) {
          category = 'CUSTOM';
          sku = 'CI-CUSTOM';
        }
        const item = {
          id: instance.id,
          sku,
          category,
          quantity: instance.config.instance_count || 1,
          description: serviceDetails.label,
          internalCode: '',
          unitPrice: 0,
          totalPrice: 0,
          env: envKey,
          environmentColor: ENVIRONMENT_TYPES[envKey].color
        };

        // Handle VM configurations
        if (instance.sku === 'VM-BASIC') {
          item.category = 'Compute';
          item.vmConfig = {
            vcpu: instance.config.cpu || 2,
            ram: instance.config.ram || 4,
            storage: instance.config.storage || 50,
            os: instance.config.os || 'windows-2022',
            features: []
          };
          if (instance.config.backup_retention) item.vmConfig.features.push('backup');
          if (instance.config.monitoring === 'advanced') item.vmConfig.features.push('antivirus');
          
          // Calculate base price
          item.unitPrice = (
            (item.vmConfig.vcpu * 400) + // CPU cost
            (item.vmConfig.ram * 200) + // RAM cost
            (item.vmConfig.storage * 8) // Storage cost
          );
          
          // Add OS cost
          if (item.vmConfig.os === 'windows-2022') item.unitPrice += 800;
          if (item.vmConfig.os === 'rhel') item.unitPrice += 1200;
          
          // Add feature costs
          item.vmConfig.features.forEach(feature => {
            if (feature === 'backup') item.unitPrice += 300;
            if (feature === 'antivirus') item.unitPrice += 200;
          });
        }
        
        // Handle network configurations
        if (instance.config.public_ip || instance.config.firewall_enabled) {
          item.networkConfig = {
            public_ip: instance.config.public_ip || false,
            firewall_enabled: instance.config.firewall_enabled || false,
            inbound_ports: instance.config.inbound_ports || [],
            outbound_access: instance.config.outbound_access || 'restricted'
          };
          
          // Add network costs
          if (item.networkConfig.public_ip) item.unitPrice += 1000;
          if (item.networkConfig.firewall_enabled) item.unitPrice += 2000;
        }
        
        // Apply environment scaling factor
        item.unitPrice *= ENVIRONMENT_TYPES[envKey].scalingFactor || 1;
        item.totalPrice = item.unitPrice * item.quantity;
        
        boqItems.push(item);
      });
    });
    
    // Navigate to BoQ page with the formatted items
    navigate('/boq-generated', {
      state: {
        ...projectData,
        boqItems,
        environments: selectedEnvironments.reduce((acc, envKey) => ({
          ...acc,
          [envKey]: {
            name: ENVIRONMENT_TYPES[envKey].name,
            scalingFactor: ENVIRONMENT_TYPES[envKey].scalingFactor,
            color: ENVIRONMENT_TYPES[envKey].color
          }
        }), {}),
        compliance: complianceRequirements
      }
    });
  };
  
  const missingComplianceServices = getMissingComplianceServices();
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Manual Entry Workspace</h1>
      <p className="text-muted-foreground">Configure your environments and select services for each environment.</p>
      
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="environments">1. Environment Selection</TabsTrigger>
          <TabsTrigger 
            value="compliance" 
            disabled={selectedEnvironments.length === 0}
          >
            2. Compliance Requirements
          </TabsTrigger>
          <TabsTrigger 
            value="services" 
            disabled={selectedEnvironments.length === 0}
          >
            3. Service Selection
          </TabsTrigger>
          <TabsTrigger 
            value="architecture" 
            disabled={selectedEnvironments.length === 0}
          >
            4. Architecture
          </TabsTrigger>
          <TabsTrigger 
            value="review" 
            disabled={selectedEnvironments.length === 0}
          >
            5. Review
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="environments">
          <EnvironmentSelector
            environments={ENVIRONMENT_TYPES}
            selectedEnvironments={selectedEnvironments}
            onEnvironmentChange={handleEnvironmentSelect}
          />
          
          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => setCurrentTab("compliance")}
              disabled={selectedEnvironments.length === 0}
            >
              Next: Compliance Requirements
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="compliance">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(COMPLIANCE_REQUIREMENTS).map(([key, requirement]) => (
                <div key={key} className="space-y-4">
                  <h3 className="text-lg font-semibold">{requirement.label}</h3>
                  <p className="text-sm text-muted-foreground">{requirement.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {requirement.options.map(option => (
                      <Button
                        key={option}
                        variant="outline"
                        size="sm"
                        className={`${
                          complianceRequirements[key]?.includes(option)
                            ? 'bg-primary text-primary-foreground'
                            : ''
                        }`}
                        onClick={() => {
                          const current = complianceRequirements[key] || [];
                          const updated = current.includes(option)
                            ? current.filter(o => o !== option)
                            : [...current, option];
                          handleComplianceChange(key, updated);
                        }}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Required services: {requirement.affectedServices.join(', ')}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentTab("environments")}
              >
                Back to Environments
              </Button>
              <Button
                onClick={() => setCurrentTab("services")}
              >
                Next: Select Services
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="services" className="space-y-6">
          <ResizablePanelGroup direction="horizontal">
            {/* Catalog Panel */}
            <ResizablePanel defaultSize={20}>
              <div className="h-[calc(100vh-200px)] border rounded-lg">
                <div className="p-4 border-b bg-muted/50">
                  <h3 className="font-medium">Service Catalog</h3>
                </div>
                <ScrollArea className="h-[calc(100%-57px)]">
                  <Accordion type="single" collapsible className="p-2">
                    {Object.entries(SERVICE_CATEGORIES).map(([key, category]) => (
                      <AccordionItem key={key} value={key}>
                        <AccordionTrigger className="flex items-center gap-2 py-2">
                          <category.icon className="w-4 h-4" />
                          <span>{category.title}</span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pl-6 space-y-1">
                            {category.services.map(service => (
                              <div
                                key={service.sku}
                                className={`
                                  flex items-center gap-2 p-2 rounded-md cursor-pointer
                                  hover:bg-accent text-sm
                                  ${selectedCategory === service.sku ? 'bg-accent' : ''}
                                `}
                                onClick={() => setSelectedCategory(service.sku)}
                              >
                                <div className="w-2 h-2 rounded-full bg-primary/50" />
                                {service.label}
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </ScrollArea>
              </div>
            </ResizablePanel>
            
            <ResizableHandle />
            
            {/* Service Selection Panel */}
            <ResizablePanel defaultSize={80}>
              <div className="h-[calc(100vh-200px)] border rounded-lg">
                <div className="p-4 border-b bg-muted/50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Input 
                      placeholder="Search services..." 
                      className="w-[300px]"
                      onChange={(e) => {
                        // Implement search
                      }}
                    />
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {Object.entries(SERVICE_CATEGORIES).map(([key, category]) => (
                          <SelectItem key={key} value={key}>{category.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="p-4">
                  <Tabs defaultValue={selectedEnvironments[0]}>
                    <TabsList>
                      {selectedEnvironments.map(envKey => (
                        <TabsTrigger 
                          key={envKey} 
                          value={envKey}
                          className="flex items-center gap-2"
                        >
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: ENVIRONMENT_TYPES[envKey].color }}
                          />
                          {ENVIRONMENT_TYPES[envKey].shortName}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {selectedEnvironments.map(envKey => (
                      <TabsContent key={envKey} value={envKey}>
                        <ScrollArea className="h-[calc(100vh-380px)]">
                          <div className="space-y-8 p-1">
                            {Object.entries(SERVICE_CATEGORIES).map(([categoryKey, category]) => (
                              <div key={categoryKey} className="mb-6">
                                <div className="flex items-center gap-2 mb-2">
                                  <category.icon className="h-5 w-5" />
                                  <h3 className="text-lg font-semibold">{category.title}</h3>
                                  <Separator className="flex-1" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {category.services.map(service => {
                                    // Find all instances of this service in this environment
                                    const envServices = selectedServices[envKey] || [];
                                    const instances = envServices.filter(s => s.sku === service.sku);
                                    const isSingleton = ["MONITORING", "LOG-ANALYTICS", "FIREWALL", "WAF", "LOAD-BALANCER", "VPN-GATEWAY", "OBJECT-STORAGE"].includes(service.sku);
                                    return (
                                      <div key={service.sku} className="space-y-2">
                                        {instances.map((instance, idx) => (
                                          <ServiceCard
                                            key={instance.id}
                                            service={service}
                                            category={category}
                                            environmentType={ENVIRONMENT_TYPES[envKey]}
                                            selectedServices={envServices}
                                            onSelect={() => {
                                              // Remove this instance
                                              setSelectedServices(prev => ({
                                                ...prev,
                                                [envKey]: prev[envKey].filter(s => s.id !== instance.id)
                                              }));
                                            }}
                                            onConfigure={() => handleConfigure(service, envKey, instance)}
                                          />
                                        ))}
                                        {/* Add button for multi-instance or if not already added for singleton */}
                                        {(!isSingleton || instances.length === 0) && (
                                          <Button size="sm" variant="outline" onClick={() => handleAddServiceInstance(service, envKey)}>
                                            + Add {service.label}
                                          </Button>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setCurrentTab("compliance")}>Back to Compliance</Button>
            <Button onClick={() => setCurrentTab("architecture")} disabled={selectedEnvironments.some(envKey => !(selectedServices[envKey] && selectedServices[envKey].length > 0))}>Next: Architecture</Button>
          </div>
        </TabsContent>
        
        <TabsContent value="architecture">
          <Card>
            <CardHeader>
              <CardTitle>Deployment Architecture</CardTitle>
              <CardDescription>
                Visual representation of your infrastructure across environments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DeploymentArchitecture 
                environments={Object.entries(environments).reduce((acc, [key, env]) => ({
                  ...acc,
                  [key]: {
                    ...env,
                    ...ENVIRONMENT_TYPES[key]
                  }
                }), {})}
                services={Object.entries(selectedServices).reduce((acc, [envKey, services]) => ({
                  ...acc,
                  [envKey]: services.map(instance => {
                    const serviceDetails = findServiceDetails(instance.sku);
                    return {
                      ...instance,
                      ...serviceDetails,
                      id: instance.id || uuidv4(),
                      label: serviceDetails?.label || instance.sku,
                      icon: serviceDetails?.category?.icon,
                      dependencies: SERVICE_DEPENDENCIES[instance.sku] || []
                    };
                  })
                }), {})}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="review">
          <div className="space-y-8">
            {selectedEnvironments.map(envKey => (
              <div key={envKey}>
                <h3 className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ENVIRONMENT_TYPES[envKey].color }} />
                  {ENVIRONMENT_TYPES[envKey].name}
                </h3>
                {Object.entries(SERVICE_CATEGORIES).map(([catKey, category]) => {
                  const envServices = (selectedServices[envKey] || []).filter(s => category.services.some(cs => cs.sku === s.sku));
                  if (envServices.length === 0) return null;
                  return (
                    <div key={catKey} className="mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <category.icon className="h-4 w-4" />
                        <span className="font-semibold">{category.title}</span>
                      </div>
                      <ul className="ml-6 space-y-2">
                        {envServices.map(instance => {
                          const service = category.services.find(s => s.sku === instance.sku);
                          return (
                            <li key={instance.id} className="border rounded p-2 bg-muted/30">
                              <div className="font-medium">{service.label}</div>
                              <div className="text-xs text-muted-foreground mb-1">{service.sku}</div>
                              <div className="text-sm">
                                {Object.entries(instance.config).map(([k, v]) => {
                                  let displayValue = v;
                                  if (typeof v === 'boolean') {
                                    displayValue = v ? 'Yes' : 'No';
                                  } else if (Array.isArray(v)) {
                                    displayValue = v.join(', ');
                                  } else if (typeof v === 'object' && v !== null) {
                                    displayValue = JSON.stringify(v);
                                  }
                                  return (
                                    <span key={k} className="mr-3">
                                      <span className="font-medium">{k}:</span> {displayValue}
                                    </span>
                                  );
                                })}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
            ))}
            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={() => setCurrentTab("services")}>Back to Services</Button>
              <Button onClick={handleSubmit} disabled={selectedEnvironments.some(envKey => !(selectedServices[envKey] && selectedServices[envKey].length > 0))}>Generate BoQ</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      <ServiceConfigModal
        open={configModal.open}
        service={configModal.service}
        initialConfig={configModal.initialConfig}
        onSave={config => handleConfigSave(configModal.envKey, configModal.service, config)}
        onCancel={handleConfigCancel}
      />
    </div>
  );
} 