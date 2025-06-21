import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useInventory } from './PortalLayout';

const nodeStyle = {
  background: '#fff',
  border: '1px solid #ddd',
  borderRadius: '8px',
  padding: '15px',
  fontSize: '12px',
  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
};

const ResourceTopology = () => {
  const inventory = useInventory();

  const { nodes, edges } = useMemo(() => {
    if (!inventory) return { nodes: [], edges: [] };

    const allResources = inventory.subscriptions.flatMap(sub =>
      sub.services.flatMap(s => s.resources)
    );

    const initialNodes = allResources.map((resource, i) => ({
      id: resource.id,
      position: { x: (i % 5) * 200, y: Math.floor(i / 5) * 150 },
      data: { label: `${resource.type}: ${resource.name}` },
      style: nodeStyle,
    }));

    const initialEdges = allResources.flatMap(resource =>
      (resource.dependsOn || []).map(depId => ({
        id: `e-${resource.id}-${depId}`,
        source: depId,
        target: resource.id,
        animated: true,
        style: { stroke: '#007bff' },
      }))
    );
    return { nodes: initialNodes, edges: initialEdges };
  }, [inventory]);

  if (!inventory) {
    return <div>Loading inventory data...</div>;
  }
  
  return (
    <div style={{ height: '70vh', width: '100%' }} className="bg-gray-50 rounded-lg shadow-inner">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};

export default ResourceTopology; 