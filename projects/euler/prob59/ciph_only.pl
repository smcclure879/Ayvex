



my $path = 'p059_cipher.txt';
my $fhr = open $path, :r;
my $content = $fhr.slurp-rest();

$fhr.close();


my @vals = $content.split(',');


my %h=();
my $ii=0;
for @vals -> $v {

    %h{$ii%3}{$v}++;

    $ii++;
}


say "----";say "----";
say %h{1}.sort({.value+0}).reverse.join("\n");
say "----";
say %h{2}.sort({.value+0}).reverse.join("\n");
say "----";


say %h{0}.sort({.value+0}).reverse.list.map(({0+$_.key +^ ord('g')})).map(&chr).join('');
say %h{1}.sort({.value+0}).reverse.list.map(({0+$_.key +^ ord('o')})).map(&chr).join('');
say %h{2}.sort({.value+0}).reverse.list.map(({0+$_.key +^ ord('d')})).map(&chr).join('');

$ii=0;
my $tot=0;
for @vals -> $v {

    my $c = 'god'.comb()[$ii % 3].ord +^ $v;
    $tot += $c;
    print(chr($c));
    $ii++;
}
say $tot;

=finish

say ord('e');
for ('a'..'z').map(&ord) -> $x {
    say chr($x),%h{2}.sort({.value+0}).reverse.list.map(({0+$_.key +^ $x})).map(&chr).join('');
    #say %h{2}.sort({.value+0}).reverse.list.map(({0+$_.key +^ $x})).map(&chr).join('');
}


with open(path, 'r') as content_file:
    content = content_file.read()

vals=list(map(int,content.split(',') ))

#everything xor with one 3 in front of it   xyza   would give x xor a
for ii in range(1,50):
    print(  vals[ ii % 51] ^ vals[ ii % 51 + 3 ]   )


