#!/usr/bin/perl
use strict;
use LWP::Simple;
use Socket;
use Cwd 'abs_path';
use File::Basename;
use JSON;
use File::Slurp;

my $MINUTES = 60;
my $ipAddr;
my $fhw;

#work with dyn.org
sub regDnsAlias {

    my $regObj = shift;

    print "working with dyn.org\n";
    
    my $dnsName = $regObj->{'dns'};
    my $user = $regObj->{'user'};
    my $pazz = $regObj->{'pazz'};
    

    my $url="http://$user:$pazz\@members.dyndns.org/nic/update?hostname=$dnsName&myip=$ipAddr&wildcard=NOCHG&mx=NOCHG&backmx=NOCHG";
    #http://username:password@members.dyndns.org/nic/update?hostname=yourhostname&myip=ipaddress&wildcard=NOCHG&mx=NOCHG&backmx=NOCHG
    print $url;
    my $output=`curl \"$url\"`;
    print $output,"\n";
    print $fhw "output from curl:::".$output;
    if ($output =~ /good/) {
	print $fhw "update ip worked\n";
    } else {
	print $fhw "update ip did not work\n";
	die "err838ax";
    }
    
    
}


sub regGoogle
{

    my $regObj = shift;

    print "working with goog\n";
    
    my $dnsName = $regObj->{'dns'};
    my $user = $regObj->{'user'};
    my $pazz = $regObj->{'pazz'};

    my $url="https://$user:$pazz\@domains.google.com/nic/update?hostname=$dnsName";

    #POST recommended but GET allowed 
    #bugbug todo log and output need cleanup
    print "trying url=$url\n";
    my $output=`curl -s -A "ayvexGoogleUpdateScript" \"$url\"`;
    print $output,"\n";
    print $fhw "output from curl:::".$output;
    ($output =~ /good/) or ($output =~ /nochg/) or die "err9834p\n";
}






sub performDnsRegistration {
    my $regObj = shift;

    print "foo$regObj","llll";

    
    my $reg = $regObj->{'reg'};

    
    regDnsAlias($regObj) if $reg eq 'dnsalias';
    regGoogle($regObj) if $reg eq 'google';
}



# my $dnsRegInfoExample = << 'EOREG';
# {
#   { 
#     reg:"dnsalias",
#     dns:"ayvex.dnsalias.com",
#     user:"",
#     pazz:"yeahbub";
#   },
#   {
#      reg:"google",
#     dns:"ayvexllc.com",
#     user:"yeahUser",
#     pazz:"yeahPazz"
#   }
# }    
# EOREG
# ;












######START########

#keeping these older for now as failsafes
#...for dnsalias registration   #bugbug factor better need a pwd store
my $dnsName="ayvex.dnsalias.com";
my $pazzword="readElsewhere204r";

print "remember this sleeps 5 minutes in case internet is just down for a while after power out\n";
sleep 5 * $MINUTES; 
print "sleep is done\n";



my $correctTime = get "http://www.timeapi.org/utc/now"  || print "ERROR: where is the internet1???\n";
print $correctTime;


my $logDir = dirname(abs_path($0))."/logs";
my $logFile = "$logDir/ip-update.".$correctTime.".log";
print "opening log in $logFile\n"; 



#start logging
open $fhw, ">", $logFile  || die "$!\n";





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
}
else
{
    print $fhw "need to update\n";
}













my $force = $ARGV[0] || 0;

#my $mcLocalFolder = "../../web/mc/";
#my $mcGuideFile = 'guide.htm';





if ( $force || $updating ) {
    my $stuff = read_file("passwordsNotCheckedIn.pazz"); #bugbug todo rename to "config" or similar
    my $registrations = decode_json($stuff);
    for my $reg (@$registrations) {
	performDnsRegistration($reg);
    }
}






#more advanced checks to see if web server is running various ways
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



