# Kaku

![Kaku Icon](http://i.imgur.com/c3KKQ9t.png)

Kaku is an online music player which supports many differnt platform Like YouTube, Vimeo ... etc. With Kaku, you can easily listen to all kinds of music with just few simple clicks and don't need to leave this desktop application.

# Nice works !

Hi all, if you think this open source project does help you, please do support me if you can. With your help, I'll keep updating this project and adding more features as my dedicated side project :) :beers: :beers:

My bitcoin wallet : **1KtpFtaLW52tCe2VhWxCMHmRt8Mrxqj4WB**

# Download Links

We do support Windows, Mac OS X, Linux 32 and Linux 64, so please go check it :

https://github.com/EragonJ/Kaku/releases

# Latest Screenshot

![Latest Screenshot](http://i.imgur.com/RjSGvse.png)

![Latest Screenshot](http://i.imgur.com/9nrYuB9.jpg)

# Supported Streaming Platform

+ YouTube
+ Vimeo
+ SoundCloud
+ ... keep adding :)

# Supported Languages

+ 繁體中文 (沒錯，這個程式 Made in Taiwan XD)
+ 日本語
+ Portuguese
+ English
+ Français
+ Spanish
+ Русский
+ Türkçe
+ ... keep adding :)

# Build Status

[![Build Status](https://travis-ci.org/EragonJ/Kaku.svg?branch=master)](https://travis-ci.org/EragonJ/Kaku)
[![GitHub version](https://badge.fury.io/gh/EragonJ%2Fkaku.svg)](https://github.com/EragonJ/Kaku/releases)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/EragonJ/Kaku/blob/master/LICENSE)
[![Dependency Status](https://david-dm.org/EragonJ/kaku.svg)](https://david-dm.org/EragonJ/kaku)
[![devDependency Status](https://david-dm.org/EragonJ/kaku/dev-status.svg)](https://david-dm.org/EragonJ/kaku#info=devDependencies)

# Let's Talk !

We have a gitter chatting room and please feel free to join us and talk there :)

[![Join the chat at https://gitter.im/EragonJ/Kaku](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/EragonJ/Kaku?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

# Setup Environment

Because we use npm to maintain our third party libraries, you have to make sure before doing anything, these needed stuffs are all installed already.

1. `npm install`
2. `npm install electron-prebuilt@0.36.0 -g` - Install **electron** command

## Prerequistiques

**This is IMPORTANT, please read this**

Please take a look at `config/`, you will notice there are some files named like `api_config.*.json`, remember to update them with correct config and rename them to `api_config.production.json`, then everything should work as perfect !

In order to make sure others can join the development without worrying too much about this config, I just added `api_config.development.json` for you guys ! If you don't want to register these services by yourself and want to jump to develop directly, please just copy the file and rename to `api_config.production.json` then you are done !

## Make Production Build

We need to make sure all codes would be moved to the right place and generated the final entry point to reduce requests to load data, so you have to build first.

```bash
gulp build # without plaform argument, we will build Kaku based on your platform
```

or you can be more precise about which platform you are going to build like this :

```bash
gulp build --platform=mac # =linux32, =linux64, =windows, =win, =mac, =darwin are all valid
```

After that, you will get a solid application to run !

## How To Develop

### For Testers Who Want To Build Kaku And Give It A Try

This is for one-time tester, you can just directly build the clean Kaku and directly run
the code and see how it works.

```bash
gulp && electron .
```

### For Developers Who Need To Test Your Patches

You can use the command to create a daemon that would keep watching changes and rebuild
Kaku by webpack. After building, Kaku will be automatically reloaded and the changes would
be reflected on UI directly.

```bash
gulp watch
```

## How To Run Tests or Linter

For unit tests :

```bash
npm test
```

For linter :

```bash
gulp linter:all
```

# TODO / Issues

Moved all todos and issues to https://github.com/EragonJ/Kaku/issues, so if your are interested with them, please go check it there !

# What Tech We Use ?

## Still In Use

+ [Gulp](http://gulpjs.com/) - To build up our environment
+ [Electron](http://electron.atom.io) - Let us use web technology to build native app
+ [Bootstrap](http://getbootstrap.com/) - To boostrap the whole project including grid system ... etc
+ [FontAwesome](http://fortawesome.github.io/Font-Awesome/) - To make Kaku look nice
+ [jQuery](https://jquery.com/) - Bootstrap is based on jQuery
+ [React.js](http://reactjs.org/) - To help us break UI into small components
+ [Video.js](http://www.videojs.com/) - To help us control the player
+ [Babel](https://babeljs.io/) - To do some pre-transfrom process
+ [NPM](https://www.npmjs.org/) - To help us manage node modules resources
+ [Less](http://lesscss.org) - Make life better when writting CSS
+ [Pouchdb](http://pouchdb.com) - Our database to store trakcs
+ [Bootbox](http://bootboxjs.com) - To help us show dialogs based on Bootstrap
+ [Animate.css](https://daneden.github.io/animate.css/) - Animation matters
+ [Youtube-dl](https://github.com/rg3/youtube-dl/) - Download youtube tracks on the fly
+ [Webpack](http://webpack.github.io) - Module Bundler
+ [Firebase](https://www.firebase.com) - Make our app real-time !
+ ... still increasing :)

## Deprecated
+ [Bower](http://bower.io/) - To help us manage frontend resources
+ [Compass / SASS](http://compass-style.org/) - To help us write CSS easily
+ [NW.js](http://nwjs.io/) - (Moved to Electron)
+ [Require.js](http://requirejs.org/) - To help me make codes more structure
+ ... thanks for these old friends :)

# Special Thanks

Kaku's logo is designed by [Peko Chen](https://www.facebook.com/peko.chen), thanks for her support :)
