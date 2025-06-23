import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, ArrowRight, AlertCircle } from 'lucide-react'
import { ESSENTIAL_SERVICES } from '@/utils/dataModel'
import { SERVICE_CATEGORIES as SERVICE_CATALOG } from '@/utils/serviceModel';
import { getPrice, generateInternalCode, findServiceByKeywords, parseVmConfig } from '@/utils/boqUtils';

const ExcelUpload = ({ onBoQFinalized, projectDetails }) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const processFile = async () => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    const boqItems = [];
    const excelData = getScenarioExcelData(projectDetails.flowType);

    // --- Main Processing Logic ---
    try {
      setProcessingStep('Parsing and matching services...');
      await new Promise(r => setTimeout(r, 500));
      setProgress(50);

      excelData.forEach(row => {
        const desc = row.description.toLowerCase();
        const service = findServiceByKeywords(desc);

        if (service) {
          let config = {};
          if (service.sku.includes('COMPUTE')) {
            config = parseVmConfig(row.description);
          }
          
          const unitPrice = getPrice(service, config);
          
          boqItems.push({
            sku: service.sku,
            internalCode: generateInternalCode(service, config),
            description: row.description,
            quantity: row.quantity,
            config: config,
            unitPrice: unitPrice,
            totalPrice: unitPrice * row.quantity,
          });
        }
      });

      setProcessingStep('Adding essential services...');
      await new Promise(r => setTimeout(r, 500));
      setProgress(80);

      ESSENTIAL_SERVICES.forEach(essential => {
          const service = findServiceByKeywords(essential.sku.toLowerCase().replace('-', ' '));
          if(service) {
            const unitPrice = getPrice(service, {});
            boqItems.push({
                sku: service.sku,
                internalCode: service.sku,
                description: service.label,
                quantity: essential.quantity,
                config: {},
                unitPrice: unitPrice,
                totalPrice: unitPrice * essential.quantity,
                autoAdded: true,
                notes: essential.reason
            });
          }
      });
      
      setProcessingStep('Finalizing BoQ...');
      await new Promise(r => setTimeout(r, 500));
      setProgress(100);

      onBoQFinalized(boqItems);
      navigate('/');

    } catch (err) {
      console.error("Processing Error:", err);
      setError("An unexpected error occurred during processing.");
      setIsProcessing(false);
    }
  };
  
  // This is a simplified mock function for the demo
  const getScenarioExcelData = (flowType) => {
    if (flowType === 'standard') {
      return [
        { description: 'Compute Instance 4 vCPU 8GB RAM Windows', quantity: 3 },
        { description: 'Compute Instance 8 vCPU 16GB RAM Windows', quantity: 1 },
        { description: 'Block Storage 100GB SSD', quantity: 4 },
        { description: 'Enterprise Firewall', quantity: 1 },
      ];
    }
    return [ // Custom flow
        { description: 'Compute Instance 4 vCPU 8GB RAM Windows', quantity: 2 },
        { description: 'VDI Desktop as a Service 50 users', quantity: 1 },
        { description: 'Managed Kubernetes Service', quantity: 1 },
    ];
  };

  if (!projectDetails) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-lg font-medium">No Project Selected</h3>
          <p className="mt-1 text-sm text-gray-600">
            Please create a project from the main dashboard before uploading an Excel file.
          </p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Upload Requirements</CardTitle>
          <CardDescription>
            Upload the customer's requirements Excel file to automatically generate a BoQ.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                  <Label>Customer</Label>
                  <p className="font-semibold">{projectDetails.customerName}</p>
              </div>
              <div>
                  <Label>Project Name</Label>
                  <p className="font-semibold">{projectDetails.projectName}</p>
              </div>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <p className="text-sm text-blue-800">
              For this demo, we will use a pre-defined scenario based on your demo type selection.
            </p>
            <p className="text-xs text-blue-600 mt-1">
              <strong>Demo Mode:</strong> '{projectDetails.flowType}' workflow selected.
            </p>
          </div>

          {isProcessing ? (
            <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-center text-gray-600">{processingStep}</p>
            </div>
          ) : (
            <Button onClick={processFile} className="w-full">
              <Upload className="mr-2 h-4 w-4" /> Start Processing
            </Button>
          )}

        </CardContent>
      </Card>
    </div>
  );
};

export default ExcelUpload;

