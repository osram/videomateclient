import React from 'react';
import videojs from 'video.js';

//create a static reference for onPlayerTimeUpdate
let _VideoPlayer = null;

const onPlayerTimeUpdate = function (){
  if(_VideoPlayer.state.playingSequence && _VideoPlayer.getCurrentTime() >= _VideoPlayer.state.sequence.outPoint){
    _VideoPlayer.player.pause();
    _VideoPlayer.setState({sequence: null, playingSequence: false});
  }
  console.log(_VideoPlayer.getCurrentTime());
}

export default class VideoPlayer extends React.Component {
  state = {
    sequence: null,
    playingSequence: false
  }
  
  componentDidMount() {
      _VideoPlayer = this;
      this.player = videojs(this.videoNode, this.props, () => {
       // 
        this.player.on('timeupdate', onPlayerTimeUpdate);
        console.log('onPlayerReady')
      });
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

  setCurrentTime(time){
    this.player.currentTime(time);
  }

  seek(change){
      let currentTime = this.player.currentTime();
      this.player.currentTime(currentTime + change);
  }

  setSrc(location, type){
    this.player.children()[0].setAttribute('crossOrigin','anonymous');
    this.player.src({type: type, src: location});
  }

  tooglePlay(){
         
      if(this.player.paused()){
        this.player.play();
      }
      else{
        this.player.pause();
      }
  }

  playSequence(sequence){
    console.log("Playing sequence " + sequence.inPoint + " - " + sequence.outPoint);
    this.setState({sequence:sequence, playingSequence: true});
    this.player.currentTime(sequence.inPoint);
    this.player.play();
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

