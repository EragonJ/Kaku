# Kaku
The next generation music client

# Latest Screenshot

![Latest Screenshot](http://i.imgur.com/EA2T6YL.jpg)

# Setup environment

Because we use bower & npm to maintain our third party libraries, you have to make sure before doing anything, these needed stuffs are all installed already.

```bash
bower install
npm install
```

## Make production build

We need to make sure all codes would be moved to the right place and generated the final entry point to reduce requests to load data, so you have to build first.

```bash
gulp build
```

After that, you will get a solid application to run !

## How to develop

In order to speed up development pace, we won't do too much building tasks in this phase. All we do is to watch all folders and see what files are changed and trigger browser to reload.

But no matter how, please remember to run following command first to make sure we create all needed temporary files first.

```bash
gulp
```

After that, you need to open a terminal session and watch changes in files :

```bash
gulp watch
```

then run Kaku :

```bash
nw .
```

**Notes**

If you are using your local `nw.js` to test Kaku, please remember to copy needed **ffmpegsumo** from `miscs/` to your nw.js by following the official article here - http://goo.gl/h1zQ4W

# What tech we use ?

1. [Gulp](http://gulpjs.com/) - To build up our environment
2. [NW.js](http://nwjs.io/) - Let us use web technology to build native app
3. [Compass / SASS](http://compass-style.org/) - To help us write CSS easily
4. [Bower](http://bower.io/) - To help us manage frontend resources
5. [Require.js](http://requirejs.org/) - To help me make codes more structure
6. [Bootstrap](http://getbootstrap.com/) - To boostrap the whole project including grid system ... etc
7. [FontAwesome](http://fortawesome.github.io/Font-Awesome/) - To make Kaku look nice
8. [jQuery](https://jquery.com/) - Bootstrap is based on jQuery
9. [React.js](http://reactjs.org/) - To help us break UI into small components
10. [Video.js](http://www.videojs.com/) - To help us control the player
11. [Babel](https://babeljs.io/) - To do some pre-transfrom process
12. [NPM](https://www.npmjs.org/) - To help us manage node modules resources
13. ... still increasing :)

# TODO

+ Add playlist feature
+ Add node-webkit updator
+ Add settings page to make sure users can change their streaming platform
+ Add i18n support
+ Fixed related UI
+ [Done] Make tracks in Top Rankings playable
+ [Done] Remember to write a installer to package all needed codec based on this article - https://github.com/nwjs/nw.js/wiki/Using-MP3-&-MP4-%28H.264%29-using-the--video--&--audio--tags.
