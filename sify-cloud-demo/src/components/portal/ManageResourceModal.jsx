import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";

const ManageResourceModal = ({ resource, isOpen, onClose, onSave }) => {
  const [updatedSpecs, setUpdatedSpecs] = useState({});

  useEffect(() => {
    if (resource) {
      setUpdatedSpecs(resource.specs);
    }
  }, [resource]);

  if (!resource) {
    return null;
  }

  const handleSpecChange = (key, value) => {
    setUpdatedSpecs(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(resource.id, updatedSpecs);
    toast.success("Resource updated successfully!");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage: {resource.name}</DialogTitle>
          <DialogDescription>
            Modify the specifications for this resource. Click save to apply changes.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {Object.entries(updatedSpecs).map(([key, value]) => (
            <div className="grid grid-cols-4 items-center gap-4" key={key}>
              <Label htmlFor={key} className="text-right capitalize">
                {key.replace(/_/g, ' ')}
              </Label>
              <Input
                id={key}
                value={value}
                onChange={(e) => handleSpecChange(key, e.target.value)}
                className="col-span-3"
                type={typeof value === 'number' ? 'number' : 'text'}
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManageResourceModal; 