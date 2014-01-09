Ayvex
=====


need to start with a 3d engine about this capable...
http://www.youtube.com/watch?v=HOfll06X16c

in eventual game, users should be able to BUILD stuff like this for themselves, IN GAME.

starting project with more immediate business application: Build a good 3d render engine 
in-browser, so we can get the math etc right.  Use minecraft map data as intial data set.
Move to a business set soon.  move to higher dimensions soon (fork project when ready).



the goal in the eventual game is to enable the level of editing you get in minecraft, but with meshes not blocks
(for that we'll use standalone java client and openGL (the way minecraft does, but possibly a newer openGL version)

the editing should work like "magic" or "nanotech", or "earthbending" or whathave you. (not
render distances shall be infinite
there shall be an octree looking thingy (or voronoi cells in space formulation) ,
which shall have the forward propagation of compressed-information views. (snow globes)

platform: 3gl in browser?  rejected not enough flexibility and power
  so java with openGL and LWJGL.  (working good so far)

something like erlang messaging or ajax to get the meshes/norms/color/depthmap  flowing one way, and users actionAttempts going the other way.  (priority queues each way to optimize the connection).  This is a held-open TCP connection at the base.

would like the client to be capable of also being the server.  not sure what that means yet but it should be decentralized yet consistent, and the world host should get last say about "what really happened"  (this is a deadlock prevention rule if you look at it in a certain way).

must be available: explicit non-rendering... see *where* you are not seeing. see where you are getting "tricked" with lazy rendering!

sample-sample-sample (and presample) to keep framerate up.  trust random and trust consistent hashing.















