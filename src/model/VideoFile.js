import { Sequence } from "./Sequence";

export class VideoFile{
    location = "";
    type = "";
    framerate = 30;
    sequences = [];

    constructor(location, type){
        this.location = location;
        this.type = type
    }

    addSequence(sequence){
        this.sequences.push(sequence)
    }

    toString(){
        JSON.stringify(this);
    }
}