import React, { Component } from 'react';
import logo from '../yoda.jpg';
import '../App.css';
import VideoPlayer from './VideoPlayer.js'
import TagEditor from './TagEditor.js'
import { VideoFile } from '../model/VideoFile';
import { Sequence } from '../model/Sequence';
//import Tags from 'react-material-tags';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import hotkeys from 'hotkeys-js';

/*
 * action types
 */

import {
  apiFetchFolders,
  apiFetchFiles,
  apiSaveVideoFile,
  apiSaveSuggestions,
  apiFetchSuggestions
} from '../services/fileapi';

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
  width:700
}

class Manager extends Component {
  videoPlayer = null;
  state = {
      availableFolders : [],
      currentFolder: "",
      filesToProcess : [],
      currentSequence: new Sequence(),
      currentFile: new VideoFile(),
      suggestions:{tag:[], issue:[]},
      filesToProcessFilter: "Not processed",
      saveInProgress: false
  }

  constructor(props) {
    super(props);
    var self = this;

    apiFetchFolders().then(result => {
      this.setState({"availableFolders": result.serverResponse});
      this.forceUpdate();
    });
    
    apiFetchSuggestions("tag").then(result => {
      var copy = this.state.suggestions;
      copy["tag"] = result.serverResponse;
      self.setState({"suggestions": copy});
    });
    apiFetchSuggestions("issue").then(result => {
      var copy = this.state.suggestions;
      copy["issue"] = result.serverResponse;
      self.setState({"suggestions": copy});
    });
    this.initHotKeys();
  }

  updateFileListFromServer(folder){
    var self = this;
    apiFetchFiles(folder).then(result => {
      let filesToProcess = [];
      result.serverResponse.forEach(file => {
        filesToProcess.push(new VideoFile(file));
      })
      self.setState({"filesToProcess":filesToProcess});
    });
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
    this.videoPlayer.setSrc(file.url, file.type);
    
    if(file.sequences.size === 0){
      let sequence = new Sequence();
      file.addSequence(sequence);
    }
    this.setState({currentFile: file});
    this.setCurrentSequence(file.sequences.values().next().value);   
  }

  addSuggestionToCurrentSequence(type, tag){
    if(!this.getSuggestion(type, tag.id)){
      this.state.suggestions[type].push(tag);
      apiSaveSuggestions(type, this.state.suggestions[type]).then(() => {console.log("suggestions saved")});
    }
    var copy = this.state.currentSequence;
    if(type === "tag"){
      copy.tags = [...this.state.currentSequence.tags, tag.id];
    }
    if(type === "issue"){
      copy.issues = [...this.state.currentSequence.issues, tag.id];
    }
    this.setState({currentSequence: copy});
  }

  removeSuggestionFromCurrentSequence(type, idx)
  {
    if(this.state.currentSequence)
    {
      if(type === "tag"){
        const { tags } = this.state.currentSequence;
        this.setState({
          currentSequence: {tags: tags.filter((tag, index) => index !== idx),}
        });
      }
      
      if(type === "issue"){
        const { issues } = this.state.currentSequence;
        this.setState({
          currentSequence: {ussues: issues.filter((tag, index) => index !== idx),}
        });
      }
    }
  }

  getSuggestion(type, id){
    console.log("mapping suggestion:" + type + "::" + id);
    return this.state.suggestions[type].find(suggestion => {
      return suggestion.id === id;
    });
  }

  getTagValues(type, tagIdArray){
    let tags = [];
    tagIdArray.forEach(tag => {
      tag = this.getSuggestion(type, tag)
      if(tag){
        tags.push(tag);
      }
    });
    return tags;
  }

  toogleVideoFileMarkedAsDeleted(){
    var copy = this.state.currentFile;
    copy.markedAsDeleted = !copy.markedAsDeleted;
    this.setState({currentFile:copy});
  }

  changeStatus(event){
    let copy = this.state.currentFile;
    copy.status = event.target.value;
    this.setState({currentFile: copy});
  }

  changeRating(event){
    let copy = this.state.currentSequence;
    copy.rating = event.target.value;
    this.setState({currentSequence: copy});
  }

  changeFilesToProcessFilter(event){
    this.setState({filesToProcessFilter: event.target.value});
  }

  shouldFileBeDisplayedInFilesToProcess(file){
    if(this.state.filesToProcessFilter === "Marked as deleted" && file.markedAsDeleted){
      return true;
    }
    if(this.state.filesToProcessFilter === "all"){
      return true;
    }
    if(this.state.filesToProcessFilter === "Not processed" && file.status === "Not processed" && !file.markedAsDeleted){
      return true;
    }
    else if(this.state.filesToProcessFilter === "categorized" && file.status === "categorized"){
      return true;
    }
    //sequences_has_been_processed
    return false;
  }

  changeCurrentFolder(event){
    if(event && event.target){
      let folder = event.target.value;
      this.setState({"currentFolder": folder});
      this.updateFileListFromServer(folder);
    }
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
      self.setState({"saveInProgress": true});
      apiSaveVideoFile(self.state.currentFile).then(result => {
        if(result.serverResponse === "Success"){
          self.setState({"saveInProgress": false});
          console.log("File saved");
        }
        else{
          alert("Failed to save!");
        }
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
    let totalNrOfFiles = this.state.filesToProcess.length;
    let filteredNrOfFile = 0;
    this.state.filesToProcess.forEach((file) => {
      if(this.shouldFileBeDisplayedInFilesToProcess(file)){
        filteredNrOfFile++;
      }
    })
    return (
      <MuiThemeProvider>
      <div className="Manager">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">VideoMate</h1>
          <p>- Helping you cut and organize with a lite magick.</p>
        </header>
        
        <h2>Files to process 
          <span> {filteredNrOfFile}/{totalNrOfFiles}</span>
          {this.state.saveInProgress ? " Saving" : ""}
        </h2>
        <span>Folder to display: 
          <select onChange={this.changeCurrentFolder.bind(this)}>
            {this.state.availableFolders.map((folder) => {
              return <option value={folder}>{folder}</option>
            })}
          </select>
          {/*<button onClick={(e) => this.updateFileListFromServer()}>Update from server</button>*/}
          Show only files with status:
          <select value={this.state.filesToProcessFilter} onChange={this.changeFilesToProcessFilter.bind(this)}>
            <option value="all">All files</option>
            <option value="Not processed">Not processed</option>
            <option value="categorized">Categorized</option> 
            <option value="Marked as deleted">Marked as deleted</option>    
          </select>
        </span>
        <div className="itemBar filesToProcess">
          <span></span>
          {this.state.filesToProcess.map((file) =>
            {
              return this.shouldFileBeDisplayedInFilesToProcess(file) ?
              (
                <div className="item" key={file.fileName} onClick={(e) => this.setCurrentFile(file)}>
                  <img src={file.thumbNailImageUrl} alt="thumbnail" />
                  <span>{file.fileName}</span>
                </div>
              ):''
            }
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
        </div>
        <div class="fileAttributes container">
         <h2>File attributes</h2>
         <span>
           Status:<select value={this.state.currentFile.status} onChange={this.changeStatus.bind(this)}>
             <option value="not_processed">Not Processed</option>
             <option value="categorized">Categorized</option>
             <option value="sequences_has_been_processed">Sequences has beed processed</option>
           </select><br/>
           <input name="markedAsDeleted" type="checkbox" checked={this.state.currentFile.markedAsDeleted} onChange={this.toogleVideoFileMarkedAsDeleted.bind(this)} />
           Mark file as deleted
         </span>
        </div>
        <div class="sequenceAttributes container">
          <h2>Sequence attributes</h2>
          <span>
            Rating:
            <select value={this.state.currentSequence.rating} onChange={this.changeRating.bind(this)}>
              <option value="">Choose rating of sequence</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
          </select>
         </span><br/>
         <span>Taggs:</span> <TagEditor type={"tag"} tags={this.getTagValues("tag", this.state.currentSequence.tags)} suggestions={this.state.suggestions.tag} addTag={this.addSuggestionToCurrentSequence.bind(this)} removeTag={this.removeSuggestionFromCurrentSequence}></TagEditor>
         <span>Technical issues:</span><TagEditor type={"issue"} tags={this.getTagValues("issue", this.state.currentSequence.issues)} suggestions={this.state.suggestions.issue} addTag={this.addSuggestionToCurrentSequence.bind(this)} removeTag={this.removeSuggestionFromCurrentSequence}></TagEditor>
        </div>
        
        <div className="sequencesContainer">
          <h2>Sequences beloning to {this.state.currentFile.fileName}</h2>  
          <div className="itemBar sequencesBelongingToFile">
            {[...this.state.currentFile.sequences.values()].map((sequence, i) =>
              <div className="item" key={i} onClick={(e) => this.setCurrentSequence(sequence)}>
                <img src={sequence.thumbNailImageUrl} alt="thumbnail" />
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

export default Manager;
