#!/usr/bin/perl
use strict;
use LWP::Simple;
my $mcLocalFolder = "../../web/mc/";
my $mcGuideFile = 'guide.htm';


my $timeStr = gmtime()." UTC";
print "running at $timeStr\n";


# get IP addr
my $content = get "http://checkip.dyndns.org/" || print "ERROR: where is the internet???\n";
my $ipAddr='uninit';
if ($content =~ /(\d{1,3}\.){3}\d{1,3}/gio )
{
  $ipAddr = $&;
  print "found ip $ipAddr\n";
}
else
{
  print "no IP address: here is start of content:".substr($content,0,300)."\n\n";
}

exit unless $ipAddr;


#check old IP before rewriting file
my $oldIp;
open my $fhr, "<", "$mcLocalFolder$mcGuideFile";
while(<$fhr>)
{
  next unless /(\d{1,3}\.){3}\d{1,3}/gio;
  $oldIp=$&;
  last;
}

if ($oldIp ne $ipAddr)
{
  print system(qq(git add $mcLocalFolder$mcGuideFile));
  
  open my $fhw, ">", "$mcLocalFolder$mcGuideFile";
  print $fhw "direct connect IP address is:   $ipAddr:25565\n\n";
  print $fhw "timestamp=".$timeStr;
  print $fhw "\nbookmark this page!";
  print $fhw "\n\nThere is also a creative-mode server if you use 25566 instead\n";
  close $fhw;
  
  system(qq(git commit -m "foobar" $mcLocalFolder$mcGuideFile )) == 0 or print "ERROR: bad commit operation\n";
  system(qq(git push )) == 0  or print "ERROR: bad push operation\n";
}

print "file will appear at https://raw.github.com/smcclure879/Ayvex/master/web/mc/guide.htm\n\n"

  
