import React, { Component } from 'react';
import logo from './yoda.jpg';
import './App.css';
import VideoPlayer from './VideoPlayer.js'
import TagEditor from './TagEditor.js'
import { VideoFile } from './model/VideoFile';
import { Sequence } from './model/Sequence';
//import Tags from 'react-material-tags';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import hotkeys from 'hotkeys-js';

/*
 * action types
 */

import {
  apiFetchFiles
} from './services/fileapi';


const sourceTags=[
  {label:"America"},
  {label:"Europe"},
  {label:"Africa"},
  {label:"Asia"},
  {label:"Australia"}
];

const defTags=[
  {label:"America"}
];

const videoJsOptions = {
  autoplay: false,
  controls: true,
  sources: [{
    src: './DJI_0839.mp4',
    type: 'video/mp4'
  }],
  width:500
}

class App extends Component {
  videoPlayer = null;
  state = {
      filesToProcess : [
        new VideoFile("http://192.168.137.151:81/videostorage/DJI_0465-small2.MP4", 'video/mp4'),
        new VideoFile("./DJI_0456.MP4", 'video/mp4'),
      ],
      currentSequence: new Sequence(),
      currentFile: new VideoFile()
  }

  updateFileListFromServer(){
    var self = this;
    apiFetchFiles().then(result => {
      let filesToProcess = []
      result.serverResponse.map(file => {
        filesToProcess.push(new VideoFile(file.location, 'video/mp4'));
      })
      self.setState({"filesToProcess":filesToProcess});
    });
    this.initHotKeys();
  }

  updateFileListState(newFileList){
    console.debug(newFileList);
  }

  markInPoint() { 
    this.state.currentSequence.inPoint = this.videoPlayer.getCurrentTime();
    console.log("setting in point at:" + this.state.currentSequence.inPoint);
  }

  markOutPoint() { 
    this.state.currentSequence.outPoint = this.videoPlayer.getCurrentTime();
    console.log("setting out point at:" + this.state.currentSequence.outPoint);
  }

  saveSequence(){
    console.log("Saving:" + JSON.stringify(this.state.currentSequence));
    var copy = this.state.currentFile;
    copy.addSequence(this.state.currentSequence);
    this.setState({currentFile: copy, currentSequence: new Sequence()})
    console.log("Saving:" + JSON.stringify(copy));
  }

  setCurrentSequence(sequence){
    this.setState({currentSequence: sequence});
    if(sequence.inPoint){
      this.videoPlayer.setCurrentTime(sequence.inPoint);
    }
  }

  setCurrentFile(file){
    this.setState({currentFile: file});
    this.videoPlayer.setSrc(file.location, file.type);
  }

  initHotKeys(){
    let self = this;
    hotkeys('up', function(event, handler){ 
      event.preventDefault() 
      self.markOutPoint("out");
    });
    hotkeys('down', function(event, handler){ 
      event.preventDefault() 
      self.markInPoint("in");
    });
    hotkeys('left', function(event, handler){ 
      event.preventDefault() 
      self.videoPlayer.seek(-0.5);
    });
    hotkeys('right', function(event, handler){ 
      event.preventDefault() 
      self.videoPlayer.seek(0.5);
    });
    hotkeys('space', function(event, handler){ 
      event.preventDefault() 
      self.videoPlayer.tooglePlay();
    });
    hotkeys('enter', function(event, handler){ 
      event.preventDefault() 
      self.saveSequence();
    });

    hotkeys('ctrl+space', function(event, handler){ 
      event.preventDefault() 
      self.videoPlayer.playSequence(self.state.currentSequence);
    });
  }

  render() {
    return (
      <MuiThemeProvider>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">VideoMate</h1>
          <p>- Helping you cut and organize with a lite magick.</p>
        </header>
        
        <h2>Files to process</h2>
        <button onClick={(e) => this.updateFileListFromServer()}>Update from server</button>
        <div className="itemBar filesToProcess">
          {this.state.filesToProcess.map((file) =>
            <div className="item" key={file.location} onClick={(e) => this.setCurrentFile(file)}><span>{file.location}</span></div>
          )}
        </div>
        <div className="videoContainer">
          <VideoPlayer {...videoJsOptions} ref={(child) => { this.videoPlayer = child; }}/>
          <i class="material-icons" onClick={(e) => this.markInPoint("in")}>arrow_downward</i>
          <i class="material-icons" onClick={(e) => this.markOutPoint("out")}>arrow_upward</i>
          <i class="material-icons" onClick={(e) => this.videoPlayer.seek(-1)}>skip_previous</i>
          <i class="material-icons" onClick={(e) => this.videoPlayer.tooglePlay()}>pause</i>
          <i class="material-icons" onClick={(e) => this.videoPlayer.seek(1)}>skip_next</i>
          <i class="material-icons" onClick={(e) => this.saveSequence()}>alarm_add</i>
         {/* <Tags defTags={defTags} sourceTags={sourceTags} />*/}
         <TagEditor></TagEditor>
        </div>
        <div className="sequencesContainer">
          <h2>Sequences beloning to {this.state.currentFile.location}</h2>  
          <div className="itemBar sequencesBelongingToFile">
            {this.state.currentFile.sequences.map((sequence, i) =>
              <div className="item" key={i} onClick={(e) => this.setCurrentSequence(sequence)}><span>{sequence.inPoint.toFixed(2)} - {sequence.outPoint.toFixed(2)}</span></div>
            )}
          </div>
        </div>
      </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
