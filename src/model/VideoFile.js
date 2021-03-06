
export class VideoFile{
    
    comment = "";
    exposureRequiresAdjustment = false;
    framerate = 30;
    folder = "";
    fileName = "";
    url = "";
    resolution = "";
    rotationRequiresAdjustment = false;
    sequences = new Map();
    status = ""
    type = "";
    thumbNailImageUrl = "";
    markedAsDeleted = false;
    

    constructor(json){
        if(json){
            this.comment = json.comment;
            this.exposureRequiresAdjustment = json.exposureRequiresAdjustment;
            this.framerate = json.framerate;
            this.folder = json.folder;
            this.fileName = json.fileName;
            this.url = json.url;
            this.resolution = json.resolution;
            this.rotationRequiresAdjustment = json.rotationRequiresAdjustment;
            this.thumbNailImageUrl = json.thumbNailImageUrl;
            this.markedAsDeleted = json.markedAsDeleted;
            
            //Remapp the array of sequences to an map
            if(json.sequences != null){
                json.sequences.forEach(sequence => {
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