#!/bin/bash

# Size of swap in GB
SWAP_SIZE=4

echo "Checking for existing swap..."
if [ $(swapon --show --noheadings | wc -l) -gt 0 ]; then
    echo "Swap already exists:"
    swapon --show
    echo "Skipping creation."
    exit 0
fi

echo "Creating ${SWAP_SIZE}GB swap file at /swapfile..."

# Create file
if command -v fallocate >/dev/null 2>&1; then
    sudo fallocate -l ${SWAP_SIZE}G /swapfile
else
    sudo dd if=/dev/zero of=/swapfile bs=1G count=${SWAP_SIZE}
fi

if [ ! -f /swapfile ]; then
    echo "Error: Failed to create swap file."
    exit 1
fi

# Permissions
sudo chmod 600 /swapfile

# Setup swap
sudo mkswap /swapfile
sudo swapon /swapfile

# Persist
if ! grep -q "/swapfile" /etc/fstab; then
    echo "/swapfile none swap sw 0 0" | sudo tee -a /etc/fstab
    echo "Added to /etc/fstab for persistence."
fi

echo "Swap setup complete!"
echo "Current Memory Status:"
free -h
