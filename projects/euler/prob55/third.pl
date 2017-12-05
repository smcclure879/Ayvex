my $countLosses=0;
my $countWins=0;
my $max = 10_000;
my %cache = ();

sub rev($x) {
    return 0+$x.comb.reverse.join();
}


sub isp($x) {
    my $rev=rev($x);
    #print " r=$rev  ";
    return $x==rev($x) ?? 1 !! 0 ;
}


sub isl2($x,$c,$rx) {

    if $x ~~ %cache {
	print "hit $c";
	return %cache{$x} ;
    }
    if $rx ~~ %cache {
	print "hit2 $c";
	return %cache{$rx};
    }
    
    print '.';
 
    my $retval = sub {
	return 1 if $c > 49;
	my $above = $x + $rx;
	my $revAbove = rev($above);
	return 0 if $above==$revAbove;
	return isl2($above, $c+1, $revAbove);
    }();

    %cache{$x}=$retval;

    return $retval;
}

sub isl($x) {
    print $x,"  ";
    my $retval = isl2($x,0,rev($x));
    print "\n";
    return $retval;
}


for (1..^$max).list.reverse {
    my $res=isl($_);
    if ($res) {
	$countWins++;
    }else{
	$countLosses++;
    }
    my $cacheSize = 0 + %cache.keys;
    say "$_  $res  $cacheSize";
}


print "
wins=$countWins
losses=$countLosses
";
