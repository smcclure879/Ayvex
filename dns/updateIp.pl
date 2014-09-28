#!/usr/bin/perl
use strict;
use LWP::Simple;


print "hint: snackage with poverty in the middle  bugbug";
my $pazzword=<>;
chomp $pazzword;  






my $force = $ARGV[0] || 0;

my $mcLocalFolder = "../../web/mc/";
my $mcGuideFile = 'guide.htm';


my $timeStr = gmtime()." UTC";
print "running at $timeStr\n";


# get IP addr
my $content = get "http://checkip.dyndns.org/" || print "ERROR: where is the internet???\n";
my $ipAddr;
if ($content =~ /(\d{1,3}\.){3}\d{1,3}/gio )
{
    $ipAddr = $&;
    print "found ip $ipAddr\n";
}
else
{
    print "ERROR: no IP address: here is start of content:".substr($content,0,300)."\n\n";
    die "noIPaddr\n";
}

if (!$ipAddr)
{
    print "ERROR: no IP found\n";
    die "noIPaddr2\n";
}





#check old IP before rewriting file
my $oldIp;
open my $fhr, "<", "$mcLocalFolder$mcGuideFile";
while(<$fhr>)
{
    next unless /(\d{1,3}\.){3}\d{1,3}/gio;
    $oldIp=$&;
    last;
}

if ($force || ($oldIp ne $ipAddr))
{
    print system(qq(git add $mcLocalFolder$mcGuideFile));
    
    open my $fhw, ">", "$mcLocalFolder$mcGuideFile";
    print $fhw "direct connect IP address is:   $ipAddr:25565\n\n";
    print $fhw "timestamp=".$timeStr;
    print $fhw "\nbookmark this page!";
    print $fhw "\n\nThere is also a creative-mode server if you use 25566 instead\n";
    close $fhw;
    
    ##system(qq(git commit -m "foobar" $mcLocalFolder$mcGuideFile )) == 0 or print "ERROR: bad commit operation\n";
    ##system(qq(git push )) == 0  or print "ERROR: bad push operation\n";
    print "skipping copy of file to   https://raw.github.com/smcclure879/Ayvex/master/web/mc/guide.htm\n\n"
}
else
{
    print "not writing file...same IP, not forced\n";
}



#work with dyn.org







my $url="http://ayvex:$pazzword\@members.dyndns.org/nic/update?hostname=ayvex.dnsalias.com&myip=$ipAddr&wildcard=NOCHG&mx=NOCHG&backmx=NOCHG";
#       http://username:password@members.dyndns.org/nic/update?hostname=yourhostname&myip=ipaddress&wildcard=NOCHG&mx=NOCHG&backmx=NOCHG
print $url;
my $output=`curl \"$url\"`;
print $output,"\n";
($output =~ /good/) or die ;


