
# * A googol (10<sup>100</sup>) is a massive number: one followed by one-hundred zeros;
# * 100<sup>100</sup> is almost unimaginably large: one followed by two-hundred zeros.
# Despite their size, the sum of the digits in each number is only 1.</p>

# Considering natural numbers of the form, <i>a<sup>b</sup></i>, 
#where <i>a, b</i> &lt; 100, what is the maximum digital sum?


my $counta=0;
my $countb=0;

my $max=0; #max sum seen
my $spl=1;
my $ans='no answer found'; 

for (2..99).list.reverse -> $a {

    my $loga = log10($a);
    my $startb = round($spl/$loga)-1;
    say "$a,$loga,$startb, $spl";
    $startb = 0 if $startb < 1;
    $counta++;
    
    if $startb > 99 {
	say "*****";
	next;
    }
    for ($startb..99).list.reverse -> $b {


	#my $digitEst = $b * $loga;
	#last if $digitEst < $spl;
	my $digits = ($a ** $b).comb.list;
	
	#if $max/9 > #ofdigitsPossible
	# if $digits.chars < $spl {
	#     say "skip at $a ^ $b ";
	#     last;
	# }

	$countb++;
	
	my $result = $digits.map({0+$_}).sum;
	if $result > $max {
	    print "----$result   $a,$b   \n";
	    $max = $result;
	    $spl = $max//9;
	    $ans = "----$result   $a,$b   \n";
	}

   }
}

say $ans;
say $counta,$countb;
