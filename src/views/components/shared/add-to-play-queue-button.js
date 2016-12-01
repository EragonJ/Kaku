import React, { Component } from 'react';
import L10nSpan from './l10n-span';
import Player from '../../modules/Player';

class AddToPlayQueueButton extends Component {
  constructor(props) {
    super(props);
  }

  _clickToAddToPlayQueue() {
    Player.addTracks(this.props.data);
  }

  render() {
    let isDiabled = (this.props.data.length === 0);

    return (
      <button
        className="add-to-play-queue-button btn btn-default"
        onClick={this._clickToAddToPlayQueue.bind(this)}
        disabled={isDiabled}>
          <i className="fa fa-fw fa-ellipsis-h"></i>
          <L10nSpan l10nId="component_add_to_play_queue"/>
      </button>
    );
  }
}

AddToPlayQueueButton.propTypes = {
  data: React.PropTypes.array.isRequired
};

AddToPlayQueueButton.getDefaultProps = {
  data: []
};

module.exports = AddToPlayQueueButton;
