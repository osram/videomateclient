import React from 'react';
import ReactDOM from 'react-dom';
import { WithContext as ReactTags } from 'react-tag-input';
 
const KeyCodes = {
  comma: 188,
  enter: 13,
  TAB: 9
};
 
const delimiters = [KeyCodes.comma, KeyCodes.enter];
 
export default class TagEditor extends React.Component {
    constructor(props) {
        super(props);
        this.addTag = this.addTag.bind(this);
        this.removeTag = this.removeTag.bind(this);
        this.handleDrag = this.handleDrag.bind(this);
    }

    addTag(tag){
        tag.id = tag.id.toUpperCase().replace(' ','_');
        tag.text = tag.text.charAt(0).toUpperCase() + tag.text.slice(1);
        this.props.addTag(this.props.type, tag);
    }

    removeTag(idx){
        this.props.removeTag(this.props.type, idx);
    }
 
    handleDrag(tag, currPos, newPos) {
        const tags = [...this.state.tags];
        const newTags = tags.slice();
 
        newTags.splice(currPos, 1);
        newTags.splice(newPos, 0, tag);
 
        // re-render
        this.setState({ tags: newTags });
    }

    refocus(){
        console.log("focus");
    }
 
    render() {
        return (
            <div>
                <ReactTags tags={this.props.tags}
                    suggestions={this.props.suggestions}
                    handleDelete={this.remoteTag}
                    handleAddition={this.addTag}
                    handleDrag={this.handleDrag}
                    delimiters={delimiters}
                    autofocus={true}
                    handleInputBlur={this.refocus} />
            </div>
        )
    }
};