
(function ($){
  var app = $.app;
  var IMG_WIDTH = 100;
  var IMG_HEIGHT = 100;

  function mainColumn() {}
  
  function startProgress() {
    $('#progressbar', '#search_column').show();
    $('input[name=search]').attr('disabled', 'disabled');
  }

  function makeProgress(total, progress) {
    var degree = (progress/total)*360;
    app.progress_ctx.beginPath();  
    app.progress_ctx.clearRect(
      0,0,$.app.progress_canvas.width,$.app.progress_canvas.height);

    app.progress_ctx.strokeStyle = 'rgba(190, 190, 190, 0.4)';
    app.progress_ctx.lineWidth = 1;
    app.progress_ctx.arc(75,75,50,Math.PI*(270/180),Math.PI*(360+270)/180);
    app.progress_ctx.stroke();
    app.progress_ctx.closePath();

    app.progress_ctx.beginPath();  
    app.progress_ctx.strokeStyle = 'rgba(190, 190, 190, 0.4)';
    app.progress_ctx.lineWidth = 1;
    app.progress_ctx.arc(75,75,70,Math.PI*(270/180),Math.PI*(360+270)/180);
    app.progress_ctx.stroke();
    app.progress_ctx.closePath();

    app.progress_ctx.beginPath();  
    app.progress_ctx.strokeStyle = 'rgba(210, 210, 210, 0.9)';
    app.progress_ctx.lineWidth = 18;
    app.progress_ctx.arc(75,75,60,Math.PI*(270/180),Math.PI*(degree+270)/180);

    app.progress_ctx.shadowOffsetX = 0;
    app.progress_ctx.shadowOffsetY = 0;
    app.progress_ctx.shadowBlur = 5;
    app.progress_ctx.shadowColor = 'rgba(160,160,160,0.7)';

    app.progress_ctx.stroke();

    app.progress_ctx.closePath();
  }
  
  function completeProgress() {
    $('#search_column #progressbar').fadeOut();
    $('input[name=search]').attr('disabled', '');
  }

  function showSettings() {
    $('#shelf', '#search_column').hide(); 
    $('#ytshelf', '#search_column').hide(); 
    $('#search_column #searchbar').css('visibility', 'hidden');
    $('#search_results', '#search_column').hide();
    $('#settings', '#search_column').show();
  }

  function showSearchResults() {
    $('#search_column #shelf').hide();
    $('#search_column #settings').hide();
    $('#search_column #searchbar').css('visibility', 'visible');
    $('#search_column #search_results').empty();
    $('#search_column #search_results').show();
    $('#search_column #ytshelf').hide();
  }

  function showShelf() {
    var shelf = $('#search_column #shelf').show();
    var scTop = shelf.data('scrollTop');
    if(scTop) {
      shelf.scrollTop(scTop);
      shelf.removeData('scrollTop');
    }
    $('#search_column #searchbar').css('visibility', 'visible');
    $('#search_column #search_results').hide();
    $('#search_column #settings').hide();
    $('#search_column #ytshelf').hide();
  }
  
  function populateShelf(url, artist, album){ 
    var shelf = $('#search_column #shelf');
    var artworkNum = Math.floor(shelf.width()/IMG_WIDTH);
    var margin = 
      Math.floor((shelf.width()-(artworkNum*IMG_WIDTH))/(artworkNum*2))-1;
    if(margin <= 2){
      IMG_WIDTH = 95;
      IMG_HEIGHT = 95;
      margin = Math.floor((shelf.width()-(artworkNum*IMG_WIDTH))/(artworkNum*2))-1;
    }
    var artwork = $('<img></img>')
      .attr('src', url)
      .attr('title', album+'\n'+artist)
      .data('meta', { album : album, artist : artist })
      .width(IMG_WIDTH)
      .height(IMG_HEIGHT)
      .css('margin', margin)
      .fadeIn()
      .click(function () {
        var shelf = $(this).parent();
        shelf.data('scrollTop', shelf.scrollTop());
        showSearchResults();
        var query = 'al:'+$(this).data('meta').album;
        populateSearchResults(query);
        $('input[name=search]').val(query);
      });
    shelf.append(artwork);
  }

  function populateSearchResults(query) {
    var results = $.app.Storage.search(query);
    _(results).each(function (muFile) {
      $('#search_results', '#search_column')
        .append($.app.utils.getSongEntryHTML(muFile, true));
    });

    $('#search_results', '#search_column').find('.entry_action')
      .click(function () {
        var muFile = $(this).data('muFile');
        var player_entry = $.app.utils.getSongEntryHTML(muFile, false);
        $.app.Playlist.attachEntryControls(player_entry);
        $.app.Playlist.add(player_entry);
      });
    $('#search_results', '#search_column').find('.play_action')
      .click(function (){
        var muFile = $(this).prev().data('muFile');
        var player_entry = app.utils.getSongEntryHTML(muFile, false);
        $.app.Playlist.attachEntryControls(player_entry);
        $.app.Playlist.add(player_entry);
        app.player.playMedia(player_entry, false, true);
      });
    $('#search_column #search_results').find('.album_name')
      .click(function () {
        var muFile = $(this).data('muFile');
        showSearchResults();
        var query = 'al:'+muFile.album;
        populateSearchResults(query);
        $('input[name=search]').val(query);
      });
    $('#search_column #search_results').find('.artist_name')
      .click(function () {
        var muFile = $(this).data('muFile');
        showSearchResults();
        var query = 'ar:'+muFile.artist
        populateSearchResults(query);
        $('input[name=search]').val(query);
      });
  }

  function populatePlaylistSettings() {
    $('#settings_playlist').empty();
    $('#settings_playlist').append(
      '<option value="no selection">--Select Playlist--</option>');
    _.each(app.Playlist.favPlaylists, function (playlist, key){
      var option = $('<option></option>').text(key).attr('value', key);
      $('#settings_playlist').append(option);
    }); 
  }

  function init() {
    app.localArtworks = loadArtworkMap();
    _.each(app.localArtworks, function (artwork, key){
      populateShelf(key, artwork.artist, artwork.album);
    });

    $('input[name=search]').keyup(function (e) {

      var text = $(this).val();

      if(!text || (text && text.length < 4)) { 
        showShelf();
        return; 
      }
      showSearchResults();
      populateSearchResults(text);

    })
    .focusin(function (e){
      if($(this).val() == 'Search...'){ $(this).val(''); }
    })
    .focusout(function (e){
      if($(this).val() == ''){
        $(this).val('Search...');
        showShelf();
      }
    }); 

    $('#addall', '#search_column').click(function () {
      $('#search_results .entry', '#search_column').each(function () { 
        var muFile = $(this).find('.entry_action').data('muFile');
        var player_entry = $.app.utils.getSongEntryHTML(muFile, false);
        $.app.Playlist.attachEntryControls(player_entry);
        $.app.Playlist.add(player_entry);
      });
    });

    $('#clear_search', '#search_column').click(function (){
      $('input[name=search]').focus().val('');
      showShelf();
    });

    $('#settings_button', '#search_column').click(function () {
      showSettings();
      populatePlaylistSettings();
    });

    $('#settings #settings_done', '#search_column').click(function () {
      showShelf();
    });

    $('#search_column #reset_db').click(function () {
      if(confirm('Are you sure you want to reset the database?')){
        $('#playlist').empty();
        window.localStorage.clear();
        window.location.reload();
      } 
    });

    $('#search_column #reset_cache').click(function () {
      if(confirm('Are you sure you want to reset the cache?')){
        $.app.Cache.empty();
      } 
    });

    $('#settings #del_all_playlist', '#search_column').click(function (){
      app.Playlist.favPlaylists = {};
      window.localStorage.setItem('__fav_playlist__', 
        JSON.stringify(app.Playlist.favPlaylists));
      populatePlaylistSettings();
      app.Playlist.populatePlaylistDropdown();
    });

    $('#settings #del_playlist', '#search_column').click(function () {
      var templist = app.Playlist.favPlaylists;
      var selection = $('#settings_playlist').val();
      app.Playlist.favPlaylists = {};
      _.each(templist, function (value, key){
        console.log(key, selection);
        if(selection != key){
          app.Playlist.favPlaylists[key] = value;
        }
      });
      window.localStorage.setItem('__fav_playlist__', 
        JSON.stringify(app.Playlist.favPlaylists));
      app.Playlist.populatePlaylistDropdown();
      populatePlaylistSettings();
    });

    $('#ytclose', '#search_column').click(showShelf);
  }

  function storeArtworkMap() {
    window.localStorage.setItem(
      '__artwork_map__', JSON.stringify(app.localArtworks));
  }

  function loadArtworkMap() {
    var artworks = 
      JSON.parse(window.localStorage.getItem('__artwork_map__'));
    return (_.isNull(artworks) ? {} : artworks);
  }

  app.mainColumn = mainColumn;
  app.mainColumn.init = init;
  app.mainColumn.storeArtworkMap = storeArtworkMap;
  app.mainColumn.loadArtworkMap = loadArtworkMap;
  app.mainColumn.populateShelf = populateShelf;
  app.mainColumn.showShelf = showShelf;
  app.mainColumn.showSearchResults = showSearchResults;
  app.mainColumn.startProgress = startProgress;
  app.mainColumn.makeProgress = makeProgress;
  app.mainColumn.completeProgress = completeProgress;
  app.mainColumn.populatePlaylistSettings = populatePlaylistSettings;

})(jQuery);
