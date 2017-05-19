import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import Track from './track/track';
import NoTrack from './track/no-track';
import L10nSpan from './l10n-span';
import ActionButton from './action-button';
import TrackModeButton from './track-mode-button';
import AddToPlayQueueButton from './add-to-play-queue-button';

class TracksComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      trackMode: 'square'
    };

    this._onTrackModeChange = this._onTrackModeChange.bind(this);
  }

  _onTrackModeChange(mode) {
    this.setState({
      trackMode: mode
    });
  }

  componentDidUpdate() {
    // Only rebuild the tooltip when we are under sqaure more
    // this can avoid manipulate DOM tree too much
    if (this.state.trackMode === 'square') {
      ReactTooltip.rebuild();
    }
  }

  render() {
    let {
      tracks,
      headerL10nId,
      headerWording,
      headerIconClass,
      controls,
      onDeleteAllClick,
      onPlayAllClick
    } = this.props;

    let trackMode = this.state.trackMode;
    let noTracks = (tracks.length === 0);

    // TODO
    // right now L10nSpan is just a span, we can extend it so that we can
    // also pass plain strings.
    let headerSpan;
    if (headerL10nId) {
      headerSpan = <L10nSpan l10nId={headerL10nId}/>;
    }
    else {
      headerSpan = <span>{headerWording}</span>;
    }

    let deleteAllButton;
    if (controls.deleteAllButton) {
      deleteAllButton =
        <ActionButton
          l10nId='history_clean_all'
          buttonClass='btn btn-default clean-button'
          iconClass='fa fa-fw fa-trash-o'
          isDisabled={noTracks}
          onClick={onDeleteAllClick} />
    }

    let trackModeButton;
    if (controls.trackModeButton) {
      trackModeButton =
        <TrackModeButton
          onTrackModeChange={this._onTrackModeChange}/>
    }

    let playAllButton;
    if (controls.playAllButton) {
      playAllButton =
        <ActionButton
          l10nId='component_play_all'
          buttonClass='btn btn-default playall-button'
          iconClass='fa fa-fw fa-play-circle'
          isDisabled={noTracks}
          onClick={onPlayAllClick} />
    }

    let addToPlayQueueButton;
    if (controls.addToPlayQueueButton) {
      addToPlayQueueButton =
        <AddToPlayQueueButton data={tracks}/>
    }

    let noTracksDiv;
    if (noTracks) {
      noTracksDiv = <NoTrack/>;
    }

    return (
      <div className="tracks-slot">
        <div className="header clearfix">
          <h1>
            <i className={headerIconClass}></i>
            {headerSpan}
          </h1>
          <div className="control-buttons">
            {trackModeButton}
            {addToPlayQueueButton}
            {deleteAllButton}
            {playAllButton}
          </div>
        </div>
        <div className="tracks-component">
          {noTracksDiv}
          {tracks.map(function(track, index) {
            return <Track key={index} data={track} mode={trackMode} index={index}/>;
          })}
        </div>
      </div>
    );
  }
}

TracksComponent.propTypes = {
  headerL10nId: PropTypes.string,
  headerWording: PropTypes.string,
  headerIconClass: PropTypes.string.isRequired,
  controls: PropTypes.object,
  tracks: PropTypes.array.isRequired,
  onDeleteAllClick: PropTypes.func,
  onPlayAllClick: PropTypes.func
};

TracksComponent.defaultProps = {
  headerL10nId: '',
  headerWording: '',
  headerIconClass: '',
  controls: {
    trackModeButton: true,
    playAllButton: true,
    addToPlayQueueButton: true,
    deleteAllButton: false
  },
  onDeleteAllClick: function() {},
  onPlayAllClick: function() {},
  tracks: []
};

module.exports = TracksComponent;
