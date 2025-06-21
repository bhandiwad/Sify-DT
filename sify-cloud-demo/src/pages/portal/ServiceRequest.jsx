import React, { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { SERVICE_CATEGORIES } from '@/utils/serviceModel';
import { LOCATIONS, CLOUD_TYPES, RESOURCE_STATUS } from '@/utils/inventoryModel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

const ServiceRequest = () => {
  const [selectedCategoryKey, setSelectedCategoryKey] = useState('');
  const [selectedServiceSku, setSelectedServiceSku] = useState('');

  const selectedCategory = selectedCategoryKey ? SERVICE_CATEGORIES[selectedCategoryKey] : null;
  const selectedService = selectedCategory?.services.find(s => s.sku === selectedServiceSku);

  const formSchema = useMemo(() => {
    const schemaShape = {};
    if (selectedService?.configOptions) {
      Object.entries(selectedService.configOptions).forEach(([key, options]) => {
        if (Array.isArray(options)) {
          schemaShape[key] = z.string().nonempty(`${key} is required`);
        } else if (typeof options.min === 'number') {
          schemaShape[key] = z.coerce.number().min(options.min, `Value must be at least ${options.min}`).max(options.max, `Value can be at most ${options.max}`);
        } else {
          schemaShape[key] = z.string().nonempty();
        }
      });
    }
    return z.object(schemaShape);
  }, [selectedService]);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    key: selectedServiceSku, 
  });

  const handleCategoryChange = (key) => {
    setSelectedCategoryKey(key);
    setSelectedServiceSku('');
    reset({});
  };

  const handleServiceChange = (sku) => {
    setSelectedServiceSku(sku);
    reset({});
  };

  const onSubmit = (data) => {
    const newResourceRequest = {
      id: uuidv4(),
      name: `${selectedService.label} - New Request`,
      category: selectedCategory.title,
      type: selectedService.label,
      cloudType: CLOUD_TYPES.SHARED,
      location: LOCATIONS.MUMBAI,
      status: RESOURCE_STATUS.PROVISIONING,
      specs: data,
      mrr: 5000,
      dependsOn: [],
    };

    console.log("New Service Request Submitted:", newResourceRequest);
    toast.success("Service Request Submitted", {
      description: `Your request for a new ${selectedService.label} has been received and is pending approval.`,
    });
    
    reset({});
    setSelectedCategoryKey('');
    setSelectedServiceSku('');
  };
  
  const renderDynamicForm = () => {
    if (!selectedService) return null;

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {Object.entries(selectedService.configOptions).map(([key, options]) => (
          <div key={key}>
            <Label className="capitalize">{key.replace(/_/g, ' ')}</Label>
            <Controller
              name={key}
              control={control}
              defaultValue={Array.isArray(options) ? options[0] : (options.min ?? '')}
              render={({ field }) => {
                if (Array.isArray(options)) {
                  return (
                    <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {options.map(opt => <SelectItem key={String(opt)} value={String(opt)}>{String(opt)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  );
                }
                return (
                  <Input 
                    {...field}
                    type="number"
                    min={options.min}
                    max={options.max}
                    placeholder={`e.g., ${options.min}`}
                  />
                );
              }}
            />
            {errors[key] && <p className="text-red-500 text-sm mt-1">{errors[key].message}</p>}
          </div>
        ))}
        <Button type="submit">Submit Request</Button>
      </form>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request a New Service</CardTitle>
        <CardDescription>
          Select a service category and type to configure and request a new resource.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
            <Label>1. Select Service Category</Label>
            <Select onValueChange={handleCategoryChange} value={selectedCategoryKey}>
                <SelectTrigger><SelectValue placeholder="Choose a category..." /></SelectTrigger>
                <SelectContent>
                {Object.entries(SERVICE_CATEGORIES).map(([key, category]) => (
                    <SelectItem key={key} value={key}>{category.title}</SelectItem>
                ))}
                </SelectContent>
            </Select>
        </div>

        {selectedCategory && (
            <div className="space-y-2">
                <Label>2. Select Service Type</Label>
                <Select onValueChange={handleServiceChange} value={selectedServiceSku}>
                    <SelectTrigger><SelectValue placeholder="Choose a service type..." /></SelectTrigger>
                    <SelectContent>
                    {selectedCategory.services.map(s => (
                        <SelectItem key={s.sku} value={s.sku}>{s.label}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </div>
        )}
        
        {selectedService && (
            <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-2">3. Configure Your Service</h3>
                {renderDynamicForm()}
            </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceRequest; 