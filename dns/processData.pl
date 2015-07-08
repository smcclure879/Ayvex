#!/usr/bin/perl

$comment = << 'SAMPLE_LOG_END'
 

----starting log----time=Fri Jul  3 04:04:01 2015
uptime=210110.82 835158.97

proceeding
no dup procs
about to run ifconfig
interface=eth0
failed response:bogus1
bogus1 is down
failed response:bogus2
bogus2 is down
interface ok:wired
interface=lo
interface=wlan0
bad interface: wireless
interface=
c
----starting log----time=Fri Jul  3 04:13:01 2015
uptime=210650.49 837295.89

proceeding
no dup procs
about to run ifconfig
interface=eth0
failed response:bogus1
bogus1 is down
failed response:bogus2
bogus2 is down
interface ok:wired
interface=lo
interface=wlan0
bad interface: wireless
interface=
c
----starting log----time=Fri Jul  3 04:27:01 2015
uptime=211490.72 840625.91


SAMPLE_LOG_END
;




while(<STDIN>)
{
    if (/uptime/)
    {
	next;
    }

    if (/time\=(.+)/)
    {
	$time=$1;
	print "\ntime=$time  ";
	next;
    }
    print "_" if /bogus. is down/;
    print "C" if  /comcast is down/;
    print "A" if  /ayvex is down/;
    print "G" if  /google is down/;
    #print "                           **" if /http/;
    
}


print "\n";
