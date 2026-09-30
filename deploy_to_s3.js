require('dotenv').config({ path: '.env.deploy' });
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

// Check if keys are loaded
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.error("ERROR: Could not find AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY in .env.deploy");
  process.exit(1);
}

const s3Client = new S3Client({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const BUCKET_NAME = 'frost-dashboard-prod-148983979655';
const DIST_DIR = path.join(__dirname, 'frontend', 'dist');

async function uploadDirectory(directoryPath, prefix = '') {
  const entries = fs.readdirSync(directoryPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directoryPath, entry.name);
    const key = prefix ? `${prefix}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      await uploadDirectory(fullPath, key);
    } else {
      const fileStream = fs.createReadStream(fullPath);
      const mimeType = mime.lookup(fullPath) || 'application/octet-stream';
      
      const uploadParams = {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileStream,
        ContentType: mimeType,
      };

      try {
        await s3Client.send(new PutObjectCommand(uploadParams));
        console.log(`Uploaded: ${key}`);
      } catch (err) {
        console.error(`Error uploading ${key}:`, err.message);
      }
    }
  }
}

async function runDeploy() {
  console.log('Starting S3 deployment...');
  if (!fs.existsSync(DIST_DIR)) {
    console.error('Error: frontend/dist does not exist! Please run npm run build in the frontend directory first.');
    process.exit(1);
  }
  await uploadDirectory(DIST_DIR);
  console.log('Deployment complete!');
}

runDeploy();
