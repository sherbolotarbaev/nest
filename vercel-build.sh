#!/bin/bash

# Run prisma generate
npx prisma generate

# Start Nest.js application
node dist/main.js
