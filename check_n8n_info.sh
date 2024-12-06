#!/bin/bash

# Kiểm tra phiên bản Node.js
echo "Node.js version:"
node -v

# Kiểm tra phiên bản npm
echo "npm version:"
npm -v

# Kiểm tra phiên bản n8n
echo "n8n version:"
n8n -v

# Kiểm tra quyền truy cập tệp cấu hình
CONFIG_FILE="/root/.n8n/config"
if [ -f "$CONFIG_FILE" ]; then
    echo "Config file found: $CONFIG_FILE"
    echo "Permissions for config file:"
    ls -l "$CONFIG_FILE"
else
    echo "Config file not found: $CONFIG_FILE"
fi

# Kiểm tra thư mục cài đặt của n8n
N8N_DIR="/root/.n8n"
if [ -d "$N8N_DIR" ]; then
    echo "n8n directory found: $N8N_DIR"
    echo "Contents of n8n directory:"
    ls -la "$N8N_DIR"
else
    echo "n8n directory not found: $N8N_DIR"
fi

# Kiểm tra cấu hình TypeScript (nếu có)
TS_CONFIG_FILE="tsconfig.json"
if [ -f "$TS_CONFIG_FILE" ]; then
    echo "TypeScript config found: $TS_CONFIG_FILE"
    echo "Contents of tsconfig.json:"
    cat "$TS_CONFIG_FILE"
else
    echo "TypeScript config not found: $TS_CONFIG_FILE"
fi

# Kiểm tra cài đặt gói @azure/storage-blob
AZURE_PACKAGE_PATH="/root/n8n-nodes-aitable/node_modules/@azure/storage-blob"
if [ -d "$AZURE_PACKAGE_PATH" ]; then
    echo "@azure/storage-blob package found: $AZURE_PACKAGE_PATH"
    echo "Contents of @azure/storage-blob directory:"
    ls -la "$AZURE_PACKAGE_PATH"
else
    echo "@azure/storage-blob package not found: $AZURE_PACKAGE_PATH"
fi

echo "Information gathering completed."
