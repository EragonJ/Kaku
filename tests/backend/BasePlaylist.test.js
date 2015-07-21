suite('BasePlaylist', () => {
  'use strict';

  var BasePlaylist;
  var BaseTrack;

  setup((done) => {
    testRequire([
      'backend/models/playlist/BasePlaylist',
      'backend/models/track/BaseTrack'
    ], {
      '*': {
        'backend/modules/KakuCore': 'mocks/KakuCore'
      }
    }, (BasePlaylistConstructor, BaseTrackConstructor) => {
      BasePlaylist = BasePlaylistConstructor;
      BaseTrack = BaseTrackConstructor;
      done();
    });
  });

  suite('findTracksByArtist() >', () => {
    test('can find out needed track', () => {
      var playlist = new BasePlaylist();
      playlist._tracks = [
        { artist: 'jay' },
        { artist: 'A-Fu' },
        { artist: 'A-Fu' },
        { artist: 'MJ' }
      ];
      var tracks = playlist.findTracksByArtist('A-Fu');
      assert.equal(tracks.length, 2);
    });
  });

  suite('findTracksByTitle() >', () => {
    test('can find out needed track', () => {
      var playlist = new BasePlaylist();
      playlist._tracks = [
        { artist: '五月天', title: '如果還有明天' },
        { artist: '信樂團', title: '如果還有明天' },
        { artist: 'Maroon 5', title: 'Animals' }
      ];

      var tracks = playlist.findTracksByTitle('如果還有明天');
      assert.equal(tracks.length, 2);
    });
  });

  suite('findTrackByTitleAndArtist() >', () => {
    test('can find out needed track', () => {
      var playlist = new BasePlaylist();
      playlist._tracks = [
        { artist: '五月天', title: '如果還有明天' },
        { artist: '信樂團', title: '如果還有明天' },
        { artist: 'Maroon 5', title: 'Animals' }
      ];

      var track = playlist.findTrackByArtistAndTitle('五月天', '如果還有明天');
      assert.deepEqual(track, {
        artist: '五月天',
        title: '如果還有明天'
      });
    });
  });

  suite('findTrackIndex() >', () => {
    var playlist;
    var fakeTrack = {
      artist: '周杰倫',
      title: '給我一首歌的時間'
    };
    var fakeTrack2 = {
      artist: '周杰倫',
      title: '我要夏天'
    };

    setup(() => {
      playlist = new BasePlaylist();
    });

    test('if found track, get it\'s index', () => {
      playlist._tracks.push(fakeTrack);
      assert.equal(playlist.findTrackIndex(fakeTrack), 0);
    });

    test('if can\'t find track, get -1', () => {
      playlist._tracks.push(fakeTrack);
      assert.equal(playlist.findTrackIndex(fakeTrack2), -1);
    });
  });

  suite('isSameWith() >', () => {
    test('if id are the same, get true', () => {
      var playlistA = new BasePlaylist({
        id: 'abcd1234'
      });
      var playlistB = new BasePlaylist({
        id: 'abcd1234'
      });
      assert.isTrue(playlistA.isSameWith(playlistB));
    });

    test('if id are different, get false', () => {
      var playlistA = new BasePlaylist();
      var playlistB = new BasePlaylist();

      // Because the id is created randomly, it means that two newly-created
      // playlists must be diffrent. If this fails often, it means we have
      // to make id more randomized.
      assert.isFalse(playlistA.isSameWith(playlistB));
    });
  });

  suite('addTrack() >', () => {
    var playlist;
    var fakeTrack = {
      artist: '周杰倫',
      title: '我要夏天' 
    };

    setup(() => {
      playlist = new BasePlaylist(); 
    });

    test('if the track doesn\'t exist, do add', (done) => {
      // TODO
      // This may be ES6 + rjs problem, fix later.
      playlist.addTrack(fakeTrack).then(() => {
        var addedTrack = playlist.tracks[0];
        assert.deepEqual(addedTrack, fakeTrack);
      }).then(done, done);
    });

    test('if the track does exist, do not add', (done) => {
      playlist._tracks.push(fakeTrack);
      playlist.addTrack(fakeTrack).then(() => {
        // should not go into here
        assert.ok(false);
      }, () => {
        assert.equal(playlist.tracks.length, 1);
      }).then(done, done);
    });
  });

  suite('removeTrack() >', () => {
    var playlist;
    var fakeTrack = {
      artist: '周杰倫',
      title: '我要夏天' 
    };

    setup(() => {
      playlist = new BasePlaylist(); 
    });

    test('if the track doesn\'t exist, do not remove', (done) => {
      playlist.removeTrack(fakeTrack).then(() => {
        // we should not go into here
        assert.ok(false);
      }, () => {
        assert.equal(playlist.tracks.length, 0);
      }).then(done, done);
    });

    test('if the track does exist, do remove', (done) => {
      playlist._tracks.push(fakeTrack);
      playlist.removeTrack(fakeTrack).then(() => {
        assert.equal(playlist.tracks.length, 0);
      }, () => {
        // we should not go into here
        assert.ok(false);
      }).then(done, done);
    });
  });

  suite('toJSON() + fromJSON() >', () => {
    test('they should be the same', () => {
      var playlistInfo = {
        id: 'abcde1234',
        name: 'playlistABCD',
        _tracks: [
          new BaseTrack(),
          new BaseTrack()
        ]
      };

      var originalPlaylist = new BasePlaylist(playlistInfo);
      var exportedPlaylist = BasePlaylist.fromJSON(originalPlaylist.toJSON());
      
      assert.equal(exportedPlaylist.id, playlistInfo.id);
      assert.equal(exportedPlaylist.name, playlistInfo.name);
      assert.equal(exportedPlaylist._tracks.length,
        playlistInfo._tracks.length);
    });
  });

});
