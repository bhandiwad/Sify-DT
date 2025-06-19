import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Checkbox } from './ui/checkbox';

export default function EnvironmentSelection({
  environments,
  selectedEnvironments,
  onEnvironmentChange
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Environments</CardTitle>
        <CardDescription>
          Choose which environments you want to configure. Each environment can have different service configurations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(environments).map(([key, env]) => (
            <Card 
              key={key}
              className={`
                cursor-pointer transition-colors
                ${selectedEnvironments.includes(key) ? 'border-primary' : ''}
              `}
              onClick={() => onEnvironmentChange(key)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <Checkbox 
                    checked={selectedEnvironments.includes(key)}
                    onCheckedChange={() => onEnvironmentChange(key)}
                  />
                  <div>
                    <h3 className="font-medium">{env.name}</h3>
                    <div 
                      className="w-2 h-2 rounded-full mt-2"
                      style={{ backgroundColor: env.color }}
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Scaling Factor: {env.scalingFactor * 100}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 