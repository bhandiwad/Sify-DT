import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Server, Database, Shield, Network, ChevronDown, ChevronRight, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useInventory } from '@/context/InventoryContext';

const statusColors = {
  Running: 'bg-green-100 text-green-800',
  Active: 'bg-green-100 text-green-800',
  'Stopped (Standby)': 'bg-yellow-100 text-yellow-800',
  Attached: 'bg-blue-100 text-blue-800',
};

const getCategoryIcon = (category) => {
    switch(category) {
        case 'Compute': return <Server className="h-5 w-5" />;
        case 'Storage': return <Database className="h-5 w-5" />;
        case 'Networking': return <Network className="h-5 w-5" />;
        case 'Security': return <Shield className="h-5 w-5" />;
        default: return <Server className="h-5 w-5" />;
    }
}

const ResourceDetailPanel = ({ resource, open, onOpenChange }) => {
    if (!resource) return null;

    const renderUsageCharts = () => {
        if(!resource.usage || Object.keys(resource.usage).length === 0) {
            return <p className="text-sm text-gray-500">No usage data available for this resource.</p>
        }
        return (
            <div className="space-y-8">
                {Object.entries(resource.usage).map(([key, data]) => (
                    <div key={key}>
                        <h4 className="font-semibold capitalize mb-2">{key} ({data[0]?.unit})</h4>
                         <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} name={key} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="max-h-[90vh]">
                <div className="mx-auto w-full max-w-4xl">
                    <DrawerHeader>
                        <DrawerTitle>{resource.name}</DrawerTitle>
                        <DrawerDescription>{resource.service} - {resource.category}</DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4 overflow-y-auto">
                        <Tabs defaultValue="overview">
                            <TabsList>
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
                                <TabsTrigger value="tags">Tags</TabsTrigger>
                            </TabsList>
                            <TabsContent value="overview" className="mt-4">
                               <div className="grid grid-cols-2 gap-4 text-sm">
                                   {Object.entries(resource.details).map(([key, value]) => (
                                       <div key={key} className="bg-gray-50 p-2 rounded">
                                           <p className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                                           <p className="text-gray-700">{value}</p>
                                       </div>
                                   ))}
                               </div>
                            </TabsContent>
                             <TabsContent value="monitoring" className="mt-4">
                                {renderUsageCharts()}
                            </TabsContent>
                            <TabsContent value="tags" className="mt-4">
                                <div className="flex flex-wrap gap-2">
                                     {Object.entries(resource.tags).map(([key, value]) => (
                                        <Badge key={key} variant="secondary">{key}: {value}</Badge>
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                    <DrawerFooter>
                        <DrawerClose asChild>
                           <Button variant="outline">Close</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    )
}

const SifyInventory = () => {
  const { inventory } = useInventory();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    location: 'all',
    role: 'all',
    redundancy: 'all',
  });
  const [isGrouped, setIsGrouped] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [selectedResource, setSelectedResource] = useState(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };
  
  const filteredInventory = useMemo(() => {
    if (!inventory?.sifyServices) return [];
    return inventory.sifyServices.filter(item => {
      return (filters.location === 'all' || item.location === filters.location) &&
             (filters.role === 'all' || item.role === filters.role) &&
             (filters.redundancy === 'all' || item.redundancy === filters.redundancy);
    });
  }, [inventory, filters]);

  const groupedInventory = useMemo(() => {
    if (!isGrouped) return { 'All Services': filteredInventory };
    return filteredInventory.reduce((acc, item) => {
      const key = item.category;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});
  }, [filteredInventory, isGrouped]);

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({...prev, [groupName]: !prev[groupName]}));
  }
  
  const handleRowClick = (item) => {
    setSelectedResource(item);
    setIsDetailPanelOpen(true);
  }

  if (!inventory) {
    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold text-red-600">No Inventory Data</h2>
            <p>Please go back to the dashboard and select a customer.</p>
            <Button onClick={() => navigate('/')} className="mt-4">Back to Dashboard</Button>
        </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Sify Cloud Inventory for: {inventory.customerName}</CardTitle>
              <CardDescription>
                Detailed view of all services hosted with Sify.
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => navigate('/')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
           <CardTitle>Inventory Filters</CardTitle>
            <div className="flex items-center gap-2">
                <Label htmlFor="group-switch" className="mr-2">Group by Category</Label>
                <Switch id="group-switch" checked={isGrouped} onCheckedChange={setIsGrouped} />
            </div>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
            <div className="flex flex-col space-y-1.5">
                <Label htmlFor="location">Location</Label>
                <Select value={filters.location} onValueChange={(v) => handleFilterChange('location', v)}>
                    <SelectTrigger id="location" className="w-[180px]">
                        <SelectValue placeholder="Select Location" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        <SelectItem value="Mumbai">Mumbai</SelectItem>
                        <SelectItem value="Chennai">Chennai</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex flex-col space-y-1.5">
                <Label htmlFor="role">Role</Label>
                <Select value={filters.role} onValueChange={(v) => handleFilterChange('role', v)}>
                    <SelectTrigger id="role" className="w-[180px]">
                        <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="DC">DC</SelectItem>
                        <SelectItem value="DR">DR</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex flex-col space-y-1.5">
                <Label htmlFor="redundancy">Redundancy</Label>
                <Select value={filters.redundancy} onValueChange={(v) => handleFilterChange('redundancy', v)}>
                    <SelectTrigger id="redundancy" className="w-[180px]">
                        <SelectValue placeholder="Select Redundancy" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="High Availability">High Availability</SelectItem>
                        <SelectItem value="Single Instance">Single Instance</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        {Object.entries(groupedInventory).map(([groupName, items]) => (
           <Card key={groupName}>
             <CardHeader className="cursor-pointer" onClick={() => toggleGroup(groupName)}>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    {isGrouped && getCategoryIcon(groupName)}
                    <CardTitle className="text-xl">{groupName} ({items.length})</CardTitle>
                 </div>
                 {isGrouped && (expandedGroups[groupName] ? <ChevronDown /> : <ChevronRight />)}
               </div>
             </CardHeader>
             {(expandedGroups[groupName] || !isGrouped) && (
             <CardContent>
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Name</TableHead>
                     <TableHead>Service Type</TableHead>
                     <TableHead>Location</TableHead>
                     <TableHead>Redundancy</TableHead>
                     <TableHead>Status</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {items.map(item => (
                     <TableRow key={item.id} onClick={() => handleRowClick(item)} className="cursor-pointer hover:bg-gray-50">
                       <TableCell className="font-medium">{item.name}</TableCell>
                       <TableCell>{item.service}</TableCell>
                       <TableCell>{item.location} ({item.role})</TableCell>
                       <TableCell>
                         <Badge variant={item.redundancy === 'High Availability' ? 'default' : 'secondary'}>{item.redundancy}</Badge>
                       </TableCell>
                       <TableCell>
                         <Badge className={statusColors[item.status] || 'bg-gray-100 text-gray-800'}>{item.status}</Badge>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </CardContent>
             )}
           </Card>
        ))}
      </div>
      <ResourceDetailPanel 
        resource={selectedResource}
        open={isDetailPanelOpen}
        onOpenChange={setIsDetailPanelOpen}
      />
    </div>
  );
};

export default SifyInventory;
