import React, { useMemo } from 'react';
import ReactFlow, { MiniMap, Controls, Background } from 'reactflow';
import 'reactflow/dist/style.css';

import { mockCustomerInventory } from '@/utils/mockInventoryData';

const position = { x: 0, y: 0 };
const edgeOptions = {
  animated: true,
  style: {
    stroke: '#334155',
  },
};

const ResourceTopology = () => {
  const { nodes, edges } = useMemo(() => {
    const allResources = mockCustomerInventory.subscriptions.flatMap(sub =>
      sub.services.flatMap(service => service.resources)
    );

    const initialNodes = allResources.map((resource, i) => ({
      id: resource.id,
      data: { label: `${resource.type}: ${resource.name}` },
      position: { x: (i % 4) * 250, y: Math.floor(i / 4) * 150 },
      style: {
        background: '#f0f9ff',
        color: '#0c4a6e',
        border: '1px solid #7dd3fc',
        borderRadius: '0.375rem',
        width: 180,
      },
    }));

    const initialEdges = allResources.flatMap(resource =>
      (resource.dependsOn || []).map(depId => ({
        id: `e-${depId}-${resource.id}`,
        source: depId,
        target: resource.id,
        ...edgeOptions,
      }))
    );

    return { nodes: initialNodes, edges: initialEdges };
  }, []);

  return (
    <div style={{ height: '75vh' }} className="rounded-lg border bg-white dark:bg-gray-800">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};

export default ResourceTopology; 