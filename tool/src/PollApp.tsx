import { ReactNode } from "react";
import "./PollApp.css";
import React from "react";
import { serverFetch } from "./model/common";
import { Pending } from "plutchik-reactjs-components";
export interface IPollAppProps {
    params: URLSearchParams
}
export interface IPollAppState {
    personid?: string;
    person_level_0?: string;
    person_level_1?: string;
    person_level_2?: string;
    poll?: any;
    opinionSaved?: boolean;
}
export default class PollApp extends React.Component<IPollAppProps, IPollAppState> {
    state: IPollAppState = {
        personid: localStorage.getItem("plutchart_poll_person")?localStorage.getItem("plutchart_poll_person") as string:undefined
    }
    pendingRef: React.RefObject<Pending> = React.createRef(); 
    loadPoll() {
        this.pendingRef.current?.incUse();
        serverFetch("poll/get", "POST", undefined, JSON.stringify({pollid: this.props.params.get("pollid"), personid: this.state.personid}), res=> {
            this.pendingRef.current?.decUse();
            console.log(res);
            const nState = this.state;
            nState.poll = res;
            this.setState(nState);
        }, err=> {
            this.pendingRef.current?.decUse();
            console.log(err);
        })
    }
    componentDidMount(): void {
        
        this.loadPoll();

    }
    renderPersonCreation(): ReactNode {
        let struct_level_1: any; 
        let struct_level_2: any; 
        if (this.state.poll !== undefined) {
            const struct_level_1_arr = this.state.poll.structure.filter((el: any)=> el.name === this.state.person_level_0);
            if (struct_level_1_arr.length === 1) struct_level_1 = struct_level_1_arr[0].options;
            
            if (struct_level_1 !== undefined) {
                const struct_level_2_arr = struct_level_1.filter((el: any)=> el.name === this.state.person_level_1);
                if (struct_level_2_arr.length === 1) struct_level_2 = struct_level_2_arr[0].options;
            }
        }
        return <div className="person-greetings-container">
            <div className="person-greetings-text">
                <img src="/tra.jpg" style={{borderRadius:"1em", boxShadow: "silver 0em 0em 1em 0.2em", width:"200px"}}/>
                <h2>Уважаемые участники опроса! </h2>
                <h5>Приглашаем вас высказать мнение относительно наблюдаемого вами в реальной действительности на рабочем месте в отношении поведения Ваших коллег.  Опрос займет около 7 минут вашего времени. Опрос анонимный, поэтому не стоит волноваться, что ваши объективные ответы будут использованы против вас. Задача опроса - оценить уровень культуры взаимного уважения и доверия в организации с целью последующего улучшения комфорта среды общения, лидерства и исполнения оперативных и долгосрочных задач. Спасибо за уделенное время</h5>
            </div>
            {this.state.poll !== undefined?<div>
                <h1>Опрос: {this.state.poll.name}</h1><h4>{this.state.poll.description}</h4>
                <div>
                    <label>Пожалуйста, выберите подразделение, в котором Вы работаете</label>
                    <select defaultValue={this.state.person_level_0} data-level={0} onChange={event=>{
                        const nState = this.state;
                        nState.person_level_0 = event.currentTarget.value;
                        nState.person_level_1 = undefined;
                        nState.person_level_2 = undefined;
                        this.setState(nState);
                    }}
                    ><option> </option>{this.state.poll.structure.map((el: any, idx: number)=><option key={idx} value={el.name}>{el.name}</option>)}</select>
                    {this.state.person_level_0 !== undefined && struct_level_1 !== undefined?<select defaultValue={this.state.person_level_1} data-level={1} onChange={event=>{
                        const nState = this.state;
                        nState.person_level_1 = event.currentTarget.value;
                        nState.person_level_2 = undefined;
                        this.setState(nState);
                    }}
                    >
                        <option> </option>
                        {struct_level_1.map((el: any, idx: number)=><option key={idx} value={el.name}>{el.name}</option>)}
                    </select>:<></>}
                    {this.state.person_level_0 !== undefined && struct_level_1 !== undefined && struct_level_2 !== undefined?<select defaultValue={this.state.person_level_2} data-level={1} onChange={event=>{
                        const nState = this.state;
                        nState.person_level_2 = event.currentTarget.value;
                        this.setState(nState);
                    }}
                    >
                        <option> </option>
                        {struct_level_2.map((el: any, idx: number)=><option key={idx} value={el.name}>{el.name}</option>)}
                    </select>:<></>}
                </div>
                {this.state.person_level_0 !== undefined && (struct_level_1 !== undefined && this.state.person_level_1 !== undefined || struct_level_1 === undefined) && 
                (struct_level_2 !== undefined && this.state.person_level_2 !== undefined || struct_level_2 === undefined)?<button onClick={event=>{
                    this.pendingRef.current?.incUse();
                    serverFetch("poll/person", "POST", undefined, JSON.stringify({
                        level0: this.state.person_level_0,
                        level1: this.state.person_level_1,
                        level2: this.state.person_level_2
                    }), res=> {
                        this.pendingRef.current?.decUse();
                        localStorage.setItem("plutchart_poll_person", res._id);
                        const nState = this.state;
                        nState.personid = res._id;
                        this.setState(nState);
                        console.log(res);
                    }, err=>{
                        this.pendingRef.current?.decUse();
                        console.log(err);
                    });
                }}
                >Начать отвечать на вопросы</button>:<></>}
            </div>
            :
            <></>}
            <Pending ref={this.pendingRef} />
        </div>
    }
    render(): ReactNode {
        if (this.state.personid === undefined) return this.renderPersonCreation();
        return <div className="quiz-container">
            {this.state.poll !== undefined?
            <><h3>Опрос: {this.state.poll.name}</h3>
            <h4>{this.state.poll.description}</h4>
            {this.state.poll.questions.length > 0? <div className="question-container">
                <h2>{this.state.poll.questions[0].name}</h2>
                <h4>{this.state.poll.questions[0].description}</h4>
                <h5>Если Вы не нашли в ответах варианта, наблюдаемого Вами в реальной действительности, пожалуйста, переходите к следующему вопросу, нажав кнопку ниже</h5>
                {this.state.poll.questions[0].type === "multi"?
                <div className="question-options-container">{this.state.poll.questions[0].answerOptions.map((option: any, idx: number)=><div key={idx}><input type="checkbox" data-option-number={idx}/>&nbsp;{option.name}</div>)}</div>
                :
                <div>{this.state.poll.questions[0].answerOptions.map((option: any, idx: number)=><div key={idx}><input name="answer" type="radio" data-option-number={idx}/>&nbsp;{option.name}</div>)}</div>
                }
            </div>:<div></div>}
            <div style={{paddingTop:"1em", textAlign:"center"}}><button onClick={event=> {
                const response = {
                    personid: this.state.personid,
                    pollid: this.state.poll._id,
                    questionid: this.state.poll.questions[0].id,
                    choosenoptions: new Array<any>()
                };
                for (const idx in this.state.poll.questions[0].answerOptions) {
                    const option = this.state.poll.questions[0].answerOptions[idx];
                    const el = document.querySelector(`input[data-option-number="${idx}"]`)
                    if (el && (el as any).checked) {
                        response.choosenoptions.push(option);
                        (el as any).checked = false;
                    }
                    
                }
                this.pendingRef.current?.incUse();
                serverFetch("poll/assess", "POST", undefined, JSON.stringify(response), res=> {
                    this.pendingRef.current?.decUse();
                    const nState = this.state;
                    nState.poll = res;
                    this.setState(nState);
                    console.log(res);
                }, err=> {
                    this.pendingRef.current?.decUse();
                    const nState = this.state;
                    nState.poll = undefined;
                    this.setState(nState);
                    console.log(err);
                })
            }}>Ответить на вопрос</button></div>
            </>:<div style={{textAlign:"center"}}><h1>Спасибо за Ваши ответы</h1>
            {!this.state.opinionSaved?<><h5>У вас есть возможность анонимно оставить мнение о ситуации с культурой взаимного уважения и доверия в организации, высказать пожелания и комментарии. Ваши ответы останутся анонимными. Просьба соблюдать деловую этику в выражении вашего мнения, основанного на реальных наблюдениях фактов в организации в отношении поведения лидеров, коммуникаций между сотрудниками и исполнения оперативных и стратегических задач.</h5>
            <textarea id="opinion" placeholder="Мое мнение о ситуации в компании" maxLength={2000}/>
            <button onClick={event=> {
                this.pendingRef.current?.incUse();
                serverFetch("poll/opinion", "POST", undefined, JSON.stringify({
                    personid: this.state.personid,
                    text: (document.getElementById("opinion") as any).value
                }), res=> {
                    //debugger
                    this.pendingRef.current?.decUse();
                    const nState = this.state;
                    nState.opinionSaved = true;
                    this.setState(nState);
                    console.log(res);
                }, err=> {
                    //debugger
                    this.pendingRef.current?.decUse();
                })
            }}>Отправить</button></>:<></>}
            </div>}
            <Pending ref={this.pendingRef} />
        </div>
    }
}