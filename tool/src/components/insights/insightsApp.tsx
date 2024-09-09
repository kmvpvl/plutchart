import { ReactNode } from "react"
import "./insightsApp.css"
import React from "react"
import { ITGLoginInfo } from "../assess/assess";
import { Charts, EmotionVector, Formula, IEmotionVector, Pending, Toaster } from "plutchik-reactjs-components";
import { serverFetch } from "../../model/common";
import { ML } from "../../model/mlstring";
export interface IInsightsAppProps {
	tgLoginInfo: ITGLoginInfo;
	toaster?: React.RefObject<Toaster>;
	pending?: React.RefObject<Pending>;
    uid?: string;
}

export interface IInsightsAppState {
    myVector: IEmotionVector;
    othersVector: IEmotionVector;
    myAssessmentsCount: number;
    othersAssessmentsCount: number;
    delta:IEmotionVector;
    user: any;
}

export default class InsightsApp extends React.Component<IInsightsAppProps, IInsightsAppState> {
    private prepareHeaders(): Headers {
		const headers = new Headers();
		if (this.props.tgLoginInfo.querycheckstring) headers.append("plutchik-tgquerycheckstring", this.props.tgLoginInfo.querycheckstring);
		if (this.props.tgLoginInfo.tguserid) headers.append("plutchik-tguid", this.props.tgLoginInfo.tguserid);
		if (this.props.tgLoginInfo.sessiontoken) headers.append("plutchik-sessiontoken", this.props.tgLoginInfo.sessiontoken);
		return headers;
	}
    componentDidMount(): void {
        this.loadUserInsights();
    }
    loadUserInsights() {
        serverFetch("getinsights", "POST", this.prepareHeaders(), undefined, res=>{
            const nState: IInsightsAppState = {
                myAssessmentsCount: res.observe.ownVector.count,
                myVector: res.observe.ownVector,
                othersAssessmentsCount: res.observe.othersVector.count,
                othersVector: res.observe.othersVector,
                delta: new EmotionVector(),
                user: res.user
            }
            //debugger
            const othT = new EmotionVector(res.observe.othersVector);
            othT.mult(-1);
            const myT = new EmotionVector(res.observe.ownVector);
            myT.add(othT);
            nState.delta = myT.align().norm(); 
            this.setState(nState);
        }, err=>{

        })
    }
    render(): ReactNode {
        return <div className="insights-app-container">
            <div>{ML("The emotions listed below are the most prevalent in you compared to people who assessed the same content. The emotions are listed in descending order of intensity.", this.state?.user.nativelanguage)}</div>
            <div>{this.state?<Formula vector={this.state.delta} upperCase={true}/>:<></>}</div>
            <div>{this.state?<Charts label={ML(`My vector`, this.state?.user.nativelanguage)} vector={this.state.myVector}/>:<></>}</div>
            <div>{this.state?<Charts label={ML(`Content items' vector`, this.state?.user.nativelanguage)} vector={this.state.othersVector}/>:<></>}</div>
        </div> 
    }
}