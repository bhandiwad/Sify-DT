import { v4 as uuidv4 } from 'uuid';

export const maxHealthGcpInventory = {
  customerName: "Max Health Inc.",
  projectId: 'maxhealth-analytics-2024',
  projectNumber: '987654321098',
  provider: 'GCP',
  services: [
    {
      id: uuidv4(),
      service: 'BigQuery Dataset',
      name: 'patient_admissions_data',
      details: {
        datasetId: 'patient_admissions_data',
        location: 'US (multi-region)',
        tables: 5,
        size: '2.1 TB'
      },
      tags: { department: 'data-analytics', project: 'patient-trends' }
    },
    {
      id: uuidv4(),
      service: 'Cloud Storage Bucket',
      name: 'mh-gcp-ml-models',
      details: {
        bucketName: 'mh-gcp-ml-models',
        location: 'us-central1',
        storageClass: 'Standard',
        size: '520 GB'
      },
      tags: { department: 'data-science', project: 'ml-models' }
    },
    {
      id: uuidv4(),
      service: 'Cloud Functions',
      name: 'daily-data-ingest-trigger',
      details: {
        functionName: 'daily-data-ingest-trigger',
        region: 'us-central1',
        trigger: 'Cloud Pub/Sub',
        runtime: 'Python 3.9'
      },
      tags: { department: 'data-engineering', project: 'etl-pipelines' }
    }
  ]
}; 