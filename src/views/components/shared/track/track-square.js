import React from 'react';

class TrackSquare extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div
        data-tip={this.props.track.title}
        className={this.props.trackClassName}
        onClick={this.props.onClick}
        onContextMenu={this.props.onContextMenu}>
          <img src={this.props.track.covers.medium}/>
          <div className="ribbon">
            <i className={this.props.iconClassName}></i>
          </div>
          <div className="info">
            <div className="track-name">{this.props.track.title}</div>
            <div className="track-artist">{this.props.track.artist}</div>
          </div>
      </div>
    );
  }
}

module.exports = TrackSquare;
