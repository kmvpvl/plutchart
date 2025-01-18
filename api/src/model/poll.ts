import { Types, Schema, model } from "mongoose";
import colours from "./colours";
import PlutchikError from "./error";
import MongoProto from "./mongoproto";

/**
 * 
 */

export interface IQuestion {
    id: number;
    sortIndex?: string;
    name: string;
    description: string;
    type: string; // radio or multi
    answerOptions: Array<IAnswerOption>;
}

export interface IAnswerOption {
    _id: Types.ObjectId;
    sortIndex?: string;
    name: string;
    description?: string;
    weight?: number;
}

export interface IPerson {
    _id?: Types.ObjectId;
    level0: string;
    level1: string;
    level2: string;
    created: Date;
}

interface IStructLevel {
    name: string;
    options?: Array<IStructLevel>;
}

export interface IPoll {
    _id: Types.ObjectId;
    name: string;
    description: string;
    questions: Array<IQuestion>;
    structure: IStructLevel[];
    created: Date;
    changed?: Date;
} 

interface IPollAssessment {
    _id?: Types.ObjectId; // uniq ID of assessment
    personid: Types.ObjectId; // user ID, required but may be undefined. userid posted by security schema of call
    pollid: Types.ObjectId;
    questionid: number;
    choosenoptions: IAnswerOption[];
    created?: Date;
}
export const PollSchema = new Schema({
    name: {type: String, required: true},
    description: {type: String, required: true},
    questions: {type: Array, required: true},
    structure: {type: Array, required: true},
    created: {type: Date, required: true},
    changed: {type: Date, required: false}
})

export const PersonSchema = new Schema({
    level0: {type: String, required: true},
    level1: {type: String, required: false},
    level2: {type: String, required: false},
    created: {type: Date, required: true},
    changed: {type: Date, required: false}
})

export const PollAssessmentSchema = new Schema({
    personid: {type: Types.ObjectId, required: true},
    pollid: {type: Types.ObjectId, required: true},
    questionid: {type: Number, required: true},
    choosenoptions: {type: Array, required: true},
    created: {type: Date, required: true}
});

export const mongoPollAssessments = model<IPollAssessment>('poll_assessments', PollAssessmentSchema);
export const mongoPollPersons = model<IPerson>('poll_persons', PersonSchema);
export const mongoPolls = model<IPoll>('polls', PollSchema);

export class Poll extends MongoProto<IPoll> {
    constructor(id?: Types.ObjectId, data?: IPoll){
        super(mongoPolls, id, data);
    }
}
export class Person extends MongoProto<IPerson> {
    constructor(id?: Types.ObjectId, data?: IPerson){
        super(mongoPollPersons, id, data);
    }
}
export class PollAssessment extends MongoProto<IPollAssessment> {
    constructor(id?: Types.ObjectId, data?: IPollAssessment){
        super(mongoPollAssessments, id, data);
    }
}