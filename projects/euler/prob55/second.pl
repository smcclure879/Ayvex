my $countLosses=0;
my $countWins=0;
my $max = 10_000;


sub rev($x) {
    return $x.comb.reverse.join();
}

sub isp($x) {
    my $rev=rev($x);
    print " r=$rev  ";
    return $x==rev($x) ?? 1 !! 0 ;
}


sub isl2($x,$c) {
    return 1 if $c > 49;
    my $above =$x+rev($x);
    return 0 if isp($above);
    return isl2($above,$c+1);
}

sub isl($x) {
    my $res=isl2($x,0);
    return $res;
}


for (1..^$max).reverse {
    my $res=isl($_);
    if ($res) {
	$countWins++;
    }else{
	$countLosses++;
    }
    say "$_  $res";
}


print "
wins=$countWins
losses=$countLosses
";
