var Electron = require('electron');
var Clipboard = Electron.clipboard;
var Shell = require('shell');
var React = require('react');
var L10nSpan = require('../shared/l10n-span');
var Dialog = require('../../modules/Dialog');
var Notifier = require('../../modules/Notifier');
var AppCore = require('../../../modules/AppCore');
var L10nManager = require('../../../modules/L10nManager');
var _ = L10nManager.get.bind(L10nManager);

var AboutComponent = React.createClass({
  getInitialState: function() {
    return {
      thanksMessage: ''
    };
  },

  _onFormSubmit: function(event) {
    event.preventDefault();
  },

  _onClickToSuppportUs: function() {
    let title = _('about_option_support_wallet_address');
    let walletAddress = '1KtpFtaLW52tCe2VhWxCMHmRt8Mrxqj4WB';

    Dialog.confirm({
      title: title,
      message: walletAddress,
      callback: (result) => {
        if (result) {
          Clipboard.writeText(walletAddress);
          Notifier.alert(
            _('about_option_support_click_to_copy_wallet_address_alert'));
        }
      },
      buttons: {
        confirm: {
          label: _('about_option_support_copy_wallet_address')
        }
      }
    });
  },

  _onClickToOpenFacebook: function() {
    Shell.openExternal('http://facebook.com/kaku.rocks');
  },

  _onClickToOpenTwitter: function() {
    var link = '';
    link += 'https://twitter.com/intent/tweet?text=';
    link += 'I%20am%20listening%20music%20on%20Kaku%20!';
    link += '%20http%3A%2F%2Fkaku.rocks%20%23kaku_rocks%20';
    Shell.openExternal(link);
  },

  _onClickToOpenGithub: function() {
    Shell.openExternal('https://github.com/EragonJ/Kaku');
  },

  _onClickToOpenGithubIssues: function() {
    Shell.openExternal('https://github.com/EragonJ/Kaku/issues');
  },

  _onClickToOpenGitter: function() {
    Shell.openExternal('https://gitter.im/EragonJ/Kaku');
  },

  _onClickToOpenFacebookDM: function() {
    Shell.openExternal('https://www.facebook.com/messages/kaku.rocks');
  },

  _onClickToOpenQA: function() {
    Shell.openExternal('http://kaku.rocks/docs/');
  },

  _onClickToShowSpecialThanks: function() {
    let thanksMessage = this._getThanksMessage();
    let title = '<i class="fa fa-gift"></i> Thanks <i class="fa fa-gift"></i>';

    Dialog.alert({
      title: title,
      message: thanksMessage,
      className: 'special-thanks-modal'
    });
  },

  _getThanksMessage: function() {
    let thanksMessage = this.state.thanksMessage;

    if (thanksMessage !== '') {
      return thanksMessage;
    }
    else {
      let thanksInfo = AppCore.getInfoFromDataFolder('thanks.json');
      let people = thanksInfo.people;

      thanksMessage += '<ul>';
      people.forEach((name) =>{
        thanksMessage += [
          '<li>',
            name,
          '</li>'
        ].join('');
      });
      thanksMessage += '</ul>';
      // save that into state
      this.setState({
        thanksMessage: thanksMessage
      });
    }
    return thanksMessage;
  },

  render: function() {
    /* jshint ignore:start */
    return (
      <div className="about-slot">
        <div className="header clearfix">
          <h1>
            <i className="fa fa-fw fa-info"></i>
            <L10nSpan l10nId="about_header"/>
          </h1>
        </div>
        <div className="about-component">
          <p className="well">
            <L10nSpan l10nId="about_intro"/>
          </p>
          <form className="form-horizontal" onSubmit={this._onFormSubmit}>
            <div className="form-group">
              <label className="col-sm-3 control-label">
                <L10nSpan l10nId="about_option_support_intro"/>
              </label>
              <div className="col-sm-3">
                <button
                  className="btn btn-danger"
                  onClick={this._onClickToSuppportUs}>
                    <i className="fa fa-credit-card"></i>
                    <L10nSpan l10nId="about_option_support_button_wording"/>
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="col-sm-3 control-label">
                <L10nSpan l10nId="about_option_facebook_intro"/>
              </label>
              <div className="col-sm-3">
                <button
                  className="btn btn-primary"
                  onClick={this._onClickToOpenFacebook}>
                    <i className="fa fa-facebook-official"></i>
                    <L10nSpan l10nId="about_option_facebook_button_wording"/>
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="col-sm-3 control-label">
                <L10nSpan l10nId="about_option_twitter_intro"/>
              </label>
              <div className="col-sm-3">
                <button
                  className="btn btn-info"
                  onClick={this._onClickToOpenTwitter}>
                    <i className="fa fa-twitter"></i>
                    <L10nSpan l10nId="about_option_twitter_button_wording"/>
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="col-sm-3 control-label">
                <L10nSpan l10nId="about_option_github_intro"/>
              </label>
              <div className="col-sm-3">
                <button
                  className="btn btn-success"
                  onClick={this._onClickToOpenGithub}>
                    <i className="fa fa-github-alt"></i>
                    <L10nSpan l10nId="about_option_github_button_wording"/>
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="col-sm-3 control-label">
                <L10nSpan l10nId="about_option_bug_intro"/>
              </label>
              <div className="col-sm-3">
                <button
                  className="btn btn-warning"
                  onClick={this._onClickToOpenGithubIssues}>
                    <i className="fa fa-bug"></i>
                    <L10nSpan l10nId="about_option_bug_button_wording"/>
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="col-sm-3 control-label">
                <L10nSpan l10nId="about_option_special_thanks_intro"/>
              </label>
              <div className="col-sm-3">
                <button
                  className="btn btn-default"
                  onClick={this._onClickToShowSpecialThanks}>
                    <i className="fa fa-gift"></i>
                    <L10nSpan l10nId="about_option_special_thanks_button_wording"/>
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="col-sm-3 control-label">
                <L10nSpan l10nId="about_option_comment_intro"/>
              </label>
              <div className="col-sm-3">
                <button
                  className="btn btn-default"
                  onClick={this._onClickToOpenGitter}>
                    <i className="fa fa-comments-o"></i>
                    <L10nSpan l10nId="about_option_comment_button_wording"/>
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="col-sm-3 control-label">
                <L10nSpan l10nId="about_option_facebook_dm_intro"/>
              </label>
              <div className="col-sm-3">
                <button
                  className="btn btn-default"
                  onClick={this._onClickToOpenFacebookDM}>
                    <i className="fa fa-comments-o"></i>
                    <L10nSpan l10nId="about_option_facebook_dm_button_wording"/>
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="col-sm-3 control-label">
                <L10nSpan l10nId="about_option_qa_intro"/>
              </label>
              <div className="col-sm-3">
                <button
                  className="btn btn-default"
                  onClick={this._onClickToOpenQA}>
                    <i className="fa fa-info-circle"></i>
                    <L10nSpan l10nId="about_option_qa_button_wording"/>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
    /* jshint ignore:end */
  }
});

module.exports = AboutComponent;
