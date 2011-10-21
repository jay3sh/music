
(function ($){
  var app = $.app;
  var IMG_WIDTH = 100;

  function mainColumn () {}

  function showSearchResults() {
    $('#shelf', '#search_column').hide();
    $('#search_results', '#search_column').empty();
    $('#search_results', '#search_column').show();
  }

  function showShelf() {
    $('#shelf', '#search_column').show();
    $('#search_results', '#search_column').hide();
  }
  
  function populateShelf(url, artist, album){ 
    var shelf = $('#shelf', '#search_column');
    var artworkNum = Math.floor(shelf.width()/IMG_WIDTH);
    var margin = (shelf.width()-(artworkNum*IMG_WIDTH))/(artworkNum*2);
    var artwork = $('<img></img>')
      .attr('src', url)
      .data('meta', { album : album, artist : artist })
      .css('margin', Math.floor(margin)-1)
      .fadeIn()
      .click(function () {
        showSearchResults();
        populateSearchResults($(this).data('meta').album);
        $('input[name=search]').val($(this).data('meta').album);
      });
    $('#shelf', '#search_column').append(artwork);
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

})(jQuery);
