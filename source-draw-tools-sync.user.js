// ==UserScript==
// @id             iitc-plugin-draw-tools-sync@viljoviitanen
// @name           IITC plugin: draw tools sync
// @category       Layer
// @version        XXVERSIONXX
// @namespace      https://github.com/viljoviitanen/drawtools-sync-plugin
// @downloadURL    XXURLXX
// @description    Allows syncing draw tools drawings to a server. Server source is available at https://github.com/viljoviitanen/drawtools-sync
// @include        https://www.ingress.com/intel*
// @include        http://www.ingress.com/intel*
// @match          https://www.ingress.com/intel*
// @match          http://www.ingress.com/intel*
// @grant          none
// ==/UserScript==

// Released under the "ISC" License: https://github.com/viljoviitanen/drawtools-sync-plugin/blob/master/LICENSE

function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};


// PLUGIN START ////////////////////////////////////////////////////////


// use own namespace for plugin
window.plugin.drawToolsSync = function() {};

//XXX TODO make server configurable
window.SYNCSERVER="XXSERVERXX"

window.plugin.drawToolsSync.syncOpt = function() {
      dialog({
        html: '<button onclick="window.open(\''+SYNCSERVER+'/login\')">Login at Sync Server</button><button onclick="window.plugin.drawToolsSync.SyncInit()">Save Drawing</button><button onclick="window.plugin.drawToolsSync.SyncList()">Get List of Drawings</button><button onclick="window.plugin.drawToolsSync.SyncLoadWithKey()">Get with Share Key</button><div id=drawtoolssync_list></div><div id=drawtoolssync_item></div>',
        width: 600,
        dialogClass: 'ui-dialog-drawtoolsSet-copy',
        title: 'Draw Tools Sync'
        });
}

window.plugin.drawToolsSync.SyncDel = function () {
  name=$('#drawtoolssync_name').val()
  key=localStorage['plugin-draw-tools-synckey']
  if (!confirm("Really delete " + window.plugin.drawToolsSync.escapehtml(name) + "?")) return
  $.ajax({
    dataType: "jsonp",
    url: SYNCSERVER+'/delete',
    data: {'key':key},
    xhrFields: { withCredentials: true },
    crossDomain: true,
    success: function(data) {
    if(data.error) {
       alert("Could not delete: "+data.error)
       return
    }
    if(!data.key) {
       alert("Could not delete")
       return
    }

    alert("delete successful")
    //reload
    delete localStorage['plugin-draw-tools-synckey']
    delete localStorage['plugin-draw-tools-syncname']
    window.plugin.drawToolsSync.SyncList()
    }
  })
}

window.plugin.drawToolsSync.SyncSave = function() {
  key=localStorage['plugin-draw-tools-synckey']
  name=$('#drawtoolssync_name').val()
  window.plugin.drawTools.save();
  content=localStorage['plugin-draw-tools-layer']
  shared=$('#drawtoolssync_shared').val()
  //base64-encoded zlib-deflated data.
  c=btoa(zpipe.deflate(JSON.stringify({'key':key,'name':name,'content':content,'shared':shared})))
  //jsonp calls are GET calls and the url must not be greater than about 2k bytes.
  //1860 = max length for c parameter from empirical tests.
  //68 = compressed size of a new empty drawing, empty name and no sharing key
  //note: with jsonp there is no error message if there is a server error
  //like appengine "414 url too long"
  if(c.length > 1860) {
    alert("-----------------------------------------------------------\n"+
          "Too much data in the drawing, saving will probably fail! Approximate drawing size: "+
          Math.floor(100*(c.length-68)/1792)+"%\n"+
          "-----------------------------------------------------------")
  }
  $.ajax({
    dataType: "jsonp",
    url: SYNCSERVER+'/sync',
    data: {'c':c},
    xhrFields: { withCredentials: true },
    crossDomain: true,
    success: function(data) {
    if(data.error) {
       alert("Could not sync data: "+data.error)
       return
    }
    if(!data.content) {
       alert("Could not sync data.")
       return
    }
    if(!data.key) {
       alert("Server did not return the key. What?!")
       return
    }

    // XXX in distant future, check that server returned the same content
    // we put in. if not, someone else modified it betweem saves.
    // provide some options for resolving the conflict.
    alert("Save successful. Approximate drawing size: "+Math.floor(100*(c.length-68)/1792)+"%")

    // save the key received from the server, in case this was a new drawing
    localStorage['plugin-draw-tools-synckey'] = data.key
    }
  })
}

window.plugin.drawToolsSync.SyncLoad = function(key) {
  $.ajax({
    dataType: "jsonp",
    url: SYNCSERVER+'/load',
    data: {'key':key },
    xhrFields: { withCredentials: true },
    crossDomain: true,
    success: function(data) {
      if(data.error) {
         alert("Could not load data: "+data.error)
         return
      }
      if(!data.content) {
         alert("Could not load data.")
         return
      }
      if (!confirm("Merge loaded drawing (ok) or overwrite (cancel)?")) {
          delete localStorage['plugin-draw-tools-layer'];
          window.plugin.drawTools.drawnItems.clearLayers();
          window.plugin.drawTools.load();
      }
      if (!data.name) data.name="(unnamed)"
    
      $('#drawtoolssync_item').html(window.plugin.drawToolsSync.escapehtml(data.name)+' loaded succesfully<br>Shared with: <input id=drawtoolssync_shared><br>')
      $('#drawtoolssync_shared').val(JSON.stringify(data.shared))
      localStorage['plugin-draw-tools-syncshared']=JSON.stringify(data.shared)
      localStorage['plugin-draw-tools-syncname']=data.name
      localStorage['plugin-draw-tools-syncsharekey']=data.sharekey
      localStorage['plugin-draw-tools-synckey']=key
      window.plugin.drawTools.import(data.content)
    }
  })
}

window.plugin.drawToolsSync.SyncLoadWithKey = function() {
  var sharekey = prompt('Enter Share Key.', '');
  if (sharekey == null || sharekey=='') return
  $.ajax({
    dataType: "jsonp",
    url: SYNCSERVER+'/loadwithkey',
    data: {'sharekey':sharekey },
    xhrFields: { withCredentials: true },
    crossDomain: true,
    success: function(data) {
      if(data.error) {
         alert("Could not load data: "+data.error)
         return
      }
      if(!data.content) {
         alert("Could not load data.")
         return
      }
      if (!confirm("Merge loaded drawing (ok) or overwrite (cancel)?")) {
        delete localStorage['plugin-draw-tools-layer'];
        window.plugin.drawTools.drawnItems.clearLayers();
        window.plugin.drawTools.load();
      }
      if (!data.name) data.name="(unnamed)"
  
      $('#drawtoolssync_item').html(window.plugin.drawToolsSync.escapehtml(data.name)+' loaded succesfully<br>Shared with: <input id=drawtoolssync_shared><br>')
      $('#drawtoolssync_shared').val(JSON.stringify(data.shared))
      localStorage['plugin-draw-tools-syncshared']=JSON.stringify(data.shared)
      localStorage['plugin-draw-tools-syncname']=data.name
      localStorage['plugin-draw-tools-syncsharekey']=data.sharekey
      localStorage['plugin-draw-tools-synckey']=key
      window.plugin.drawTools.import(data.content)
    }
  })
}

window.plugin.drawToolsSync.SyncList = function() {
  $.ajax({
    dataType: "jsonp",
    url: SYNCSERVER+'/list',
    xhrFields: { withCredentials: true },
    crossDomain: true,
    success: function(data) {
    if(data.error) {
       alert("Could not load data: "+data.error)
       return
    }
    if(!data.own) {
       alert("Could not load data.")
       return
    }
    own=data.own
    shared=data.shared
    s="My drawings:<br>"
    if (own.length == 0) {
      s+='(none)'
    }
    for (i = 0; i < own.length; i++) {
      name=own[i].name
      if (!name) name="(unnamed)"
      s+='<a href="javascript:window.plugin.drawToolsSync.SyncLoad('+own[i].key+')">' + name + '</a><br>'
    }
    s+="Shared drawings:<br>"
    if (shared.length == 0) {
      s+='(none)'
    }
    for (i = 0; i < shared.length; i++) {
      name=shared[i].name
      if (!name) name="(unnamed)"
      s+='<a href="javascript:window.plugin.drawToolsSync.SyncLoad('+shared[i].key+')">' + name + '</a><br>'
    }
    $('#drawtoolssync_list').html(s)
    $('#drawtoolssync_item').html('')
    } 
  })
}

window.plugin.drawToolsSync.SyncInit = function() {
    shared=localStorage['plugin-draw-tools-syncshared']
    sharekey=localStorage['plugin-draw-tools-syncsharekey']
    name=localStorage['plugin-draw-tools-syncname']
    key=localStorage['plugin-draw-tools-synckey']
    html=''
    if (key==undefined) {
      key='new'
      localStorage['plugin-draw-tools-synckey']=key
      shared='[]'
      sharekey=''
      date=new Date()
      name='Unnamed drawing at '+date.toLocaleString()
      localStorage['plugin-draw-tools-syncname']=name
    }
    else {
      html+='<button onclick="delete localStorage[\'plugin-draw-tools-synckey\']; window.plugin.drawToolsSync.SyncInit()">Create New Drawing</button><br>'
    }
    html+='Name: <input size=50 id=drawtoolssync_name value="'+window.plugin.drawToolsSync.escapehtml(name)+'"><br>Shared with: <input id=drawtoolssync_shared><br>Share Key: <input id=drawtoolssync_sharekey size=32 readonly><br><br><button onclick="window.plugin.drawToolsSync.SyncSave()">Save</button><button onclick="window.plugin.drawToolsSync.SyncDel()">Delete</button> <p> Note: shared emails format is a json array: <tt>["email.address@example.com","another.address@example.com"]</tt>'
    $('#drawtoolssync_item').html(html)
    $('#drawtoolssync_shared').val(shared)
    $('#drawtoolssync_sharekey').val(sharekey)
}

window.plugin.drawToolsSync.escapehtml = function(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}




window.plugin.drawToolsSync.boot = function() {
  //add options menu
  $('#toolbox').append('<a onclick="window.plugin.drawToolsSync.syncOpt();return false;">DrawTools Sync</a>');
  //XXX TODO check that drawtools are of compatible version (new enough!)

}


var setup = window.plugin.drawToolsSync.boot

// begin zpipe. This part is licenced differently than the rest of the file.
// end zpipe

// PLUGIN END //////////////////////////////////////////////////////////


setup.info = plugin_info; //add the script info data to the function as a property
if(!window.bootPlugins) window.bootPlugins = [];
window.bootPlugins.push(setup);
// if IITC has already booted, immediately run the 'setup' function
if(window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
(document.body || document.head || document.documentElement).appendChild(script);


