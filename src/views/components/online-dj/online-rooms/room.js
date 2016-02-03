import React from 'react';

let Room = React.createClass({
  propTypes: {
    data: React.PropTypes.object.isRequired
  },

  render: function() {
    let data = this.props.data;
    let roomName = data.roomName || '';
    let roomAvatar = roomName.charAt(0).toUpperCase();

    return (
      <div className="online-room">
        <span className="avatar">{roomAvatar}</span>
      </div>
    );
  }
});

module.exports = Room;
