#!/bin/bash

# AWS Deployment Script for Agentic Payments Sandbox
# This script builds and deploys the app to AWS S3 + CloudFront

set -e

# Configuration - Update these values
BUCKET_NAME="${AWS_S3_BUCKET:-agentic-payments-sandbox}"
CLOUDFRONT_DISTRIBUTION_ID="${AWS_CLOUDFRONT_ID:-}"
AWS_REGION="${AWS_REGION:-us-east-1}"
PROFILE="${AWS_PROFILE:-default}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting AWS deployment...${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity --profile "$PROFILE" &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured. Please run 'aws configure'${NC}"
    exit 1
fi

# Build the project
echo -e "${YELLOW}📦 Building project...${NC}"
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed - dist directory not found${NC}"
    exit 1
fi

# Check if bucket exists, create if not
echo -e "${YELLOW}🪣 Checking S3 bucket...${NC}"
if ! aws s3 ls "s3://${BUCKET_NAME}" --profile "$PROFILE" 2>&1 | grep -q 'NoSuchBucket'; then
    echo -e "${GREEN}✓ Bucket exists${NC}"
else
    echo -e "${YELLOW}Creating bucket ${BUCKET_NAME}...${NC}"
    if [ "$AWS_REGION" == "us-east-1" ]; then
        aws s3 mb "s3://${BUCKET_NAME}" --profile "$PROFILE"
    else
        aws s3 mb "s3://${BUCKET_NAME}" --region "$AWS_REGION" --profile "$PROFILE"
    fi
    
    # Enable static website hosting
    aws s3 website "s3://${BUCKET_NAME}" \
        --index-document index.html \
        --error-document index.html \
        --profile "$PROFILE"
    
    # Set bucket policy for public read access
    cat > /tmp/bucket-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${BUCKET_NAME}/*"
    }
  ]
}
EOF
    aws s3api put-bucket-policy \
        --bucket "${BUCKET_NAME}" \
        --policy file:///tmp/bucket-policy.json \
        --profile "$PROFILE"
    
    # Block public access settings (needed for public website)
    aws s3api put-public-access-block \
        --bucket "${BUCKET_NAME}" \
        --public-access-block-configuration \
        "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false" \
        --profile "$PROFILE"
    
    echo -e "${GREEN}✓ Bucket created and configured${NC}"
fi

# Upload files to S3
echo -e "${YELLOW}📤 Uploading files to S3...${NC}"
aws s3 sync dist/ "s3://${BUCKET_NAME}" \
    --delete \
    --cache-control "public, max-age=31536000, immutable" \
    --exclude "*.html" \
    --profile "$PROFILE"

# Upload HTML files with shorter cache
aws s3 sync dist/ "s3://${BUCKET_NAME}" \
    --delete \
    --cache-control "public, max-age=0, must-revalidate" \
    --include "*.html" \
    --profile "$PROFILE"

# Set content types for common files
aws s3 cp dist/ "s3://${BUCKET_NAME}" \
    --recursive \
    --exclude "*" \
    --include "*.js" \
    --content-type "application/javascript" \
    --cache-control "public, max-age=31536000, immutable" \
    --profile "$PROFILE"

aws s3 cp dist/ "s3://${BUCKET_NAME}" \
    --recursive \
    --exclude "*" \
    --include "*.css" \
    --content-type "text/css" \
    --cache-control "public, max-age=31536000, immutable" \
    --profile "$PROFILE"

echo -e "${GREEN}✓ Files uploaded successfully${NC}"

# Invalidate CloudFront cache if distribution ID is provided
if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo -e "${YELLOW}🔄 Invalidating CloudFront cache...${NC}"
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
        --paths "/*" \
        --profile "$PROFILE" \
        --query 'Invalidation.Id' \
        --output text)
    echo -e "${GREEN}✓ CloudFront invalidation created: ${INVALIDATION_ID}${NC}"
fi

# Get website URL
if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    CLOUDFRONT_URL=$(aws cloudfront get-distribution \
        --id "$CLOUDFRONT_DISTRIBUTION_ID" \
        --profile "$PROFILE" \
        --query 'Distribution.DomainName' \
        --output text)
    echo -e "${GREEN}✅ Deployment complete!${NC}"
    echo -e "${GREEN}🌐 CloudFront URL: https://${CLOUDFRONT_URL}${NC}"
else
    S3_WEBSITE_URL=$(aws s3api get-bucket-website \
        --bucket "${BUCKET_NAME}" \
        --profile "$PROFILE" \
        --query 'WebsiteConfiguration.IndexDocument.Suffix' \
        --output text 2>/dev/null || echo "index.html")
    echo -e "${GREEN}✅ Deployment complete!${NC}"
    echo -e "${GREEN}🌐 S3 Website URL: http://${BUCKET_NAME}.s3-website-${AWS_REGION}.amazonaws.com${NC}"
    echo -e "${YELLOW}💡 Tip: Set up CloudFront for HTTPS and better performance${NC}"
fi
