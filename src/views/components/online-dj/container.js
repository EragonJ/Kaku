import React from 'react';
import Moment from 'moment';
import L10nSpan from '../shared/l10n-span';
import ChooseRolePage from './choose-role-page';
import DashboardPage from './dashboard-page';
import Firebase from '../../../modules/wrapper/Firebase';

const MAX_PAGE_COUNT = 2;

let OnlineDJContainer = React.createClass({
  getInitialState: function() {
    return {
      page: 0,
      userInfo: {},
      roomInOnlineRoomsRef: null
    };
  },

  componentDidMount: function() {

  },

  _onRoleChoose: function(userInfo) {
    this.setState({
      userInfo: userInfo
    });

    // TODO
    // we need to change userInfo to make it cleaner later.
    //
    // {
    //   role: 'xxx',
    //   userName: 'xxx',
    //   roomName: 'yyy',
    //   roomKey: 'zzz',
    //   isPrivate: true
    // }
    Firebase.setup(userInfo.roomKey, userInfo);

    let ref = Firebase.joinMetadataRoom();

    if (userInfo.role === 'dj') {
      let metadata = {
        roomName: userInfo.roomName,
        roomKey: userInfo.roomKey,
        isPrivate: userInfo.isPrivate,
        createdAt: Moment.utc().format()
      };

      // If the room is not private, then we'll store it in our onlineRooms list
      // to let everyone access
      if (!userInfo.isPrivate) {
        let onlineRoomsRef = Firebase.joinOnlineRoomsRoom();
        let roomInOnlineRoomsRef = onlineRoomsRef.push();
        roomInOnlineRoomsRef.set(metadata);

        // keep that for leaveAll use
        this.setState({
          roomInOnlineRoomsRef: roomInOnlineRoomsRef
        });
      }

      Firebase.setMetadata(metadata);
      ref.set(metadata);
    }
    else {
      ref.on('value', (snapshot) => {
        Firebase.setMetadata(snapshot.val());
      });
    }
    this._changeToPage(1);
  },

  _onLeft: function() {
    Firebase.leaveAll();

    if (this.state.roomInOnlineRoomsRef) {
      this.state.roomInOnlineRoomsRef.remove();
    }

    this._changeToPage(0);
  },

  _changeToPage: function(page) {
    page = Math.max(0, Math.min(page, MAX_PAGE_COUNT - 1));

    this.setState({
      page: page
    });
  },

  render: function() {
    /* jshint ignore:start */
    let page = this.state.page;
    let userInfo = this.state.userInfo;
    let renderedElement;

    return (
      <div className="online-dj-slot" data-page={page}>
        <div className="header clearfix">
          <h1>
            <i className="fa fa-fw fa-hand-peace-o"></i>
            <L10nSpan l10nId="online_dj_header"/>
          </h1>
        </div>
        <div>
          <ChooseRolePage onRoleChoose={this._onRoleChoose}/>
          <DashboardPage userInfo={userInfo} onLeft={this._onLeft}/>
        </div>
      </div>
    );
    /* jshint ignore:end */
  }
});

module.exports = OnlineDJContainer;
