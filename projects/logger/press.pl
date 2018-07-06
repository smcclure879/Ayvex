use strict;
use warnings;
use Time::Piece;


      
my $offset=1_530_000_000;
sub getDate {
    my $in=shift;
 
    return eval {Time::Piece->strptime($in, "%Y-%m-%d %H:%M:%S")} || 0;
}

sub unlet {
    my $x=shift;
    $x =~ s/[a-zA-Z]//go;
    return $x;
}

#columns    
print "timecode\tyday\tdegC\tPa\tpressAltComp\n";
my $c=0;
while(<STDIN>) {
    $c++;
    next if $c % 1000;
    next unless $_ =~ /^2018-/o;
    next if $_ =~ /!!!/io;
    
    my @f=split /,/;
    
    my $dtraw =  $f[0];
    $dtraw =~ s/Z/ /og ;
    # Parse the date using strptime(), which uses strftime() formats.
    my $dt = getDate($dtraw);
    next unless $dt;
    
    print join "\t",(
	$dt->epoch,
	$dt->yday,
	unlet($f[2]),
	unlet($f[3]),
	unlet($f[4])
    );
    print "\n";
}
exit;



# Here it is, parsed but still in GMT.
# say $time->datetime;

# # Get your local time zone offset and add it to the time.
# $time += $time->localtime->tzoffset;

# # And here it is localized.
# say $time->datetime;
# print gmtime();

