
(function ($){
  var app = $.app;
  
  function utils(){};

  utils.getYoutubeSearchURL = function (muFile) {
    var name = utils.getPrettySongName(muFile);
    return 'http://www.youtube.com/results?search_query='+
      name.split(/\s+/).join('+')+'+'+
      muFile.artist.split(/\s+/).join('+');
  };

  utils.getLyricsSearchURL = function (muFile) {
    var name = utils.getPrettySongName(muFile);
    return 'http://www.google.com/search?q='+
      name.split(/\s+/).join('+')+'+'+
      muFile.artist.split(/\s+/).join('+')+'+lyrics';
  };

  utils.getArtistWikipediaURL = function (muFile) {
    return 'http://en.wikipedia.org/w/index.php?search='+
            muFile.artist.split(/\s+/).join('+');
  };

  utils.getAmazonLink = function (muFile) {
    return 'http://www.amazon.com/s?ie=UTF8&x=0&ref_=nb_sb_noss&y=0&field-keywords='+encodeURI(muFile.artist)+'&url=search-alias%3Ddigital-music&_encoding=UTF8&tag=mu-sic-more-20&linkCode=ur2&camp=1789&creative=390957';
  };

  utils.getMetroLyricsURL = function (muFile){
    var name = muFile.title.split(' ').join('-');
    var artist = muFile.artist.split(' ').join('-');
    
    return ('http://www.metrolyrics.com/'+name+'-lyrics-'+artist+'.html');
  };

  utils.getPlayableURL = function (path, callback) {
    var hash = $.MD5(path);
    app.Cache.getPlayableURL(hash, function (url) {
      if(url) {
        console.log(url);
        callback(url);
      } else {
        if(app.liveFiles && app.liveFiles[path]) {
          app.Cache.add(hash, app.liveFiles[path]);
          callback(window.webkitURL.createObjectURL(app.liveFiles[path]));
        } else {
          callback(null);
        }
      }
    });
  };

  utils.searchImage = function (album, artist, callback) {
    function onComplete(artist, album) {
      if (imageSearch.results && imageSearch.results.length > 0) {
        var results = imageSearch.results;
        callback(results[0].tbUrl, artist, album);
      }
    }

    var imageSearch = new google.search.ImageSearch();
    imageSearch.setSearchCompleteCallback(this, onComplete, [artist, album]);
    imageSearch.execute(album + ' ' + artist);
  };

  utils.getPrettySongName = function (muFile) {
    if(muFile.title.trim().length > 0) {
      return muFile.title.trim();
    } else {
      return muFile.name.trim().replace(/\.\w+$/,'');
    }
  };

  utils.getSongEntryHTML = function (muFile, asSearchResult) { 
    var name = utils.getPrettySongName(muFile);
    var album = muFile.album;
    var artist = muFile.artist;
    var songNameWidth = ($('#playlist').width()/2.2).toFixed();
    var albumNameWidth = songNameWidth/2;
    var artistNameWidth = albumNameWidth-60;

    var entryHTML = $('<div class="entry" draggable="true"></div>');
    var songName = $('<div class="song_name"></div>')
      .attr('title', name)
      .html(name)
      .width(songNameWidth);
    var albumName = $('<div class="album_name"></div>')
      .attr('title', album)
      .html(album)
      .width(albumNameWidth);
    var artistName = $('<div class="artist_name"></div>')
      .attr('title', artist)
      .html(artist)
      .width(artistNameWidth);
    entryHTML.append(songName)
      .append(albumName)
      .append(artistName)
      .append(asSearchResult ?
        '<div class="entry_action">+</div>'+
        '<div class="play_action" style="font-size:11px;">&#9654;</div>': 
        '<div class="remove_action">-</div>'+
        '<div class="entry_action" style="font-size:12px;">&#9654;</div>'); 
    entryHTML
      .hover(
        function () { $(this).addClass('focused_entry'); },
        function () { $(this).removeClass('focused_entry'); }
      );
    entryHTML.find('.entry_action').data('muFile',muFile);
    entryHTML.find('.album_name').data('muFile',muFile);
    entryHTML.find('.artist_name').data('muFile',muFile);

    function dragStart(e, curr){ 
      if($(curr).parent().attr('id') == 'playlist'){
        app.Playlist.dragSelection = $(curr);
        app.Playlist.dragSelectionData = 
          $(curr).find('.entry_action').data('muFile');
        e.dataTransfer.setData('text/plain', $(curr).html());
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.dropEffect = 'move';
        $(curr).css({ 'opacity' : '0.7' });
      } else { return; }
    }

    function dragOver(e, curr){ 
      if(e.preventDefault) { e.preventDefault(); }
      $(curr).css('border-bottom', '1px dotted white');
      return false;
    }
    function dragLeave(e, curr){ 
      if(e.preventDefault) { e.preventDefault(); }
      $(curr).css('border', 'none');
      return false;
    }

    function drop(e, curr){ 
      var tempHTML = $(curr).html();
      var tempData = $(curr).find('.entry_action').data('muFile');

      if (e.preventDefault) e.preventDefault();

      $(curr).after(app.Playlist.dragSelection);
      app.Playlist.dragSelection.find('.entry_action')
        .data('muFile', app.Playlist.dragSelectionData);

      app.Playlist.attachEntryControls($(curr).next());
      $(curr).css('border', 'none');
      
      return false;
    }

    function dragEnd(e, curr){
      $(curr).css({ 'opacity' : '1.0' });
    }

    entryHTML
      .bind('dragstart', function (e) { dragStart(e, this); })
      .bind('dragover', function (e) { dragOver(e, this); })
      .bind('dragleave', function (e) { dragLeave(e, this); })
      .bind('drop', function (e) { drop(e, this); })
      .bind('dragend', function (e) { dragEnd(e, this); });

    return entryHTML;
  };

  utils.checkSupport = function () {
    var support = {}
    var a = document.createElement('audio');
    support.audioOk = !!(a && a.canPlayType)
    support.mpegOk = !!(a.canPlayType('audio/mpeg').replace(/no/, ''));
    support.m4aOk = !!(a.canPlayType('audio/x-m4a').replace(/no/, ''));
    support.oggOk = 
      !!(a.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, ''));

    var f = document.createElement('input');
    f.type = 'file';

    support.multipleFilesOk = ('multiple' in f);
    support.dirSelectionOk = ('webkitdirectory' in f);
    
    support.objURLOk =
      window.createObjectURL ||
      window.createBlobURL ||
      (window.URL && window.URL.createObjectURL) ||
      (window.webkitURL && window.webkitURL.createObjectURL);

    utils.support = support;

    // If mandatory support is missing show error
    if(!support.audioOk) {
      $.app.Skin.showNotification(
        'Missing support for audio element. '+
        '&mu;sic won\'t work');
      return;
    }
    if(!support.multipleFilesOk) {
      $.app.Skin.showNotification(
        'Missing support for selecting multiple files. '+
        '&mu;sic won\'t work');
      return;
    }
    if(!support.dirSelectionOk) {
      $.app.Skin.showNotification(
        'Missing support for directory selection. '+
        '&mu;sic won\'t work');
      return;
    }
    if(!support.objURLOk) {
      $.app.Skin.showNotification(
        'Missing support for creating Object URLs. '+
        '&mu;sic won\'t work');
      return;
    }
  };

  utils.compat = {
    getPath : function (file) {
      if(typeof file.webkitRelativePath == 'string') {
        return file.webkitRelativePath;
      } else if(typeof file.mozFullPath == 'string') {
        return file.mozFullPath;
      } else {
        throw new Exception('Path not defined');
      }
    },

    getName : function (file) {
      if(typeof file.name == 'string') {
        return file.name;
      } else if(typeof file.fileName == 'string') {
        return file.fileName;
      } else {
        throw new Exception('Name not defined');
      }
    },

    getSize : function (file) {
      if(typeof file.size == 'number') {
        return file.size;
      } else if(typeof file.fileSize == 'number') {
        return file.fileSize;
      } else {
        throw new Exception('File size not defined');
      }
    },

    getObjectURL : function (file) {
      if(window.createObjectURL) {
        return window.createObjectURL(file);
      } else if(window.createBlobURL) {
        return window.createBlobURL(file);
      } else if(window.URL && window.URL.createObjectURL) {
        return window.URL.createObjectURL(file);
      } else if(window.webkitURL && window.webkitURL.createObjectURL) {
        return window.webkitURL.createObjectURL(file);
      } else {
        throw new Exception('Missing support for Object URL creation');
      }
    },

    requestAnimationFrame : function (callback){
      if(window.requestAnimationFrame){
        return window.requestAnimationFrame(callback)
      } else if(window.webkitRequestAnimationFrame) { 
        return window.webkitRequestAnimationFrame(callback);
      } else if(window.mozRequestAnimationFrame) { 
        window.mozRequestAnimationFrame(callback); 
      } else if(window.oRequestAnimationFrame) { 
        window.oRequestAnimationFrame(callback); 
      } else if(window.msRequestAnimationFrame) {
        window.msRequestAnimationFrame(callback); 
      } else { 
        window.setTimeout(callback, 1000 / 60);
      }
    },

    fileSlice : function (file, start, length) {
      if(file.mozSlice) return file.mozSlice(start, start + length);
      if(file.webkitSlice) return file.webkitSlice(start, start + length);
      if(file.slice) return file.slice(start, length);
      throw new Exception('Missing support for fileSlice');
    }
  };

  app.utils = utils;
})(jQuery);
