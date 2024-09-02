import React from "react";
import { ReactNode } from "react";
import "./match.css";
import { ITGLoginInfo } from "../assess/assess";
import { Pending, Toaster, EmotionVector, Flower, Formula, ToastType } from "plutchik-reactjs-components";
import { serverFetch } from "../../model/common";

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
}

export default class Match extends React.Component<IMatchProps, IMatchState> {
    state: Readonly<IMatchState> = {};
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
        this.setState(nState);
    }

    updateNoCandidate(user: any){
        const nState: IMatchState = this.state;
        nState.myVector = undefined
        nState.candidateVector = undefined;
        nState.deltaVector = undefined;
        nState.me = user;
        nState.candidate = undefined;
        this.setState(nState);
    }

    loadNextMatch(uid?: string) {
        serverFetch("getnextmatchcandidate", "POST", this.prepareHeaders(), uid === undefined?undefined:JSON.stringify({uid:uid}), res=>{
            this.updateCandidate(res);
        }, err=>{
            this.updateNoCandidate(err.rawData.user);
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
            this.updateNoCandidate(err.rawData.user);
        })
    }

    onClickClearSkippedList(event: any) {
        const curOpt = this.state.me?.datingsettings?this.state.me.datingsettings:{};
        curOpt.clearskippedlist = true
        serverFetch("setmatchoptions", "POST", this.prepareHeaders(), JSON.stringify(curOpt), res=>{
            this.loadNextMatch();
            this.props.toaster?.current?.addToast({
                message: `Skipped list is clear`,
                type: ToastType.info
            });
        }, err=>{
            this.updateNoCandidate(err.rawData.user);
        })
    }

    onClickClearLikedList(event: any) {
        const curOpt = this.state.me?.datingsettings?this.state.me.datingsettings:{};
        curOpt.clearlikedlist = true
        serverFetch("setmatchoptions", "POST", this.prepareHeaders(), JSON.stringify(curOpt), res=>{
            this.loadNextMatch();
            this.props.toaster?.current?.addToast({
                message: `Liked list is clear`,
                type: ToastType.info
            });
        }, err=>{
            this.updateNoCandidate(err.rawData.user);
        })
    }

    onSuspendMatchClick(event: any) {
        const curOpt = this.state.me?.datingsettings?this.state.me.datingsettings:{};
        curOpt.readytomatch = !curOpt.readytomatch;
        serverFetch("setmatchoptions", "POST", this.prepareHeaders(), JSON.stringify(curOpt), res=>{
            this.loadNextMatch();
            this.props.toaster?.current?.addToast({
                message: curOpt.readytomatch?`You're ready to match`:`You're not reachable`,
                type: ToastType.info
            });
        }, err=>{
            this.updateNoCandidate(err.rawData.user);
        })
    }

    componentDidMount(): void {
        this.loadNextMatch(this.props.uid);
    }
    renderNoMatch(): ReactNode {
        return <div className="nomatch-container">
            <div></div>
            <div>No more match. Invite friend</div>
            <a target="_blank" rel="noreferrer" href={`https://t.me/share/url?url=${encodeURIComponent(`https://t.me/${process.env.REACT_APP_PLUTCHART_BOT_USER_NAME}/?start="from_match"`)}&text=${encodeURIComponent(`Invite your friends to check out their emotional azimuth`)}`}>
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
                <button onClick={this.onClickClearSkippedList.bind(this)}>Clear all skipped</button>
                <button onClick={this.onClickClearLikedList.bind(this)}>Clear all liked</button>
            </div>
            <div className="nomatch-toolbar">
                <button onClick={this.onSuspendMatchClick.bind(this)}>{this.state.me?.datingsettings?.readytomatch?`I don't want to be matched`:`I want to be matched`}</button>
            </div>
        </div>
    }
	renderMatch(): ReactNode {
        //let age: number | undefined = undefined;
        const age = this.state.candidate.birthdate?Math.round((new Date().getTime() - new Date(this.state.candidate.birthdate).getTime())/1000/60/60/24/365.25):undefined;
        
		return <div className="match-container">
            <div className="candidate-info">
                <div>{this.state.candidate?.name?this.state.candidate.name:"??"}</div>
                <div>
                <span><span>language</span><span>{this.state.candidate.nativelanguage}</span></span>
                <span><span>age</span><span>{age?`${age}`:"??"}</span></span>
                <span><span>gender</span><span>{this.state.candidate?.gender?this.state.candidate?.gender:"??"}</span></span>
                <span><span>общих оценок</span><span>{this.state.candidate.commonContentAssessmentsCount}</span></span>
                </div>
            </div>
            <div className="candidate-profile">
            {this.state.deltaVector !== undefined?<>
                <div>Ниже эмоциональный вектор человека по отношению к Вашему эмоциональному вектору. Эмоции перечислены по убыванию их силы </div>
                <Formula vector={this.state.deltaVector} showAllComplexEmotions={true} upperCase={true}/>
                <Flower width="50vh" vector={this.state.deltaVector} />
            </>:<></>}
            </div>
            <div className="match-toolbar"><button className="trash-button" onClick={this.onClickSkip.bind(this)}></button><button className="like-button" onClick={this.onClickLike.bind(this)}></button></div>
        </div>;
	}
    render(): ReactNode {
        if (this.state.candidate !== undefined) {
            return this.renderMatch()
        } else {
            return this.renderNoMatch()
        }
    }
}
