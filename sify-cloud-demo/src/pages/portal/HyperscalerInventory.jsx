import React from 'react';
import { useInventory } from '@/context/InventoryContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, Cloud, Power, Database, Cpu } from 'lucide-react';


const HyperscalerInventory = ({ provider }) => {
  const navigate = useNavigate();
  const { inventory } = useInventory();

  if (!inventory) {
    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold text-red-600">No Inventory Data</h2>
            <p>Please go back to the dashboard and select a customer.</p>
            <Button onClick={() => navigate('/')} className="mt-4">Back to Dashboard</Button>
        </div>
    );
  }
  
  const getProviderIcon = (provider) => {
      // In a real app, you'd use actual logos. For now, a generic icon.
      return <Cloud className="h-6 w-6" />;
  }

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
               {getProviderIcon(provider)}
               <div>
                <CardTitle>{provider} Managed Account: {inventory.customerName}</CardTitle>
                <CardDescription>
                  Summary of resources managed by Sify in the customer's {provider} account.
                </CardDescription>
               </div>
            </div>
            <Button variant="outline" onClick={() => navigate('/')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Name / ID</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Tags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.services.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.service}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    <ul className="text-xs list-disc pl-4">
                      {Object.entries(item.details).map(([key, value]) => (
                        <li key={key}>
                          <span className="font-semibold">{key}:</span> {value}
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell>
                      {Object.entries(item.tags).map(([key, value]) => (
                        <span key={key} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full mr-1">
                          {key}: {value}
                        </span>
                      ))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default HyperscalerInventory; 