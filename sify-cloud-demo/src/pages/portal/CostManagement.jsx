import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import { useInventory } from './PortalLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658'];

const renderActiveShape = (props) => {
// ... existing code ...
};

const CostManagement = () => {
  const inventory = useInventory();
  
  const { totalMrr, byCategory, byLocation } = useMemo(() => {
    if (!inventory) return { totalMrr: 0, byCategory: [], byLocation: [] };
    
    const allResources = inventory.subscriptions.flatMap(sub =>
      sub.services.flatMap(s => s.resources)
    );

    const total = allResources.reduce((sum, resource) => sum + resource.mrr, 0);

    const categoryCosts = allResources.reduce((acc, resource) => {
      acc[resource.category] = (acc[resource.category] || 0) + resource.mrr;
      return acc;
    }, {});
    const categoryData = Object.entries(categoryCosts).map(([name, value]) => ({ name, value }));
    
    const locationCosts = allResources.reduce((acc, resource) => {
      acc[resource.location] = (acc[resource.location] || 0) + resource.mrr;
      return acc;
    }, {});
    const locationData = Object.entries(locationCosts).map(([name, value]) => ({ name, value }));

    return { totalMrr: total, byCategory: categoryData, byLocation: locationData };
  }, [inventory]);

  if (!inventory) {
    return <div>Loading inventory data...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">
            ₹{totalMrr.toLocaleString()}
          </div>
          <p className="text-xs text-gray-500">
            Total Monthly Recurring Revenue (MRR)
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown by Service Category</CardTitle>
          </CardHeader>
          <CardContent style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {byCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown by Location</CardTitle>
          </CardHeader>
          <CardContent style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byLocation} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {byLocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CostManagement; 