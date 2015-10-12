import React from 'react';
import ReactTooltip from 'react-tooltip';
import Track from './track/track';
import NoTrack from './track/no-track';
import L10nSpan from './l10n-span';
import ActionButton from './action-button';
import TrackModeButton from './track-mode-button';
import PlayAllButton from './playall-button';

class TracksContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      trackMode: 'square'
    };
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
          onTrackModeChange={this._onTrackModeChange.bind(this)}/>
    }

    let playAllButton;
    if (controls.playAllButton) {
      playAllButton = <PlayAllButton data={tracks}/>
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
            {deleteAllButton}
            {playAllButton}
          </div>
        </div>
        <div className="tracks-container">
          {noTracksDiv}
          {tracks.map(function(track, index) {
            return <Track key={index} data={track} mode={trackMode}/>;
          })}
        </div>
      </div>
    );
    /* jshint ignore:end */
  }
}

TracksContainer.propTypes = {
  headerL10nId: React.PropTypes.string,
  headerWording: React.PropTypes.string,
  headerIconClass: React.PropTypes.string.isRequired,
  controls: React.PropTypes.object,
  tracks: React.PropTypes.array.isRequired,
  onDeleteAllClick: React.PropTypes.func,
};

TracksContainer.defaultProps = {
  headerL10nId: '',
  headerWording: '',
  headerIconClass: '',
  controls: {
    trackModeButton: true,
    playAllButton: true,
    deleteAllButton: false
  },
  onDeleteAllClick: function() {},
  tracks: []
};

export default TracksContainer;
