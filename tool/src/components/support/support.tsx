import { ReactNode, RefObject } from "react";
import "./support.css";
import React from "react";
import { IServerInfo, serverCommand, serverFetch } from "../../model/common";

export interface ISupportProps {
    serverInfo: IServerInfo;

}

export interface ISupportState {
    userStats?: any;

}

export default class Support extends React.Component<ISupportProps, ISupportState> {
    state: ISupportState = {};
    private tguseridRef: RefObject<HTMLInputElement> = React.createRef();
    loadUser(tguserid?: string) {
        //debugger
        tguserid = tguserid?tguserid:this.tguseridRef.current?.value;
        if (tguserid !== undefined) {
            serverCommand("supportuserstats", this.props.serverInfo, JSON.stringify({tguserid: tguserid}), res=> {
                this.setState({userStats: res});
            }, err=>{

            })
        }
    }
    render(): ReactNode {
        return <div className="support-container">
            <div><input type="text" placeholder="Telegram id" ref={this.tguseridRef}/><button onClick={this.loadUser.bind(this, this.tguseridRef.current?.value)}>Load</button></div>
            <div>{this.state.userStats?JSON.stringify(this.state.userStats, undefined, 4):""}</div>
        </div>
    }
}