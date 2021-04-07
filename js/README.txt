This directory contains stored procedures for CosmosDB that implement
Replicache's push() and pull() operation.

It is *required* for correctness to implement push() as a stored proc
so that the `lastMutationID` and mutations happen atomically. Pull
could be implemented in application code, but since push is the more
complex of the two, we have implemented both as stored procs for
consistency.

Sadly, CosmosDB's JS environment is quite impoverished and there are
several caveats to be aware of:

* The core API for the JS that runs inside stored procs (which
  CosmosDB confusingly calls "server-side JavaScript") is not Promise-
  based, which makes it very difficult to work with. We have wrapped it
  in cosmos.js. It looks like there are also some open source projects
  that take this idea and run with it, but require compilation.
* Stored procedures don't support es6 import/export, or even cjs
  require(). The only way to share code is by concatenation. Lol. See
  db.js registerStoredProcedures().
* The main entry point function for a stored procedure is assumed to be
  the first one in source order. WTF I don't even... So make sure you
  keep that in mind when writing stored procs.

We recommend that customers who want to use CosmosDB invest some effort
into getting a bundling phase setup so that full modern JS/TS features
can be used.
