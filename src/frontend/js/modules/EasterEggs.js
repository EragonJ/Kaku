define(function(require) {
  'use strict';

  var Notifier = require('modules/Notifier');
  var Player = require('modules/Player');

  var EasterEggs = function() {
    this._timerIds = [];
    /* jshint ignore:start */
    this._sentences = [
      '%E3%81%8A%E6%97%A9%E3%81%86%E3%82%AB%E3%82%AF%E3%81%A1%E3%82%83%E3%82%93',
      '%E5%A6%82%E6%9E%9C%E4%BD%A0%E8%83%BD%E5%A4%A0%E7%9C%8B%E5%88%B0%E9%80%99%E5%80%8B%E8%A8%8A%E6%81%AF%E7%9A%84%E8%A9%B1',
      '%E5%B0%B1%E4%BB%A3%E8%A1%A8%E4%BD%A0%E8%A7%A3%E9%96%8B%20Konami%20Code%20%E4%BA%86%EF%BC%81',
      '%E6%B2%92%E6%9C%89%E6%84%8F%E5%A4%96%E7%9A%84%E8%A9%B1',
      '%E4%BB%8A%E5%A4%A9%E6%87%89%E8%A9%B2%E6%98%AF%207/19%20-%20%E5%A6%B3%E7%9A%84%E7%94%9F%E6%97%A5',
      '%E7%82%BA%E4%BA%86%E6%BA%96%E5%82%99%E5%A6%B3%E7%9A%84%E7%94%9F%E6%97%A5%E7%A6%AE%E7%89%A9',
      '%E6%88%91%E6%83%B3%E4%BA%86%E8%B6%85%E4%B9%85%E9%83%BD%E6%B2%92%E4%BB%80%E9%BA%BC%E6%83%B3%E6%B3%95',
      '%E5%8F%AA%E5%9B%A0%E7%82%BA%E6%88%91%E6%83%B3%E8%A6%81%E9%80%81%E5%A6%B3%E4%B8%80%E5%80%8B%E7%8D%A8%E4%B8%80%E7%84%A1%E4%BA%8C%E7%9A%84%E7%A6%AE%E7%89%A9%EF%BC%81',
      '%E4%BD%86%E6%9C%89%E4%B8%80%E5%A4%A9%EF%BC%8C%E6%88%91%E7%AA%81%E7%84%B6%E9%96%93%E6%83%B3%E5%88%B0%E4%B8%80%E4%BB%B6%E4%BA%8B',
      '%E8%BA%AB%E7%82%BA%E7%A8%8B%E5%BC%8F%E8%A8%AD%E8%A8%88%E5%B8%AB%E7%9A%84%E6%88%91%E6%9C%80%E6%93%85%E9%95%B7%E7%9A%84%E5%B0%B1%E6%98%AF%E5%AF%AB%E7%A8%8B%E5%BC%8F%E4%BA%86',
      '%E5%A6%82%E6%9E%9C%E5%8F%AF%E4%BB%A5%E8%87%AA%E5%B7%B1%E5%BE%9E%E7%84%A1%E5%88%B0%E6%9C%89%E5%AF%AB%E5%87%BA%E5%92%8C%E5%A6%B3%E6%9C%89%E9%97%9C%E7%9A%84%E7%A8%8B%E5%BC%8F',
      '%E6%87%89%E8%A9%B2%E6%9C%83%E8%AE%93%E5%A6%B3%E5%BE%88%E6%84%9F%E5%8B%95%E5%90%A7%EF%BC%9F%EF%BC%81',
      '%E6%89%80%E4%BB%A5%E5%A6%B3%E7%9F%A5%E9%81%93%E7%82%BA%E4%BB%80%E9%BA%BC%E5%AE%83%E5%8F%AB%E5%81%9A%20Kaku%20%E4%BA%86%E5%97%8E%20:D%20?',
      '%E5%8D%8A%E5%B9%B4%E5%89%8D%EF%BC%8C%E6%88%91%E5%B0%B1%E9%96%8B%E5%A7%8B%E5%AF%AB%E7%AC%AC%E4%B8%80%E8%A1%8C%E7%A8%8B%E5%BC%8F%E7%A2%BC',
      '%E6%AF%8F%E5%A4%A9%E4%B8%8D%E8%AB%96%E6%88%91%E6%9C%89%E5%A4%9A%E5%BF%99',
      '%E6%88%91%E9%83%BD%E6%9C%83%E7%9B%A1%E9%87%8F%E6%92%AD%E5%87%BA%E8%87%B3%E5%B0%91%2030%20%E5%88%86%E9%90%98%E5%AF%AB%E4%B8%80%E9%BB%9E%E9%BB%9E',
      '%E6%B2%92%E6%83%B3%E5%88%B0%E9%81%8E%E4%BA%86%E5%8D%8A%E5%B9%B4%E5%A4%9A%E4%B9%9F%E5%AF%AB%E5%87%BA%E4%B8%80%E5%80%8B%E5%8E%9F%E5%9E%8B%E4%BA%86%EF%BC%81',
      '%E5%AE%83%E9%9B%96%E7%84%B6%E9%82%84%E4%B8%8D%E5%A4%A0%E5%AE%8C%E6%95%B4%EF%BC%8C%E4%B9%9F%E9%82%84%E7%AE%97%E5%8B%98%E7%94%A8%E4%BA%86%E5%90%A7%EF%BC%81',
      '%E4%B8%8D%E8%AB%96%E5%A6%82%E4%BD%95%EF%BC%8C%E5%B8%8C%E6%9C%9B%E5%A6%B3%E6%9C%83%E5%96%9C%E6%AD%A1%E5%AE%83',
      '%E5%BE%88%E9%AB%98%E8%88%88%E5%9C%A8%E6%88%91%E4%BA%BA%E7%94%9F%E6%9C%80%E4%BD%8E%E6%BD%AE%E7%9A%84%E6%99%82%E5%80%99%E9%81%87%E5%88%B0%E4%BA%86%E5%A6%B3',
      '%E5%9B%A0%E7%82%BA%E5%A6%B3%E5%B0%B1%E6%98%AF%E6%88%91%E6%89%BE%E5%B0%8B%2025%20%E5%B9%B4%E7%9A%84%E9%82%A3%E9%A1%86%E9%81%BA%E8%90%BD%E4%B9%8B%E6%98%9F',
      '%E6%9C%80%E5%BE%8C%EF%BC%8C%E9%80%81%E7%B5%A6%E5%A6%B3%E9%80%99%E9%A6%96%E5%B1%AC%E6%96%BC%E6%88%91%E5%80%91%E5%85%A9%E5%80%8B%E4%BA%BA%E7%9A%84%E6%AD%8C',
      'Adam%20Levine%20-%20Lost%20Stars',
      '%E7%94%9F%E6%97%A5%E5%BF%AB%E6%A8%82%20:)'
    ];
    /* jshint ignore:end */

    // You are my lost star :)
    this._lostTrackForKaku = {
      artist: 'Adam Levine',
      title: 'Lost Stars'
    };

    this._ALERT_TIMEOUT = 5800;
    this._ALERT_EXTRA_WAITING = 300;
  };

  EasterEggs.prototype.show = function() {
    Player.play(this._lostTrackForKaku);
    // We may show EasterEggs for multiple times, so let's drop old timerIds
    // and make sure everything is new.
    this._cleanup();
    this._sentences.forEach((eachSentence, index) => {
      var id = setTimeout((eachSentence) => {
        return () => {
          Notifier.alert(decodeURI(eachSentence));
        };
      }(eachSentence), this._ALERT_TIMEOUT * index + this._ALERT_EXTRA_WAITING);
      this._timerIds.push(id);
    });
  };

  EasterEggs.prototype._cleanup = function() {
    this._timerIds.forEach((id) => {
      clearTimeout(id);
    });
  };

  // should be singleton
  return new EasterEggs();
});
