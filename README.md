Development has been stopped

Plugin development has been stopped in 7/2014, sync server has been removed and installable plugin removed.

Old readme is below.

---

drawtools-sync-plugin

An IITC plugin to sync drawtools plugin drawings to a server

Installable plugin is available at

https://viljoviitanen.nfshost.com/iitc/draw-tools-sync.user.js

The plugin should work at least on Firefox and Greasemonkey, that's what the author uses.

Quick instructions:

- open "DrawTools Sync" from right hand side blue box
- before trying anything else "Login at Sync Server".
- the sharing syntax is lousy (a raw json/python array of email addresses). Sorry about that :)
- but for easier sharing, use the "sharing key" functionality. When a sharing key is used, the email address that used the key is added to the "shared" list automatically.

The UI and the code could still use some polishing.

For now the server is hardcoded in the plugin, but you could easily run your own (provided you have some experience with google appengine) and change it from the plugin code.
I would advise you not to store anything sensitive at the server unless you trust the owner of the server, as he/she can see all the data in the server, it's stored plaintext.

The server source is available at 

https://github.com/viljoviitanen/drawtools-sync

And a public server run by the author is available at

https://drawtools-sync.appspot.com

