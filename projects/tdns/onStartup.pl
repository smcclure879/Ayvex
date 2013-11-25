#!/usr/bin/perl
use strict;
use LWP::Simple;
my $mcLocalFolder = "C:\\Users\\steve\\Documents\\GitHub\\Ayvex\\web\\mc\\";
my $mcGuideFile = 'guide.htm';


# get IP addr
my $content = get "http://checkip.dyndns.org/";
$content =~ /(\d{1,3}\.){3}\d{1,3}/gio;
my $ipAddr = $&;
print "found ip $ipAddr\n";

##my $r = Git::Repository->new( work_tree => $mcLocalFolder );
print system(qq(git checkout $mcLocalFolder$mcGuideFile));

open my $fhw, ">", "$mcLocalFolder$mcGuideFile";

print $fhw "my ip is bugbug:   $ipAddr\n\n";
print $fhw "got that at "+time;
print "got that at "+time;

close $fhw;


print system(qq(git commit -m "foobar" $mcLocalFolder$mcGuideFile ));
print system(qq(git push ));
print "file will appear at https://raw.github.com/smcclure879/Ayvex/master/web/mc/guide.htm"


