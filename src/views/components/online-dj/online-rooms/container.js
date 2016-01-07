import React from 'react';
import ReactFireMixin from 'reactfire';
import Room from './room';
import Firebase from '../../../../modules/wrapper/Firebase';

let OnlineRooms = React.createClass({
  mixins: [ReactFireMixin],

  getInitialState: function() {
    return {
      onlineRooms: []
    };
  },

  componentWillMount: function() {
    let ref = Firebase.joinOnlineRoomsRoom();
    this.bindAsArray(ref, 'onlineRooms');
  },

  render: function() {
    // TODO
    // sort onlineRooms later
    let onlineRooms = this.state.onlineRooms;

    /* jshint ignore:start */
    return (
      <div className="online-rooms">
        {onlineRooms.map(function(room) {
          return <Room data={room}/>;
        })}
      </div>
    );
    /* jshint ignore:end */
  }
});

module.exports = OnlineRooms;
