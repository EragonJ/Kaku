import {
  clipboard as Clipboard,
  shell as Shell
} from 'electron';
import React, { Component } from 'react';
import L10nSpan from '../shared/l10n-span';
import Dialog from '../../modules/Dialog';
import Notifier from '../../modules/Notifier';
import AppCore from '../../../modules/AppCore';
import L10nManager from '../../../modules/L10nManager';

let _ = L10nManager.get.bind(L10nManager);

class AboutComponent extends Component {
  constructor() {
    super();
    this.thanksMessage = '';
  }

  _onFormSubmit(event) {
    event.preventDefault();
  }

  _onClickToShowBitcoinModal() {
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
  }

  _onClickToOpenPatreon() {
    Shell.openExternal('https://www.patreon.com/eragonj');
  }

  _onClickToOpenFacebook() {
    Shell.openExternal('http://facebook.com/kaku.rocks');
  }

  _onClickToOpenTwitter() {
    let link = '';
    link += 'https://twitter.com/intent/tweet?text=';
    link += 'I%20am%20listening%20music%20on%20Kaku%20!';
    link += '%20http%3A%2F%2Fkaku.rocks%20%23kaku_rocks%20';
    Shell.openExternal(link);
  }

  _onClickToOpenGithub() {
    Shell.openExternal('https://github.com/EragonJ/Kaku');
  }

  _onClickToOpenGithubIssues() {
    Shell.openExternal('https://github.com/EragonJ/Kaku/issues');
  }

  _onClickToOpenGitter() {
    Shell.openExternal('https://gitter.im/EragonJ/Kaku');
  }

  _onClickToOpenFacebookDM() {
    Shell.openExternal('https://www.facebook.com/messages/kaku.rocks');
  }

  _onClickToOpenQA() {
    Shell.openExternal('http://kaku.rocks/docs/');
  }

  _onClickToShowSpecialThanks() {
    let thanksMessage = this._getThanksMessage();
    let title = '<i class="fa fa-gift"></i> Thanks <i class="fa fa-gift"></i>';

    Dialog.alert({
      title: title,
      message: thanksMessage,
      className: 'special-thanks-modal'
    });
  }

  _getThanksMessage() {
    let thanksMessage = this.state.thanksMessage;

    if (thanksMessage !== '') {
      return thanksMessage;
    }
    else {
      let thanksInfo = AppCore.getInfoFromDataFolder('thanks.json');
      let author = [thanksInfo.author];
      let contributors = thanksInfo.contributors;
      let translators = thanksInfo.translators;
      let others = thanksInfo.others;

      thanksMessage += this._generateThanksHTML('Author', author);
      thanksMessage += this._generateThanksHTML('Contributors', contributors);
      thanksMessage += this._generateThanksHTML('Translators', translators);
      thanksMessage += this._generateThanksHTML('Awesome People', others);

      // save that into state
      this.setState({
        thanksMessage: thanksMessage
      });
    }
    return thanksMessage;
  }

  _generateThanksHTML(title, list) {
    let html = '';

    html += `<h1>${title}</h1>`;
    html += '<ul>';
    list.forEach((name) =>{
      html += [
        '<li>',
          name,
        '</li>'
      ].join('');
    });
    html += '</ul>';

    return html;
  }

  render() {
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
              <div className="col-sm-9">
                <button
                  className="btn btn-danger"
                  onClick={this._onClickToShowBitcoinModal}>
                    <i className="fa fa-btc"></i>
                    <L10nSpan l10nId="about_option_support_button_wording"/>
                </button>
                <button
                  className="btn btn-danger"
                  onClick={this._onClickToOpenPatreon}>
                    <i className="fa fa-credit-card"></i>
                    <L10nSpan l10nId="about_option_support_button_patreon_wording"/>
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="col-sm-3 control-label">
                <L10nSpan l10nId="about_option_facebook_intro"/>
              </label>
              <div className="col-sm-9">
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
              <div className="col-sm-9">
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
              <div className="col-sm-9">
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
              <div className="col-sm-9">
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
              <div className="col-sm-9">
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
              <div className="col-sm-9">
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
              <div className="col-sm-9">
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
              <div className="col-sm-9">
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
}

export default AboutComponent;
