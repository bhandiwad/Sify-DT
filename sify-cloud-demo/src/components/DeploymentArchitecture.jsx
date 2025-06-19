import React, { useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Handle, 
  Position,
  MarkerType,
  useNodesState,
  useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { SERVICE_CATEGORIES } from '../utils/serviceModel';

function findServiceDetails(sku) {
  for (const category of Object.values(SERVICE_CATEGORIES)) {
    const service = category.services.find(s => s.sku === sku);
    if (service) {
      return { ...service, category };
    }
  }
  return null;
}

const ServiceNode = ({ data }) => {
  const Icon = data.icon;
  return (
    <Card className="min-w-[200px] p-3">
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="font-medium text-sm flex items-center justify-between">
            {data.label}
            {data.instanceLabel && (
              <Badge variant="outline" className="ml-1">{data.instanceLabel}</Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground">{data.sku}</div>
          {data.config && (
            <div className="text-xs mt-2 space-y-1">
              {/* Compute */}
              {data.config.cpu && data.config.ram && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Compute:</span>
                  {data.config.cpu}vCPU, {data.config.ram}GB RAM
                </div>
              )}
              {/* Storage */}
              {data.config.storage && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Storage:</span>
                  {data.config.storage.ssd && `${data.config.storage.ssd}GB SSD`}
                  {data.config.storage.hdd && `${data.config.storage.hdd}GB HDD`}
                </div>
              )}
              {/* Network */}
              {data.config.network && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Network:</span>
                  {data.config.network.publicIp ? 'Public IP, ' : ''}
                  {data.config.network.firewall ? 'Firewall' : ''}
                </div>
              )}
              {/* OS */}
              {data.config.os && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">OS:</span>
                  {data.config.os}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
};

const EnvironmentColumn = ({ envKey, env, children, x }) => (
  <div style={{ position: 'absolute', left: x, top: 0, width: 300 }}>
    <div className="font-bold text-lg mb-2" style={{ color: env.color }}>{env.name}</div>
    {children}
  </div>
);

const nodeTypes = {
  service: ServiceNode
};

export default function DeploymentArchitecture({ environments, services }) {
  // Generate nodes and edges based on environments and services
  const generateGraph = useCallback(() => {
    const nodes = [];
    const edges = [];
    const envKeys = Object.keys(environments);
    const envSpacing = 400; // Increased spacing for better readability
    
    envKeys.forEach((envKey, envIdx) => {
      const env = environments[envKey];
      const envServices = services[envKey] || [];
      
      // Group services by category for better organization
      const servicesByCategory = envServices.reduce((acc, instance) => {
        const category = instance.category?.name || 'Other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(instance);
        return acc;
      }, {});
      
      let yOffset = 100;
      Object.entries(servicesByCategory).forEach(([category, instances]) => {
        instances.forEach((instance, idx) => {
          const nodeId = `${envKey}-${instance.id}`;
          nodes.push({
            id: nodeId,
            type: 'service',
            position: { 
              x: envIdx * envSpacing + 50, // Added margin
              y: yOffset
            },
            data: {
              label: instance.label,
              sku: instance.sku,
              icon: instance.icon,
              config: instance.config,
              instanceLabel: instances.length > 1 ? `#${idx + 1}` : ''
            }
          });
          
          // Draw dependency edges
          if (instance.dependencies) {
            instance.dependencies.forEach(depSku => {
              // Find all instances of the dependency in this env
              const depInstances = envServices.filter(inst => inst.sku === depSku);
              depInstances.forEach(depInstance => {
                edges.push({
                  id: `${nodeId}-dep-${depInstance.id}`,
                  source: nodeId,
                  target: `${envKey}-${depInstance.id}`,
                  markerEnd: { type: MarkerType.ArrowClosed },
                  type: 'smoothstep',
                  animated: true,
                  style: { stroke: '#888' }
                });
              });
            });
          }
          
          yOffset += 200; // Increased spacing between nodes
        });
        yOffset += 50; // Add space between categories
      });
    });
    
    return { nodes, edges };
  }, [environments, services]);

  const { nodes: initialNodes, edges: initialEdges } = generateGraph();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="w-full h-[800px] relative border rounded-lg">
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-around bg-background/80 backdrop-blur-sm border-b z-10">
        {Object.entries(environments).map(([key, env]) => (
          <div key={key} className="text-sm font-medium" style={{ color: env.color }}>
            {env.name}
          </div>
        ))}
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.5}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
} 