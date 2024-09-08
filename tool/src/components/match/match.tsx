import React from "react";
import { ReactNode } from "react";
import "./match.css";
import { ITGLoginInfo } from "../assess/assess";
import { Pending, Toaster, EmotionVector, Flower, Formula, ToastType, Charts } from "plutchik-reactjs-components";
import { serverFetch } from "../../model/common";
import Chat, { IMessage } from "../chat/chat";
import { ML } from "../../model/mlstring";

export interface IMatchProps {
	tgLoginInfo: ITGLoginInfo;
	toaster?: React.RefObject<Toaster>;
	pending?: React.RefObject<Pending>;
    uid?: string;
}

export interface IMatchState {
    myVector?: EmotionVector;
    candidateVector?: EmotionVector;
    deltaVector?: EmotionVector;
    me?: any;
    candidate?: any;
    mutuallike?: boolean;
    messages: any [];
    mutuals: any []
}

export default class Match extends React.Component<IMatchProps, IMatchState> {
    state: Readonly<IMatchState> = {messages: [], mutuals: []};
    private prepareHeaders(): Headers {
		const headers = new Headers();
		if (this.props.tgLoginInfo.querycheckstring) headers.append("plutchik-tgquerycheckstring", this.props.tgLoginInfo.querycheckstring);
		if (this.props.tgLoginInfo.tguserid) headers.append("plutchik-tguid", this.props.tgLoginInfo.tguserid);
		if (this.props.tgLoginInfo.sessiontoken) headers.append("plutchik-sessiontoken", this.props.tgLoginInfo.sessiontoken);
		return headers;
	}

    updateCandidate(res?: any){
        const nState: IMatchState = this.state;
        nState.myVector = res?new EmotionVector(res.vectors.vector):undefined;
        nState.candidateVector = res?new EmotionVector(res.vectors.candidate):undefined;
        nState.deltaVector = res?new EmotionVector(res.vectors.delta).align().norm():undefined;
        nState.me = res?res.user:undefined;
        nState.candidate = res?res.matchcandidate:undefined;
        nState.mutuallike = res?res.mutuallike:undefined;
        nState.messages = res?res.messages:[];
        this.setState(nState);
    }

    updateNoCandidate(data: any){
        const nState: IMatchState = this.state;
        nState.myVector = undefined
        nState.candidateVector = undefined;
        nState.deltaVector = undefined;
        nState.me = data.user;
        nState.candidate = undefined;
        nState.messages = [];
        nState.mutuals = data.mutuals;
        this.setState(nState);
    }

    loadNextMatch(uid?: string) {
        serverFetch("getnextmatchcandidate", "POST", this.prepareHeaders(), uid === undefined?undefined:JSON.stringify({uid:uid}), res=>{
            this.updateCandidate(res);
        }, err=>{
            this.updateNoCandidate(err.rawData);
        } )
    }
    onClickSkip(event: any) {
        serverFetch("skipmatchcandidate", "POST", this.prepareHeaders(), JSON.stringify({
            candidateid: this.state.candidate?._id
        }), res=>{
            this.updateCandidate(res);
        }, err=>{
            this.updateNoCandidate(err.rawData.user);
        })
    }

    onClickLike(event: any) {
        serverFetch("likematchcandidate", "POST", this.prepareHeaders(), JSON.stringify({
            candidateid: this.state.candidate?._id
        }), res=>{
            this.updateCandidate(res);
        }, err=>{
            this.updateNoCandidate(err.rawData);
        })
    }

    onClickClearSkippedList(event: any) {
        const curOpt = this.state.me?.datingsettings?this.state.me.datingsettings:{};
        curOpt.clearskippedlist = true
        serverFetch("setmatchoptions", "POST", this.prepareHeaders(), JSON.stringify(curOpt), res=>{
            this.loadNextMatch();
            this.props.toaster?.current?.addToast({
                message: ML(`Skipped list is clear`, this.state.me?.nativelanguage),
                type: ToastType.info
            });
        }, err=>{
            this.updateNoCandidate(err.rawData);
        })
    }

    onClickClearLikedList(event: any) {
        const curOpt = this.state.me?.datingsettings?this.state.me.datingsettings:{};
        curOpt.clearlikedlist = true
        serverFetch("setmatchoptions", "POST", this.prepareHeaders(), JSON.stringify(curOpt), res=>{
            this.loadNextMatch();
            this.props.toaster?.current?.addToast({
                message: ML(`Liked list was clear`, this.state.me?.nativelanguage),
                type: ToastType.info
            });
        }, err=>{
            this.updateNoCandidate(err.rawData);
        })
    }

    onSuspendMatchClick(event: any) {
        const curOpt = this.state.me?.datingsettings?this.state.me.datingsettings:{};
        curOpt.readytomatch = !curOpt.readytomatch;
        serverFetch("setmatchoptions", "POST", this.prepareHeaders(), JSON.stringify(curOpt), res=>{
            this.loadNextMatch();
            this.props.toaster?.current?.addToast({
                message: curOpt.readytomatch?ML(`You're ready to match`, this.state.me?.nativelanguage):ML(`You're not reachable`, this.state.me?.nativelanguage) ,
                type: ToastType.info
            });
        }, err=>{
            this.updateNoCandidate(err.rawData);
        })
    }

    componentDidMount(): void {
        this.loadNextMatch(this.props.uid);
    }
    renderNoMatch(): ReactNode {
        return <div className="nomatch-container">
            <div className="nomatch-mutuals">
                <div>{ML("My mutuals", this.state.me?.nativelanguage)}</div>
                <div>
                {this.state.mutuals?.map((m, i)=><span key={i}><a href={`?uid=${m._id}`}>{m.name}</a></span>)}
                </div>
            </div>
            <div>{ML("No more match. Invite friend", this.state.me?.nativelanguage)}</div>
            <a target="_blank" rel="noreferrer" href={`https://t.me/share/url?url=${encodeURIComponent(`https://t.me/${process.env.REACT_APP_PLUTCHART_BOT_USER_NAME}/?start="from_match"`)}&text=${encodeURIComponent(ML(`Invite your friends to check out their emotional azimuth`, this.state.me?.nativelanguage))}`}>
            <button style={
                {backgroundImage: "url('/telegram-logo.svg')",
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                width:"10em", height:"10em",
                backgroundColor:"transparent",
                borderWidth:0
                }
            }></button></a>
            <div className="nomatch-toolbar">
                <button onClick={this.onClickClearSkippedList.bind(this)}>{ML("Clear all skipped", this.state.me?.nativelanguage)}</button>
                <button onClick={this.onClickClearLikedList.bind(this)}>{ML("Clear all liked", this.state.me?.nativelanguage)}</button>
            </div>
            <div className="nomatch-toolbar">
                <button onClick={this.onSuspendMatchClick.bind(this)}>{this.state.me?.datingsettings?.readytomatch?ML("I don't want to be matched", this.state.me?.nativelanguage):ML("I want to be matched", this.state.me?.nativelanguage)}</button>
            </div>
        </div>
    }
    refreshMessages() {
        serverFetch("getmessageswithmutualmatch", "POST", this.prepareHeaders(), JSON.stringify({uid: this.state.candidate._id}), res=>{
            const nState: IMatchState = this.state;
            nState.messages = res;
            this.setState(nState);
        }, err=> {

        })
    }
    sendMessage(m: IMessage): Promise<boolean> {
        const promise = new Promise<boolean>((resolve, reject)=> {
            serverFetch("sendmessagetomutualmatch", "POST", this.prepareHeaders(), JSON.stringify({
                to:[this.state.candidate._id],
                text: m.text
            }), res=>{
                //debugger
                resolve(true);
                const nState: IMatchState = this.state;
                nState.messages = res;
                this.setState(nState);
            }
            , err=>{
                debugger
            });
        });
        return promise;
    }
	renderMatch(): ReactNode {
        //let age: number | undefined = undefined;
        const age = this.state.candidate.birthdate?Math.round((new Date().getTime() - new Date(this.state.candidate.birthdate).getTime())/1000/60/60/24/365.25):undefined;
        
		return <div className="match-container">
            <div className="candidate-info">
                <div>{this.state.candidate?.name?this.state.candidate.name:"??"}</div>
                <div>
                <span><span>{ML("language", this.state.me.nativelanguage)}</span><span>{this.state.candidate.nativelanguage}</span></span>
                <span><span>{ML("age", this.state.me.nativelanguage)}</span><span>{age?`${age}`:"??"}</span></span>
                <span><span>{ML("gender", this.state.me.nativelanguage)}</span><span>{ML(this.state.candidate?.gender?this.state.candidate?.gender:"??", this.state.me.nativelanguage)}</span></span>
                <span><span>{ML("common assessments", this.state.me.nativelanguage)}</span><span>{this.state.candidate.commonContentAssessmentsCount}</span></span>
                </div>
            </div>
            {this.state.mutuallike?<Chat me={this.state.me} messages={this.state.messages} onSendMessage={this.sendMessage.bind(this)} onNeedUpdateThread={this.refreshMessages.bind(this)}/>:
            <div className="candidate-profile">
            {this.state.deltaVector !== undefined?<>
                <div>Ниже список базовых и сложных эмоций, которых у человека больше, чем у Вас. Эмоции перечислены по убыванию их силы </div>
                <Formula vector={this.state.deltaVector} showAllComplexEmotions={true} upperCase={true}/>
                <div style={{margin: "auto"}}><Charts vector={this.state.deltaVector}/></div>
                {/*<Flower width="50vh" vector={this.state.deltaVector} />*/}
            </>:<></>}
            </div>}
            <div className="match-toolbar"><button className="trash-button" onClick={this.onClickSkip.bind(this)}></button><button className="like-button" onClick={this.onClickLike.bind(this)}></button></div>
        </div>;
	}
    
    renderMutual(): ReactNode {
        return <div>Mutual</div>
    }

    render(): ReactNode {
        if (this.state.candidate !== undefined) {
            //if (this.state.mutuallike) return this.renderMutual()
            return this.renderMatch()
        } else {
            return this.renderNoMatch()
        }
    }
}
