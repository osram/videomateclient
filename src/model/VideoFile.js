import { Sequence } from "./Sequence";

export class VideoFile{
    
    comment = "";
    exposureRequiresAdjustment = false;
    framerate = 30;
    location = "";
    resolution = "";
    rotationRequiresAdjustment = false;
    sequences = new Map();
    status = ""
    type = "";

    constructor(json){
        if(json){
            this.comment = json.comment;
            this.exposureRequiresAdjustment = json.exposureRequiresAdjustment;
            this.framerate = json.framerate;
            this.location = json.location;
            this.resolution = json.resolution;
            this.rotationRequiresAdjustment = json.rotationRequiresAdjustment;
            
            //Remapp the array of sequences to an map
            if(json.sequences != null){
                json.sequences.map(sequence => {
                    this.sequences.set(sequence.id, sequence);
                });
            }
            else{
                this.sequences = new Map()
            }
            
            this.status = json.status;
            this.type = json.type;
        }
    }

    addSequence(sequence){
        this.sequences.set(sequence.id, sequence);
        console.log(this);
    }

    toString(){
        return JSON.stringify(this);
    }
}