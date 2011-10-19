
(function ($){
  var app = $.app;

  function mainColumn () {}

  function showSearchResults() {
    $('#shelf', '#search_column').hide();
    $('search_results', '#search_column').empty();
    $('#search_results', '#search_column').show();
  }

  function showShelf() {
    $('#shelf', '#search_column').show();
    $('#search_results', '#search_column').hide();
  }
  
  function populateShelf(url, artist, album){ 
    var shelf = $('#shelf', '#search_column');
    var artworkNum = Math.floor(shelf.width()/125);
    var margin = (shelf.width()-(artworkNum*125))/(artworkNum*2);
    if(!app.artworks[url]){
      var artwork = $('<img></img>')
        .attr('src', url)
        .data('meta', { album : album, artist : artist })
        .css('margin', margin)
        .fadeIn()
        .click(function () {
          console.log($(this).data('meta'));
        });
      $('#shelf', '#search_column').append(artwork);
      app.artworks[url] = { album : album, artist : artist };
    } else { console.log('repeated'); }
  }

  function init() {
    /*if(_.isNull(window.localStorage.getItem('__name_index__'))){} 
    else { } */ 
    app.artworks = {};
    showShelf();
    loadArtworkMap();
    $('input[name=search]').keyup(function (e) {

      var divResults = $('#search_results');
      divResults.empty();
      var text = $(this).val();

      if(!text || (text && text.length < 4)) { return; }

      var results = $.app.Storage.search($(this).val());
      _(results).each(function (muFile) {
        divResults.append($.app.utils.getSongEntryHTML(muFile, true));
      });


      divResults.find('.entry_action')
        .click(function () {
          var muFile = $(this).data('muFile');
          var player_entry = $.app.utils.getSongEntryHTML(muFile, false);
          $.app.Playlist.attachEntryControls(player_entry);
          $.app.Playlist.add(player_entry)
        });

    })
    .focus(function (e){
      $(this).val('');
      showSearchResults();
    })
    .focusout(function (e){
      if($(this).val() == ''){
        $(this).val('Search...');
        showShelf();
      }
    }); 
  }

  function storeArtworkMap() {
    window.localStorage.setItem(
      '__artwork_map__', JSON.stringify(app.artworks));
  }

  function loadArtworkMap() {
    app.artworks = JSON.parse(window.localStorage.getItem('__artwork_map__'));
  }

  app.mainColumn = mainColumn;
  app.mainColumn.init = init;
  app.mainColumn.storeArtworkMap = storeArtworkMap;
  app.mainColumn.loadArtworkMap = loadArtworkMap;
  app.mainColumn.populateShelf = populateShelf;

})(jQuery);
