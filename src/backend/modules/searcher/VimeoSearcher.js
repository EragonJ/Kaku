define(function(require) {
  'use strict';

  var VimeoTrack = require('backend/models/track/VimeoTrack');
  var Constants = require('backend/Constants');
  var Tracker = require('backend/Tracker');
  var Vimeo = requireNode('vimeo').Vimeo;

  var VimeoSearcher = function() {
    this._accessToken = '';
    this._scope = ['public'];

    this._vimeo = new Vimeo(Constants.API.VIMEO_API_CLIENT_ID,
      Constants.API.VIMEO_API_CLIENT_SECRET);
    this._initRequest = this._init();
  };

  VimeoSearcher.prototype._ready = function() {
    return this._initRequest.catch((error) => {
      console.log(error);
    });
  };

  VimeoSearcher.prototype._init = function() {
    var promise = new Promise((resolve, reject) => {
      this._vimeo.generateClientCredentials(
        this._scope, (error, accessToken) => {
          if (error) {
            reject(error);
          }
          else {
            this._accessToken = accessToken.access_token;
            this._scope = accessToken.scope;
            this._vimeo.access_token = this._accessToken;
            resolve();
          }
      });
    });
    return promise;
  };

  VimeoSearcher.prototype.search = function(keyword, limit) {
    limit = limit || 50;
    return this._ready().then(() => {
      limit = (limit >= 50) ? 50 : limit;
      var promise = new Promise((resolve, reject) => {
        this._vimeo.request({
          path: '/videos',
          query: {
            page: 1,
            per_page: limit,
            query: keyword,
            sort: 'relevant'
          }
        }, (error, body, statusCode, headers) => {
          if (error) {
            reject(error);
          }
          else {
            var rawTracks = body.data;
            var vimeoTracks = rawTracks.map((rawTrack) => {
              var track = new VimeoTrack();
              track.init(rawTrack);
              return track;
            });
            Tracker.event('VimeoSearcher', 'search', keyword).send();
            resolve(vimeoTracks);
          }
        });
      });
      return promise;
    });
  };

  return new VimeoSearcher(); 
});
