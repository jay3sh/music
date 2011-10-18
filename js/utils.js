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
    return 'http://www.amazon.com/s?ie=UTF8&x=0&ref_=nb_sb_noss&y=0&field-keywords='+encodeURI(muFile.artist)+'&url=search-alias%3Ddigital-music&_encoding=UTF8&tag=myfreq-20&linkCode=ur2&camp=1789&creative=390957'
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
          console.log('Adding to cache',hash,path);
          app.Cache.add(hash, app.liveFiles[path]);
          callback(window.webkitURL.createObjectURL(app.liveFiles[path]));
        } else {
          callback(null);
        }
      }
    });
  };

  utils.searchImage = function (query, callback) {
    function onComplete() {
      if (imageSearch.results && imageSearch.results.length > 0) {
        var results = imageSearch.results;
        callback(results[0].tbUrl);
      }
    }

    var imageSearch = new google.search.ImageSearch();
    imageSearch.setSearchCompleteCallback(this, onComplete, null);
    imageSearch.execute(query);
  };

  utils.getPrettySongName = function (muFile) {
    var name = muFile.name.length > muFile.title.length ?
      muFile.name : muFile.title;
    return name.replace(/\.\w+$/,'');
  };

  utils.getSongEntryHTML = function (muFile, asSearchResult) { 
    var name = utils.getPrettySongName(muFile);
    var album = muFile.album;
    var artist = muFile.artist;
    var songNameWidth = ($('.entry_list').width()/2.2).toFixed();
    var albumNameWidth = songNameWidth/2;
    var artistNameWidth = albumNameWidth-40;

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
        '<div class="entry_action">+</div>' :
        '<div class="remove_action">-</div>'+
        '<div class="entry_action" style="font-size:14px;">&#9654;</div>'); 
    entryHTML
      .hover(
        function () { $(this).addClass('focused_entry'); },
        function () { $(this).removeClass('focused_entry'); }
      )
      .find('.entry_action').data('muFile',muFile);

    entryHTML
      .bind('dragstart', function (e) {
        if($(this).parent().attr('id') == 'playlist'){
          app.Playlist.dragSelection = $(this);
          app.Playlist.dragSelectionData = 
            $(this).find('.entry_action').data('muFile');
          e.dataTransfer.setData('text/plain', $(this).html());
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.dropEffect = 'move';
          $(this).css({ 'opacity' : '0.7' });
        } else { return; }
      })
      .bind('dragover', function (e) {
        if(e.preventDefault) { e.preventDefault(); }
        return false;
      })
      .bind('dragenter', function (e) {
        if(e.preventDefault) { e.preventDefault(); }
        return false;
      })
      .bind('drop', function (e) {
        var tempHTML = $(this).html();
        var tempData = $(this).find('.entry_action').data('muFile');

        if (e.preventDefault) e.preventDefault();

        $(this).html(app.Playlist.dragSelection.html());
        app.Playlist.dragSelection.html(tempHTML)
          .removeClass('focused_entry');
        $(this).find('.entry_action')
          .data('muFile', app.Playlist.dragSelectionData);
        app.Playlist.dragSelection.find('.entry_action')
          .data('muFile', tempData);

        return false;
      })
      .bind('dragend', function () {
        $(this).css({ 'opacity' : '1.0' });
      });

    return entryHTML;
  };

  app.utils = utils;
})(jQuery);
