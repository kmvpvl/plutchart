import React from "react";
import { ComplexEmotion, Emotion, IEmotionVector } from "./types";
import { ML } from "./mlstrings";

export interface IFormulaProps {
    language?: string;
    complexEmotion?: ComplexEmotion;
    className?: string;
    upperCase?: boolean;
    vector?: IEmotionVector;
}

export interface IFormulaState {

}

export default class Formula extends React.Component <IFormulaProps, IFormulaState> {
    render(): React.ReactNode {
        let str: string = "";
        if (this.props.complexEmotion !== undefined) {
            const f = formulas.filter(v=>v[0] === this.props.complexEmotion)[0];
            str = `${ML(f[0] as ComplexEmotion, this.props.language)} = ${ML(f[1][0] as Emotion, this.props.language)} + ${ML(f[1][1] as Emotion, this.props.language)}`;
        }
        if (this.props.vector !== undefined) {
            const nonZeros = Object.entries(this.props.vector).filter(el=>el[1] !== 0);
            if (nonZeros.length === 2) {
                const emList = Array.from(nonZeros, el=>el[0]);
                const fForm = formulas.filter(pair=>pair[1][0] === emList[0] || pair[1][1] === emList[0]);
                const sForm = fForm.filter(pair=>pair[1][0] === emList[1] || pair[1][1] === emList[1]);
                if (sForm.length === 1) str = `${ML(sForm[0][0] as ComplexEmotion, this.props.language)} = ${Array.from(emList, el=>ML(el, this.props.language)).join(" + ")}`;
            } 
        }
        return <div className={this.props.className}>{this.props.upperCase?str.toUpperCase():str}</div>
    }
}

const formulas: (Emotion[] | ComplexEmotion)[][] = [
    [ComplexEmotion.love, [Emotion.joy, Emotion.trust]],
    [ComplexEmotion.guilt, [Emotion.joy, Emotion.fear]],
    [ComplexEmotion.delight, [Emotion.joy, Emotion.surprise]],
    [ComplexEmotion.submission, [Emotion.trust, Emotion.fear]],
    [ComplexEmotion.curiosity, [Emotion.trust, Emotion.surprise]],
    [ComplexEmotion.sentimentality, [Emotion.trust, Emotion.sadness]],
    [ComplexEmotion.awe, [Emotion.fear, Emotion.surprise]],
    [ComplexEmotion.despair, [Emotion.fear, Emotion.sadness]],
    [ComplexEmotion.shame, [Emotion.fear, Emotion.disgust]],
    [ComplexEmotion.disappointment, [Emotion.surprise, Emotion.sadness]],
    [ComplexEmotion.unbelief, [Emotion.surprise, Emotion.disgust]],
    [ComplexEmotion.outrage, [Emotion.surprise, Emotion.anger]],
    [ComplexEmotion.remorse, [Emotion.sadness, Emotion.disgust]],
    [ComplexEmotion.envy, [Emotion.sadness, Emotion.anger]],
    [ComplexEmotion.pessimism, [Emotion.sadness, Emotion.anticipation]],
    [ComplexEmotion.contempt, [Emotion.disgust, Emotion.anger]],
    [ComplexEmotion.cynicism, [Emotion.disgust, Emotion.anticipation]],
    [ComplexEmotion.morbidness, [Emotion.disgust, Emotion.joy]],
    [ComplexEmotion.aggression, [Emotion.anger, Emotion.anticipation]],
    [ComplexEmotion.pride, [Emotion.anger, Emotion.joy]],
    [ComplexEmotion.dominance, [Emotion.anger, Emotion.trust]],
    [ComplexEmotion.optimism, [Emotion.anticipation, Emotion.joy]],
    [ComplexEmotion.hope, [Emotion.anticipation, Emotion.trust]],
    [ComplexEmotion.anxiety, [Emotion.anticipation, Emotion.fear]],
];
