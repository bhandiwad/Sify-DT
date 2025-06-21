import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const InventoryDashboard = () => {
  const [inventory, setInventory] = useState(mockInventory.subscriptions[0].services.flatMap(s => s.resources));

  const handleSave = (resourceId, updatedSpecs) => {
    const updatedInventory = inventory.map(item => {
      if (item.id === resourceId) {
        return { ...item, specs: updatedSpecs };
      }
      return item;
    });
    setInventory(updatedInventory);
    // The toast is now inside the modal, but we could have one here too
    // toast({ title: "Resource Updated", description: "Changes have been saved." });
  };

  const filteredInventory = inventory.filter(item => {
    const searchTermMatch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status.toLowerCase().includes(searchTerm.toLowerCase());
    return searchTermMatch;
  });

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Inventory Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          {/* ... existing code ... */}
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryDashboard;