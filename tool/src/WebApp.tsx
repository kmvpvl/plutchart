import React, { ReactNode } from "react";
import "./WebApp.css";
import Assess, { ITGLoginInfo } from "./components/assess/assess";
import { Pending, Toaster } from "plutchik-reactjs-components";
import TGLogin, {LoginFormStates} from "./components/loginForm/loginForm";
import { IServerInfo } from "./model/common";
export interface IWebAppState {
    tgLoginInfo: ITGLoginInfo
}
declare global {
    interface Window {
        Telegram: any;
    }
}
export default class WebApp extends React.Component <{mode: string}, IWebAppState> {
    toastsRef: React.RefObject<Toaster> = React.createRef();
    pendingRef: React.RefObject<Pending> = React.createRef();
    loginRef: React.RefObject<TGLogin> = React.createRef();
    state: IWebAppState = {
        tgLoginInfo: {}
    }
    componentDidMount(): void {
        const tgLoginInfo: ITGLoginInfo = {};
        tgLoginInfo.tguserid = window.Telegram.WebApp.initData?window.Telegram.WebApp.initDataUnsafe.user.id:undefined;
        tgLoginInfo.querycheckstring = window.Telegram.WebApp.initData?window.Telegram.WebApp.initData:undefined;
        //tgLoginInfo.sessiontoken = window.Telegram.WebApp.initData?undefined:this.loginRef.current?.serverInfo.sessiontoken;
        this.setState({tgLoginInfo: tgLoginInfo});
    }

    onLogged(os: string, ns: string, si:IServerInfo) {
        //debugger
        if (ns === LoginFormStates.logged) {
            const tgLoginInfo: ITGLoginInfo = {};
            tgLoginInfo.tguserid = si.tguserid?.toString();
            tgLoginInfo.sessiontoken = si.sessiontoken;
            this.setState({tgLoginInfo: tgLoginInfo});
        }
    }
    render(): ReactNode {
        window.Telegram.WebApp.expand();
        //window.Telegram.WebApp.initDataUnsafe.user.id
        //window.Telegram.WebApp.initData
        //this.loginRef.current?.serverInfo.sessiontoken
        //this.loginRef.current?.serverInfo.tguserid
        //debugger
        return <div className="webapp-container">
            {this.state.tgLoginInfo.tguserid?
            /** Auth by telegram */
            <>
            <Assess tgLoginInfo={this.state.tgLoginInfo} toaster={this.toastsRef} pending={this.pendingRef}/>
            <Toaster ref={this.toastsRef} placesCount={2}/>
            <Pending ref={this.pendingRef}/>
            </>:
            /* Not from Telegram */
            <>
            <TGLogin onError={()=>{}} onStateChanged={this.onLogged.bind(this)} ref={this.loginRef}/>
            </>}
        </div>
    }
}
