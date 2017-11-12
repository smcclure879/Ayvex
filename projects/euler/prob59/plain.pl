

my %h=();

my $spacing = 3;
my $path = 'text.txt';
my $fhr = open $path, :r;
my $content = $fhr.slurp-rest;
$fhr.close();



my @vals = $content.comb.grep( { !!$_ and ord($_) >= 32 } );
my $l=@vals - $spacing;



for ^$l -> $ii {
    
    my @v=[47] x 2;

    
    @v[0]=@vals[ $ii ];
    @v[1]=@vals[ $ii+$spacing ];

    @v=sort(@v);

    my $cross = ord( @v[0] ) +^ ord( @v[1] );

    %h{	"" ~ $cross ~ ',' ~ @v[0] ~ ',' ~ @v[1]    }++;

}

my %g = %h.invert;

for %g.keys.sort( -* ) -> $k {
    #in sorted(h.items(), key= lambda $ii : str(x[0]).split(",")[0], reverse=True):  #most popular first!!
    #next if $v lt 5;
    my $v=%g{$k};
    say("key=--$k  val=$v");

}

=finish



path = 'p059_cipher.txt'

with open(path, 'r') as content_file:
    content = content_file.read()

vals=list(map(int,content.split(',') ))

#everything xor with one 3 in front of it   xyza   would give x xor a
for ii in range(1,50):
    print(  vals[ ii % 51] ^ vals[ ii % 51 + 3 ]   )


