import { Request, Response } from 'express';
import colours from '../model/colours';
import User, { IDatingSettings, IUserStats } from "../model/user";
import Organization from '../model/organization';
import TelegramBot from 'node-telegram-bot-api';
import { Types } from 'mongoose';
import PlutchikError from '../model/error';
import { mainKeyBoardMenu } from './telegram';
import ML from '../model/mlstring';
import Match from '../model/match';
import Message from '../model/messages';

export default async function userinfo(c: any, req: Request, res: Response, user: User) {
    return res.status(200).json(user.json);
}

export async function ogranizationAttachedToUser(c: any, req: Request, res: Response, user: User){
    const orgs = await user.getOrganizationsUserAttachedTo();
    return res.status(200).json(orgs);
}

export async function getinsights(c: any, req: Request, res: Response, user: User){
    const ob = await user.observeAssessments();
    return res.status(200).json({observe: ob, user: user.json});
}

export async function reviewemotionaboveothers(c: any, req: Request, res: Response, user: User){
    const em = req.body.emotion;
    const invitationid = req.body.invitationid !== undefined?new Types.ObjectId(req.body.invitationid):undefined;
    console.log(`${colours.fg.blue}Values: emotion = '${em}', invitationid = '${invitationid}'${colours.reset}`);
    if (invitationid !== undefined){
        const org = await Organization.getOrganizationByInvitationId(invitationid);
        if (!org.checkRoles(user, "manage_users")) return res.status(403).json('User has no role "manage_users"');
        const una = await org.getUserAndAssignByInvitationId(invitationid);
        const ob = await una.user.reviewByEmotion(em, una.assign?._id);
        return res.status(200).json({decoding: ob, user: user.json});
    } else {
        const ob = await user.reviewByEmotion(em);
        return res.status(200).json({decoding: ob, user: user.json});
    }
}

export async function getmatchlist(c: any, req: Request, res: Response, user: User){
    const u = await user.getMatchList();
    return res.status(200).json({matchlist: u, user: user.json});
}

export async function supportusersrating(c: any, req: Request, res: Response, user: User, bot: TelegramBot){
    if (!user.json?.support_staff) return res.status(403).json({ok: false, errorText: "Support staff must do this request"});
    try {
        return res.status(200).json(await User.getUsersAssessmentsCount());
    } catch (e: any) {
        return res.status(404).json({ok: false, errorRaw: JSON.stringify(e), errorText: `Couldn't return users' list`});
    }
}

export async function supportuserstats(c: any, req: Request, res: Response, user: User, bot: TelegramBot){
    const tguserid = req.body.tguserid;
    console.log(`${colours.fg.blue}Args: tguserid = '${tguserid}'${colours.reset}`);
    if (!user.json?.support_staff) return res.status(403).json({ok: false, errorText: "Support staff must do this request"});
    try {
        const supporting_user = await User.getUserByTgUserId(Number(tguserid));
        if (supporting_user === undefined) {
            return res.status(404).json({ok: false, message: `User tg id = '${tguserid}' not found`});
        }
        return res.status(200).json(await supporting_user.userStats());

    } catch (e: any) {
        return res.status(404).json({ok: false, errorRaw: JSON.stringify(e), errorText: `Couldn't return user with Telegram ID = '${tguserid}'`});
    }
}

export async function supportsendmessagetouser(c: any, req: Request, res: Response, user: User, bot: TelegramBot){
    const uid = new Types.ObjectId(req.body.uid);
    const message = req.body.message;
    console.log(`${colours.fg.blue}Args: uid = '${uid}'; message = '${message}'${colours.reset}`);
    if (!user.json?.support_staff) return res.status(403).json({ok: false, errorText: "Support staff must do this request"});
    try {
        const supporting_user = new User(uid);
        await supporting_user.load();
        bot.sendMessage(supporting_user.json?.tguserid as number, message, {disable_notification: true});
        return res.status(200).json(await supporting_user.getSutableTimeToChat());

    } catch (e: any) {
        return res.status(404).json({ok: false, errorRaw: JSON.stringify(e), errorText: `Couldn't return user uid = '${uid}'`});
    }
}

export async function reminduseraboutinvitation(c: any, req: Request, res: Response, user: User, bot: TelegramBot){
    const m = req.body.message;
    const invitationid = new Types.ObjectId(req.body.invitationid);
    console.log(`${colours.fg.blue}Args: message = '${m}'; invitationid = '${invitationid}'${colours.reset}`);
    try {
        const org = await Organization.getOrganizationByInvitationId(invitationid);
        if (!org.checkRoles(user, "manage_users")) return res.status(403).json('User has no role "manage_users"');
        const arrInv = org.json?.invitations?.filter(i=>invitationid.equals(i._id));
        if (arrInv) {
            const user_n_assign = await org.getUserAndAssignByInvitationId(invitationid);
            const assign = user_n_assign.assign;
            const sutableTime = await user_n_assign.user.getSutableTimeToChat();
            if (assign !== undefined && !assign.closed){
                bot.sendMessage(arrInv[0].whom_tguserid, `${user.json?.name} ${ML("reminds you about the set", user_n_assign.user.json?.nativelanguage)} '${org.json?.name}'`, {reply_markup: {inline_keyboard:mainKeyBoardMenu(user?.json?.nativelanguage)}});
            } else {
                return res.status(404).json({ok: false, 
                    message: assign===undefined?
                    ML("User didn't accept your invitation", user.json?.nativelanguage):
                    ML(`The assign was closed`, user.json?.nativelanguage)});
            }
            return res.status(200).json(sutableTime);
        } else {
            throw new PlutchikError("organization:broken", `Couldn't find invitation = '${invitationid}'`);
        }
    } catch(e: any) {
        return res.status(404).json({ok: "FAIL", message: `invitationid = '${invitationid}' not found`});
    }
}

export async function getnextmatchcandidate(c: any, req: Request, res: Response, user: User, bot: TelegramBot){
    const uid_str = req.body.uid;
    const uid = uid_str === undefined?undefined:new Types.ObjectId(uid_str);
    try {
        const mcand = await user.nextMatch(uid);
        const mutuallike = mcand._id !== undefined?await Match.isMutual(user.uid, mcand._id):false;
        return res.status(200).json({
            matchcandidate: mcand,
            user: user.json,
            vectors: await user.getDeltaMatch(mcand),
            mutuallike: mutuallike,
            messages: mutuallike && mcand._id !== undefined?await Message.getByUids(user.uid, mcand._id):undefined
        });
    } catch (err: any) {
        return res.status(404).json({ok: false, description: 'Could not get next match candidate', user: user.json, mutuals: await user.getMutualMatches()});
    }
}

export async function skipmatchcandidate(c: any, req: Request, res: Response, user: User, bot: TelegramBot){
    try {
        const candidate_uid = new Types.ObjectId(req.body.candidateid);
        await user.skipMatchCandidate(candidate_uid);
        return getnextmatchcandidate(c, req, res, user, bot);
    } catch (err: any) {
        return res.status(404).json({ok: false, description: 'Could not get next match candidate (skip)', user: user.json});
    }
}

export async function likematchcandidate(c: any, req: Request, res: Response, user: User, bot: TelegramBot){
    try {
        const candidate_uid = new Types.ObjectId(req.body.candidateid);
        const candidate = new User(candidate_uid);
        try {
            await candidate.load();
            await user.likeMatchCandidate(candidate_uid);
            //!!! need to check either candidate already liked the user or user liked the candidate first?
            try {
                const candidatematches = new Match(candidate_uid);
                await candidatematches.load();
                if (candidatematches.json.liked.filter(m=>m.equals(this.uid)).length > 0) {
                    //mutual like 
                    //???
                    bot.sendMessage(candidate.json?.tguserid as number, `${user.json?.name} and you have liked your emotional vectors mutually. Do you want to message each other`, {reply_markup: {inline_keyboard:[[{text:ML(`Text with ${user.json?.name}`, candidate.json?.nativelanguage), web_app:{url:`${process.env.tg_web_app}/match?uid=${candidate_uid}`}}]]}});
                    return getnextmatchcandidate(c, req, res, user, bot);
                } else {
                    // non-mutual like
                }
            } catch (e) {
                //candidate dont have matches
            }

            bot.sendMessage(candidate.json?.tguserid as number, `${user.json?.name} liked your emotional vector. Do you want try to match back`, {reply_markup: {inline_keyboard:[[{text:ML(`Check emotion vector of candidate`, candidate.json?.nativelanguage), web_app:{url:`${process.env.tg_web_app}/match?uid=${candidate_uid}`}}]]}});
        } catch {
            //!!! couldn't find user
        }
        return getnextmatchcandidate(c, req, res, user, bot);
    } catch (err: any) {
        return res.status(404).json({ok: false, description: 'Could not get next match candidate (skip)', user: user.json});
    }
}

export async function setmatchoptions(c: any, req: Request, res: Response, user: User, bot: TelegramBot){
    const resetall = req.body.resetall;
    req.body.resetall = undefined
    const clearskippedlist = req.body.clearskippedlist;
    req.body.clearskippedlist = undefined
    const clearlikedlist = req.body.clearlikedlist;
    req.body.clearlikedlist = undefined;
    const options: IDatingSettings = req.body;
    try {
        await user.setMatchOptions(options, clearskippedlist, clearlikedlist, resetall);
        return res.status(200).json({ok: true});
    } catch (err: any) {
        return res.status(404).json({ok: false, description: 'Could not get next match candidate (skip)', user: user.json});
    }
}

export async function sendmessagetomutualmatch(c: any, req: Request, res: Response, user: User, bot: TelegramBot){
    const to_str: Array<string> = req.body.to;
    const to = to_str.map(to_uid=>new Types.ObjectId(to_uid));
    const text: string = req.body.text;
    try {
        const message = new Message(undefined, {
            uidfrom: user.uid,
            uidto: to,
            text: text,
            created: new Date()
        });
        await message.save();
        const messages = await Message.getByUids(user.uid, to[0]);
        return res.status(200).json(messages);
    } catch (err: any) {
        return res.status(400).json({ok: false, description: 'Could not send message to mutual match', user: user.json});
    }
}

export async function getmessageswithmutualmatch(c: any, req: Request, res: Response, user: User, bot: TelegramBot){
    const uid: Types.ObjectId = new Types.ObjectId(req.body.uid);
    try {
        const messages = await Message.getByUids(user.uid, uid);
        return res.status(200).json(messages);
    } catch (err: any) {
        return res.status(400).json({ok: false, description: 'Could not get messages with mutual match', user: user.json});
    }
}
