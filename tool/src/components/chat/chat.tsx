import { ReactNode } from "react"
import "./chat.css"
import React from "react"
import { relativeDateString } from "../../model/common";
import { ML } from "../../model/mlstring";

export interface IMessage {
    text: string
}
export interface IChatProps {
    messages: any[];
    onSendMessage: (message: IMessage)=>Promise<boolean>;
    onNeedUpdateThread: ()=>void;
    me:any
}

export interface IChatState {

}

export default class Chat extends React.Component<IChatProps, IChatState> {
    newMessageRef: React.RefObject<HTMLInputElement> = React.createRef();
    messagesRef: React.RefObject<HTMLDivElement> = React.createRef();
    timer?: NodeJS.Timer;
    componentDidUpdate(prevProps: Readonly<IChatProps>, prevState: Readonly<IChatState>, snapshot?: any): void {
        
    }
    componentDidMount(): void {
        this.timer = setInterval((() => {
            this.props.onNeedUpdateThread();        
        }).bind(this), 10000);
    }
    componentWillUnmount(): void {
        clearInterval(this.timer);
    }
    onSendMessage(event: any) {
        const text = this.newMessageRef.current?.value;
        if (text !== undefined){
            this.props.onSendMessage({text: text})
            .then(val=>{
                if (this.newMessageRef.current) this.newMessageRef.current.value = ""
            });
        }
    }
    render(): ReactNode {
        return <div className="chat-container">
            <div className="chat-messages" ref={el=>el?.scrollTo(0, el.scrollHeight)}>
                {this.props.messages.length === 0? <>No messages yet</>:this.props.messages.map((m, i)=><div className={m.uidfrom === this.props.me._id?"chat-message-my":"chat-message-others"} key={i}>
                    <span>{m.text}</span>
                    <span>{relativeDateString(new Date(m.created))}</span>
                </div>)}
            </div>
            <div className="chat-new-message">
                <span></span>
                <input ref={this.newMessageRef} placeholder={ML("Write message here...", this.props.me.nativelanguage)}/>
                <button className="send-button" onClick={this.onSendMessage.bind(this)}/>
            </div>
        </div>
    }
}