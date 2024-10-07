import { ReactNode } from "react";
import "./demo.css";
//import {Flower} from "flower"
import React from "react";
import { Chart, Emotion, Flower, Formula, IEmotionVector } from "plutchik-reactjs-components";
import MLString from "../mlstrings";

export interface IDemoProps {};
export interface IDemoState {
    curVector: IEmotionVector;
};
const strComplexEmotionsDemo = new MLString({
    default: "COMPLEX EMOTIONS", 
    values: new Map([
        ["en-US", "COMPLEX EMOTIONS"],
        ["de", "KOMPLEXE EMOTIONEN"],
        ["fr", "D'ÉMOTIONS COMPLEXES"],
        ["es", "EMOCIONES COMPLEJAS"],
        ["uk", "СКЛАДНІ ЕМОЦІЇ"],
        ["ru", "КОМПЛЕКСНЫЕ ЭМОЦИИ"]])
});
  
const strTip1 = new MLString({
    default: "Use the controls to mix your emotion.", 
    values: new Map([
        ["de", "Verwenden Sie die Steuerelemente, um Ihre Emotionen zu mischen."],
        ["fr", "Utilisez les commandes pour mélanger vos émotions."],
        ["es", "Usa los controles para mezclar tus emociones."],
        ["uk", "Використовуйте елементи керування, щоб комбінувати свої емоції."],
        ["ru", "Используйте элементы управления, чтобы смешивать свои эмоции."]])
});
const strTip2 = new MLString({
    default: "You can manage by rolling the mouse wheel or drag pointer or click to the emotion scale", 
    values: new Map([
        ["de", "Sie können dies tun, indem Sie das Mausrad drehen, den Zeiger ziehen oder auf die Emotionsskala klicken."],
        ["fr", "Vous pouvez gérer en faisant tourner la molette de la souris, en faisant glisser le pointeur ou en cliquant sur l'échelle des émotions"],
        ["es", "Puedes administrarlo girando la rueda del mouse o arrastrando el puntero o haciendo clic en la escala de emociones."],
        ["uk", "Ви можете керувати, обертаючи колесо миші або перетягуючи вказівник або клацаючи на шкалу емоцій"],
        ["ru", "Вы можете управлять, вращая колесико мыши или перетаскивая указатель или нажимая на шкалу эмоций."]])
});
export default class Demo extends React.Component <IDemoProps, IDemoState> {
    state = {
        curVector: {joy:0, trust:0, fear:0, surprise:0, sadness:0, disgust:0, anger:0, anticipation:0}
    }
    onVectorChange(emotion: Emotion, newValue: number) {
        const nl = this.state.curVector;
        nl[emotion] = newValue;
        this.setState({curVector: nl});
    }
    render(): ReactNode {
        return <div className="demo-container">
            <div className="demo-header">{strComplexEmotionsDemo}</div>
            <div className="demo-content">
                <div>
                    <Flower width="200px" vector={this.state.curVector}></Flower>
                </div>
                <div>{strTip1}</div><div>{strTip2}</div>
                <div>
                    <Chart emotion={Emotion.joy} viewmode="slider" value={this.state.curVector.joy} onChange={this.onVectorChange.bind(this, Emotion.joy)}/>
                    <Chart emotion={Emotion.trust} viewmode="slider" value={this.state.curVector.trust} onChange={this.onVectorChange.bind(this, Emotion.trust)}/>
                    <Chart emotion={Emotion.fear} viewmode="slider" value={this.state.curVector.fear} onChange={this.onVectorChange.bind(this, Emotion.fear)}/>
                    <Chart emotion={Emotion.surprise} viewmode="slider" value={this.state.curVector.surprise} onChange={this.onVectorChange.bind(this, Emotion.surprise)}/>
                    <Chart emotion={Emotion.sadness} viewmode="slider" value={this.state.curVector.sadness} onChange={this.onVectorChange.bind(this, Emotion.sadness)}/>
                    <Chart emotion={Emotion.disgust} viewmode="slider" value={this.state.curVector.disgust} onChange={this.onVectorChange.bind(this, Emotion.disgust)}/>
                    <Chart emotion={Emotion.anger} viewmode="slider" value={this.state.curVector.anger} onChange={this.onVectorChange.bind(this, Emotion.anger)}/>
                    <Chart emotion={Emotion.anticipation} viewmode="slider" value={this.state.curVector.anticipation} onChange={this.onVectorChange.bind(this, Emotion.anticipation)}/>
                </div>
                <div><Formula vector={this.state.curVector} showAllComplexEmotions={true}/></div>
            </div>
        </div>
    }
}