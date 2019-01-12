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
  apiFetchFiles,
  apiSaveVideoFile,
  apiSaveSuggestions,
  apiFetchSuggestions
} from './services/fileapi';

/*
const tags = [
  { id: "Thailand", text: "Thailand" },
  { id: "India", text: "India" }
];*/
/*
const suggestions= [
  { id: 'USA', text: 'USA' },
  { id: 'Germany', text: 'Germany' },
  { id: 'Austria', text: 'Austria' },
  { id: 'Costa Rica', text: 'Costa Rica' },
  { id: 'Sri Lanka', text: 'Sri Lanka' },
  { id: 'Thailand', text: 'Thailand' }
];
*/
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
      filesToProcess : [],
      currentSequence: new Sequence(),
      currentFile: new VideoFile(),
      suggestions:[]
  }

  updateFileListFromServer(){
    var self = this;
    apiFetchFiles().then(result => {
      let filesToProcess = []
      result.serverResponse.map(file => {
        filesToProcess.push(new VideoFile(file));
      })
      self.setState({"filesToProcess":filesToProcess});
    });
    apiFetchSuggestions().then(result => {
      self.setState({"suggestions": result.serverResponse});
    })
    this.initHotKeys();
  }

  updateFileListState(newFileList){
    console.debug(newFileList);
  }

  markInPoint() { 
    var copy = this.state.currentSequence;
    copy.thumbNailImageUrl = this.videoPlayer.captureFrame();
    copy.inPoint = this.videoPlayer.getCurrentTime();
    this.setState({currentSequence:copy});
    console.log("setting in point at:" + this.state.currentSequence.inPoint);
    console.log(this.state.currentSequence);
  }

  markOutPoint() { 
    var copy = this.state.currentSequence;
    copy.outPoint = this.videoPlayer.getCurrentTime();
    this.setState({currentSequence:copy});
    console.log("setting out point at:" + this.state.currentSequence.outPoint);
  }

  addNewSequence(){
    let copy = this.state.currentFile;
    let sequence = new Sequence();
    copy.addSequence(sequence);
    this.setState({currentFile: copy, currentSequence: sequence});
  }

  setCurrentSequence(sequence){
    this.setState({currentSequence: sequence});
    if(sequence.inPoint){
      this.videoPlayer.setCurrentTime(sequence.inPoint);
    }
    console.log(this.state.currentSequence);
  }

  setCurrentFile(file){
    this.setState({currentFile: file});
    this.videoPlayer.setSrc(file.url, file.type);
  }

  addTagToCurrentSequence(tag){
    if(!this.getSuggestion(tag.id)){
      this.state.suggestions.push(tag);
      apiSaveSuggestions(this.state.suggestions).then(() => {console.log("suggestions saved")});
    }
    var copy = this.state.currentSequence;
    copy.tags = [...this.state.currentSequence.tags, tag.id];
    this.setState({currentSequence: copy});
  }

  removeTagFromCurrentSequence(idx)
  {
    if(this.state.currentSequence)
    {
      const { tags } = this.state.currentSequence;
      this.setState({
        currentSequence: {tags: tags.filter((tag, index) => index !== idx),}});
      }
  }

  getSuggestion(id){
    return this.state.suggestions.find(suggestion => {
      return suggestion.id == id;
    });
  }

  getTagValues(tagIdArray){
    let tags = [];
    tagIdArray.map(tag => {
      tags.push(this.getSuggestion(tag));
    });
    return tags;
  }

  initHotKeys(){
    let self = this;
    hotkeys('up', function(event, handler){ 
      event.preventDefault();
      self.markOutPoint("out");
    });
    hotkeys('down', function(event, handler){ 
      event.preventDefault();
      self.markInPoint("in");
    });
    hotkeys('left', function(event, handler){ 
      event.preventDefault();
      self.videoPlayer.seek(-0.5);
    });
    hotkeys('right', function(event, handler){ 
      event.preventDefault();
      self.videoPlayer.seek(0.5);
    });
    hotkeys('space', function(event, handler){ 
      event.preventDefault();
      self.videoPlayer.tooglePlay();
    });
    /*hotkeys('enter', function(event, handler){ 
      event.preventDefault();
      self.saveSequence();
    });*/
    hotkeys('alt+s', function(event, handler){
      apiSaveVideoFile(self.state.currentFile).then(result => {
        console.log("File saved");
      });
    });

    hotkeys('ctrl+space', function(event, handler){ 
      event.preventDefault();
      self.videoPlayer.playSequence(self.state.currentSequence);
    });
    hotkeys('enter', function(event, handler){ 
      event.preventDefault();
      self.addNewSequence();
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
            <div className="item" key={file.fileName} onClick={(e) => this.setCurrentFile(file)}>
              <img src={file.thumbNailImageUrl} />
              <span>{file.fileName}</span>
            </div>
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
         <TagEditor tags={this.getTagValues(this.state.currentSequence.tags)} suggestions={this.state.suggestions} addTag={this.addTagToCurrentSequence.bind(this)} removeTag={this.removeTagFromCurrentSequence}></TagEditor>
        </div>
        <div className="sequencesContainer">
          <h2>Sequences beloning to {this.state.currentFile.fileName}</h2>  
          <div className="itemBar sequencesBelongingToFile">
            {[...this.state.currentFile.sequences.values()].map((sequence, i) =>
              <div className="item" key={i} onClick={(e) => this.setCurrentSequence(sequence)}>
                <img src={sequence.thumbNailImageUrl} />
                <span>{sequence.inPoint.toFixed(2)} - {sequence.outPoint.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
