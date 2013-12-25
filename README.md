Ayvex
=====

short name I'll use for the project

"Ayvex Industries"  company name

have a cartoon character reminiscent of a Bond villain as the "mascot"?


the goal is to enable the level of editing you get in minecraft, but with meshes not blocks
the editing should work like "magic" or "nanotech", or "earthbending" or whathave you.
render distances shall be infinite.
there shall be an octree looking thingy (or voronoi cells in space formulation) ,
which shall have the forward propagation of compressed-information views. (snow globes)

platform: 3gl in browser?  rejected not enough flexibility and power
  so java with openGL and LWJGL.  (working good so far)

something like erlang messaging or ajax to get the meshes/norms/color/depthmap  flowing one way, and users actionAttempts going the other way.  (priority queues each way to optimize the connection).  This is a held-open TCP connection at the base.

would like the client to be capable of also being the server.  not sure what that means yet but it should be decentralized yet consistent, and the world host should get last say about "what really happened"  (this is a deadlock prevention rule if you look at it in a certain way).

must be available: explicit non-rendering... see *where* you are not seeing. see where you are getting "tricked" with lazy rendering!

sample-sample-sample (and presample) to keep framerate up.  trust random and trust consistent hashing.















