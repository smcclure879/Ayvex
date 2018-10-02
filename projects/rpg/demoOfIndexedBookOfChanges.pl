while (<DATA>)  {
    #print $_;
    ($id,$t) = split /\ /,$_,2;
    $id or next;
    $t or next;
    
    $d{$id}=$t;
}

my $prev;
while(1) {
    print "beep>";
    my $x=<STDIN>;
    chomp($x);
    $x = $x || $prev || 'xx';

    $prev=$x;
    if ($x eq 'artifact') {
	$x = '9895xx';
    }
    

    if ($x eq 'q') {
	exit(0);
    
    } elsif ($x =~ /x/) {

	#substitute random digit for every x
	$x =~ s/x/int(10*rand())/ge;

	print $x,"\n";
	for (my $q=int($x); $q>-1; $q--) {
	    my $t=$d{$q};
	    if ($t) {
		print "$q: $t", "\n";
		last;
	    }
	}

    } elsif(0) {

	my $a=int(10*rand());
	my $b=int(10*rand());
	my $n=$a.$b;
	
	for my $q (reverse("00"..$n)) {
	    my $t=$d{$q};
	    if ($t) {
		print "$q: $t", "\n";
		last;
	    }
	    #print $q, $t, "\n";
	}

    } else {
	print "NYI-bugbug-\n";
    }
}

__END__
#This is the Book of Changes...literally all changes that can happen in a place, to a person, etc.
#scan the list for the closest matching number.  
00 All remains as before
50 .

51 External

510 heat
5100 weather temperature rises
5101 warm draft
5102 fire/smell of smoke

511 cold
5110 weather temp falls
5111 cool draft
5112 frost sign or smell of cold

#many more lists could be imported and semi-automatically numbered,
#  so that there are potentially millions of effects, items, etc


90 Bodily Change/Mutation
901 Grow
90100 All over
90105 .
90106 Grow Head (extra brain etc)
90107 Grow Neck
90108 Grow new limb (tentacle, etc)
90109 Grow One Sided Only Leg (dm choice)
90110 Grow Both Legs



98 Gain Treasure
980 Gold
981 Gems
9895 Artifact
989501 The Lesser Crown of Raxaxala of which legends lie boldly.
989502 Fry Pan of the Ancient Order of Saucerors
989503 The mizutoyo   (really a Bilingual Japanese-english electronic dictionary, ca. 1999)
989504 Pick of Density (-4 mental strength, +3 charisma)


