import Constants from '../Constants';
import Youtube from 'youtube-node';

const youtube = new Youtube();
youtube.setKey(Constants.API.YOUTUBE_API_KEY);

module.exports = youtube;
