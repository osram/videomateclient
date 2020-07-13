import React, { Component } from 'react';
import logo from '../yoda.jpg';
import '../App.css';
import { VideoFile } from '../model/VideoFile';
import { Sequence } from '../model/Sequence';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import hotkeys from 'hotkeys-js';
import elasticlunr from 'elasticlunr';
import VideoPlayer from './VideoPlayer.js'
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import Fade from '@material-ui/core/Fade';



import {
  apiFetchFolders,
  apiFetchFiles,
  apiSaveSearchIndex,
  apiFetchSearchIndex
} from '../services/fileapi';


const videoJsOptions = {
  autoplay: false,
  controls: true,
  sources: [],
  width:500
};

class Search extends Component {

  index = elasticlunr(function () {
    this.addField('tags');
    this.addField('issues');
    this.addField('folder');
    this.addField('status');
    this.setRef('id');
  });

  state = {
    availableFolders:[],
    processMessage:"",
    searchResult:[]
  }

  constructor(props) {
    super(props);
    var self = this;
    //this.generateIndex();
    console.log("Loading search index");
    apiFetchSearchIndex().then(result => {
      try {
        this.index = elasticlunr.Index.load(result.serverResponse);
      } catch (error) {
        console.log(error)
        return
      }
      console.log("Search index loaded");
      this.doSearch();
    });



    /*apiFetchSuggestions("tag").then(result => {
      var copy = this.state.suggestions;
      copy["tag"] = result.serverResponse;
      self.setState({"suggestions": copy});
    });
    apiFetchSuggestions("issue").then(result => {
      var copy = this.state.suggestions;
      copy["issue"] = result.serverResponse;
      self.setState({"suggestions": copy});
    });*/

  }

  doSearch(searchStr){
    if (!searchStr){
      let allDocs = this.index.documentStore.docs
      allDocs = Object.values(allDocs)
      this.setState({searchResult:allDocs});
      return
    }
    let matchedSequences = [];
    let result = this.index.search(searchStr) 
    result.map(item => {
      matchedSequences.push(this.index.documentStore.getDoc(item.ref));
    });
    this.setState({searchResult:matchedSequences});
  }

  generateIndex(){
    this.setState({processMessage:"Regenerating index"});
    apiFetchFolders().then(result => {
      this.setState({"availableFolders": result.serverResponse});
      this.forceUpdate();

      let foldersToProcess = this.state.availableFolders.slice(0);
      let self = this;
      self.index = elasticlunr()
      self.index.addField("tags")
      let promise = new Promise(function(resolv,reject){
        self.loadFoldersToIndex(foldersToProcess, resolv, reject);
      }).then(() => {
        apiSaveSearchIndex(self.index.toJSON());
        self.setState({processMessage:"Index generated"});
        this.doSearch("categorized");
      });
    });
  }

  loadFoldersToIndex(foldersToProcess, resolv, reject){
    if(foldersToProcess.length == 0){
      return resolv();
    }
    let folder = foldersToProcess[0];
    console.log("Loading folder " + folder + " to index");
    this.setState({processMessage:"processing folder " + folder});
    let self = this;
    apiFetchFiles(folder).then(result => {
      result.serverResponse.map(file => {
        let vf = new VideoFile(file);
        if(vf.status === "sequences_has_been_processed") {
          console.log("   Loading file to index " + vf.fileName);
          vf.sequences.forEach(sequence => {
            let doc = {
              "id":  sequence.id,
              "status": file.status,
              "folder": file.folder,
              "tags": sequence.tags,
              "issues": sequence.issues,
              "thumbNailImageUrl": sequence.thumbNailImageUrl,
              "length": sequence.outPoint - sequence.inPoint
            }
            self.index.addDoc(doc);
            console.log(self.index.documentStore.length);
          })
        }
      });
      return this.loadFoldersToIndex(foldersToProcess.slice(1), resolv, reject);
    });
  }

  render() {
    return (
      <div className="Search">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">VideoMate</h1>
          <p>- Helping you cut and organize with a little magic.</p>
        </header>

        <h1>Search</h1>
        <span>{this.state.processMessage}</span>
        <p>
          <input type="text" id="search" onChange={(e) => this.doSearch(e.target.value)}/>
          {/* <button>Search</button>  */}
          <button onClick={(e) => this.generateIndex()}>Regenerate searchindex</button>
        </p>

        <div className="columns">
          <div className="sequencesContainer">
            <h2>Search result</h2>
            <div className="itemBar sequencesBelongingToFile">
              { this.state.searchResult.map((sequence,i) =>
                <div key={i} className="item" onClick={(e) => this.setCurrentSequence(sequence)}>
                  <img src={sequence.thumbNailImageUrl} />
                  <span>Length:{Math.ceil(sequence.length)}s</span>
                </div>
              )}
            </div>
          </div>
          <div className="sequenceViewer">
            <VideoPlayer {...videoJsOptions} ref={(child) => { this.videoPlayer = child; }}/>
          </div>
        </div>
      </div>


    );
  }
}
export default Search;