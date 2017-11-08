qw<
√ 2 = 1 + 1/(2 + 1/(2 + 1/(2 + ... ))) = 1.414213...</p>
<p>By expanding this for the first four iterations, we get:</p>
<p>1 + 1/2 = 3/2 = 1.5<br />
1 + 1/(2 + 1/2) = 7/5 = 1.4<br />
1 + 1/(2 + 1/(2 + 1/2)) = 17/12 = 1.41666...<br />
1 + 1/(2 + 1/(2 + 1/(2 + 1/2))) = 41/29 = 1.41379...<br /></p>
<p>The next three expansions are 99/70, 239/169, and 577/408,
  but the eighth expansion, 1393/985, is the first example where
  the number of digits in the numerator exceeds the number of
  digits in the denominator.</p>

<p>In the first one-thousand expansions, how many fractions
  contain a numerator with more digits than denominator?</p>

""";
>;

# 3/2   7/5   17/12   41/29
my $n=3; 
my $d=2;
my $wins=0;
for (0..999) {
    ($n , $d) = ($n+$d+$d , $n+$d);
    say "$_   $n / $d";
    $wins++ if $n.chars > $d.chars;
}

say "wins=$wins"

