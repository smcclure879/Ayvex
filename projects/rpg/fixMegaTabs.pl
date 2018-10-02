use strict;
my $file = $ARGV[0];
open(my $fh, '<:encoding(UTF-8)', $file)
    or die "Could not open file '$file' $!";
while (my $row = <$fh>) {
    chomp $row;
    $row =~ s/ {4,}/\t/go;
    $row =~ s/\t{3,}/\t\t/go;
    print "$row\n";

}
