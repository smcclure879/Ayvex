use strict;

my $n= 40; #use 3 for a 2x2
my $curr = 1;

my $sum = 1; # for  k=0  case

for my $k (1..$n) {
    print $curr,",";
    $curr *= ($n+1-$k)/$k;
    #$sum += $curr*$curr;
}
print $curr,"\n";
#print $sum,"\n";
