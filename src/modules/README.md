# src/modules

In Kaku, `src/modules` would keep UI-free codes here. For each module, they should
mainly focus on **data** and should not interact with any UI.

## src/modules/backuper/*

Backuper is a module that can help users **sync data back** and **backup data out**.
For each module, we should at least implement `.backup()` and `.syncDataBack()`
two methods and they would be triggered by `BackuperManager` in UI.

** TODO:** add BackuperManager

## src/modules/searcher/*

Because Kaku is built on top of `youtube-dl`, so we should be able to search / download any
tracks from any online service it supports. Right now we do support `SoundCloud`,
`Vimeo` and `YouTube`.

If you want to add any additional searcher here, just follow the other file and make sure you
do implement `.search()` and it will be triggered by `Searcher.js`.

Reference: [Supported extractor in youtube-dl](https://github.com/rg3/youtube-dl/tree/master/youtube_dl/extractor)

## src/modules/AutoUpdater.js

We implemented a small auto updater which can help us fetch latest release (from Github) and compare its version with current version. If latest release has newer version, we will find out needed zip file for user's platfom (Windows, Linux ...).

## src/modules/BaseModule.js

**Should be deprecated.**

## src/modules/Constants.js

We will keep all neede constants here and let other modules use.

## src/modules/Database.js

Because we use pouchdb as our DB, this is just a wrapper with some customized methods.

## src/modules/Defer.js

This is a wrapped Promise to make it work like jQuery defer.

## src/modules/DownloadManager.js

In Kaku, we can let users download tracks, so we need this DownloadManager to control each download state and reflect its state to UI. In the future, we need to implement parallel downloads and cancel feature.

## src/modules/Dropbox.js

This is a wrapper for `node-dropbox`.

## src/modules/HistoryManager.js

We use this HistoryManager to store played tracks. But right now, it is not connected with database, so the history will be removed each time. We should make it stored in database in the future.

## src/modules/IniParser.js

Because our locale files are written in Ini format, we write our own parser to parse Ini file and return that as JavaScript object.

## src/modules/KakuCore.js

For global stuffs, we will keep them in KakuCore, but right now only use it to change our title.

## src/modules/L10nManager.js

L10nManager will read all locale files from `locales/` and use `IniParser` to parse these strings. After parsing, we would keep these locales (in Object) in its cache for later use.

## src/modules/NewsFetcher.js

This helps us fetch latest news from [our website](https://kaku.rocks/news.json) and let users know latest news.

## src/modules/PackageInfo.js

**Should be deprecated.**

## src/modules/PlaylistManger.js

PlaylistManager helps us handle CRUD actions for playlist.

## src/modules/PreferenceManager.js

This is a manager which builds on top of **localstorage** to keep users' preferences like language, searcher ... etc.

## src/modules/Searcher.js (Should be renamed to SearcherManager.js)

This is a manager which controls each searcher and search tracks for users. For more information, please check `Modules/Searcher/`

## src/modules/TopRanking.js

After doing some survey, we noticed that iTunes would provide latest TopRankings for different countries. In additin to this, these data are updated often. Please check [iTunes' data](https://rss.itunes.apple.com) for more information.

## src/modules/Tracker.js

This will leverage Google Analytics to help us track some useful data like which track is the most popular ... etc. With these data, we can make Kaku better in the future.

## src/modules/TrackInfoFetcher.js

This is where we use `youtube-dl` to help us get real information (like resource link) from online service (YouTube, Vimeo ... etc).
