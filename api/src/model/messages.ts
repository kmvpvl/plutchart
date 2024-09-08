import { model, Schema, Types } from "mongoose";
import MongoProto from "./mongoproto";
import PlutchikError from "./error";

export interface IMessage {
    _id?: Types.ObjectId;
    uidfrom: Types.ObjectId;
    uidto: Array<Types.ObjectId>;
    text: string;
    created: Date;
    changed?: Date;
}

export const MessageSchema = new Schema({
    uidfrom:{type: Types.ObjectId, required: true},
    uidto: {type: Array, required: true},
    text: {type: String, required: true},
    created: {type: Date, required: true},
    changed: {type: Date, required: false},
});

export const mongoMessages = model<IMessage>('messages', MessageSchema);

export default class Message extends MongoProto<IMessage> {
    constructor(id?: Types.ObjectId, data?: IMessage){
        super(mongoMessages, id, data);
    }
    static async getByUids(uidfrom: Types.ObjectId, uidto: Types.ObjectId): Promise <Array<IMessage>> {
        const messages = await mongoMessages.aggregate([
            {$match:{$expr: {$or: [
                {$and: [{$eq: [
                    uidfrom,
                    "$uidfrom"
                    ]},{$in: [
                    uidto,
                    "$uidto"
                    ]}]
                },{$and: [{$eq: [
                    uidto,
                    "$uidfrom"
                    ]},{$in: [
                    uidfrom,
                    "$uidto"
                    ]}]
                }]}}
            }, {$sort: {"created":-1}
            }
        ]);
        return messages;
    }
}