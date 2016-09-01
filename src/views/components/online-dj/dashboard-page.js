import React from 'react';
import Firebase from 'firebase';
import { Clipboard } from 'electron';
import ReactFireMixin from 'reactfire';
import Track from '../shared/track/track';
import L10nSpan from '../shared/l10n-span';
import Notifier from '../../modules/Notifier';
import ActionButton from '../shared/action-button';
import Constants from '../../../modules/Constants';
import L10nManager from '../../../modules/L10nManager';
import BaseTrack from 'kaku-core/models/track/BaseTrack';

let DashboardPage = React.createClass({
  mixins: [ReactFireMixin],

  propTypes: {
    userInfo: React.PropTypes.object.isRequired,
    onLeft: React.PropTypes.func.isRequired
  },

  getDefaultProps: function() {
    return {
      userInfo: {},
      onLeft: function() {}
    };
  },

  getInitialState: function() {
    return {
      playedTracks: []
    };
  },

  componentWillMount: function() {
    Firebase.on('setup', () => {
      let playedTracksRef = Firebase.joinPlayedTracksRoom();
      this.bindAsArray(playedTracksRef, 'playedTracks');
    });

    Firebase.on('room-left', (roomName) => {
      if ('playedTracks' === roomName) {
        this.unbind('playedTracks');
      }
    });
  },

  _onClickToCopy: function() {
    let node = this.refs['room-key'];
    let key = node.value;
    Clipboard.writeText(key);
    Notifier.alert(L10nManager.get('online_dj_dashboard_click_to_copy_key'));
  },

  render: function() {
    let userInfo = this.props.userInfo;
    let role = userInfo.role;
    let roomKey = userInfo.roomKey;
    let playedTracks = this.state.playedTracks || [];
    playedTracks = playedTracks.map((rawTrackInfo) => {
      return BaseTrack.fromJSON(rawTrackInfo);
    });

    // TODO
    // we can't use [].reverse() here, weird ! This may be the bug in
    // ReactFire
    let finalTracks = [];
    for (let i = 0, len = playedTracks.length; i < len; i++) {
      finalTracks[i] = playedTracks[len - 1 - i];
    }

    /* jshint ignore:start */
    return (
      <div className="dashboard-page">
        <form className="form-inline">
          <div className="form-group">
            <label>
              <span><i className="fa fa-fw fa-user"></i></span>
              <L10nSpan l10nId="online_dj_dashboard_your_name"/>
            </label>
            <input
              type="text"
              className="form-control user-name"
              readOnly
              value={userInfo.userName}></input>
          </div>
          <div className="form-group">
            <label>
              <span><i className="fa fa-fw fa-key"></i></span>
              <L10nSpan l10nId="online_dj_dashboard_room_key"/>
            </label>
            <input
              type="text"
              className="form-control room-key"
              readOnly
              ref="room-key"
              value={roomKey}></input>
          </div>
          <ActionButton
            buttonClass="btn btn-primary"
            iconClass="fa fa-fw fa-clipboard"
            onClick={this._onClickToCopy}></ActionButton>
          <ActionButton
            buttonClass="btn btn-danger"
            iconClass="fa fa-fw fa-sign-out"
            wording="Leave this room"
            onClick={this.props.onLeft}></ActionButton>
        </form>
        <div className="tracks-component">
          {finalTracks.map(function(track, index) {
            return <Track key={index} data={track} mode="square"/>;
          })}
        </div>
      </div>
    );
    /* jshint ignore:end */
  }
});

module.exports = DashboardPage;
