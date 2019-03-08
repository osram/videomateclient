import React, { Component } from 'react';
import logo from '../yoda.jpg';
import '../App.css';
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

class Search extends Component {
 
  state = {
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

  }
  render() {
    return (<h1>Search</h1>);
  }
}
export default Search;