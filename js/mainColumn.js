
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
  
  
  function init() {
    /*if(_.isNull(window.localStorage.getItem('__name_index__'))){} 
    else { } */ 
    showShelf();
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

  app.mainColumn = mainColumn;
  app.mainColumn.init = init;

})(jQuery);
