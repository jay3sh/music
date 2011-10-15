
/*
 * Tag parsing library for music files. It supports ID3 (mp3 files)
 * and MPEG4 (m4a files) tags
 *
 * It is based on the information found in specification documents and
 * other libraries that can be found at following links:
 *
 * http://atomicparsley.sourceforge.net/mpeg-4files.html
 * Source code of AtomicParsley
 * https://github.com/antimatter15/player/blob/master/id3v2.js
 * http://www.tumblr.com/tagged/filereader
 * http://code.google.com/p/mutagen/source/browse/trunk/mutagen/
 */

(function ($) {
var app = $.app;

var ID3_2_GENRES = {
  "0": "Blues",
  "1": "Classic Rock",
  "2": "Country",
  "3": "Dance",
  "4": "Disco",
  "5": "Funk",
  "6": "Grunge",
  "7": "Hip-Hop",
  "8": "Jazz",
  "9": "Metal",
  "10": "New Age",
  "11": "Oldies",
  "12": "Other",
  "13": "Pop",
  "14": "R&B",
  "15": "Rap",
  "16": "Reggae",
  "17": "Rock",
  "18": "Techno",
  "19": "Industrial",
  "20": "Alternative",
  "21": "Ska",
  "22": "Death Metal",
  "23": "Pranks",
  "24": "Soundtrack",
  "25": "Euro-Techno",
  "26": "Ambient",
  "27": "Trip-Hop",
  "28": "Vocal",
  "29": "Jazz+Funk",
  "30": "Fusion",
  "31": "Trance",
  "32": "Classical",
  "33": "Instrumental",
  "34": "Acid",
  "35": "House",
  "36": "Game",
  "37": "Sound Clip",
  "38": "Gospel",
  "39": "Noise",
  "40": "AlternRock",
  "41": "Bass",
  "42": "Soul",
  "43": "Punk",
  "44": "Space",
  "45": "Meditative",
  "46": "Instrumental Pop",
  "47": "Instrumental Rock",
  "48": "Ethnic",
  "49": "Gothic",
  "50": "Darkwave",
  "51": "Techno-Industrial",
  "52": "Electronic",
  "53": "Pop-Folk",
  "54": "Eurodance",
  "55": "Dream",
  "56": "Southern Rock",
  "57": "Comedy",
  "58": "Cult",
  "59": "Gangsta",
  "60": "Top 40",
  "61": "Christian Rap",
  "62": "Pop/Funk",
  "63": "Jungle",
  "64": "Native American",
  "65": "Cabaret",
  "66": "New Wave",
  "67": "Psychadelic",
  "68": "Rave",
  "69": "Showtunes",
  "70": "Trailer",
  "71": "Lo-Fi",
  "72": "Tribal",
  "73": "Acid Punk",
  "74": "Acid Jazz",
  "75": "Polka",
  "76": "Retro",
  "77": "Musical",
  "78": "Rock & Roll",
  "79": "Hard Rock",
  "80": "Folk",
  "81": "Folk-Rock",
  "82": "National Folk",
  "83": "Swing",
  "84": "Fast Fusion",
  "85": "Bebob",
  "86": "Latin",
  "87": "Revival",
  "88": "Celtic",
  "89": "Bluegrass",
  "90": "Avantgarde",
  "91": "Gothic Rock",
  "92": "Progressive Rock",
  "93": "Psychedelic Rock",
  "94": "Symphonic Rock",
  "95": "Slow Rock",
  "96": "Big Band",
  "97": "Chorus",
  "98": "Easy Listening",
  "99": "Acoustic",
  "100": "Humour",
  "101": "Speech",
  "102": "Chanson",
  "103": "Opera",
  "104": "Chamber Music",
  "105": "Sonata",
  "106": "Symphony",
  "107": "Booty Bass",
  "108": "Primus",
  "109": "Porn Groove",
  "110": "Satire",
  "111": "Slow Jam",
  "112": "Club",
  "113": "Tango",
  "114": "Samba",
  "115": "Folklore",
  "116": "Ballad",
  "117": "Power Ballad",
  "118": "Rhythmic Soul",
  "119": "Freestyle",
  "120": "Duet",
  "121": "Punk Rock",
  "122": "Drum Solo",
  "123": "A capella",
  "124": "Euro-House",
  "125": "Dance Hall"
};

function fileSlice(file, start, length){
  if(file.mozSlice) return file.mozSlice(start, start + length);
  if(file.webkitSlice) return file.webkitSlice(start, start + length);
  if(file.slice) return file.slice(start, length);
}

function cleanText(str){
  return str.replace(
    /[^A-Za-z0-9\(\)\{\}\[\]\!\@\#\$\%\^\&\* \/\"\'\;\>\<\?\,\~\`\.\n\t]/g,'');
}

var ITER_LIMIT = 100;
function parseID3v2(view, callback) {
  var tags = { version:2, other:[] }
  try {
    tags.revision = view.getInt8(3);
    var id3Flags = view.getInt8(5);
    var tagSize = view.getUint32(6, littleEndian=false);
    var cursor = 10;

    if(tags.revision < 3) {
      var iter = 0;
      while(cursor < tagSize && iter < ITER_LIMIT) {
        var header = view.getString(3, cursor);
        var sbytes = [
          view.getUint8(cursor+3),
          view.getUint8(cursor+4),
          view.getUint8(cursor+5)
        ];
        var frameSize = (sbytes[0] << 16) + (sbytes[1] << 8) + sbytes[2];
        var content = view.getString(frameSize, cursor+6);
        switch(header) {
        case 'TT2':
          tags.title = cleanText(content); break;
        case 'TAL':
          tags.album = cleanText(content); break;
        case 'TP1':
          tags.artist = cleanText(content); break;
        case 'TYE':
          tags.year = cleanText(content); break;
        case 'TCO':
          s = cleanText(content);
          if(/\([0-9]+\)/.test(s)) {
            tags.genre = ID3_2_GENRES[parseInt(s.replace(/[\(\)]/g,''), 10)];
          } else {
            tags.genre = s;
          }
          break;
        default:
          if(header && header.trim().length > 0) {
            tags.other.push({ header:header, content:cleanText(content) });
          }
          break;
        }
        cursor += (6+frameSize);
        iter++;
      }
    } else {
      var iter = 0;
      while(cursor < tagSize && iter < ITER_LIMIT) {
        var header = view.getString(4, cursor);
        var frameSize = view.getUint32(cursor+4, littleEndian=false);
        var flags = view.getUint16(cursor+8, littleEndian=false);
        var content = view.getString(frameSize, cursor+10);
        switch(header) {
        case 'TIT2':
          tags.title = cleanText(content); break;
        case 'TALB':
          tags.album = cleanText(content); break;
        case 'TPE1':
          tags.artist = cleanText(content); break;
        case 'TYER':
          tags.year = cleanText(content); break;
        case 'TCON':
          s = cleanText(content);
          if(/\([0-9]+\)/.test(s)) {
            tags.genre = ID3_2_GENRES[parseInt(s.replace(/[\(\)]/g,''), 10)];
          } else {
            tags.genre = s;
          }
          break;
        default:
          if(header && header.trim().length > 0) {
            tags.other.push({ header:header, content:cleanText(content) });
          }
          break;
        }
        cursor += (10+frameSize);
        iter++;
      }
    }
    callback(tags);
  } catch(e) {
    callback(tags);
  }
}

function parseID3v1(view, callback) {
  callback({
    version : 1,
    title : cleanText(view.getString(30, view.tell())),
    artist : cleanText(view.getString(30, view.tell())),
    album : cleanText(view.getString(30, view.tell())),
    year : cleanText(view.getString(4, view.tell()))
  });
}

function parseMpeg4(view, callback) {

  var cursor = 0;
  var depth = 0;
  var pattern = ['moov','udta','meta','ilst']
  var endpos = view.length;
  var tags = {};

  function processTagAtom(name, size) {
    var localcursor = cursor+8;
    var dataSize = view.getUint32(localcursor, littleEndian=false);
    var data = view.getString(dataSize-8, localcursor+8);
    if(name.indexOf('alb') > 0) {
      tags.album = data;
    } else if(name.indexOf('art') > 0) {
      tags.artist = data;
    } else if(name.indexOf('ART') > 0) {
      if(!tags.artist) { tags.artist = data; }
    } else if(name.indexOf('wrt') > 0) {
      if(!tags.artist) { tags.artist = data; }
    } else if(name.indexOf('gen') > 0 || name.indexOf('gnre') == 0) {
      tags.genre = data;
    } else if(name.indexOf('nam') > 0) {
      tags.title = data;
    } else if(name.indexOf('day') > 0) {
      tags.year = data;
    }
  }

  function findAtomPattern() {
    if(cursor >= endpos) { return tags; }

    var atomSize = view.getUint32(cursor, littleEndian=false);
    var atomName = view.getString(4, cursor+4);
    if(atomName == pattern[depth]) {
      depth++;
      if(atomName == 'ilst') { endpos = cursor + atomSize; }
      if(depth == 3) { cursor += 4; }
      cursor += 8;
      return findAtomPattern();
    } else {
      if(depth == pattern.length) {
        processTagAtom(atomName, atomSize);
      }
      cursor += atomSize;
      return findAtomPattern();
    }
  }

  callback(findAtomPattern());
}

var id3v1Count = 0;
var id3v2Count = 0;
var m4aCount = 0;
var unknownTagCount = 0;

app.parseTags = function (file, callback) {
  var reader = new FileReader();
  if(/\.mp3$/.test(file.webkitRelativePath.toLowerCase())) {

    reader.onload = function (e) {
      var view = new jDataView(this.result);
      if(view.getString(3,0) == 'ID3') {
        parseID3v2(view, callback);
        id3v2Count++;
      } else {

        reader = new FileReader();
        reader.onload = function (e) {
          var view = new jDataView(this.result);
          if (view.getString(3,0) == 'TAG') {
            parseID3v1(view, callback);
            id3v1Count++;
          } else {
            callback({});
            console.log('Unknown tags: '+file.webkitRelativePath.toLowerCase());
            unknownTagCount++;
          }
        }
        reader.readAsArrayBuffer(fileSlice(file, file.fileSize-128, 128));
      }
    };
    reader.readAsArrayBuffer(fileSlice(file, 0, 128*1024));

  } else if(/\.m4a$/.test(file.webkitRelativePath.toLowerCase())) {
    reader.onload = function (e) {
      var view = new jDataView(this.result);
      if(view.getString(4,4) == 'ftyp') {
        parseMpeg4(view, callback);
        m4aCount++;
      } else {
        console.log('Unknown Tags: '+file.webkitRelativePath.toLowerCase());
        callback({});
        unknownTagCount++;
      }
    };
    reader.readAsArrayBuffer(file);
  } else {
    console.log(file.webkitRelativePath.toLowerCase());
    unknownTagCount++;
  }
};

app.printParseReport = function () {
  console.log('Tag parsing report');
  console.log('------------------');
  console.log('ID3v1 '+id3v1Count);
  console.log('ID3v2 '+id3v2Count);
  console.log('M4A '+m4aCount);
  console.log('Unknown '+unknownTagCount);
}

})(jQuery);

