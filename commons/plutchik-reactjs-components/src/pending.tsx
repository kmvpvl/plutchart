import React from 'react';
import './pending.css';
import { Emotion } from './types';
export type IPendingProps = {

}

export type IPendingState = {
    useCount: number;
}

export default class Pending extends React.Component <IPendingProps, IPendingState>{
    state: IPendingState = {
        useCount:0,
    }
    incUse(){
        const nState: IPendingState = this.state;
        nState.useCount++;
        this.setState(nState);
    }
    decUse(){
        const nState: IPendingState = this.state;
        nState.useCount = nState.useCount===0?0:nState.useCount -1;
        this.setState(nState);
    }
    render(): React.ReactNode {
        const w = 200;
        if (this.state.useCount === 0) return <></>;
        return <>
        <div className='plutchik-pending-container'>
        </div>
        <div className='plutchik-pending-wheel-container'>
        <svg xmlns='http://www.w3.org/2000/svg' xmlnsXlink='http://www.w3.org/1999/xlink' width="200px" height="200px" viewBox={`-${w/2} -${w/2} ${w} ${w}`}>
            {Object.values(Emotion).map((v, i)=> {
                const N = 8;
                let R;
                R = w/2 - 15;
                const av = 2 * Math.PI * i / N;
                const XV = Math.round(R * Math.sin(av));
                const YV = -Math.round(R * Math.cos(av));
                const ac1 = 2 * Math.PI * i / N + Math.PI/N - 0.15;
                const ac2 = 2 * Math.PI * i / N - Math.PI/N + 0.15;
                const XC1 = Math.round(R * Math.sin(ac1));
                const XC2 = Math.round(R * Math.sin(ac2));
                const YC1 = -Math.round(R * Math.cos(ac1));
                const YC2 = -Math.round(R * Math.cos(ac2));
                return <g key={i}>
                    <path style={{stroke: `var(--plutchik-${v}-color)`, fill: "transparent", strokeWidth: "20px"}} d={`M ${XC1},${YC1} Q ${XV},${YV} ${XC2},${YC2}`}/>
                </g>
            })}
        </svg>
        </div>
    </>;
    }
}