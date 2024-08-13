import { ReactNode, RefObject } from "react";
import "./support.css";
import React from "react";
import { IServerInfo, PlutchikError, serverCommand } from "../../model/common";
import { Charts, Pending } from "plutchik-reactjs-components";

export interface ISupportProps {
    serverInfo: IServerInfo;
    pending?: RefObject<Pending>;
    onError?: (err: PlutchikError)=>void,
    onSuccess?: (text: string)=>void,
}

export interface ISupportState {
    usersRating?: Array<any>; 
    userStats?: any;

}

export default class Support extends React.Component<ISupportProps, ISupportState> {
    state: ISupportState = {};
    private usersList: RefObject<HTMLSelectElement> = React.createRef();
    private tguseridRef: RefObject<HTMLInputElement> = React.createRef();
    private messageRef: RefObject<HTMLTextAreaElement> = React.createRef();
    componentDidMount(): void {
        this.loadUsersRating();
    }
    loadUser(tguserid?: string) {
        //debugger
        tguserid = tguserid?tguserid:this.tguseridRef.current?.value;
        if (tguserid !== undefined) {
            if (this.props.pending) this.props.pending?.current?.incUse();
            serverCommand("supportuserstats", this.props.serverInfo, JSON.stringify({tguserid: tguserid}), res=> {
                if (this.props.pending) this.props.pending?.current?.decUse();
                const nState: ISupportState = this.state;
                nState.userStats = res;
                this.setState(nState);
                }, err=>{
                if (this.props.pending) this.props.pending?.current?.decUse();
                if (this.props.onError) this.props.onError(err);
            })
        }
    }
    loadUsersRating() {
        if (this.props.pending) this.props.pending?.current?.incUse();
        serverCommand("supportusersrating", this.props.serverInfo, undefined, res=> {
            if (this.props.pending) this.props.pending?.current?.decUse();
            const nState: ISupportState = this.state;
            nState.usersRating = res;
            this.setState(nState);
        }, err=>{
            if (this.props.pending) this.props.pending?.current?.decUse();
            if (this.props.onError) this.props.onError(err);
        })
    }

    onUserSelected(event: any) {
        if (this.tguseridRef.current) this.tguseridRef.current.defaultValue = event.currentTarget.value;
    }

    render(): ReactNode {
        return <div className="support-container">
            <div><select onChange={this.onUserSelected.bind(this)} ref={this.usersList}>{this.state.usersRating?.map((v, i)=><option value={v.tguserid}>{v.assessments_count}-{v.name}-{v.nativelanguage}-{v.tguserid}</option>)}</select></div>
            <div><input type="text" placeholder="Telegram id" ref={this.tguseridRef}/><button onClick={this.loadUser.bind(this, this.tguseridRef.current?.value)}>Load</button></div>
            {this.state.userStats?<>
            <div>
                <div>Name: {this.state.userStats?.userData.name}</div>
                <div>Lang: {this.state.userStats?.userData.nativelanguage}</div>
                <div>Birthdate: {this.state.userStats.userData.birthdate}</div>
                <div>Registered: {this.state.userStats?.userData.created}</div>
            </div>
            <div> <span>Organizations</span>
                {this.state.userStats?.orgs?.map((v: any, i: any)=><div key={i}>{v.name}</div>)}
            </div>
            <div><span>Sutable time to chat: {this.state.userStats?.sutableTime}</span></div>
            <div><span>Content</span>
                <div>Count: {this.state.userStats?.content.count}</div>
                <div>Last created: {this.state.userStats?.content.last_created}</div>
            </div>
            <div><span>Assessments</span>
                <div>Count: {this.state.userStats?.assessments.count}</div>
                <div>Last created: {this.state.userStats?.assessments.last_created}</div>
            </div>
            <div>
                <Charts vector={this.state.userStats.observeAssessments.ownVector} label="Own vector"/> 
                <Charts vector={this.state.userStats.observeAssessments.othersVector} label="Others"/> 
            </div>
            <div>
                <textarea placeholder="Type message to user here" ref={this.messageRef}></textarea>
                <button onClick={()=>{
                    serverCommand("supportsendmessagetouser", this.props.serverInfo, JSON.stringify({
                        uid: this.state.userStats.userData._id,
                        message: this.messageRef.current?.value
                    }), res=>{
                        if (this.props.onSuccess) this.props.onSuccess("Message was sent successfully")
                    }, err=>{
                        if (this.props.onError) this.props.onError(err);
                    })
                }}
                >Send message to user</button>
            </div>
            </>:<></>}
        </div>
    }
}