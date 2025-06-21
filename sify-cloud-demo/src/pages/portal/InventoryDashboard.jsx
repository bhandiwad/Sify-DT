import React, { useState, useMemo } from 'react';
import { useInventory } from './PortalLayout';
import { LOCATIONS, SERVICE_CATEGORIES } from '@/utils/inventoryModel';
import ResourceCard from '@/components/portal/ResourceCard';
import GeographicMap from '@/components/portal/GeographicMap';
import ManageResourceModal from '@/components/portal/ManageResourceModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const InventoryDashboard = () => {
  const inventory = useInventory();
  // We need a local state for inventory to handle updates (e.g., from the modal)
  const [localInventory, setLocalInventory] = useState(inventory);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);

  const allResources = useMemo(() => {
    if (!localInventory || !localInventory.subscriptions) return [];
    return localInventory.subscriptions.flatMap(sub =>
      sub.services.flatMap(service =>
        service.resources.map(resource => ({
          ...resource,
          serviceName: service.name,
          subscriptionId: sub.id,
        }))
      )
    );
  }, [localInventory]);

  const handleManageClick = (resource) => {
    setSelectedResource(resource);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedResource(null);
  };
  
  const handleSaveChanges = (resourceId, updatedSpecs) => {
    // This is a complex operation. For the demo, we'll update the local state.
    // A real app would send this to a backend API.
    setLocalInventory(prevInventory => {
      const newInventory = JSON.parse(JSON.stringify(prevInventory)); // Deep copy
      for (const sub of newInventory.subscriptions) {
        for (const srv of sub.services) {
          const resourceIndex = srv.resources.findIndex(r => r.id === resourceId);
          if (resourceIndex > -1) {
            srv.resources[resourceIndex].specs = updatedSpecs;
            break;
          }
        }
      }
      return newInventory;
    });
    toast.success("Resource specifications updated locally.");
    handleCloseModal();
  };

  const filteredResources = useMemo(() => {
     return allResources.filter(resource => {
       const matchesSearch = searchTerm === '' || 
         resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         resource.type.toLowerCase().includes(searchTerm.toLowerCase());
       
       const matchesLocation = locationFilter === 'all' || resource.location === locationFilter;
       
       const matchesCategory = categoryFilter === 'all' || resource.category === categoryFilter;
 
       return matchesSearch && matchesLocation && matchesCategory;
    });
   }, [allResources, searchTerm, locationFilter, categoryFilter]);

  return (
    <div className="space-y-6">
      <GeographicMap 
        resources={allResources} 
        setLocationFilter={setLocationFilter}
        currentLocation={locationFilter}
      />

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input 
            placeholder="Search by name or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {Object.values(LOCATIONS).map(loc => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.values(SERVICE_CATEGORIES).map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">{filteredResources.length} Resources Found</h2>
        {filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredResources.map(resource => (
              <ResourceCard 
                key={resource.id} 
                resource={resource} 
                onManageClick={handleManageClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-700">No resources match your filters.</h3>
            <p className="text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
      <ManageResourceModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        resource={selectedResource}
        onSave={handleSaveChanges}
      />
    </div>
  );
};

export default InventoryDashboard;