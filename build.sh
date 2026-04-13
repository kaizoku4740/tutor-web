#!/bin/bash
# Cloudflare Pages uses the build output from react-app/dist
# This script prevents Cloudflare from trying to build
echo "Build output is pre-built in react-app/dist"
exit 0
