# Serverless Twitterbot
This twitterbot uses AWS Lambda and AWS Key Management Service.
This twitterbot will tweet based on configured Cloudwatch Events

## Requirements
- Node.js 18+
- AWS Lambda execution role with KMS decrypt permission
- X (Twitter) app credentials

## Configuration
Set the Lambda environment variable:

- `FN_ENCRYPTED_CONFIG`: Base64 encoded KMS-encrypted JSON payload containing:
  - `consumer_key`
  - `consumer_secret`
  - `access_token_key`
  - `access_token_secret`

Example decrypted JSON:

```json
{
  "consumer_key": "xxx",
  "consumer_secret": "xxx",
  "access_token_key": "xxx",
  "access_token_secret": "xxx"
}
```

## Install
```bash
npm install
```

## Deploy/Run Notes
- Lambda handler: `index.handler`
- Trigger from EventBridge/CloudWatch schedule to post periodically.
- The tweet text uses `Asia/Kolkata` timezone.


