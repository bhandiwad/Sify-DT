import React from 'react';
import { Card } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Plus, AlertCircle, CheckCircle2, Shield, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { SERVICE_DEPENDENCIES, COMPLIANCE_REQUIREMENTS } from '../../utils/serviceModel';

export function ServiceCard({ 
  service, 
  category, 
  onSelect, 
  isSelected, 
  environmentType,
  selectedServices = [],
  onConfigure
}) {
  const Icon = category.icon;
  const isRecommended = environmentType?.recommendedServices?.includes(service.sku);
  const dependencies = SERVICE_DEPENDENCIES[service.sku] || [];
  const missingDependencies = dependencies.filter(dep => !selectedServices.some(s => s.sku === dep));
  
  const affectingCompliance = Object.entries(COMPLIANCE_REQUIREMENTS)
    .filter(([_, req]) => req.affectedServices?.includes(service.sku))
    .map(([key, req]) => ({
      label: req.label,
      description: req.description,
      options: req.options
    }));
  
  const selectedObj = selectedServices.find(s => s.sku === service.sku);
  
  return (
    <TooltipProvider>
      <Card className={`
        relative p-4 hover:bg-accent cursor-pointer transition-colors
        ${selectedObj ? 'border-primary bg-primary/5' : ''}
      `}
      onClick={() => onSelect(service)}
      >
        <div className="flex items-start gap-3">
          {/* Service Icon and Basic Info */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="w-6 h-6 text-primary" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium truncate">{service.label}</h3>
              {isRecommended && (
                <Tooltip>
                  <TooltipTrigger>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Recommended for {environmentType.name}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            
            <div className="text-xs text-muted-foreground mt-0.5">
              {service.description}
            </div>
            
            {/* Badges Row */}
            <div className="flex flex-wrap gap-1 mt-2">
              {/* Dependencies Badge */}
              {dependencies.length > 0 && (
                <Tooltip>
                  <TooltipTrigger>
                    <Badge 
                      variant={missingDependencies.length > 0 ? "outline" : "secondary"}
                      className="text-xs"
                    >
                      <Info className="w-3 h-3 mr-1" />
                      {dependencies.length} dependencies
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-2">
                      <p className="font-medium">Required Services:</p>
                      <ul className="text-sm space-y-1">
                        {dependencies.map(dep => (
                          <li key={dep} className="flex items-center gap-2">
                            {selectedServices.some(s => s.sku === dep) ? (
                              <CheckCircle2 className="w-3 h-3 text-green-500" />
                            ) : (
                              <AlertCircle className="w-3 h-3 text-yellow-500" />
                            )}
                            {dep}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
              
              {/* Compliance Badge */}
              {affectingCompliance.length > 0 && (
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="text-xs">
                      <Shield className="w-3 h-3 mr-1" />
                      {affectingCompliance.length} compliance
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-2">
                      <p className="font-medium">Compliance Requirements:</p>
                      <ul className="text-sm space-y-1">
                        {affectingCompliance.map(comp => (
                          <li key={comp.label}>
                            {comp.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
              
              {/* Config Options Preview */}
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="secondary" className="text-xs">
                    {Object.keys(service.configOptions).length} options
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-2">
                    <p className="font-medium">Configuration Options:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(service.configOptions).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium">{key}:</span>
                          <span className="text-muted-foreground ml-1">
                            {Array.isArray(value) 
                              ? `${value.length} choices`
                              : `${value.min}-${value.max}`
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
            {/* Configure button if already selected */}
            {selectedObj && onConfigure && (
              <Button size="sm" variant="outline" className="mt-2" onClick={e => { e.stopPropagation(); onConfigure(service); }}>
                Configure
              </Button>
            )}
          </div>
          
          {/* Selection Status */}
          <div className="flex-shrink-0">
            <div className={`
              w-6 h-6 rounded-full border-2 flex items-center justify-center
              ${selectedObj 
                ? 'border-primary bg-primary text-primary-foreground' 
                : 'border-muted-foreground'
              }
            `}>
              {selectedObj && <CheckCircle2 className="w-4 h-4" />}
            </div>
          </div>
        </div>
      </Card>
    </TooltipProvider>
  );
} 