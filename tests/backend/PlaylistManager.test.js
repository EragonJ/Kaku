suite('PlaylistManager', () => {
  'use strict';

  var playlistManager;
  var mockDB;
  var mockTracker;
  var mockBasePlaylist;
  var sandbox;

  setup((done) => {
    testRequire([
      'backend/modules/PlaylistManager',
      'mocks/Database',
      'mocks/Tracker',
      'mocks/BasePlaylist'
    ], {
      '*': {
        'backend/modules/Database': 'mocks/Database',
        'backend/modules/Tracker': 'mocks/Tracker',
        'backend/modules/BasePlaylist': 'mocks/BasePlaylist'
      }
    }, (PlaylistManager, MockDB, MockTracker, MockBasePlaylist) => {
      playlistManager = PlaylistManager;
      mockDB = MockDB;
      mockTracker = MockTracker;
      mockBasePlaylist = MockBasePlaylist;

      // Let's stub all db related operations
      sandbox = sinon.sandbox.create();
      sandbox.spy(playlistManager, 'emit');
      sandbox.stub(playlistManager, '_storePlaylistsToDB', () => {
        return Promise.resolve();
      });

      playlistManager.ready().then(() => {
        playlistManager._activePlaylist = null;
        playlistManager._isDisplaying = false;
        // insert two fakeData
        playlistManager._playlists = [
          { id: 'id1', name: 'playlist1' },
          { id: 'id2', nam1: 'playlist2' }
        ];
        done();
      });
    });
  });

  teardown(() => {
    sandbox.restore();
  });

  suite('findPlaylistById() >', () => {
    test('if without playlist, return undefined', () => {
      var playlist = playlistManager.findPlaylistById('id0');
      assert.equal(playlist, undefined);
    });

    test('if with playlist, return it', () => {
      var playlist = playlistManager.findPlaylistById('id1');
      assert.equal(playlist.id, 'id1');
    });
  });

  suite('findPlaylistByName() >', () => {
    test('if without playlist, return undefined', () => {
      var playlist = playlistManager.findPlaylistByName('playlist0');
      assert.equal(playlist, undefined);
    });

    test('if with playlist, return it', () => {
      var playlist = playlistManager.findPlaylistByName('playlist1');
      assert.equal(playlist.name, 'playlist1');
    });
  });

  suite('findPlaylistIndexById() >', () => {
    test('if without playlist, return -1', () => {
      var index = playlistManager.findPlaylistIndexById('id0');
      assert.equal(index, -1);
    });

    test('if with playlist, return its index', () => {
      var index = playlistManager.findPlaylistIndexById('id1');
      assert.equal(index, 0);
    });
  });

  suite('findPlaylistIndexByName() >', () => {
    test('if without playlist, return -1', () => {
      var index = playlistManager.findPlaylistIndexByName('playlist0');
      assert.equal(index, -1);
    });

    test('if with playlist, return its index', () => {
      var index = playlistManager.findPlaylistIndexByName('playlist1');
      assert.equal(index, 0);
    });
  });

  suite('renamePlaylistById() >', () => {
    test('if without playlist, then reject', (done) => {
      playlistManager.renamePlaylistById('id0', 'newPlaylist0').catch(() => {
        assert.ok(true);
      }).then(done, done);
    });

    test('if with playlist, then rename it', (done) => {
      playlistManager.renamePlaylistById('id1', 'newPlaylist1').then(() => {
        var playlist = playlistManager.findPlaylistByName('newPlaylist1');
        assert.equal(playlist.id, 'id1');
        assert.ok(playlistManager.emit.calledWith('renamed', playlist));
      }).then(done, done);
    });
  });

  suite('removePlaylistById() >', () => {
    test('if without playlist, then reject', (done) => {
      playlistManager.removePlaylistById('id0').catch(() => {
        assert.ok(true);
      }).then(done, done);
    });

    test('if with playlist, then remove it', (done) => {
      playlistManager.removePlaylistById('id1').then((removedPlaylist) => {
        assert.equal(playlistManager.playlists.length, 1);
        assert.ok(playlistManager.emit.calledWith('removed', removedPlaylist));
      }).then(done, done);
    });
  });

  suite('showPlaylistById() >', () => {
    test('if without playlist, do nothing', () => {
      playlistManager.showPlaylistById('id0');
      assert.isFalse(playlistManager.emit.calledWith('shown'));
    });

    test('if with playlist, do shown', () => {
      playlistManager.showPlaylistById('id1');

      var playlist = playlistManager.findPlaylistById('id1');
      assert.equal(playlistManager._activePlaylist, playlist);
      assert.ok(playlistManager._isDisplaying);
      assert.ok(playlistManager.emit.calledWith('shown', playlist));
    });
  });

  suite('hidePlaylist() >', () => {
    test('do hide playlist', () => {
      playlistManager.hidePlaylist();
      assert.equal(playlistManager._activePlaylist, null);
      assert.isFalse(playlistManager._isDisplaying);
      assert.ok(playlistManager.emit.calledWith('hidden'));
    });
  });

  suite('_addPlaylist() >', () => {
    test('if there is any playlist with the same name, then reject', (done) => {
      playlistManager._addPlaylist({
        id: 'id1',
        name: 'playlist1'
      }).catch(() => {
        assert.ok(true);
      }).then(done, done);
    });

    test('if there is no same-named playlist, then add it', (done) => {
      var rawPlaylist = {
        id: 'id3',
        name: 'playlist3'
      };

      playlistManager._addPlaylist(rawPlaylist).then((playlist) => {
        assert.equal(rawPlaylist.name, playlist.name);
        assert.ok(playlistManager.emit.calledWith('added', playlist));
      }).then(done, done);
    });
  });
});
