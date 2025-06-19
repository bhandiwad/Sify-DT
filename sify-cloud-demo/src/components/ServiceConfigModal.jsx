import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Cpu, HardDrive, Network, Shield } from 'lucide-react';

export default function ServiceConfigModal({ open, service, onSave, onCancel, initialConfig }) {
  const [config, setConfig] = useState({});
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (service) {
      // Set defaults or use initialConfig
      const defaults = {};
      Object.entries(service.configOptions || {}).forEach(([key, value]) => {
        if (initialConfig && initialConfig[key] !== undefined) {
          defaults[key] = initialConfig[key];
        } else if (Array.isArray(value)) {
          defaults[key] = value[0];
        } else if (typeof value === 'object' && value.min !== undefined) {
          defaults[key] = value.min;
        } else {
          defaults[key] = '';
        }
      });
      setConfig(defaults);
    }
  }, [service, initialConfig]);

  if (!service) return null;

  const handleChange = (key, value) => {
    setConfig(prev => {
      if (key.includes('.')) {
        const [parent, child] = key.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        };
      }
      return { ...prev, [key]: value };
    });
  };

  const applyTemplate = (template) => {
    setConfig({
      ...config,
      ...service.templates[template],
      instance_count: config.instance_count || 1
    });
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configure {service.label}</DialogTitle>
        </DialogHeader>

        {service.sku === 'VM-BASIC' && (
          <div className="mb-4">
            <Label>Quick Start Templates</Label>
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyTemplate('web-server')}
              >
                Web Server
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyTemplate('db-server')}
              >
                Database Server
              </Button>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">
              <Cpu className="w-4 h-4 mr-2" />
              Basic
            </TabsTrigger>
            <TabsTrigger value="storage">
              <HardDrive className="w-4 h-4 mr-2" />
              Storage
            </TabsTrigger>
            <TabsTrigger value="network">
              <Network className="w-4 h-4 mr-2" />
              Network
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            {service.sku === 'VM-BASIC' && (
              <div>
                <Label>Number of Instances</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={config.instance_count || 1}
                  onChange={e => handleChange('instance_count', parseInt(e.target.value))}
                />
                <p className="text-sm text-gray-500 mt-1">Deploy multiple identical instances</p>
              </div>
            )}
            {Object.entries(service.configOptions || {}).map(([key, value]) => {
              if (['storage', 'network'].includes(key)) return null;
              if (key === 'instance_count') return null;
              
              return (
                <div key={key}>
                  <Label className="block font-medium mb-1">{key}</Label>
                  {Array.isArray(value) ? (
                    <Select value={config[key]} onValueChange={val => handleChange(key, val)}>
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${key}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {value.map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type="number"
                      min={value.min}
                      max={value.max}
                      value={config[key]}
                      onChange={e => handleChange(key, parseInt(e.target.value))}
                      placeholder={`${value.min} - ${value.max}`}
                    />
                  )}
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="storage" className="space-y-4">
            {Object.entries(service.configOptions || {}).map(([key, value]) => {
              if (!key.includes('storage')) return null;
              return (
                <div key={key}>
                  <Label className="block font-medium mb-1">Storage (GB)</Label>
                  <Input
                    type="number"
                    min={value.min}
                    max={value.max}
                    value={config[key]}
                    onChange={e => handleChange(key, parseInt(e.target.value))}
                    placeholder={`${value.min} - ${value.max}`}
                  />
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="network" className="space-y-4">
            {service.configOptions?.public_ip && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center justify-between">
                    Public IP
                    <Badge variant="outline">₹1000/month</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Label>Enable Public IP</Label>
                    <input
                      type="checkbox"
                      checked={config.public_ip}
                      onChange={e => handleChange('public_ip', e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {service.configOptions?.firewall_enabled && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center justify-between">
                    Firewall
                    <Badge variant="outline">₹2000/month</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Enable Firewall</Label>
                    <input
                      type="checkbox"
                      checked={config.firewall_enabled}
                      onChange={e => handleChange('firewall_enabled', e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>

                  {config.firewall_enabled && (
                    <>
                      <div>
                        <Label>Inbound Ports</Label>
                        <Select
                          value={config.inbound_ports}
                          onValueChange={val => handleChange('inbound_ports', val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select ports" />
                          </SelectTrigger>
                          <SelectContent>
                            {service.configOptions.inbound_ports.map(ports => (
                              <SelectItem key={ports} value={ports}>{ports}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Outbound Access</Label>
                        <Select
                          value={config.outbound_access}
                          onValueChange={val => handleChange('outbound_access', val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select access level" />
                          </SelectTrigger>
                          <SelectContent>
                            {service.configOptions.outbound_access.map(access => (
                              <SelectItem key={access} value={access}>{access}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={() => onSave(config)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 