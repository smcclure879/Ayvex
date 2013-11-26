#!/usr/bin/perl
use strict;
use LWP::Simple;
my $mcLocalFolder = "../../web/mc/";
my $mcGuideFile = 'guide.htm';


# get IP addr
my $content = get "http://checkip.dyndns.org/";
$content =~ /(\d{1,3}\.){3}\d{1,3}/gio;
my $ipAddr = $&;
print "found ip $ipAddr\n";



#check old IP before rewriting file
open my $fhr, "<", "$mcLocalFolder$mcGuideFile";
while(<$fhr>)
{
  next unless /(\d{1,3}\.){3}\d{1,3}/gio;
  my $oldIp=$&;
  last;
}

if ($oldIp ne $ipAddr)
{
  print system(qq(git checkout $mcLocalFolder$mcGuideFile));
  
  open my $fhw, ">", "$mcLocalFolder$mcGuideFile";
  print $fhw "direct connect IP address is:   $ipAddr:25565\n\n";
  print $fhw "timestamp=".time;
  print $fhw "\nbookmark this page!";
  print $fhw "\n\nThere is also a creative-mode server if you use 25566 instead\n";
  close $fhw;
  
  print system(qq(git commit -m "foobar" $mcLocalFolder$mcGuideFile ));
  print system(qq(git push ));
}

print "file will appear at https://raw.github.com/smcclure879/Ayvex/master/web/mc/guide.htm"

  
