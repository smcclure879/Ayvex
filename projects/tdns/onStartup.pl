#!/usr/bin/perl
use strict;
use LWP::Simple;
my $content = get "http://checkip.dyndns.org/";
#print $content;
$content =~ /(\d{1,3}\.){3}\d{1,3}/gio;
my $ipAddr = $&;

print "found ip $ipAddr\n";

my $mcLocalFolder = "C:\\Users\\steve\\Documents\\GitHub\\Ayvex\\web\\mc\\";
my $mcGuideFile = 'guide.htm';
##my $r = Git::Repository->new( work_tree => $mcLocalFolder );

print system(qq(git checkout $mcLocalFolder$mcGuideFile));




