var IniParser = function() {

};

IniParser.prototype.parse = function(rawData) {
  var result = {};
  var lines = rawData.split(/\r\n|\r|\n/);

  lines.forEach((eachLine) => {
    var matched;
    var matchedKey;
    var matchedValue;
    var reLine;

    eachLine = eachLine.trim();
    if (eachLine.length === 0) {
      return;
    }

    if (eachLine.charAt(0) === '#' || eachLine.charAt(0) === ';') {
      return;
    }

    reLine = /(\w+)\s*=\s*["]?(.*?)["]?$/;
    matched = reLine.exec(eachLine);
    matchedKey = matched && matched[1];
    matchedValue = matched && matched[2];
    if (matchedKey && matchedValue) {
      result[matchedKey] = matchedValue;
    }
  });

  return result;
};

module.exports = new IniParser();
