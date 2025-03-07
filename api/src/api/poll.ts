import { Types } from "mongoose";
import User from "../model/user";
import TelegramBot from "node-telegram-bot-api";
import { Request, Response } from 'express';
import colours from "../model/colours";
import { mongoPolls, Opinion, Person, Poll, PollAssessment } from "../model/poll";
import PlutchikError from "../model/error";

export async function getPoll(c: any, req: Request, res: Response, user: User, bot: TelegramBot){
    let pollid = new Types.ObjectId(req.body.pollid);
    const personid = req.body.personid;
    console.log(`${colours.fg.blue}Args: pollid = '${pollid}'; personid = '${personid}'${colours.reset}`);
    try {
        while (true){
          const poll = new Poll(pollid);
          await poll.load();
          const polls = await mongoPolls.aggregate([
              {$match:{_id: new Types.ObjectId(pollid)}},
              {$unwind:{path: "$questions"}},
              {$lookup:{
                    from: "poll_assessments",
                    localField: "questions.id",
                    foreignField: "questionid",
                    as: "answered",
                    pipeline: [{$match: {personid: new Types.ObjectId(personid), pollid: new Types.ObjectId(pollid)}}]
                  }},
              {$match:{$expr: {$eq: [{$size: "$answered"},0]}}},
              {$group:{
                    _id: "$_id",
                    name: {
                      $first: "$name"
                    },
                    description: {
                      $first: "$description"
                    },
                    structure: {
                      $first: "$structure"
                    },
                    questions: {
                      $push: "$questions"
                    }
                  }
              }
            ]);
          if (polls.length === 1) return res.status(200).json(polls[0]);
          if (poll.json.nextPollChain !== undefined) {
            pollid = poll.json.nextPollChain;
            continue;
          }
          throw new Error("Unable return remaining questions")
        }
    } catch (e: any) {
        return res.status(404).json({ok: false, errorRaw: JSON.stringify(e), errorText: `Couldn't return poll uid = '${pollid}'`});
    }
}

export async function newPollPerson(c: any, req: Request, res: Response, user: User, bot: TelegramBot){
    const level0 = req.body.level0;
    const level1 = req.body.level1;
    const level2 = req.body.level2;
    try {
        const person = new Person();
        await person.load({
            level0: level0,
            level1: level1,
            level2: level2,
            created: new Date()
        });
        await person.save();
        return res.status(200).json(person.json);
    } catch (e: any) {
        return res.status(400).json({ok: false, errorRaw: JSON.stringify(e), errorText: `Couldn't create new poll person`});
    }
}


export async function savePollOpinion(c: any, req: Request, res: Response, user: User, bot: TelegramBot){
    const personid = req.body.personid;
    const text = req.body.text;
    try {
        const op = new Opinion(undefined, {
            personid: personid,
            text: text,
            created: new Date()
        })
        await op.save();
        return res.status(200).json({ok: true});
    } catch(e: any) {
        return res.status(400).json({ok: false, errorRaw: JSON.stringify(e), errorText: `Couldn't save opinion`});
    }
}

export async function savePollAssessment(c: any, req: Request, res: Response, user: User, bot: TelegramBot){
    const personid = req.body.personid;
    let pollid = new Types.ObjectId(req.body.pollid);
    const questionid = parseInt(req.body.questionid);
    const choosenoptions = req.body.choosenoptions;
    try {
        const person = new Person(new Types.ObjectId(personid));
        await person.load();
        const poll = new Poll(new Types.ObjectId(pollid));
        await poll.load();
        if (poll.json.questions.filter(el => el.id == questionid).length !== 1) throw Error("Incostisnce of poll and answer");
        const assessment = new PollAssessment(undefined, {
            created: new Date(),
            personid: personid,
            pollid: pollid,
            questionid: questionid,
            choosenoptions: choosenoptions
        })
        await assessment.save();
        while (true) {
                const poll = new Poll(pollid);
                await poll.load();
              const polls = await mongoPolls.aggregate([
                {$match:{_id: new Types.ObjectId(pollid)}},
                {$unwind:{path: "$questions"}},
                {$lookup:{
                    from: "poll_assessments",
                    localField: "questions.id",
                    foreignField: "questionid",
                    pipeline: [{$match: {personid: new Types.ObjectId(personid), pollid: new Types.ObjectId(pollid)}}],
                    as: "answered"
                    }},
                {$match:{$expr: {$eq: [{$size: "$answered"},0]}}},
                {$group:{
                    _id: "$_id",
                    name: {
                        $first: "$name"
                    },
                    description: {
                        $first: "$description"
                    },
                    structure: {
                        $first: "$structure"
                    },
                    questions: {
                        $push: "$questions"
                    }
                    }
                }
            ]);
            if (polls.length === 1) return res.status(200).json(polls[0]);
            if (poll.json.nextPollChain !== undefined) {
                pollid = poll.json.nextPollChain;
                continue;
            }
            return res.status(404).json({ok: false, message: "Unable return remaining questions"});
        }
    } catch (e: any) {
        return res.status(400).json({ok: false, errorRaw: JSON.stringify(e), errorText: `Couldn't save assessment`});
    }
}
