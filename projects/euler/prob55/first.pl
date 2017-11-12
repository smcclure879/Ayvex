my $countLosses=0;
my $countWins=0;
my $ii = 9_999; #current number being tested
my $jj = 0; #the number during after a reverseAndAnd
my $iter=0;

my %bads = ();

while True {
    if $ii < 0 { 
	last;
    };
    if ($iter > 49) or %bads{$jj} { 
	$countLosses++;
	%bads{$ii} = 1;
	$iter = 0;
	say "$ii lose";
	--$ii;
	last if $ii < 0;
	$jj=$ii+$ii.comb.reverse.join();
	next; 
    };

    my $rev = $jj.comb.reverse.join;
    #print 'rev=',$rev,'  ';
    if $rev == $jj {
	$countWins++;
	say "\n\n$ii WIN at $jj";
	--$ii;
	last if $ii < 0;
	$jj=$ii+$ii.comb.reverse.join();
    } else {
	$jj += $rev;
	if $jj < 100_000 {print "jj=$jj "} else { print '.' }
	$iter++;
    }
}

print "
wins=$countWins
losses=$countLosses
";
