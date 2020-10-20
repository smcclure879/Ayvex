use strict;

sub unquote {
    my $x=shift;
    $x =~ s/^\"//go;
    $x =~ s/\"$//go;
    return $x;
}

# my %cities = ();

# open my $fhrz, "<", "zone.csv" or die "cannot open\n";
# while(<$fhrz>) {
#     my @fields = map  { unquote($_) } (split ",");
#     my $zone = $fields[0];
#     my @fields = split "/", $fields[2];
#     my $city = $fields[-1];
#     print $city;
#     my %o=();
#     $o{zone}=$zone;
#     $cities{$city} = \%o;
#     print $city,%o if $city =~ /tokyo/i;
#     #die "stop" if $.>10;
# }
# close $fhrz;
# print "zones loaded\n";
#print (grep /tokyo/i , keys(%cities));


open my $fhrc, "<", "worldcities.csv"   or die "cannot open\n";

while(<$fhrc>){
    if ($. <= 1) {

	#print "0 0 0 0 SP AQ 0\n";
	next;

    }
    my @fields = map { unquote($_) } ( split "," ) ;
    #@fields = map unquote, @fields;
    #print $_,"   ";
    my $city = $fields[0];
    my $lat=$fields[2];
    my $long=$fields[3];
    my $country=$fields[4];
    my $pop = $fields[9];

    #bugbug not as sensitive to exponent as I had thought. 
    #scaling factor for my convenience only
    my $xlat = (($lat + 200.0)**3)/1_000_000;
    my $xlong = 360.0 + 90.0 - $long;
	
    print "$xlong $xlat $long $lat $city $country $pop\n";
    #die "stopped\n" if $.>1000;
    #die "stopped\n" if $city eq 'Seattle';
}


close $fhrc;
