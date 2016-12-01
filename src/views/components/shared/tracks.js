import React from 'react';
import ReactTooltip from 'react-tooltip';
import Track from './track/track';
import NoTrack from './track/no-track';
import L10nSpan from './l10n-span';
import ActionButton from './action-button';
import TrackModeButton from './track-mode-button';
import PlayAllButton from './playall-button';
import AddToPlayQueueButton from './add-to-play-queue-button';

var TracksComponent = React.createClass({
  propTypes: {
    headerL10nId: React.PropTypes.string,
    headerWording: React.PropTypes.string,
    headerIconClass: React.PropTypes.string.isRequired,
    controls: React.PropTypes.object,
    tracks: React.PropTypes.array.isRequired,
    onDeleteAllClick: React.PropTypes.func,
  },

  getDefaultProps: function() {
    return {
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
      tracks: []
    };
  },

  getInitialState: function() {
    return {
      trackMode: 'square'
    };
  },

  _onTrackModeChange: function(mode) {
    this.setState({
      trackMode: mode
    });
  },

  componentDidUpdate: function() {
    // Only rebuild the tooltip when we are under sqaure more
    // this can avoid manipulate DOM tree too much
    if (this.state.trackMode === 'square') {
      ReactTooltip.rebuild();
    }
  },

  render: function() {
    /* jshint ignore:start */
    let {
      tracks,
      headerL10nId,
      headerWording,
      headerIconClass,
      controls,
      onDeleteAllClick
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

    // TODO
    // add deleteAllButton later
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
      playAllButton = <PlayAllButton data={tracks}/>
    }

    let addToPlayQueueButton;
    if (controls.addToPlayQueueButton) {
      addToPlayQueueButton = <AddToPlayQueueButton data={tracks}/>
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
    /* jshint ignore:end */
  }
});

module.exports = TracksComponent;
