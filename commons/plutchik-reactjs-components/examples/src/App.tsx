import {
    Charts,
    ComplexEmotion,
    Emotion,
    Flower,
    Formula,
    Chart,
    IEmotionVector,
    Pending,
} from 'plutchik-reactjs-components'
import React from 'react'
import { ReactNode } from 'react'
import './App.css'

interface IAppProps {}
interface IAppState {
    curVector: IEmotionVector
}

export default class App extends React.Component<IAppProps, IAppState> {
    pendingRef: React.RefObject<Pending> = React.createRef()
    state: IAppState = {
        curVector: { joy: 0.5, trust: 0, fear: 0, surprise: 0, sadness: 0, disgust: 0, anger: 0, anticipation: 0 },
    }
    onVectorChange(emotion: Emotion, newValue: number) {
        const nl = this.state.curVector
        nl[emotion] = newValue
        this.setState({ curVector: nl })
    }
    render(): ReactNode {
        const love = { joy: 0.5, trust: 0.5, fear: 0, surprise: 0, sadness: 0, disgust: 0, anger: 0, anticipation: 0 }
        return (
            <React.Fragment>
                <h1>Charts component</h1>
                <Charts vector={love} label='Love' />
                <h1>Flower component</h1>
                <Flower width='200px' vector={this.state.curVector}></Flower>
                <h1>Charts sliders</h1>
                <Chart
                    emotion={Emotion.joy}
                    viewmode='slider'
                    language='en'
                    value={this.state.curVector.joy}
                    onChange={this.onVectorChange.bind(this, Emotion.joy)}
                />
                <Chart
                    emotion={Emotion.trust}
                    viewmode='slider'
                    language='de'
                    value={this.state.curVector.trust}
                    onChange={this.onVectorChange.bind(this, Emotion.trust)}
                />
                <Chart
                    emotion={Emotion.fear}
                    viewmode='slider'
                    language='fr'
                    value={this.state.curVector.fear}
                    onChange={this.onVectorChange.bind(this, Emotion.fear)}
                />
                <Chart emotion={Emotion.surprise} viewmode='slider' language='es' />
                <Chart emotion={Emotion.sadness} viewmode='slider' language='uk' />
                <Chart emotion={Emotion.disgust} viewmode='slider' language='ru' />
                <Chart emotion={Emotion.anger} viewmode='slider' />
                <Chart emotion={Emotion.anticipation} viewmode='slider' />
                <Formula vector={this.state.curVector} />
                <h1>Formula component</h1>
                <h3>Language=undefined, uppperCase=true</h3>
                <Formula complexEmotion={ComplexEmotion.curiosity} className='formula-1' upperCase={true} />
                <h3>Language=en, uppperCase=true</h3>
                <Formula language='en' complexEmotion={ComplexEmotion.envy} className='formula-1' upperCase={true} />
                <h3>Language=fr, uppperCase=false</h3>
                <Formula language='fr' vector={love} className='formula-2' />
                <h3>Language=es, uppperCase=false</h3>
                <Formula language='es' complexEmotion={ComplexEmotion.optimism} className='formula-1' />
                <h3>Language=de, uppperCase=true</h3>
                <Formula
                    language='de'
                    complexEmotion={ComplexEmotion.pessimism}
                    className='formula-2'
                    upperCase={true}
                />
                <h3>Language=uk, uppperCase=false</h3>
                <Formula language='uk' complexEmotion={ComplexEmotion.pride} className='formula-1' />
                <h3>Language=ru, uppperCase=false</h3>
                <Formula language='ru' complexEmotion={ComplexEmotion.shame} className='formula-2' />
                <h1>Pending component</h1>
                <button
                    onClick={() => {
                        this.pendingRef.current?.incUse()
                        setTimeout(() => this.pendingRef.current?.decUse(), 5000)
                    }}
                >
                    Start Pending
                </button>
                <Pending ref={this.pendingRef}></Pending>
            </React.Fragment>
        )
    }
}
