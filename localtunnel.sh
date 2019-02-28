#!/bin/bash
while true
	do
		echo "Building Local Tunnel"
		lt --subdomain livepeer-studio --port 3000
		sleep 2
	done