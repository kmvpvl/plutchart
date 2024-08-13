import { Charts } from 'plutchik-reactjs-components';
import { Emotion, IEmotionVector } from 'plutchik-reactjs-components';
import './insights.css'
import React, { ReactNode } from 'react';

interface IInsightsProps {
    myvector: IEmotionVector;
    mycount: number;
    othersvector: IEmotionVector;
    otherscount: number;
    onClick?: (emotion: Emotion)=>void;
}

interface IInsightsState {
}

export default class Insights extends React.Component<IInsightsProps, IInsightsState> {
    render(): ReactNode {
        return <div className='insights-container'>
        {this.props.mycount > 0?<>
            <div>User's and others' emptional vectors on set</div>
            <Charts key={'my'} vector={this.props.myvector} label={`User assessments count: ${this.props.mycount}`} onClick={this.props.onClick}/>
            <Charts key={'others'} vector={this.props.othersvector} label={`Others assessments count: ${this.props.otherscount}`}/>
        </>:<div></div>}
        </div>
    }
}
