define(function(require) {
  'use strict';

  var Notifier = require('modules/Notifier');
  var Player = require('modules/Player');

  var EasterEggs = function() {
    this._timerIds = [];
    this._sentences = [
      'お早うカクちゃん',
      '如果你能夠看到這個訊息的話',
      '就代表你解開 Konami Code 了！',
      '沒有意外的話',
      '今天應該是 7/19 - 妳的生日',
      '為了準備妳的生日禮物',
      '我想了超久都沒什麼想法',
      '只因為我想要送妳一個獨一無二的禮物！',
      '但有一天，我突然間想到一件事',
      '身為程式設計師的我最擅長的就是寫程式了',
      '如果可以自己從無到有寫出和妳有關的程式',
      '應該會讓妳很感動吧？！',
      '所以妳知道為什麼它叫做 Kaku 了嗎 :D ?',
      '半年前，我就開始寫第一行程式碼',
      '每天不論我有多忙',
      '我都會盡量播出至少 30 分鐘寫一點點',
      '沒想到過了半年多也寫出一個原型了！',
      '它雖然還不夠完整，也還算勘用了吧！',
      '不論如何，希望妳會喜歡它',
      '很高興在我人生最低潮的時候遇到了妳',
      '因為妳就是我找尋 25 年的那顆遺落之星',
      '最後，送給妳這首屬於我們兩個人的歌',
      'Adam Levine - Lost Stars',
      '生日快樂 :)'
    ];

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
          Notifier.alert(eachSentence);
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
