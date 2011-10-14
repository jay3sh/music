(function ($){
  var app = $.app;
  
  function utils(){};

  utils.getPrettySongName = function (muFile) {
    var name = muFile.name.length > muFile.title.length ?
      muFile.name : muFile.title;
    return name.replace(/\.\w+$/,'');
  };

  utils.getSongEntryHTML = function (muFile, asSearchResult) { 
    var name = this.getPrettySongName(muFile);
    var album = muFile.album;
    var artist = muFile.artist;

    var entryHTML = '<div class="entry">'+
      '&nbsp;&nbsp;'+
      '<div class="song_name" title="'+name+'">'+name+'</div>'+
      '&nbsp;&nbsp;'+
      '<div class="album_name" title="'+album+'">'+album+'</div>'+
      '&nbsp;&nbsp;'+
      '<div class="artist_name" title="'+artist+'">'+artist+'</div>'+
      '&nbsp;&nbsp;'+
      (asSearchResult ?
        '<div class="entry_action">+</div>' :
        '<div class="remove_action">-</div>'+
        '<div class="entry_action" style="font-size:14px;">&nbsp;&nbsp;&#9654;</div>')+
    '</div>';
    var entry = $(entryHTML);
    
    entry
      .hover(
        function () { $(this).addClass('focused_entry'); },
        function () { $(this).removeClass('focused_entry'); }
      )
      .find('.entry_action').data('muFile',muFile);

    return entry;
  };

  app.utils = utils;
})(jQuery);
