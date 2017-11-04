

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

    #%counts{' '}:delete; #nice but optional


    assert($rank.chars==14,"wrong length"~@cardChars.join(","));
    
    return $rank;
}


sub assert($a,$c) {
    return if $a;
    $c.say ;
    die;
}
    

sub { #tests

    #exit;  #tests or not
    assert(getRank("2C 3C 4C 5C 6C".ords).starts-with('90000'),"straight flush");
    assert(getRank("2C 2H 2D 2S KH".ords).starts-with('8010'),"x4ok");
    assert(getRank("2H 2C 2S 4H 4C".ords).starts-with('7000000'),"full");
    assert(getRank("2H 4H 5H 6H TH".ords).starts-with('5000010'),"flush");
    assert(getRank("2C 3H 4D 5D 6H".ords).starts-with('40000000011111'),"str");
    assert(getRank("AC AH AD 3H 4D".ords).starts-with('330'),"3ok");
    assert(getRank("2C 2H 4D 4H KH".ords).starts-with('201000'),"x2pr");
    assert(getRank("2C 3C 4C 5C 7C".ords) == getRank("2D 3D 4D 5D 7D".ords),"sameRank");
    assert(getRank("2C 3C 5C 6C 8C".ords)>getRank("2D 3D 4D 5D 7D".ords),"nearMiss");
    assert(getRank("2C 3C 4C 5C 7D".ords).starts-with('000000'),"loBall"~getRank("2C 3C 4C 5C 7D".ords));
    assert(getRank("AH KH QH JH 6D".ords).starts-with('01111000'),"hiBall");
    #exit; #or not, after running

}();

# --------------start---------

my $wins=0;
my $file = 'poker.txt';  #'test.txt';
for $file.IO.lines {
    my @chars = $_.ords;
    @chars.end>10  || die "where are chars";

    #get ranks
    my $r1=getRank(@chars[0..14]),
    my $r2=getRank(@chars[15..29]);

    print "$r1--$r2---" 
	, $r1 gt $r2 ?? ++$wins !! '...'
	, "     "
	, @chars[0..14].map(&chr)
	, "   "
	, @chars[15..29].map(&chr)
	, "\n";


}
print "wins=$wins\n";


    
    #$line ~~ s:g/\s+//;
    #say $line.flat.perl;

    #my $hand1= $line.substr(0,9);
    #my $hand2= .substr(10,*-1);

    #say $hand1.perl




    
    # say $hand1;
    
#     my @cards = $line.split(" ");
#     my @hand1 = @cards[0 .. 4];
#     my @hand2 = @cards[5 .. 9];

#     for @hand1 -> $card {
# 	my [$v,$s] = $card.chars().list();
# 	#$card[::];
# 	#my $v=$card.substr(0,1);
# 	#my $s=$card.substr(1,1);
# 	#$v = $v.trans( $valLookup );  #  .split('');  #/23456789TJQKA/,'0123456789abc'.split('')) ;
# 	say $s;
# 	    #@c=@c.split();
# 	#print @c[0];
#     }

# }	 


=finish
        #$card = $card.trans
	    #~= tr/23456789TJQKA/0123456789abc/;
	#tr/DHSC/WXYZ/;
	 #   The tr/// quote-like operator now also has a method form called trans(). Its argument is a list of pairs. You can use anything that produces a pair list:
	  #  $str.trans( %mapping.pairs );
	#Use the .= form to do a translation in place:

	$str.=trans( %mapping.pairs );
	(Perl 6 does not support the y/// form, which was only in sed because they were running out of single letters.)

	    The two sides of any pair can be strings interpreted as tr/// would:
	    $str.=trans( 'A..C' => 'a..c', 'XYZ' => 'xyz' );
	print $card;
"""




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

