import { model, Schema, Types } from "mongoose";
import MongoProto from "./mongoproto";
import PlutchikError from "./error";

export interface IMatch {
    _id?: Types.ObjectId;
    uid: Types.ObjectId;
    skipped: Array<Types.ObjectId>;
    liked: Array<Types.ObjectId>; 
}

export const MatchSchema = new Schema({
    uid:{type: Types.ObjectId, unique: true, required: true},
    skipped: {type: Array, required: false},
    liked: {type: Array, required: false},
});

export const mongoMatches = model<IMatch>('matches', MatchSchema);

export default class Match extends MongoProto<IMatch> {
    constructor(id?: Types.ObjectId, data?: IMatch){
        super(mongoMatches, id, data);
    }
    static async getByUid(uid: Types.ObjectId):Promise<Match> {
        const matches = await mongoMatches.aggregate([
            {$match: {uid: uid}}
        ]);
        if (matches.length !== 1) throw new PlutchikError("user:match", `Matches record not found of user uid = '${uid}'`);
        return new Match(matches[0]._id, matches[0]);
    }
    async addSkipped(uid: Types.ObjectId) {
        await this.checkData();
        this.data?.skipped.push(uid);
        if (this.data) this.data.liked = this.data.liked.filter(u=>!u.equals(uid));
        await this.save();
    }
    async addLiked(uid: Types.ObjectId) {
        await this.checkData();
        this.data?.liked.push(uid);
        if (this.data) this.data.skipped = this.data.skipped.filter(u=>!u.equals(uid));
        await this.save();
    }

    async clearSkipped() {
        await this.checkData();
        this.data?.skipped.splice(0, this.data.skipped.length);
        await this.save();
    }
    async clearLiked() {
        await this.checkData();
        this.data?.liked.splice(0, this.data.liked.length);
        await this.save();
    }
    static async isMutual(uid1: Types.ObjectId, uid2:Types.ObjectId): Promise<boolean> {
        try {
            const m1 = await Match.getByUid(uid1);
            const m2 = await Match.getByUid(uid2);
            return m1.json.liked.filter(uid=>uid.equals(uid2)).length > 0 && m2.json.liked.filter(uid=>uid.equals(uid1)).length > 0
        } catch(e) {
            return false;
        }
    }
}
