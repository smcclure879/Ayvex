#!/bin/bash
cat logs/netlog_* | ./processData.pl > result.txt

