let Firebase = require('firebase');
let EventEmitter = require('events').EventEmitter;
let Constants = require('../Constants');

// We will keep all events in our internal variable
let events = new EventEmitter();

const ROOMS = {
  METADATA: 'metadata',
  ONLINE_ROOMS: 'onlineRooms',
  ONLINE_USERS: 'onlineUsers',
  PLAYED_TRACKS: 'playedTracks',
  COMMENTS: 'comments',
  COMMAND: 'command',
  SPECIAL_CONNECTED: '.info/connected'
};

Firebase.roomKey = '';
Firebase.metadata = {};
Firebase.userInfo = {};
Firebase.rooms = {};

// Firebase.setup('40e566e7-7767-4601-a1e1-2b12e620afcf');
Firebase.setup = function(roomKey, userInfo) {
  Firebase.roomKey = roomKey;
  Firebase.userInfo = userInfo;
  events.emit('setup', userInfo);
};

Firebase.setMetadata = function(metadata) {
  Firebase.metadata = metadata || {};
  events.emit('meatadata-updated', Firebase.metadata);
};

// How to use :
// let ref =  Firebase.join('comments');
Firebase.join = function(roomName) {
  let roomKey = Firebase.roomKey;
  if (roomKey) {
    let url = Constants.API.FIREBASE_URL + 'rooms';
    let ref = new Firebase(url + '/' + roomKey + '/' + roomName);
    events.emit('room-joined', roomName, ref);

    // keep the reference for later use
    Firebase.rooms[roomName] = ref;
    return ref;
  }
};

// This one is special !!!
// https://www.firebase.com/docs/web/guide/offline-capabilities.html
Firebase.joinConnectedRoom = function() {
  let url = Constants.API.FIREBASE_URL;
  let ref = new Firebase(url + '/' + ROOMS.SPECIAL_CONNECTED);
  events.emit('room-joined', 'connected', ref);

  // keep the reference for later use
  Firebase.rooms.connected = ref;
  return ref;
};

Firebase.joinOnlineRoomsRoom = function() {
  let url = Constants.API.FIREBASE_URL;
  let ref = new Firebase(url + '/' + ROOMS.ONLINE_ROOMS);
  events.emit('room-joined', 'onlineRooms', ref);

  // keep the reference for later use
  Firebase.rooms.onlineRooms = ref;
  return ref;
};

Firebase.joinOnlineUsersRoom = function() {
  let ref = Firebase.join(ROOMS.ONLINE_USERS);
  return ref;
};

Firebase.joinCommentsRoom = function() {
  let ref = Firebase.join(ROOMS.COMMENTS);
  return ref;
};

Firebase.joinMetadataRoom = function() {
  let ref = Firebase.join(ROOMS.METADATA);
  return ref;
};

Firebase.joinCommandRoom = function() {
  let ref = Firebase.join(ROOMS.COMMAND);
  return ref;
};

Firebase.joinPlayedTracksRoom = function() {
  let ref = Firebase.join(ROOMS.PLAYED_TRACKS);
  return ref;
};

Firebase.leaveAll = function() {
  let dontLeaveRooms = [
    ROOMS.ONLINE_ROOMS
  ];

  let rooms = Object.keys(Firebase.rooms).filter((roomName) => {
    return dontLeaveRooms.indexOf(roomName) === -1;
  });

  rooms.forEach((roomName) => {
    Firebase.leave(roomName);
  });

  // cleaned up cached data
  Firebase.roomKey = '';
  Firebase.metadata = {};
  Firebase.userInfo = {};
  events.emit('room-left-all');
};

Firebase.leave = function(roomName) {
  let options = Firebase.get(roomName);
  if (options) {
    events.emit('room-left', roomName, options);
    delete Firebase[roomName];
  }
};

Firebase.get = function(roomName) {
  let obj = Firebase.rooms[roomName];
  return obj;
};

Firebase.on = function(eventName, callback) {
  events.on(eventName, callback);
};

module.exports = Firebase;
