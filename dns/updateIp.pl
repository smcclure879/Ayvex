#!/usr/bin/perl
use strict;
use LWP::Simple;
use Socket;
use Cwd 'abs_path';
use File::Basename;


my $MINUTES = 60;

my $dnsName="ayvex.dnsalias.com";

my $pazzword="20abd9bc512f11e4814ccd0e1d232429";
#  updater client key = 20abd9bc512f11e4814ccd0e1d232429


print "remember this sleeps 5 minutes in case internet is just down for a while after power out\n";
sleep 5 * $MINUTES; 
print "sleep is done\n";







my $correctTime = get "http://www.timeapi.org/utc/now"  || print "ERROR: where is the internet1???\n";
print $correctTime;






my $logDir = dirname(abs_path($0))."/logs";
my $logFile = "$logDir/ip-update.".$correctTime.".log";
print "opening log in $logFile\n"; 



#start logging
open my $fhw, ">", $logFile  || die "$!\n";





my $timeStr = gmtime()." UTC    local=".time();
print $fhw "computer clock: $timeStr\n";
print $fhw "timeapi.org has: $correctTime\n";








####todo more sophistication for later...
####my @addresses = gethostbyname($name)   or die "Can't resolve $name: $!\n";
####@addresses = map { inet_ntoa($_) } @addresses[4 .. $#addresses];
my $dnsAddress = inet_ntoa(inet_aton($dnsName));

print $fhw "dns address $dnsAddress\n";




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
    print $fhw "ERROR: no IP address at checkIP: here is start of content:".substr($content,0,300)."\n\n";
    die "noIPaddr\n";
}

if (!$ipAddr)
{
    print $fhw "ERROR: no IP found at checkIP \n";
    die "noIPaddr2\n";
}



print "ipAddr:   actual=$ipAddr  ...  dns=$dnsAddress\n";
my $updating = ($ipAddr ne $dnsAddress);
if (!$updating)
{
    print $fhw "not updating: no need\n";
    #close $fhw;
    #exit;
}
else
{
    print $fhw "need to update\n";
    #and keep going...
}






#close $fhw;





chomp $pazzword;  






my $force = $ARGV[0] || 0;

my $mcLocalFolder = "../../web/mc/";
my $mcGuideFile = 'guide.htm';





#print $fhw "direct connect IP address is:   $ipAddr:25565\n\n";
#print $fhw "timestamp=".$timeStr;
#print $fhw "\nbookmark this page!";
#print $fhw "\n\nThere is also a creative-mode server if you use 25566 instead\n";




#work with dyn.org
if ($force || $updating) 
{
    print "working with dyn.org\n";
    my $url="http://ayvex:$pazzword\@members.dyndns.org/nic/update?hostname=$dnsName&myip=$ipAddr&wildcard=NOCHG&mx=NOCHG&backmx=NOCHG";
    #http://username:password@members.dyndns.org/nic/update?hostname=yourhostname&myip=ipaddress&wildcard=NOCHG&mx=NOCHG&backmx=NOCHG
    print $url;
    my $output=`curl \"$url\"`;
    print $output,"\n";
    print $fhw "output from curl:::".$output;
    if ($output =~ /good/) 
    {
	print $fhw "update ip worked\n";
    }
    else
    {
	print $fhw "update ip did not work\n";
	die "err838ax";
    }
}






#see if web server is running
sub checkWebServer
{
    my $host = shift;

    print $fhw "checking web server:$host  ...";
    my $url = "http://$host/";
    my $output = `curl \"$url\"`;
    print "outputr:",$output,"\n";
    print $fhw "output from curl::: $output \n";
    my $success = (($output =~ /hello\ world/i) &&  ($output =~ /base/i));
    if ($success)
    {
	print $fhw "web server is running\n";
    }
    else
    {
	print $fhw  "die noBase-823pg, output=$output\n";
	#die "noBase-823pg\n";
    }
}

checkWebServer("localhost");
checkWebServer("ayvexllc.com");
checkWebServer("ayvex.dnsalias.com");

#see if can hit web server as ayvexllc.com:whatver AND ayvex.dnsalias.com:whatever

#see if web server is running
print $fhw "checking web server\n";
my $url = "http://localhost/";
my $output = `curl \"$url\"`;
print "checking own web server:",$output,"\n";
print $fhw "output from curl::: $output \n";
my $success = (($output =~ /hello\ world/i) &&  ($output =~ /base/i));
if ($success)
{
    print $fhw "web server is running\n";
}
else
{
    print $fhw  "die noBase-823pg, output=$output\n";
    die "noBase-823pg\n";
}






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



