const uuidv1 = require('uuid/v1');

export class Sequence{
    id = uuidv1();
    inPoint = 0.0;
    outPoint = 0.0;
    tags = [];
    issues = [];
    thumbNailImageUrl = "";
    toString(){
        JSON.stringify(this);
    }
}