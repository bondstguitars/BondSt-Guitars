#!/bin/bash

# Setup Google Cloud SDK for Guitar Vault application
echo "Setting up Google Cloud SDK..."

# Create credentials file from environment variable
if [ ! -z "$GOOGLE_APPLICATION_CREDENTIALS_JSON" ]; then
    echo "$GOOGLE_APPLICATION_CREDENTIALS_JSON" > /tmp/gcp-key.json
    export GOOGLE_APPLICATION_CREDENTIALS="/tmp/gcp-key.json"
    
    # Verify JSON format
    if python3 -m json.tool /tmp/gcp-key.json > /dev/null 2>&1; then
        echo "✅ Valid JSON credentials file created"
        
        # Activate service account
        if gcloud auth activate-service-account --key-file=/tmp/gcp-key.json --quiet; then
            echo "✅ Service account activated"
        else
            echo "❌ Failed to activate service account"
            exit 1
        fi
    else
        echo "❌ Invalid JSON format in credentials"
        exit 1
    fi
else
    echo "❌ GOOGLE_APPLICATION_CREDENTIALS_JSON not found in environment"
    exit 1
fi

# Set project configuration
if [ ! -z "$GOOGLE_CLOUD_PROJECT" ]; then
    gcloud config set project $GOOGLE_CLOUD_PROJECT --quiet
    echo "✅ Project set to: $GOOGLE_CLOUD_PROJECT"
fi

# Verify setup
echo ""
echo "Current configuration:"
gcloud config list --quiet
echo ""
echo "Authentication status:"
gcloud auth list --quiet

# Test access
echo ""
echo "Testing Google Cloud Storage access..."
if gcloud storage buckets list --project=$GOOGLE_CLOUD_PROJECT --limit=1 > /dev/null 2>&1; then
    echo "✅ Google Cloud Storage access verified"
else
    echo "⚠️ Google Cloud Storage access test failed (this may be normal if no buckets exist)"
fi

echo ""
echo "✅ Google Cloud SDK setup complete!"