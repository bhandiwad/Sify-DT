import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Cpu, HardDrive, Server, Globe, Shield } from 'lucide-react';
import { SERVICE_CATEGORIES } from '@/utils/inventoryModel';

const categoryIcons = {
  [SERVICE_CATEGORIES.COMPUTE]: <Cpu className="h-5 w-5 text-gray-500" />,
  [SERVICE_CATEGORIES.STORAGE]: <HardDrive className="h-5 w-5 text-gray-500" />,
  [SERVICE_CATEGORIES.NETWORK]: <Globe className="h-5 w-5 text-gray-500" />,
  [SERVICE_CATEGORIES.SECURITY]: <Shield className="h-5 w-5 text-gray-500" />,
  [SERVICE_CATEGORIES.MANAGED_SERVICES]: <Server className="h-5 w-5 text-gray-500" />,
  [SERVICE_CATEGORIES.DATABASE]: <HardDrive className="h-5 w-5 text-gray-500" />,
};

const ResourceCard = ({ resource, onManageClick }) => {
  const { name, type, category, location, status, specs, mrr } = resource;

  const renderSpecs = () => {
    if (!specs) return null;
    return (
      <div className="text-xs text-gray-500 space-y-1">
        {Object.entries(specs).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
            <span>{value.toString()}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{name}</CardTitle>
            <CardDescription>{type}</CardDescription>
          </div>
          {categoryIcons[category] || <Server className="h-5 w-5 text-gray-500" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <Badge variant="outline">{location}</Badge>
          <Badge variant={status === 'Active' ? 'default' : 'secondary'}>{status}</Badge>
        </div>
        <Separator className="my-4" />
        {renderSpecs()}
      </CardContent>
      <CardFooter className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-4">
        <div>
          <span className="text-xs text-gray-500">MRR</span>
          <p className="text-lg font-bold">₹{mrr.toLocaleString()}</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => onManageClick(resource)}>
          Manage
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ResourceCard; 