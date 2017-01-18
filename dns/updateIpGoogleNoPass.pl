#!/usr/bin/perl


#givens   ....  this is integration point into updateIp.pl
my $dnsName="dev.ayvexllc.com";
my $googleUser="bugbugUser";  #bugbug need a pwd store
my $googlePazz="bugbugPass";




my $url="https://$googleUser:$googlePazz\@domains.google.com/nic/update?hostname=$dnsName";

#POST recommended but GET allowed 

my $fhw = \*STDOUT;  #bugbug
print "trying url=$url\n";
my $output=`curl -s -A "ayvexGoogleUpdateScript" \"$url\"`;
print $output,"\n";
print $fhw "output from curl:::".$output;
($output =~ /good/) or ($output =~ /nochg/) or die "horrible death\n";



exit;





my $junkText = << 'JJTO';
POST /nic/update?hostname=subdomain.yourdomain.com&myip=1.2.3.4 HTTP/1.1
Host: domains.google.com
Authorization: Basic base64-encoded-auth-string User-Agent: Chrome/41.0 your_email@yourdomain.com



username:passwordRequiredThe generated username and password associated with the host that is to be updated.
    hostnameRequiredThe hostname to be updated.
    myip
   Optional  (Required if you have an IPv6 address)The IP address to which the host will be set. If not supplied, we’ll use the IP of the agent that sent the request.  Note: Because the address must be an IPv4 address, myip is required if your agent uses an IPv6 address. You can check your agent’s IP address by going to https://domains.google.com/checkip.

    offlineOptionalSets the current host to offline status. If an update request is performed on an offline host, the host is removed from the offline state.
Allowed values are
yes
no
One of the following responses will be returned after the request is processed.

Please ensure you interpret the response correctly, or you risk having your client blocked from our system.
    ResponseStatusDescription
    good 1.2.3.4SuccessThe update was successful. Followed by a space and the updated IP address. You should not attempt another update until your IP address changes.
    nochg 1.2.3.4SuccessThe supplied IP address is already set for this host. You should not attempt another update until your IP address changes.
    nohostErrorThe hostname does not exist, or does not have Dynamic DNS enabled.
    badauthErrorThe username / password combination is not valid for the specified host.
    notfqdnErrorThe supplied hostname is not a valid fully-qualified domain name.
    badagentErrorYour Dynamic DNS client is making bad requests. Ensure the user agent is set in the request, and that you’re only attempting to set an IPv4 address. IPv6 is not supported.
    abuseErrorDynamic DNS access for the hostname has been blocked due to failure to interpret previous responses correctly.
    911ErrorAn error happened on our end. Wait 5 minutes and retry.



JJTO





