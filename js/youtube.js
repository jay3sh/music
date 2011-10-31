
(function ($) {

var app = $.app;
app.youtube = {};

var monthText = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

function getDurationText(seconds) {
  if(seconds > 60) {
    return Math.round(seconds/60)+'m'+(seconds%60)+'s';
  } if(seconds > 60*60) {
    return Math.round(seconds/3600)+'h'+Math.round((seconds%3600)/60)+'m'+
      (seconds%60)+'s';
  }
}

function populateYTShelf(entry){
  var atts = { id: "swf" };
  var videoWidth = $('#shelf').width() - 150;
  var videoHeight = videoWidth * 3/4;
  var title = entry.title.$t;
  var viewCount = entry.yt$statistics.viewCount;
  var duration = getDurationText(entry.media$group.yt$duration.seconds);

  var params = { allowScriptAccess: "always" };
  var atts = { id: "swf" };
  var match = 
    /http:\/\/gdata.youtube.com\/feeds\/videos\/(.+)/.exec(entry.id.$t);

  $('#ytshelf object').remove();
  $('#ytshelf #ytinfo').empty();
  $('#ytshelf').prepend('<div id="ytplayer"></div>');

  video_id = match[1];
  swfobject.embedSWF(
    'http://www.youtube.com/e/'+video_id+
    '?enablejsapi=1&playerapiid=ytplayer',
    "ytplayer", videoWidth, videoHeight, "8", null, null, params, atts);

  var yt_title = 
    $('<div></div>').attr('id','yt_title').text(title);
  var yt_duration = 
    $('<div></div>').attr('id','yt_duration').text(duration);
  var yt_view = 
    $('<div></div>').attr('id','yt_view').text('Viewed: ' + viewCount);

  $('#ytshelf #ytinfo').append(yt_title)
    .append(yt_view)
    .append(yt_duration);
}

app.youtube.showResults = function (data) {
  $('#search_column #search_results').hide();
  $('#search_column #shelf').hide();
  $('#search_column #settings').hide();
 
  var ytshelf = $('#search_column #ytshelf').children().empty();
  var filmStrip = $('#filmstrip');
  var feed = data.feed;
  var entries = feed.entry || [];
  _(entries).each(function (entry) {
    filmStrip.append($.app.youtube.getEntryHTML(entry));
  });
  
  populateYTShelf(entries[0]);

  $('#search_column #ytshelf').show();
};

app.youtube.search = function (muFile) {
  var name = app.utils.getPrettySongName(muFile);
  var searchQuery = name.split(/\s+/).join('+')+'+'+
    muFile.artist.split(/\s+/).join('+');

  var script = document.createElement('script');
  script.setAttribute('id', 'jsonScript');
  script.setAttribute('type', 'text/javascript');    
  script.setAttribute('src', 'http://gdata.youtube.com/feeds/videos?q='+
          searchQuery+'&max-results=10&alt=json-in-script&' + 
         'callback=$.app.youtube.showResults&orderby=relevance&' + 
         'sortorder=descending&format=5&fmt=18');
  document.documentElement.firstChild.appendChild(script);
};

app.youtube.getEntryHTML = function (entry) {
  var thumburl = entry.media$group.media$thumbnail[0].url;

  var published = new Date();
  published.setTime(Date.parse(entry.published.$t));
  var publishedDate = published.getDate()+' '+
    monthText[published.getMonth()]+' '+published.getFullYear();

  var viewCount = entry.yt$statistics.viewCount;

  var duration = entry.media$group.yt$duration;

  var e = $('<div></div>').addClass('ytentry');
  e.append($('<img/>').attr('src',thumburl)
    .attr('title',entry.title.$t).data('entry',entry));

  e.find('img').click(function () {
    var entry = $(this).data('entry');
    populateYTShelf(entry);
  });
  return e;
};

})(jQuery);
