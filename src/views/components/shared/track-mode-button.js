import React from 'react';
import ClassNames from 'classnames';
import PreferenceManager from '../../../modules/PreferenceManager';

const PREFERENCE_KEY = 'default.track.mode';

class TrackModeButton extends React.Component {
  constructor() {
    super();
    this.state = {
      mode: 'square'
    };
  }

  componentDidMount() {
    let mode = PreferenceManager.getPreference(PREFERENCE_KEY);
    if (mode) {
      this.setState({
        mode: mode
      });

      this.props.onTrackModeChange(mode);
    }

    PreferenceManager.on('preference-updated', (key, newMode) => {
      if (key === PREFERENCE_KEY) {
        this.setState({
          mode: newMode
        });
        this.props.onTrackModeChange(newMode);
      }
    });
  }

  _onClick(event) {
    let target = event.target;
    let newMode = target.dataset.mode;
    if (newMode !== this.state.mode) {
      PreferenceManager.setPreference(PREFERENCE_KEY, newMode);
    }
  }

  render() {
    /* jshint ignore:start */
    let mode = this.state.mode;

    let listButtonClass = ClassNames({
      'btn': true,
      'btn-default': true,
      'track-list-mode': true,
      'active': (mode === 'list')
    });

    let squareButtonClass = ClassNames({
      'btn': true,
      'btn-default': true,
      'track-square-mode': true,
      'active': (mode === 'square')
    });
    
    return (
      <div className="btn-group" role="group">
        <button
          type="button"
          className={listButtonClass}
          data-mode="list"
          onClick={this._onClick.bind(this)}>
            <i className="fa fa-fw fa-list"></i>
        </button>
        <button
          type="button"
          className={squareButtonClass}
          data-mode="square"
          onClick={this._onClick.bind(this)}>
            <i className="glyphicon glyphicon-th"></i>
        </button>
      </div>
    );
    /* jshint ignore:end */
  }
}

TrackModeButton.propTypes = {
  onTrackModeChange: React.PropTypes.func
};

TrackModeButton.defaultProps = {
  onTrackModeChange: function() {}
};

export default TrackModeButton;
