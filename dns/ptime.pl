use strict;
#my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst)=
#    localtime();
#print "$year$mon$mday".'Z'."$hour,$min,$sec\n";


use POSIX qw(strftime);
my $p = strftime "%FT%R:%S",gmtime();
print $p;
