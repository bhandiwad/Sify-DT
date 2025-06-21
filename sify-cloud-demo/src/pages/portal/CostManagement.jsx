import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { mockCustomerInventory } from '@/utils/mockInventoryData';
import { LOCATIONS, SERVICE_CATEGORIES } from '@/utils/inventoryModel';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff4d4d'];

const CostManagement = () => {
  const { totalMrr, byCategory, byLocation } = useMemo(() => {
    const allResources = mockCustomerInventory.subscriptions.flatMap(sub =>
      sub.services.flatMap(service => service.resources)
    );

    const total = allResources.reduce((sum, resource) => sum + resource.mrr, 0);

    const categoryCosts = Object.values(SERVICE_CATEGORIES).map(category => ({
      name: category,
      value: allResources
        .filter(r => r.category === category)
        .reduce((sum, r) => sum + r.mrr, 0),
    })).filter(c => c.value > 0);

    const locationCosts = Object.values(LOCATIONS).map(location => ({
      name: location,
      value: allResources
        .filter(r => r.location.includes(location))
        .reduce((sum, r) => sum + r.mrr, 0),
    })).filter(l => l.value > 0);

    return { totalMrr: total, byCategory: categoryCosts, byLocation: locationCosts };
  }, []);

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