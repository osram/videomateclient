import React from 'react';
import videojs from 'video.js';
// The actual plugin function is exported by this module, but it is also
// attached to the `Player.prototype`; so, there is no need to assign it
// to a variable.
//import 'videojs-offset';

export default class VideoPlayer extends React.Component {
  componentDidMount() {
        // instantiate Video.js
        this.player = videojs(this.videoNode, this.props, function onPlayerReady() {
        console.log('onPlayerReady', this)
        });
        /*
        this.player.offset({
            start: 10,
            end: 15,
            restart_beginning: false //Should the video go to the beginning when it ends
        });
        */
    }

  // destroy player on unmount
  componentWillUnmount() {
    if (this.player) {
      this.player.dispose()
    }
  }

  getCurrentTime(){
      return this.player.currentTime();
  }

  seek(change){
      let currentTime = this.player.currentTime();
      
      this.player.currentTime(currentTime + change);
  }

  setSrc(location, type){
    this.player.src({type: type, src: location});
  }

  pause(){
      this.player.pause();
  }

  // wrap the player in a div with a `data-vjs-player` attribute
  // so videojs won't create additional wrapper in the DOM
  // see https://github.com/videojs/video.js/pull/3856
  render() {
    return (
      <div data-vjs-player>
        <video ref={ node => this.videoNode = node } className="video-js"></video>
      </div>
    )
  }

}

