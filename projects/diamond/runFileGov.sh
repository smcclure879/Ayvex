#!/usr/bin/expect

set timeout 20

set thepass [exec cat ../step0/ayvex.db.pwd]

spawn psql -f [lindex $argv 0] -o [lindex $argv 1] -A -q -t -h cancerfoolpostgresdb.cj71xdfmswno.us-west-2.rds.amazonaws.com -p 5432 -U ayvex clinical-trial-gov

expect "Password*"
send "$thepass\r";

interact
