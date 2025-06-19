import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './card';
import { Switch } from './switch';
import { Label } from './label';
import { Badge } from './badge';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

export function EnvironmentSelector({ environments, selectedEnvironments, onEnvironmentChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Object.entries(environments).map(([key, env]) => (
        <Card key={key} className={`${selectedEnvironments.includes(key) ? 'border-primary' : ''}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: env.color }}
                />
                <CardTitle>{env.name}</CardTitle>
              </div>
              <Badge variant="outline">{env.shortName}</Badge>
            </div>
            <CardDescription>{env.description}</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor={`enable-${key}`} className="flex items-center gap-2">
                Enable Environment
              </Label>
              <Switch
                id={`enable-${key}`}
                checked={selectedEnvironments.includes(key)}
                onCheckedChange={(checked) => onEnvironmentChange(key, checked)}
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-1">
                      <Info className="w-4 h-4" />
                      Scaling Factor
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Resources will be scaled relative to production</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="font-medium">{env.defaultScalingFactor * 100}%</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-1">
                      <Info className="w-4 h-4" />
                      High Availability
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Services will be deployed with redundancy</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Badge variant={env.defaultHA ? "default" : "secondary"}>
                  {env.defaultHA ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-1">
                      <Info className="w-4 h-4" />
                      Backup Policy
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Regular backups of data and configurations</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Badge variant={env.defaultBackup ? "default" : "secondary"}>
                  {env.defaultBackup ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-1">
                      <Info className="w-4 h-4" />
                      Monitoring Level
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Level of monitoring and alerting</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Badge variant="outline" className="capitalize">
                  {env.defaultMonitoring}
                </Badge>
              </div>
            </div>
            
            {env.recommendedServices && env.recommendedServices.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm">Recommended Services:</Label>
                <div className="flex flex-wrap gap-1">
                  {env.recommendedServices.map(service => (
                    <Badge key={service} variant="secondary" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 