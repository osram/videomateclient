import React, { Component } from 'react';
import logo from '../yoda.jpg';
import '../App.css';
import { VideoFile } from '../model/VideoFile';
import { Sequence } from '../model/Sequence';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import hotkeys from 'hotkeys-js';
import elasticlunr from 'elasticlunr';

/*
 * action types
 */

import {
  apiFetchFolders,
  apiFetchFiles
} from '../services/fileapi';

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

    apiFetchFolders().then(result => {
      this.setState({"availableFolders": result.serverResponse});
      this.forceUpdate();
      this.generateIndex().then(() => {
        this.doSearch("categorized");
      });
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
      let matchedSequences = [];
      let result = this.index.search(searchStr);
      result.map(item => {
          matchedSequences.push(this.index.documentStore.getDoc(item.ref));
      });
      this.setState({searchResult:matchedSequences});
  }

  generateIndex(){
    this.setState({processMessage:"Regenerating index"});
    let foldersToProcess = this.state.availableFolders.slice(0);
    let self = this;
    return new Promise(function(resolv,reject){
        self.loadFoldersToIndex(foldersToProcess, resolv, reject);
    }).then(() => {
        self.setState({processMessage:"Index generated"});
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
            console.log("   Loading file to index " + vf.fileName);
            if(vf.status == "categorized"){
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
                })
            }
        });
        return this.loadFoldersToIndex(foldersToProcess.slice(1), resolv, reject);
    });
  }

  render() {
    return (
        <MuiThemeProvider>
        <div className="App">
            <h1>Search</h1>
            <span>{this.state.processMessage}</span>
            <p>
                <input type="text" id="search" onChange={(e) => this.doSearch(e.target.value)}/><button>Search</button>
            </p>
            <h2>Result</h2>
            <div className="sequencesContainer">
            <h2>Search result</h2>
                <div className="itemBar sequencesBelongingToFile">
                      { this.state.searchResult.map(sequence =>  
                        <div className="item" onClick={(e) => this.setCurrentSequence(sequence)}>
                          <img src={sequence.thumbNailImageUrl} />
                          <span>Length:{Math.ceil(sequence.length)}s</span>
                        </div>
                      )}
                </div>
            </div>
        </div>
        </MuiThemeProvider>
    );
  }
}
export default Search;