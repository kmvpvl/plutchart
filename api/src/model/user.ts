import { Mongoose, PipelineStage, Schema, Types, model } from "mongoose";
import { ContentGroup, IContent, mongoContent, mongoContentGroup, SourceType } from "./content";
import PlutchikError from "./error";
import ML from "./mlstring";
import Organization, { DEFAULT_SESSION_DURATION, IOrganization, ISessionToken, mongoOrgs, mongoSessionTokens } from "./organization";
import Assessment, { IEmotionVector, mongoAssessments } from "./assessment";
import TelegramBot from "node-telegram-bot-api";
import MongoProto from "./mongoproto";
import { randomInt } from "crypto";
import { Md5 } from "ts-md5";
import Match, { mongoMatches } from "./match";

export type RoleType = "supervisor"|"administrator"|"manage_users"|"manage_content"|"getting_match"|"assessment_request";
export enum GenderType {
    male = "male",
    female = "female",
    other = "other"
}

export interface IUserStats {
    userData: IUser;
    orgs: Array<IOrganization>;
    sutableTime?: Date;
    assessments: {
        count: number;
        last_created?: Date;
    }
    content: {
        count: number;
        last_created?: Date;
    }
    observeAssessments: IObserveAssessments;
}

export interface IAssignGroup {
    _id: Types.ObjectId;
    userid: Types.ObjectId;
    tguserid?: number;
    groupid: Types.ObjectId;
    assigndate: Date;
    acceptdecline?: boolean;
    closed: boolean;
    closedate?: Date;
}

export interface IAssignOrg {
  _id: Types.ObjectId;
  response_to_invitation: Types.ObjectId,
  tguserid: TelegramBot.ChatId;
  oid: Types.ObjectId;
  assigndate: Date;
  acceptdecline?: boolean;
  closed: boolean;
  closedate?: Date;
}

export interface IDatingSettings {
    readytomatch: boolean;
    lookingfor?: {
        gender?: GenderType;
        birthdateFrom?: Date;
        birthdateTo?: Date;
        atLeastAssessmentsCount?: number;
        commonAssessedContentItems?: number;
        locationDistance?:number;
        language?: string;
    }
}

interface IUserLocation {
    country?: string;
    coords?: {
        longitude: number;
        latitude: number;
    }
}

export interface IUser {
    _id?: Types.ObjectId;
    name?: string;
    tguserid: number;
    birthdate?: Date;
    birthdateapproximately?: boolean;
    nativelanguage?: string;
    secondlanguages?: Array<string>,
    location?: IUserLocation;
    gender?: GenderType;
    maritalstatus?: string;
    features?: string;
    assignedgroups?: Array<IAssignGroup>;
    assignedorgs?: Array<IAssignOrg>;
    studygroup?: string;
    datingsettings?: IDatingSettings;
    blocked: boolean;
    auth_code_hash?: string;
    created: Date;
    changed?: Date;
    awaitcommanddata?: string;
    ips?: Array<string>;
    support_staff?: boolean;
    history?: Array<any>;
}

interface IObserveAssessments {
    /// !!! must be re implemented
    vectors?: {
        my: IEmotionVector
        others: IEmotionVector
        delta: IEmotionVector
    }
    ownVector: IEmotionVector;
    othersVector: IEmotionVector;
}

export const UserSchema = new Schema({
    tguserid: {type: Number, require: true},
    name: {type: String, require: false},
    birthdate: {type: Date, require: false},
    birthdateapproximately: {type: Boolean, require: false},
    nativelanguage: {type: String, require: false},
    secondlanguages: {type: Array<string>, require: false},
    location: {type: Object, require: false},
    gender: {type: String, require: false},
    maritalstatus: {type: String, require: false},
    features: {type: String, require: false},
    datingsettings: {type: Object, require: false},
    assignedgroups: {type: Array, require: false},
    assignedorgs: {type: Array, require: false},
    awaitcommanddata: {type: String, require: false},
    auth_code_hash: {type: String, require: false},
    studygroup: {type: String, require: false},
    ips: {type: Array, require: false},
    blocked: Boolean,
    created: Date,
    changed: Date,
    history: Array<any>,
});
export const mongoUsers = model<IUser>('users', UserSchema);

export default class User extends MongoProto<IUser> {
    constructor(id?: Types.ObjectId, data?: IUser){
        super(mongoUsers, id, data);
    }
    /**
     * Blocks or unblocks the user
     * @param block - true if need to block of false overwise 
     */
    public async block(block: boolean = true) {
        await this.checkData();
        if (this.data) this.data.blocked = block;
        await this.save();
    }

    /**
     * Function check existing session token and increase its expired time
     * @param st session token
     * @param sessionminutes duration of session token
     * @returns list of roles on this session token
     */
    public async checkSessionToken(st?: Types.ObjectId, sessionminutes: number = DEFAULT_SESSION_DURATION): Promise<Types.ObjectId>{
        MongoProto.connectMongo();
        const nexpired = new Date(new Date().getTime() + sessionminutes * 60000);
        if (st) {
            const sts = await mongoSessionTokens.aggregate([{
                '$match': {
                    'useridref': this.id,
                    '_id': st,
                    'expired': {'$gte': new Date()}
                }
            }]);
            if (!sts.length) throw new PlutchikError("user:hasnoactivesession", `userid = '${this.id}'; sessiontoken = '${st}'`);
            if (sts[0].expired < nexpired) await mongoSessionTokens.findByIdAndUpdate(sts[0]._id, {expired:nexpired});
            console.log(`Session token updated: id = '${sts[0]._id}'; new expired = '${nexpired}'`);
            return st;
        } else {
            const ist: ISessionToken =  {
                _id: new Types.ObjectId,
                useridref: this.uid,
                expired: nexpired,
                created: new Date()
            };
            const st = await mongoSessionTokens.insertMany(ist);
            console.log(`New session token created: id = '${st[0]._id}'`);
            return st[0]._id;
        }
    }

    public async changeNativeLanguage(lang:string) {
        await this.checkData();
        if (this.data) this.data.nativelanguage = lang;
        await this.save();
    }

    public async setAge(age: number) {
        await this.checkData();
        if (this.data) {
            let d = new Date();
            d.setFullYear(d.getFullYear() - age);
            this.data.birthdate = d;
            this.data.birthdateapproximately = true;
        }
        await this.save();
    }

    public async setGender(gender?: GenderType) {
        await this.checkData();
        if (this.data) {
            this.data.gender = gender;
        }
        await this.save();
    }

    public async setName(name?: string) {
        await this.checkData();
        if (this.data) {
            this.data.name = name;
            if (undefined === name) delete this.data.name;
        }
        await this.save();
    }

    public async setLocation(location?: IUserLocation) {
        await this.checkData();
        if (this.data) {
            this.data.location = location;
            if (undefined === location) delete this.data.location;
        }
        await this.save();
    }

    public async noticeIP(ip?: string | string[]) {
        if (ip === undefined) return;
        await this.checkData();
        if (this.data) {
            if (this.data.ips === undefined) this.data.ips  = [];
            if (this.data.ips.findIndex(oldIP=>oldIP === ip) === -1) this.data.ips.push(ip instanceof Array?ip[0]:ip);
        }
        await this.save();
    }

    public async setStudyGroup(name?: string) {
        await this.checkData();
        if (this.data) {
            this.data.studygroup = name;
            if (undefined === name) delete this.data.studygroup;
        }
        await this.save();
    }

    public async setAwaitCommandData(cmd?: string) {
        await this.checkData();
        if (this.data) {
            this.data.awaitcommanddata = cmd;
            if (!cmd) delete this.data.awaitcommanddata;
        }
        await this.save();
    }


    public async deleteTgUser(){
        await this.checkData();
        if (this.data) {
            this.data.tguserid = -1;
        }
        await this.save();
    }

    public async nextContentItemByAssignOrg (oid: Types.ObjectId, assignid: Types.ObjectId, bot: TelegramBot): Promise<IContent> {
        MongoProto.connectMongo();
        const v = await mongoContent.aggregate([
            {'$match': {'organizationid': oid, 'blocked': false}
            }, {'$lookup': {
              'from': 'assessments', 
              'foreignField': 'cid', 
              'localField': '_id', 
              'pipeline': [{'$match': {'$expr': {'$eq': ['$assignid', assignid]}}}], 
              'as': 'result'}
            }, {'$match': {'result': []}
            }, {'$addFields': {'rand': {'$rand': {}}}
            }, {'$sort': {'rand': 1}
            }, {'$limit': 1 
            }, {'$project': {'result':0, 'rand': 0}
            }]);
        const org = new Organization(oid);
        await org.load();
        if (v.length === 0) {
            //let's close assignment of content grooup
            this.data?.assignedorgs?.forEach(el=>{if (el._id.equals(assignid)) el.closed = true; el.closedate = new Date()});
            await this.save();
            //let's notify all about finish of the assessment
            const c = this.data?.assignedorgs?.filter(el=>el._id.equals(assignid));
            if (c) bot.sendMessage(c[0].tguserid as number, `${ML("User")} ${this.json?.name?this.json?.name:""}(${this.json?.tguserid}) has done assessment of set '${org.json?.name}'`);
            await org.closeInvitation(assignid);
            throw new PlutchikError("user:nonextcontent", `userid = '${this.id}';assignid='${assignid}';oid='${oid}'`);
        }
        //let's mark content item as asessed by assignment froup
        v[0].assignid = assignid;
        v[0].assignname = org.json?.name;
        return v[0];
    }

    public async nextContentItemByAssignGroup (groupid: Types.ObjectId, assignid: Types.ObjectId, bot?: TelegramBot): Promise<IContent> {
        MongoProto.connectMongo();
        const v = await mongoContentGroup.aggregate([
            {'$match': {'_id': groupid}
            }, {'$lookup': {
              'from': 'contents', 
              'localField': 'items', 
              'foreignField': '_id', 
              'as': 'result'}
            }, {'$unwind': '$result'
            }, {'$replaceRoot': {'newRoot': '$result'}
            }, {'$lookup': {
              'from': 'assessments', 
              'foreignField': 'cid', 
              'localField': '_id', 
              'pipeline': [{'$match': {'$expr': {'$eq': ['$assignid', assignid]}}}], 
              'as': 'result'}
            }, {'$match': {'result': []}
            }, {'$addFields': {'rand': {'$rand': {}}}
            }, {'$sort': {'rand': 1}
            }, {'$limit': 1 
            }, {'$project': {'result':0, 'rand': 0}
            }]);
        if (!v.length) {
            //let's close assignment of content grooup
            this.data?.assignedgroups?.forEach(el=>{if (el._id.equals(assignid)) el.closed = true; el.closedate = new Date()});
            await this.save();
            //let's notify all about finish of the assessment
            const c = this.data?.assignedgroups?.filter(el=>el._id.equals(assignid));

            if (c) bot?.sendMessage(c[0].tguserid as number, `${ML("User")} (${this.uid}) finished ${c[0]._id} assignment`);
            throw new PlutchikError("user:nonextcontent", `userid = '${this.id}';assignid='${assignid}';groupid='${groupid}'`);
        }
        //let's mark content item as asessed by assignment froup
        v[0].assignid = assignid;
        return v[0];
    }
    public async nextContentItem(bot: TelegramBot, language?: string, source_type?: SourceType): Promise <IContent>{
        this.checkData();
        const assigns_o: IAssignOrg[] | undefined = this.data?.assignedorgs?.filter((val)=>!val.closed);
        const assigns_g: IAssignGroup[] | undefined = this.data?.assignedgroups?.filter((val)=>!val.closed);
        if (assigns_o?.length) {
            return this.nextContentItemByAssignOrg(assigns_o[0].oid, assigns_o[0]._id, bot);
        } else if (assigns_g?.length) {
            return this.nextContentItemByAssignGroup(assigns_g[0].groupid, assigns_g[0]._id, bot);
        } else {
            return this.nextContentItemAll(language, source_type);
        }
    }

    public async nextContentItemAll(language?: string, source_type?: SourceType): Promise <IContent>{
        //this.checkData();
        MongoProto.connectMongo();
        const v = await mongoContent.aggregate([
            {$match: {'blocked': false}
            }, {$addFields: {'newName': '$name'}
            }, {$unwind: '$newName.values'
            }, {$addFields: {'otherLang': {'$first': '$newName.values'}}
            }, {$match: {'otherLang': {$regex: language?language:this.json?.nativelanguage, $options: 'i'}}
            }, {$project: {"newName":0, "otherLang":0}
            }, {$unionWith: {'coll': 'contents', 'pipeline': [
                {$match: {'language': {'$regex': language?language:this.json?.nativelanguage, '$options': 'i'}, 'blocked': false}}
                ]}
            }, {$lookup: {from: "assessments", let: {contentid: "$_id",}, pipeline: [{
                $match: {$expr: {$and: [{$eq: [this.id, "$uid",]}, {$eq: ["$cid", "$$contentid"]}]}},
                }], as: "result"},
            }, {$match: {result: []},
            }, {$addFields: {'rand': {$rand: {}}}
            }, {$sort: {'rand': 1}
            }, {$limit: 1,
        }]);
        if (!v.length) throw new PlutchikError("user:nonextcontent", `userid = '${this.id}';`)
        return v[0];
    }

    public async observeAssessments(assign_id?: Types.ObjectId):Promise<IObserveAssessments> {
        const ret: IObserveAssessments = {
            ownVector: {},
            othersVector:{}
        };
        
        const matchObject: any = {'uid': this.id};
        if (assign_id !== undefined) matchObject.assignid = assign_id; 
        await this.checkData();
        if (this.id) {
            const own = await mongoAssessments.aggregate([
                {'$match': matchObject
                }, {'$lookup': {
                        'from': 'assessments', 
                        'let': {'cid': '$cid', 'uid': '$uid'}, 
                        'pipeline': [{'$match': {'$expr': {'$and': [{'$eq': ['$cid', '$$cid']}, {'$ne': ['$uid', '$$uid']}]}}}], 
                        'as': 'result'}
                }, {'$project': {'_id': 1, 'vector': 1, 'result_size': {'$size': '$result'}}
                }, {'$match': {'result_size': {'$gt': 0}}
                }, {'$group': {'_id': '1', 
                    'joy': {'$avg': {'$toDouble': '$vector.joy'}}, 
                    'trust': {'$avg': {'$toDouble': '$vector.trust'}}, 
                    'fear': {'$avg': {'$toDouble': '$vector.fear'}}, 
                    'surprise': {'$avg': {'$toDouble': '$vector.surprise'}}, 
                    'sadness': {'$avg': {'$toDouble': '$vector.sadness'}}, 
                    'disgust': {'$avg': {'$toDouble': '$vector.disgust'}}, 
                    'anger': {'$avg': {'$toDouble': '$vector.anger'}}, 
                    'anticipation': {'$avg': {'$toDouble': '$vector.anticipation'}}, 
                    'count': {'$sum': 1}}
                }, {'$project':{'_id':0}
                }
            ]);
            ret.ownVector = own[0];

            const others = await mongoAssessments.aggregate([
                {'$match': {'uid': this.id}
                }, {'$lookup': 
                    {'from': 'assessments', 
                        'let': {'cid': '$cid', 'uid': '$uid'}, 
                    'pipeline': [
                        {'$match': {'$expr': {'$and': [{'$eq': ['$cid', '$$cid']}, {'$ne': ['$uid', '$$uid']}]}}
                        }
                    ], 
                    'as': 'result'}
                }, {'$project': {'vector': 1, 'result': 1, 'result_size': {'$size': '$result'}}
                }, {'$match': {'result_size': {'$gt': 0}}
                }, {'$unwind': {'path': '$result'}
                }, {'$replaceRoot': {'newRoot': '$result'}
                }, {'$group': {
                    '_id': '$cid', 
                    'joy': {'$avg': {'$toDouble': '$vector.joy'}}, 
                    'trust': {'$avg': {'$toDouble': '$vector.trust'}}, 
                    'fear': {'$avg': {'$toDouble': '$vector.fear'}}, 
                    'surprise': {'$avg': {'$toDouble': '$vector.surprise'}}, 
                    'sadness': {'$avg': {'$toDouble': '$vector.sadness'}}, 
                    'disgust': {'$avg': {'$toDouble': '$vector.disgust'}}, 
                    'anger': {'$avg': {'$toDouble': '$vector.anger'}}, 
                    'anticipation': {'$avg': {'$toDouble': '$vector.anticipation'}}, 
                    'count': {'$sum': 1}}
                }, {'$group': {
                    _id: "1",
                    joy: {$avg: {$toDouble: "$joy",},},
                    trust: {$avg: {$toDouble: "$trust",},},
                    fear: {$avg: {$toDouble: "$fear",},},
                    surprise: {$avg: {$toDouble: "$surprise",},},
                    sadness: {$avg: {$toDouble: "$sadness",},},
                    disgust: {$avg: {$toDouble: "$disgust",},},
                    anger: {$avg: {$toDouble: "$anger",},},
                    anticipation: {$avg: {$toDouble: "$anticipation",},},
                    count: {$sum: "$count",},} 
                }, {'$project': {'_id': 0}
                }
            ]);
            ret.othersVector = others[0];
        }
        return ret;
    }

    public async assignContentOrg(response_to_invitation: Types.ObjectId, from_tguserid: TelegramBot.ChatId, org: Organization) {
        this.checkData();
        const a: IAssignOrg = {
            _id: new Types.ObjectId(),
            response_to_invitation: response_to_invitation,
            tguserid: from_tguserid,
            oid: org.uid as Types.ObjectId,
            assigndate: new Date(),
            closed: false
        }
        if (this.data && !this.data?.assignedorgs)this.data.assignedorgs = [];
        const exists = this.data?.assignedorgs?.filter((val: IAssignOrg)=>val.response_to_invitation.equals(response_to_invitation));
        if (exists?.length === 0) this.data?.assignedorgs?.push(a);
        await this.save();
    }

    public async deleteAssignContentOrg(response_to_invitation: Types.ObjectId) {
        this.checkData();
        if (this.data) { 
            if (this.data?.assignedorgs === undefined) this.data.assignedorgs = [];
            this.data.assignedorgs = this.data?.assignedorgs?.filter((val: IAssignOrg)=>!val.response_to_invitation.equals(response_to_invitation));
        }
        await this.save();
    }

  public async assignContentGroup(from: User, group: ContentGroup) {
        this.checkData();
        const a: IAssignGroup = {
            _id: new Types.ObjectId(),
            userid: from.uid as Types.ObjectId,
            tguserid: from.json?.tguserid,
            groupid: group.uid as Types.ObjectId,
            assigndate: new Date(),
            closed: false
        }
        if (this.data && !this.data?.assignedgroups)this.data.assignedgroups = [];
        // let's check the same not closed group exists
        const exists = this.data?.assignedgroups?.filter((val)=>val.groupid.equals(group.uid as Types.ObjectId));
        if (!exists?.length) this.data?.assignedgroups?.push(a);
        await this.save();
    }
    public async createAuthCode(): Promise<string | undefined> {
        this.checkData();
        if (this.data) {
            const auth_code = randomInt(100, 999).toString();
            const auth_code_hash = Md5.hashStr(`${this.uid} ${auth_code}`);
            this.data.auth_code_hash = auth_code_hash;
            await this.save();
            return auth_code;
        }
    }
    
    static async getUserByTgUserId(tg_user_id: number): Promise<User | undefined> {
        MongoProto.connectMongo();
        const ou = await mongoUsers.aggregate([{
            '$match': {'tguserid': tg_user_id,'blocked': false}
        }]);
        if (ou.length === 1) {
            const ret = ou[0];
            // checking is user from support staff list?
            if (process.env.help_support_staff !== undefined) {
                const support_staff_arr = process.env.help_support_staff.split(',');
                ret.support_staff = support_staff_arr.filter(v=>v === ret.tguserid.toString()).length === 1;
            } 
            return new User(undefined, ret);
        }
    }

    async getOrganizationsUserAttachedTo(): Promise<Array<IOrganization>> {
        MongoProto.connectMongo();
        await this.checkData();

        const orgs = mongoOrgs.aggregate([{
            '$match': {'participants.uid': this.uid}
        }]);
        return orgs;
    }
    async reviewByEmotion(emotion: string, assignid?: Types.ObjectId): Promise<Array<Assessment>>{
        let emMatch: any = 
            {'$match': {'uid': this.uid}};
        if (assignid !== undefined) {
            emMatch = 
            {'$match': {'assignid': assignid}};
        }
        emMatch['$match']['vector.'+emotion] = {
            '$gt': 0
        };

        const a = await mongoAssessments.aggregate([
            emMatch
            , {'$lookup': {
                'from': 'assessments', 
                'pipeline': [
                    {'$match': {'$expr': {'$ne': ['$uid', this.uid]}}
                    }, {'$group': {'_id': '$cid', 'emotion': {'$avg': {'$toDouble': `$vector.${emotion}`}}}
                    }], 
                'localField': 'cid', 
                'foreignField': 'cid', 
                'as': 'others'}
            }, {'$project': {'others._id': 0}
            }, {'$unwind': {'path': '$others'}
            }, {'$addFields': {'diff': {'$sum': [`$vector.${emotion}`, {'$multiply': ['$others.emotion', -1]}]}}
            }, {'$match': {'$expr': {'$gt': [{'$abs': '$diff'}, 0.1]}}
            }, {'$sort': {'diff': -1}
            }, {'$lookup': {
                    'from': 'contents',
                    'localField': 'cid',
                    'foreignField': '_id',
                    'as': 'contentitem'}
            }, {'$unwind': {'path': '$contentitem'}
            }
          ]);
        return a;
    }
    
    async nextMatch(uid?: Types.ObjectId): Promise<IUser>{
        const pipeline: PipelineStage[] = [];
        if (uid === undefined) pipeline.push(
            //collecting _id of all previous liked or skipped persons
            {$lookup:{
                  from: "matches",
                  pipeline: [
                    {$match: {uid: this.uid}
                    }, {$addFields: {alluids: {$concatArrays: ["$skipped","$liked"]}}
                    }, {$project: {alluids: 1}
                    }],
                  localField: "",
                  foreignField: "",
                  as: "res"}},
            // adding list if users _ids to every document   
            {$addFields:{excludeuids: {$getField: {field: "alluids",input: {$first: "$res"}}}}},
            // filter users by list 
            {$match:{$expr: {$not: {$in: ["$uid",{$concatArrays: [{$ifNull: ["$excludeuids", []]},[this.uid]]}]}}}},
        ); else pipeline.push(
            {$match: {uid:uid}}
        );
        pipeline.push(
            // create intersection by the same aseessed content items
            {$lookup:{
                  from: "assessments",
                  pipeline: [{$match: {uid: this.uid}}],
                  localField: "cid",
                  foreignField: "cid",
                  as: "intersection"}},
            // cut users who has no common assessed content items
            {$match:{$expr: {$gt: [{$size: "$intersection"},0]}}},
            // calc count of common assessed content items
            {$group:{_id: "$uid",commonContentAssessmentsCount: {$count: {}}}},
            {$sort:{commonContentAssessmentsCount: -1}},
            // and cut biggest one
            {$limit:1},
            // dress _id by data from User document
            {$lookup:{
                  from: "users",
                  localField: "_id",
                  foreignField: "_id",
                  as: "userinfo"
                }},
            {$unwind:{path: "$userinfo"}},
            {$addFields:{"userinfo.commonContentAssessmentsCount":"$commonContentAssessmentsCount"}},
            {$replaceRoot:{newRoot: "$userinfo"}}
        );
        const users = await mongoAssessments.aggregate(pipeline);
        if (users.length !== 1) {
            throw new PlutchikError("user:notfound", `nextMatch for user _id = '${this.uid}'`);
        }
        return users[0];
    }

    async getDeltaMatch(candidate: IUser): Promise<any> {
        const delta = await mongoAssessments.aggregate([
            {$match: {"uid": this.uid}},
            {$lookup:{
                  from: "assessments",
                  pipeline: [{$match: {uid: candidate._id}}],
                  localField: "cid",
                  foreignField: "cid",
                  as: "candidate"}},
           {$match: {$expr: {$ne: [{$size: "$candidate"}, 0]}}},
           {$unwind: {path: "$candidate",}},
           {$group: {_id: "",
            joy: {$sum: "$vector.joy"},
            trust: {$sum: "$vector.trust"},
            fear: {$sum: "$vector.fear"},
            surprise: {$sum: "$vector.surprise"},
            sadness: {$sum: "$vector.sadness"},
            disgust: {$sum: "$vector.disgust"},
            anger: {$sum: "$vector.anger"},
            anticipation: {$sum: "$vector.anticipation"},
            c_joy: {$sum: "$candidate.vector.joy"},
            c_trust: {$sum: "$candidate.vector.trust"},
            c_fear: {$sum: "$candidate.vector.fear"},
            c_surprise: {$sum: "$candidate.vector.surprise"},
            c_sadness: {$sum: "$candidate.vector.sadness"},
            c_disgust: {$sum: "$candidate.vector.disgust"},
            c_anger: {$sum: "$candidate.vector.anger"},
            c_anticipation: {$sum: "$candidate.vector.anticipation"},
           }},
           {$addFields: {
             "vector.joy": "$joy",
             "vector.trust": "$trust",
             "vector.fear": "$fear",
             "vector.surprise": "$surprise",
             "vector.sadness": "$sadness",
             "vector.disgust": "$disgust",
             "vector.anger": "$anger",
             "vector.anticipation": "$anticipation",
             "candidate.joy": "$c_joy",
             "candidate.trust": "$c_trust",
             "candidate.fear": "$c_fear",
             "candidate.surprise": "$c_surprise",
             "candidate.sadness": "$c_sadness",
             "candidate.disgust": "$c_disgust",
             "candidate.anger": "$c_anger",
             "candidate.anticipation": "$c_anticipation",
             "delta.joy": {$subtract: ["$c_joy", "$joy"]},
             "delta.trust": {$subtract: ["$c_trust", "$trust"]},
             "delta.fear": {$subtract: ["$c_fear", "$fear"]},
             "delta.surprise": {$subtract: ["$c_surprise", "$surprise"]},
             "delta.sadness": {$subtract: ["$c_sadness", "$sadness"]},
             "delta.disgust": {$subtract: ["$c_disgust", "$disgust"]},
             "delta.anger": {$subtract: ["$c_anger", "$anger"]},
             "delta.anticipation": {$subtract: ["$c_anticipation", "$anticipation"]}
           }},
           {$project:{vector:1, candidate:1, delta:1}}
        ]);
        if (delta.length !== 1) {
            throw new PlutchikError("user:match", `User _id = '${this.uid}', candidate _id = '${candidate._id}'`);
        }    
        return delta[0];
    }

    async setMatchOptions(options: IDatingSettings, clearskippedlist?: boolean, clearlikedlist?: boolean, resetall?: boolean) {
        await this.checkData();
        if (this.data) {
            if (resetall) this.data.datingsettings = {readytomatch: true};
            if (clearskippedlist || clearlikedlist) {
                const match = await Match.getByUid(this.uid);
                if (clearskippedlist) await match.clearSkipped();
                if (clearlikedlist) await match.clearLiked();
            }
            this.data.datingsettings = options;
            await this.save();
        }
    }

    async skipMatchCandidate(candidate_uid: Types.ObjectId) {
        let m: Match;
        try {
            m = await Match.getByUid(this.uid);
        } catch(e: any){
            m = new Match(undefined, {
                uid: this.uid,
                skipped: [],
                liked: []
            });
        }
        await m.addSkipped(candidate_uid);
    }
    
    async likeMatchCandidate(candidate_uid: Types.ObjectId) {
        let m: Match;
        try {
            m = await Match.getByUid(this.uid);
        } catch(e: any){
            m = new Match(undefined, {
                uid: this.uid,
                skipped: [],
                liked: []
            });
        }
        await m.addLiked(candidate_uid);
    }

    async getMutualMatches(): Promise<IUser[]> {
        const users = await mongoMatches.aggregate([
            {$match:{uid: this.uid}},
            {$lookup:{
                  from: "matches",
                  localField: "uid",
                  foreignField: "liked",
                  as: "matched"
                }},
            {$unwind:{path: "$matched"}},
            {$replaceRoot:{newRoot: "$matched"}},
            {$lookup:{
                  from: "users",
                  localField: "uid",
                  foreignField: "_id",
                  as: "userdata"
                }},
            {$unwind:{path: "$userdata"}},
            {$replaceRoot:{newRoot: "$userdata"}}
          ]);
          return users;
    }

    async getMatchList(dist: number = 3): Promise<Array<IUser>> {
        const u = await mongoAssessments.aggregate([
            {'$match': {'uid': this.uid}
            }, {'$lookup': {
                'let': {
                  'uid': '$uid'
                }, 
                'from': 'assessments', 
                'localField': 'cid', 
                'foreignField': 'cid', 
                'as': 'others', 
                'pipeline': [
                    {'$match': {'$expr': {'$ne': ['$uid', '$$uid']}}}
                ]}
            }, {'$match': {'$expr': {'$gt': [{'$size': '$others'}, 0]}}
            }, {'$unwind': {'path': '$others'}
            }, {'$addFields': {'sub_mod': {'$sqrt': {'$sum':[ 
                {'$pow': [{'$subtract': [{'$toDouble': '$others.vector.joy'}, {'$toDouble': '$vector.joy'}]}, 2]
                }, {'$pow': [{'$subtract': [{'$toDouble': '$others.vector.trust'}, {'$toDouble': '$vector.trust'}]}, 2]
                }, {'$pow': [{'$subtract': [{'$toDouble': '$others.vector.fear'}, {'$toDouble': '$vector.fear'}]}, 2]
                }, {'$pow': [{'$subtract': [{'$toDouble': '$others.vector.surprise'}, {'$toDouble': '$vector.surprise'}]}, 2]
                }, {'$pow': [{'$subtract': [{'$toDouble': '$others.vector.sadness'}, {'$toDouble': '$vector.sadness'}]}, 2]
                }, {'$pow': [{'$subtract': [{'$toDouble': '$others.vector.disgust'}, {'$toDouble': '$vector.disgust'}]}, 2]
                }, {'$pow': [{'$subtract': [{'$toDouble': '$others.vector.anger'}, {'$toDouble': '$vector.anger'}]}, 2]
                }, {'$pow': [{'$subtract': [{'$toDouble': '$others.vector.anticipation'}, {'$toDouble': '$vector.anticipation'}]}, 2]
                }]}}, 
                'sub_vector.joy': {'$subtract': [{'$toDouble': '$others.vector.joy'}, {'$toDouble': '$vector.joy'}]}, 
                'sub_vector.trust': {'$subtract': [{'$toDouble': '$others.vector.trust'}, {'$toDouble': '$vector.trust'}]}, 
                'sub_vector.fear': {'$subtract': [{'$toDouble': '$others.vector.fear'}, {'$toDouble': '$vector.fear'}]}, 
                'sub_vector.surprise': {'$subtract': [{'$toDouble': '$others.vector.surprise'}, {'$toDouble': '$vector.surprise'}]}, 
                'sub_vector.sadness': {'$subtract': [{'$toDouble': '$others.vector.sadness'}, {'$toDouble': '$vector.sadness'}]}, 
                'sub_vector.disgust': {'$subtract': [{'$toDouble': '$others.vector.disgust'}, {'$toDouble': '$vector.disgust'}]}, 
                'sub_vector.anger': {'$subtract': [{'$toDouble': '$others.vector.anger'}, {'$toDouble': '$vector.anger'}]}, 
                'sub_vector.anticipation': {'$subtract': [{'$toDouble': '$others.vector.anticipation'}, {'$toDouble': '$vector.anticipation'}]}}
            }, {'$group': {'_id': '$others.uid', 
                'dist': {'$avg': '$sub_mod'}, 
                'joy': {'$avg': '$sub_vector.joy'}, 
                'trust': {'$avg': '$sub_vector.trust'}, 
                'fear': {'$avg': '$sub_vector.fear'}, 
                'surprise': {'$avg': '$sub_vector.surprise'}, 
                'sadness': {'$avg': '$sub_vector.sadness'}, 
                'disgust': {'$avg': '$sub_vector.disgust'}, 
                'anger': {'$avg': '$sub_vector.anger'}, 
                'anticipation': {'$avg': '$sub_vector.anticipation'}, 
                'cnt': {'$sum': 1}}
            }, {'$sort': {'dist': 1}
            }, {'$match': {'$expr': {'$lt': ['$dist', dist]}}
            }, {'$lookup': {
                'from': 'users', 
                'localField': '_id', 
                'foreignField': '_id', 
                'as': 'user'}
            }, {'$unwind': {'path': '$user'}
            }, {'$addFields': {'user.cnt': '$cnt', 'user.dist': '$dist', 'user.sub_vector.joy': '$joy', 'user.sub_vector.trust': '$trust', 'user.sub_vector.fear': '$fear', 'user.sub_vector.surprise': '$surprise', 'user.sub_vector.sadness': '$sadness', 'user.sub_vector.disgust': '$disgust', 'user.sub_vector.anger': '$anger', 'user.sub_vector.anticipation': '$anticipation'}
            }, {'$replaceRoot': {'newRoot': '$user'}
            }
          ]);
        return u;
    }

    async getSutableTimeToChat (): Promise<Date | undefined> {
        //let's get hour to chat in GMT
        const u = await mongoAssessments.aggregate([
            {'$match': {'uid': this.uid}
            }, {'$addFields': {'hour': {'$hour': {'date': '$created', 'timezone': 'GMT'}}, 'weightl': {'$toLong': '$created'}}
            }, {'$group': {'_id': '$hour', 'weight': {'$sum': {'$divide': ['$weightl', 10000]}}}
            }, {'$sort': {'weight': -1}
            }, {'$limit': 2
            }, {'$group': {'_id': 1, 'hour': {'$avg': '$_id'}}
            }
        ]);
        if (u.length === 0) return undefined;
        let d = new Date();
        d.setUTCHours(u[0].hour);
        if (d < new Date()) d = new Date(d.getTime() + 24*60*60*1000);
        return d;
    }

    async userStats(): Promise<IUserStats> {
        const orgs = await this.getOrganizationsUserAttachedTo();
        const org_ids_arr = orgs.map(org=>org._id);
        const assessments = await mongoAssessments.aggregate([
            {$match: {uid: this.uid}
            }, {"$group": {"_id": new Types.ObjectId(), 
                "count": {"$count": {}}, 
                "last_created": {"$max": "$created"}}
        }]);

        const content = await mongoContent.aggregate([
            {$match: {organizationid: {$in: org_ids_arr}}
            }, {'$group': {'_id': new Types.ObjectId(),
                'count': {'$count': {}}, 
                'last_created': {'$max': '$changed'}}
            }
        ]);

        const oas = await this.observeAssessments();
        const ret: IUserStats = {
            userData: this.json as IUser,
            orgs: orgs,
            sutableTime: await this.getSutableTimeToChat(),
            content: {
                count: content.length === 1?content[0].count:0,
                last_created: content.length === 1?content[0].last_created:undefined,
            },
            assessments: {
                count: assessments.length === 1? assessments[0].count:0,
                last_created: assessments.length === 1? assessments[0].last_created: undefined
            },
            observeAssessments: oas
        };
        return ret;
    }
    static async getUsersAssessmentsCount(): Promise<Array<IUser>> {
        const ret = await mongoUsers.aggregate([{
            $lookup: {
                  localField: "_id",
                  foreignField: "uid",
                  from: "assessments",
                  pipeline: [{$group: {_id: "$uid", count: {$sum: 1}}}],
                  as: "assessments_object",
                  let: {uid: "$_id"}}
            }, { $unwind: { path: "$assessments_object", preserveNullAndEmptyArrays: true}
            }, { $addFields:{assessments_count: {$ifNull: ["$assessments_object.count", 0]}}
            }, { $project: {assessments_object: 0}
            }, { $sort: {assessments_count: -1}
            }]);
        return ret;
    }
}