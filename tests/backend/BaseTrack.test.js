suite('BaseTrack', () => {
  'use strict';

  var BaseTrack;
  
  setup((done) => {
    testRequire([
      'backend/models/track/BaseTrack'
    ], {
      '*': {
        'backend/modules/KakuCore': 'mocks/KakuCore'
      }
    }, (BaseTrackConstructor) => {
      BaseTrack = BaseTrackConstructor;
      done();
    });
  });

  suite('isSameTrackWith() >', () => {
    test('if same artist & title, treat them the same', () => {
      var trackInfo = {
        artist: 'artistA',
        title: 'this is title'
      };

      var trackA = new BaseTrack(trackInfo);
      var trackB = new BaseTrack(trackInfo);

      assert.ok(trackA.isSameTrackWith(trackB));
    });

    test('if same platformUrl, treat them the same', () => {
      var trackInfo = {
        platformId: 'abcd1234'
      };

      var trackA = new BaseTrack(trackInfo);
      var trackB = new BaseTrack(trackInfo);

      assert.ok(trackA.isSameTrackWith(trackB));
    });

    test('else, treat them differnt tracks', () => {
      var trackA = new BaseTrack({
        artist: 'artistA',
        title: 'titleA',
        platformId: 'abcd1234'
      });

      var trackB = new BaseTrack({
        artist: 'artistB',
        title: 'titleB',
        platformId: 'abcd12345'
      });

      assert.isFalse(trackA.isSameTrackWith(trackB));
    });
  });

  suite('toJSON() + fromJSON() >', () => {
    test('they should be the same', () => {
      var trackInfo = {
        id: 'abcd12345',
        trackType: 'BaseTrack',
        title: 'title',
        artist: 'artist',
        description: 'description',
        platformId: 'abcd12345',
        platformTrackRealUrl: '',
        covers: {
          default: 'http://abc.img',
          medium: 'http://def.img',
          large: 'http://hij:img'
        }
      };

      var originalTrack = new BaseTrack(trackInfo);
      var exportedTrack = BaseTrack.fromJSON(originalTrack.toJSON());

      for (var key in trackInfo) {
        assert.equal(exportedTrack[key], trackInfo[key]);
      }
    });
  });
});
