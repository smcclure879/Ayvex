
use strict;



open my $fhr, "<", "world-cil.txt" or die "can't open\n";

#my $seg=0;
my $start=0;
my $skippingSegment=0;
while(<$fhr>){
    if (/segment\s+(\d+)\s+rank\s+(\d+)\s+points\s+(\d+)/i) {
	#$seg++;
	#$seg == $1 or die "segment count mismatch\n";
	if ($2 > 1 || $3<900) {
	    $skippingSegment=1;
	    #print "skipping\n";
	    next;
	}
	$skippingSegment=0;
	print "$_";
	$start = $.+1;
	next;
    }
    
    next if $skippingSegment;

    next if ($.-$start)%30;

    #trim
    s/^\s+//o;
    s/\s+$//o;
    
    print $_,"\n";
}



close $fhr;
