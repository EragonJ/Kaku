suite('HistoryManager', () => {
  'use strict';

  var historyManager;
  var fakeTrack = {};
  var sandbox;

  setup((done) => {
    sandbox = sinon.sandbox.create();
    testRequire(['backend/modules/HistoryManager'], {}, (HistoryManager) => {
      fakeTrack = {};
      historyManager = HistoryManager;
      // beacuse this is singleton, we have to cleanup by ourselves
      historyManager.clean();
      sandbox.stub(historyManager, 'emit');
      done();
    });
  });
  
  teardown(() => {
    sandbox.restore();
  });

  suite('add() >', () => {
    test('if without the same track, then add it', () => {
      historyManager.add(fakeTrack);
      assert.ok(historyManager._hasTrack(fakeTrack));
      assert.ok(historyManager.emit.calledWith('history-updated'));
    });

    test('if with the same track, do nothing', () => {
      historyManager._tracks.push(fakeTrack);
      historyManager.add(fakeTrack);
      assert.equal(historyManager.tracks.length, 1);
      assert.isFalse(historyManager.emit.calledWith('history-updated'));
    });
  });

  suite('remove() >', () => {
    test('if with the same track, then remove it', () => {
      historyManager.add(fakeTrack);
      historyManager.remove(fakeTrack);
      assert.equal(historyManager.tracks.length, 0);
      assert.ok(historyManager.emit.calledWith('history-updated'));
    });

    test('if without the same track, do nothing', () => {
      historyManager.remove(fakeTrack);
      assert.isFalse(historyManager.emit.calledWith('history-updated'));
    });
  });

  suite('clean() >', () => {
    test('do cleanup all internal tracks', () => {
      historyManager._tracks.push(fakeTrack);
      historyManager._tracks.push(fakeTrack);

      historyManager.clean();
      assert.equal(historyManager.tracks.length, 0);
        assert.ok(historyManager.emit.calledWith('history-updated',
          historyManager.tracks));
    });
  });
});
