# AWS Deployment Guide

This guide explains how to deploy the Agentic Payments Sandbox to AWS using S3 and CloudFront.

## Prerequisites

1. **AWS Account** - You need an active AWS account
2. **AWS CLI** - Install and configure AWS CLI:
   ```bash
   # Install AWS CLI (macOS)
   brew install awscli
   
   # Configure credentials
   aws configure
   ```
   You'll need:
   - AWS Access Key ID
   - AWS Secret Access Key
   - Default region (e.g., `us-east-1`)
   - Default output format (e.g., `json`)

3. **Node.js and npm** - Already installed if you can run `npm run dev`

## Quick Start

### Option 1: Simple Deployment Script (Recommended)

1. **Set environment variables** (optional, defaults provided):
   ```bash
   export AWS_S3_BUCKET=your-bucket-name
   export AWS_REGION=us-east-1
   export AWS_PROFILE=default
   export AWS_CLOUDFRONT_ID=your-distribution-id  # Optional
   ```

2. **Make the script executable**:
   ```bash
   chmod +x deploy.sh
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   # or
   ./deploy.sh
   ```

The script will:
- Build your project (`npm run build`)
- Create S3 bucket if it doesn't exist
- Configure bucket for static website hosting
- Upload files with proper cache headers
- Invalidate CloudFront cache (if configured)

### Option 2: CloudFormation Infrastructure Setup

For a more robust setup with CloudFront CDN:

1. **Create the infrastructure stack**:
   ```bash
   npm run deploy:setup
   # or manually:
   aws cloudformation create-stack \
     --stack-name agentic-payments-infra \
     --template-body file://cloudformation-template.yaml \
     --parameters ParameterKey=BucketName,ParameterValue=agentic-payments-sandbox
   ```

2. **Wait for stack creation** (takes ~5-10 minutes):
   ```bash
   aws cloudformation wait stack-create-complete --stack-name agentic-payments-infra
   ```

3. **Get the CloudFront Distribution ID**:
   ```bash
   aws cloudformation describe-stacks \
     --stack-name agentic-payments-infra \
     --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
     --output text
   ```

4. **Deploy with CloudFront**:
   ```bash
   export AWS_CLOUDFRONT_ID=<distribution-id-from-step-3>
   npm run deploy
   ```

## Manual Deployment Steps

If you prefer to deploy manually:

### 1. Build the Project
```bash
npm run build
```

### 2. Create S3 Bucket
```bash
aws s3 mb s3://your-bucket-name --region us-east-1
```

### 3. Enable Static Website Hosting
```bash
aws s3 website s3://your-bucket-name \
  --index-document index.html \
  --error-document index.html
```

### 4. Set Bucket Policy for Public Access
Create `bucket-policy.json`:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

Apply it:
```bash
aws s3api put-bucket-policy \
  --bucket your-bucket-name \
  --policy file://bucket-policy.json
```

### 5. Upload Files
```bash
aws s3 sync dist/ s3://your-bucket-name \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "*.html"

aws s3 sync dist/ s3://your-bucket-name \
  --delete \
  --cache-control "public, max-age=0, must-revalidate" \
  --include "*.html"
```

## Custom Domain Setup

To use a custom domain with CloudFront:

1. **Request an SSL certificate** in AWS Certificate Manager (ACM):
   - Must be in `us-east-1` region
   - Request certificate for your domain (e.g., `app.example.com`)

2. **Update CloudFormation stack** with domain parameters:
   ```bash
   aws cloudformation update-stack \
     --stack-name agentic-payments-infra \
     --template-body file://cloudformation-template.yaml \
     --parameters \
       ParameterKey=BucketName,ParameterValue=agentic-payments-sandbox \
       ParameterKey=DomainName,ParameterValue=app.example.com \
       ParameterKey=CertificateArn,ParameterValue=arn:aws:acm:us-east-1:123456789012:certificate/abc123
   ```

3. **Update DNS** - Add a CNAME record pointing to your CloudFront distribution domain name

## Environment Variables

You can configure deployment using environment variables:

- `AWS_S3_BUCKET` - S3 bucket name (default: `agentic-payments-sandbox`)
- `AWS_REGION` - AWS region (default: `us-east-1`)
- `AWS_PROFILE` - AWS CLI profile (default: `default`)
- `AWS_CLOUDFRONT_ID` - CloudFront distribution ID (optional)

## Troubleshooting

### "Access Denied" errors
- Ensure your AWS credentials have permissions for S3 and CloudFront
- Check bucket policy allows public read access
- Verify public access block settings

### CloudFront not updating
- CloudFront cache can take 5-15 minutes to propagate
- Use the invalidation feature in the deploy script
- Check CloudFront distribution status in AWS Console

### Build fails
- Ensure all dependencies are installed: `npm install`
- Check for TypeScript errors: `npm run build`
- Verify Node.js version compatibility

### Bucket name already exists
- S3 bucket names are globally unique
- Choose a different bucket name or delete the existing bucket

## Cost Estimation

- **S3 Storage**: ~$0.023 per GB/month (first 50 TB)
- **S3 Requests**: ~$0.0004 per 1,000 GET requests
- **CloudFront**: ~$0.085 per GB data transfer (first 10 TB)
- **CloudFront Requests**: ~$0.0075 per 10,000 HTTPS requests

For a small to medium traffic site, expect **<$5/month**.

## Security Best Practices

1. **Use CloudFront** - Provides HTTPS and DDoS protection
2. **Enable CloudFront logging** - Monitor access patterns
3. **Set up CloudWatch alarms** - Get notified of unusual activity
4. **Use AWS WAF** - Add web application firewall rules if needed
5. **Rotate credentials** - Regularly rotate AWS access keys

## CI/CD Integration

You can integrate this into your CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
name: Deploy to AWS
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build
      - uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - run: ./deploy.sh
```

## Additional Resources

- [AWS S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [AWS CLI Reference](https://docs.aws.amazon.com/cli/latest/reference/)
