import React from 'react'
import './flower.css'
import { Emotion, IEmotionVector } from './types'

interface IFlowerProps {
    vector: IEmotionVector
    width: string
}

interface IFlowerState {}

export default class Flower extends React.Component<IFlowerProps, IFlowerState> {
    render(): React.ReactNode {
        const w = 100
        return (
            <span className='flower-container'>
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    xmlnsXlink='http://www.w3.org/1999/xlink'
                    width={this.props.width}
                    height={this.props.width}
                    viewBox={`-${w / 2} -${w / 2} ${w} ${w}`}
                >
                    {Object.values(Emotion).map((v, i) => {
                        const N = 8
                        let vi = this.props.vector[v]
                        vi = Math.sqrt(vi === undefined ? 0 : vi)
                        const axis = vi
                        const R = (axis * w) / 2
                        const r = R * 0.7
                        const av = (2 * Math.PI * i) / N
                        const xv = Math.round(R * Math.sin(av))
                        const yv = -Math.round(R * Math.cos(av))
                        const XV = Math.round((w / 2) * Math.sin(av))
                        const YV = -Math.round((w / 2) * Math.cos(av))
                        const ac1 = (2 * Math.PI * i) / N + Math.PI / N
                        const ac2 = (2 * Math.PI * i) / N - Math.PI / N
                        const xc1 = Math.round(r * Math.sin(ac1))
                        const xc2 = Math.round(r * Math.sin(ac2))
                        const yc1 = -Math.round(r * Math.cos(ac1))
                        const yc2 = -Math.round(r * Math.cos(ac2))
                        const XC1 = Math.round((w / 2) * 0.7 * Math.sin(ac1))
                        const XC2 = Math.round((w / 2) * 0.7 * Math.sin(ac2))
                        const YC1 = -Math.round((w / 2) * 0.7 * Math.cos(ac1))
                        const YC2 = -Math.round((w / 2) * 0.7 * Math.cos(ac2))
                        return (
                            <g key={i}>
                                <path
                                    style={{
                                        stroke: 'silver',
                                        fill: 'transparent',
                                        strokeWidth: '1px',
                                        strokeDasharray: '1 1',
                                    }}
                                    d={`M 0,0 L ${XC1},${YC1} Q ${XV},${YV} ${XC2},${YC2} L 0,0, z`}
                                />
                                <path
                                    style={{ fill: `var(--plutchik-${v}-color)` }}
                                    d={`M 0,0 L ${xc1},${yc1} Q ${xv},${yv} ${xc2},${yc2} L 0,0, z`}
                                />
                            </g>
                        )
                    })}
                </svg>
            </span>
        )
    }
}
