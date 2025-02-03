#!/bin/bash

# Write the private key to a file
echo "$PRIVATE_KEY" > private-key.pem 

# Set the appropriate permissions for the key file
chmod 600 private-key.pem 

# Establish an SSH connection and execute commands on the remote server
ssh -o StrictHostKeyChecking=no -i private-key.pem "$STAGING_SERVER_USERNAME_AND_HOST" <<EOF
    # Comands below will be executed on the remote server 
    source ~/.bashrc
    cd litespace-org/litespace/
    git pull origin master
    pnpm install 
    pnpm build:server:pkgs 
    pnpm models reseed
    pm2 reload main-server
EOF

# Remove the private key file after use for security
rm -f private-key.pem