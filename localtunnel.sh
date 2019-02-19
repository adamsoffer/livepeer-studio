#!/bin/bash
while true
	do
		echo "Building Local Tunnel"
		lt --subdomain livepeer --port 3000
		sleep 2
	done