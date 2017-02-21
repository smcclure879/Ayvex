while(<DATA>) {
  next if /^Author/;
  next if /^Date/;
  next if /^\s*$/;
  next if /^\s+modif/;
  next if /^\s+new\ file/;
  print $_;
}
exit;

__END__
commit b017228bedd0912eb82d26abbf99ad4daecde953
Author: ayvex llc <smcclure897@yahoo.com>
Date:   Mon Jan 30 12:25:31 2017 -0800

    safety checkin.  gotta go bisect to find cause of lost localVideo
    	modified:   comm.js
    	modified:   conference.js
    	modified:   index.js

commit 8a9a66c75fa639c4af5289030625245383b5d945
Author: ayvex llc <smcclure897@yahoo.com>
Date:   Sat Jan 28 21:58:08 2017 -0800

    goes a bit farther thru conf connection exchange
    	modified:   conference.js
    	modified:   index.js

commit 31f03deeb30eb28755afdc1d371160697bfba273
Author: ayvex llc <smcclure897@yahoo.com>
Date:   Sat Jan 28 17:47:36 2017 -0800

    user movement now visible to other user
    	modified:   comm.js
    	modified:   index.html
    	modified:   index.js
    	new file:   util.js

commit 045223f1daa1b72f11c11cdad849dad267296bfb
Author: ayvex llc <smcclure897@yahoo.com>
Date:   Fri Jan 27 11:38:13 2017 -0800

    need to switch over to working on a real server. got as far as I can toward conferencing with a fake user.
    
    	modified:   comm.js
    	modified:   conference.js
    	modified:   gamer.js
    	modified:   index.html
    	modified:   index.js

commit c80099adce257c38a9e06091f87243e206879cfc
Author: ayvex llc <smcclure897@yahoo.com>
Date:   Thu Jan 26 12:40:29 2017 -0800

    selection sorta works, and doesn't auto-videoconf-with-self
    
    	modified:   comm.js
    	modified:   conference.js
    	new file:   gamer.js
    	modified:   index-early.js
    	modified:   index.html
    	modified:   index.js
    	new file:   scottPlane.js

commit a69121e199b7b73111b55be59cfd2f69df860e0c
Author: ayvex llc <smcclure897@yahoo.com>
Date:   Thu Jan 26 12:34:10 2017 -0800

    just a missing linefeed
    	modified:   ../demoUtils.js

commit c7c3c8d7bb67ceba9a9cf3948292ed70d9b10f40
Author: ayvex llc <smcclure897@yahoo.com>
Date:   Sat Jan 21 14:16:24 2017 -0800

    put the selection indicator back to a ring.
    
    	modified:   index.html

commit 8a4e52a47effc8db3ef880e2cae41b6c8e4d5717
Author: ayvex llc <smcclure897@yahoo.com>
Date:   Sat Jan 21 01:59:19 2017 -0800

    gaze selection sorta works, first try!
    
    	modified:   index.html
    	modified:   index.js

commit a55782a502e09079f144ab6bd870ec51ea08ad3c
Author: ayvex llc <smcclure897@yahoo.com>
Date:   Sat Jan 21 01:10:36 2017 -0800

    works for local video, now on to making remote work
    	new file:   adapter.js
    	modified:   aframe.js
    	new file:   comm.js
    	new file:   conference.js
    	new file:   index-early.js
    	modified:   index.html
    	new file:   index.js

