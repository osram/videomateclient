import { Sequence } from "./Sequence";

export class VideoFile{
    location = "";
    type = "";
    framerate = 30;
    sequences = new Map();

    constructor(location, type){
        this.location = location;
        this.type = type
    }

    addSequence(sequence){
        this.sequences.set(sequence.id, sequence);
        console.log(this);
    }

    toString(){
        JSON.stringify(this);
    }
}