let React = require('react');

let TrackList = React.createClass({
  render: function() {
    /* jshint ignore:start */
    return (
      <div
        className={this.props.trackClassName}
        onClick={this.props.onClick}
        onContextMenu={this.props.onContextMenu}>
          <i className={this.props.iconClassName}></i>
          <img src={this.props.track.covers.medium}/>
          <div className="track-artist">{this.props.track.artist}</div>
          <div className="track-name">{this.props.track.title}</div>
      </div>
    );
    /* jshint ignore:end */
  }
});

module.exports = TrackList;
