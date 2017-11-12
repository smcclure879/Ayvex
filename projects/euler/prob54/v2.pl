
my @suits = 'HDSC'.comb;

#numeric value support is more complex
my @inpNums  = 'AKQJT98765432B'.comb;  #B and 1 do not really exist, but make math easier later
my @internals  = (1..14).reverse .map({  pad( $_, '0', 2 )  });


my %revCodes = %((@internals Z @inpNums).flat);  
my %codes = %revCodes.invert;

say %codes.sort(:value);
say %revCodes.sort(:key);



sub pad($val,$pad,$count) {
    return substr( ($pad x $count) ~ $val ,  *-$count );
} 



my $testCount=0;
sub assert($a,$b,$c) {
    my $verbose=True;
    
    $testCount++;
    print "test $testCount: $c" if $verbose;
    if $a eq $b {
	say "--pass";
	return;
    }
    my $a1=$a.perl;
    my $b1=$b.perl;
    print("-----> FAIL FAIL FAIL:\n  --$a1--\n  --$b1--\n");
    
}

sub assert2($a,$b,$c) {
    return if $a == $b;
    my $a1=$a.perl;
    my $b1=$b.perl;
    print("-----> FAIL FAIL FAIL:\n  --$a1--\n  --$b1--\n");
    exit;	
}


assert( %codes{'A'} , '14' , 'lookups');




sub getRank($hand) {

    my @cards = $hand.comb;
    
    #make a histogram of the cards by number
    my %counts = ();
    %counts{$_}++  unless $_ eq ''  for @cards;
    %counts{' '}:delete;
    
    #bitvector of the numeric vals
    my $countRep = %counts{@inpNums}.map( {$_ || 0} ).list;
    
    my $cpm = $countRep.max;
    my $cv = $countRep.join();
    
    my $straightScore =   $cv.contains('11111')  ??  1  !!  0;
    #say %counts{@suits}.map( {$_||0} ).list;

    my $flushRep = %counts{@suits}.map({$_||0}).list;
    #say("FV="~$flushVec);
    my $flushScore = $flushRep.max==5  ??  1  !!  0; 

    #got the suit info we need, now it's in the way of short code.
    %counts{@suits}:delete;

    #interpret the counts as commands to reconstruct the hash in right order
    my @cmds = %counts  #value is count
	.map({	.value => %codes{.key} x .value   }) #invert and coding
	.sort:value
	;

    my $sortedCards=@cmds.reverse.map({$_[0].value}).join();
    assert2($sortedCards.chars,10,"wrong length"~@cmds.join(","));
    
    my $rank = sub {

	return 9 if ($straightScore && $flushScore);
	return 8 if $cpm=='4';
	return 7 if $cpm=='3' && $countRep.contains('2');
	return 6 if $flushScore;
	return 5 if $straightScore;
	return 4 if $cpm=='3';
	return $countRep.grep({$_=='2'})+1 ; #rank as 3,2,1 for 2,1,0 pairs respectfully
	
    }();
    
    return ($rank ~ $sortedCards);
}



sub { #tests

    #exit;  #tests or not
    assert(getRank("QC KC AC JC TC") , 9_14_13_12_11_10,"royal flush");

    assert(getRank("KH 2C 2H 4D 4H") , 3_04_04_02_02_13,"twoPair");
    assert(getRank("2H 2C 2S 4H 4C") , 7_02_02_02_04_04,"fullHouse");
    assert(getRank("2C 2H 2D 2S KH") , 8_02_02_02_02_13,"fourKind");

    assert(getRank("2C 3C 4C 5C 7D") , 1_07_05_04_03_02,"loBall");



    assert(getRank("2C 3C 4C 5C 6C") , 9_06_05_04_03_02,"straight flush");

    


    
    assert(getRank("2H 4H 5H 6H TH") , 6_10_06_05_04_02,"flush");
    assert(getRank("2C 3H 4D 5D 6H") , 5_06_05_04_03_02,"straight");
    
    assert(getRank("AC AH AD 3H 4D") , 4_14_14_14_04_03,"threeKind");

    
    assert(getRank("AH KH QH JH 6D") , 1_14_13_12_11_06,"hiBall");
    
    assert(getRank("2C 3C 4C 5C 7C") , getRank("2D 3D 4D 5D 7D"),"sameRank");
    assert(getRank("2C 3C 5C 6C 8C")>getRank("2D 3D 4D 5D 7D"),True,"nearMiss");
    
    #exit; #or not, after running

}();


    



# --------------start---------

my $wins=0;
my $file = 'poker.txt';  #'test.txt';
for $file.IO.lines {
    my @chars = $_.comb;
    #@chars.end>28  || die "where are chars " ~ @chars;

    #get ranks
    my $r1=getRank(@chars[ 0..14]);
    my $r2=getRank(@chars[15..29]);

    print "$r1--$r2---" 
	, $r1 gt $r2 ?? ++$wins !! '...'
	, "     "
	, @chars[0..14]
	, "   "
	, @chars[15..29]
	, "\n";


}
print "wins=$wins\n";

















=finish




my @suits = 'HDSC'.ords;
my @inpNums  = 'AKQJT98765432'.ords;
#my @altNums = 'zyxwvutsrqpon'.reverse.ords; #so they sort hi to low, for left-to-right stuff like arrays and bitvectors
#my %valLookup = (@inpNums Z @altNums).flat ;



sub getRank(@cardChars) {

    my %counts = ();

    #make a histogram of the cards by number
    %counts{$_}++ for @cardChars;  #histo-ize

    #bitvector of the numberic vals
    my $countRep = %counts{@inpNums}.map( {$_ || 0} ).list;
    
    my $cpm = $countRep.max;
    my $straighting = $countRep.join();
    
    my $straightScore =   $straighting.contains('11111')  ??  1  !!  0;
    #say %counts{@suits}.map( {$_||0} ).list;

    my $flushRep = %counts{@suits}.map({$_||0}).list;
    #say("FV="~$flushVec);
    my $flushScore = $flushRep.max==5  ??  1  !!  0; 


    my $tieBreaker = sub {
	#actually I'm gonna break off this work here and start in a different approach called v2.pl
	

    }();


    
    my $rank = sub {

	return 9 if ($straightScore && $flushScore);
	return 8 if $cpm=='4';
	return 7 if $cpm=='3' && $countRep.contains('2');
	return 5 if $flushScore;
	return 4 if $straightScore;
	return 3 if $cpm=='3';
	return $countRep.grep({$_=='2'})+0 ; #2 or 1 or 0 pairs
    }();

    #$rank~= ",";
    $rank ~= $straighting;




    assert($rank.chars==14,"wrong length"~@cardChars.join(","));
    
    return $rank;
}


sub assert($a,$c) {
    return if $a;
    $c.say ;
    die;
}
    



    


=finish
    High Card: Highest value card.
    One Pair: Two cards of the same value.
    Two Pairs: Two different pairs.
    Three of a Kind: Three cards of the same value.
  Straight: All cards are consecutive values.
  Flush: All cards of the same suit.
    Full House: Three of a kind and a pair.
    Four of a Kind: Four cards of the same value.
    Straight Flush: All cards are consecutive values of same suit.
    Royal Flush: Ten, Jack, Queen, King, Ace, in same suit.
    The cards are valued in the order:
    2, 3, 4, 5, 6, 7, 8, 9, 10, Jack, Queen, King, Ace.

