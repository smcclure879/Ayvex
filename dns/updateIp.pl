#!/usr/bin/perl
use strict;
use LWP::Simple;
use Socket;


my $MINUTES = 60;

my $dnsName="ayvex2.dnsalias.com";

my $pazzword="20abd9bc512f11e4814ccd0e1d232429";
#  updater client key = 20abd9bc512f11e4814ccd0e1d232429


print "remember this sleeps 5 minutes in case internet is just down for a while after power out\n";
sleep 5 * $MINUTES;   #bugbug restore this!
print "sleep is done\n";

#start logging
open my $fhw, ">", "/home/pi/autorun/ip-update.".time().".log";



####todo more sophistication for later...
####my @addresses = gethostbyname($name)   or die "Can't resolve $name: $!\n";
####@addresses = map { inet_ntoa($_) } @addresses[4 .. $#addresses];
my $foundAddress = inet_ntoa(inet_aton($dnsName));

print $fhw "found address $foundAddress\n";




# get IP addr
my $content = get "http://checkip.dyndns.org/" || print "ERROR: where is the internet2 ???\n";
my $ipAddr;
if ($content =~ /(\d{1,3}\.){3}\d{1,3}/gio )
{
    $ipAddr = $&;
    print $fhw "measured ip $ipAddr\n";
}
else
{
    print $fhw "ERROR: no IP address: here is start of content:".substr($content,0,300)."\n\n";
    die "noIPaddr\n";
}

if (!$ipAddr)
{
    print $fhw "ERROR: no IP found\n";
    die "noIPaddr2\n";
}



print "ipAddr:   measured = $ipAddr  ...  found=$foundAddress\n";
if ($ipAddr eq $foundAddress)
{
    print $fhw "not updating: no need\n";
    close $fhw;
    exit;
}
else
{
    print $fhw "need to update\n";
    #and keep going...
}



my $correctTime = get "http://www.timeapi.org/utc/now"  || print "ERROR: where is the internet1???\n";
print $correctTime;
print $fhw $correctTime;









chomp $pazzword;  






my $force = $ARGV[0] || 0;

my $mcLocalFolder = "../../web/mc/";
my $mcGuideFile = 'guide.htm';


my $timeStr = gmtime()." UTC";
print "running at $timeStr\n";




print $fhw "direct connect IP address is:   $ipAddr:25565\n\n";
print $fhw "timestamp=".$timeStr;
print $fhw "\nbookmark this page!";
print $fhw "\n\nThere is also a creative-mode server if you use 25566 instead\n";



#work with dyn.org

my $url="http://ayvex:$pazzword\@members.dyndns.org/nic/update?hostname=ayvex2.dnsalias.com&myip=$ipAddr&wildcard=NOCHG&mx=NOCHG&backmx=NOCHG";
#       http://username:password@members.dyndns.org/nic/update?hostname=yourhostname&myip=ipaddress&wildcard=NOCHG&mx=NOCHG&backmx=NOCHG
print $url;
my $output=`curl \"$url\"`;
print $output,"\n";
print $fhw "output from curl:::".$output;
($output =~ /good/) or die ;



close $fhw;




#check old IP before rewriting file
#my $oldIp;
#open my $fhr, "<", "$mcLocalFolder$mcGuideFile";
#while(<$fhr>)
#{
#    next unless /(\d{1,3}\.){3}\d{1,3}/gio;
#    $oldIp=$&;
#    last;
#}

#if ($force || ($oldIp ne $ipAddr))
#{
    #print system(qq(git add $mcLocalFolder$mcGuideFile));
    
#    open my $fhw, ">", "updateIp.log."+time;
#    print $fhw "direct connect IP address is:   $ipAddr:25565\n\n";
#    print $fhw "timestamp=".$timeStr;
#    print $fhw "\nbookmark this page!";
#    print $fhw "\n\nThere is also a creative-mode server if you use 25566 instead\n";
#    close $fhw;
    
    ##system(qq(git commit -m "foobar" $mcLocalFolder$mcGuideFile )) == 0 or print "ERROR: bad commit operation\n";
    ##system(qq(git push )) == 0  or print "ERROR: bad push operation\n";
    ##print "skipping copy of file to   https://raw.github.com/smcclure879/Ayvex/master/web/mc/guide.htm\n\n"
#}
#else
#{
#    print "not writing file...same IP, not forced\n";
#}



