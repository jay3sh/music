
(function ($){
  var app = $.app;
  var IMG_WIDTH = 100;

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

  function showSearchResults() {
    $('#search_column #shelf').hide();
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
    $('#search_column #search_results').hide();
    $('#search_column #ytshelf').hide();
  }
  
  function populateShelf(url, artist, album){ 
    var shelf = $('#search_column #shelf');
    var artworkNum = Math.floor(shelf.width()/IMG_WIDTH);
    var margin = (shelf.width()-(artworkNum*IMG_WIDTH))/(artworkNum*2);
    var artwork = $('<img></img>')
      .attr('src', url)
      .attr('title', album+'\n'+artist)
      .data('meta', { album : album, artist : artist })
      .css('margin', Math.floor(margin)-1)
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
        $.app.Playlist.add(player_entry)
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

})(jQuery);
