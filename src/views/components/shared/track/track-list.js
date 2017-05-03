import React from 'react';

class TrackList extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
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
  }
}

module.exports = TrackList;
