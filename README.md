# kaku
The next generation music client

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

After that, you can use nw.js to run Kaku.

```bash
nw .
```

## How to develop

In order to speed up development pace, we won't do too much building tasks in this phase. All we do is to watch all folders and see what files are changed and trigger browser to reload.

First, you need to open a terminal session and do :

```bash
gulp watch
```

then

```bash
nw .
```

# TODO

+ fixed related UI
+ Remember to write a installer to package all needed codec based on this article - https://github.com/nwjs/nw.js/wiki/Using-MP3-&-MP4-%28H.264%29-using-the--video--&--audio--tags.
