import { v4 as uuidv4 } from 'uuid';

export const maxHealthAwsInventory = {
  customerName: "Max Health Inc.",
  accountId: '1234-5678-9012',
  provider: 'AWS',
  services: [
    {
      id: uuidv4(),
      service: 'EC2 Instance',
      name: 'MH-AWS-Analytics-Worker',
      details: {
        instanceId: 'i-0a1b2c3d4e5f6a7b8',
        instanceType: 't3.large',
        region: 'ap-south-1',
        status: 'Running',
        publicIp: '13.233.100.200',
      },
      tags: { department: 'data-science', project: 'patient-risk-analysis' }
    },
    {
      id: uuidv4(),
      service: 'S3 Bucket',
      name: 'maxhealth-patient-data-lake',
      details: {
        bucketName: 'maxhealth-patient-data-lake',
        region: 'ap-south-1',
        size: '15.2 TB',
        objectCount: '1,203,450'
      },
      tags: { department: 'data-engineering', project: 'data-lake-v2' }
    },
    {
        id: uuidv4(),
        service: 'RDS Database',
        name: 'mh-aws-reporting-db',
        details: {
            instanceId: 'db-ABC123XYZ',
            engine: 'PostgreSQL',
            instanceClass: 'db.t3.medium',
            status: 'available',
            region: 'ap-south-1'
        },
        tags: { department: 'analytics', project: 'quarterly-reporting' }
    }
  ]
}; 