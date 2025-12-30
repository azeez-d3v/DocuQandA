const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const outputPath = path.join(__dirname, 'env.json');

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};

    envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const [key, value] = trimmed.split('=');
            if (key && value) {
                envVars[key.trim()] = value.trim();
            }
        }
    });

    // Add standard SAM local env vars if missing (mocking cloud resources)
    if (!envVars['DOC_BUCKET']) envVars['DOC_BUCKET'] = 'doc-qa-ingest-local';
    if (!envVars['INGEST_QUEUE_URL']) envVars['INGEST_QUEUE_URL'] = 'http://localhost:9324/queue/doc-qa-ingest-queue';

    // Apply to all functions
    const samEnv = {
        "AskFunction": envVars,
        "IngestFunction": envVars,
        "IngestWorkerFunction": envVars,
        "DocumentsFunction": envVars,
        "UploadUrlFunction": envVars
    };

    fs.writeFileSync(outputPath, JSON.stringify(samEnv, null, 2));
    console.log('Successfully generated env.json from .env');

} catch (error) {
    console.error('Error generating env.json:', error.message);
    process.exit(1);
}
