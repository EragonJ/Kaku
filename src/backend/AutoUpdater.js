define(function(require) {
  'use strict';

  var gui = requireNode('nw.gui');
  var Updater = requireNode('node-webkit-updater');
  var PackageInfo = require('backend/PackageInfo');

  var AutoUpdater = {
    run: function() {
      PackageInfo.get().then((packageInfo) => {
        var upd = new Updater(packageInfo);
        if (gui.App.argv.length) {
          // Step 5
          copyPath = gui.App.argv[0];
          execPath = gui.App.argv[1];

          // Replace old app,
          // and run updated app from original location and close temp instance
          upd.install(copyPath, (err) => {
            if (!err) {
              // Step 6
              upd.run(execPath, null);
              gui.App.quit();
            }
          });
        }
        else {
          // Step 1
          upd.checkNewVersion((error, newVersionExists, manifest) => {
            console.log(error);
            if (!error && newVersionExists) {
              var wantToUpdate = confirm(
                'we have a new release, do you want to update ?');
              if (wantToUpdate) {
                // Step 2
                upd.download((error, filename) => {
                  if (!error) {
                    // Step 3
                    upd.unpack(filename, (error, newAppPath) => {
                      if (!error) {
                        // Step 4
                        upd.runInstaller(newAppPath, [
                          upd.getAppPath(),
                          upd.getAppExec() 
                        ],{});
                        gui.App.quit();
                      }
                    }, manifest);
                  }
                }, manifest);
              }
            }
          });
        }
      });
    }
  };

  return AutoUpdater;
});
