import React from 'react'
import { Emotion, IEmotionVector } from './types'
import './charts.css'
import { ML } from './mlstrings'

export type EmotionViewModeType = 'slider' | 'chart'
interface IChartProps {
    emotion: Emotion
    value?: number
    disabled?: boolean
    viewmode: EmotionViewModeType
    language?: string
    onChange?: (value: number) => void
    onClick?: () => void
}

interface IChartState {
    value: number
}

export class Chart extends React.Component<IChartProps, IChartState> {
    state: IChartState = {
        value: this.props.value ? this.props.value : 0,
    }
    capture: boolean = false
    svgRef: React.RefObject<SVGSVGElement> = React.createRef()
    gRef: React.RefObject<SVGGElement> = React.createRef()
    pointerRef: React.RefObject<SVGRectElement> = React.createRef()
    width?: number
    height?: number
    componentDidMount(): void {
        this.width = this.svgRef.current?.width.baseVal.value
        this.height = this.svgRef.current?.height.baseVal.value
        this.gRef.current?.addEventListener('wheel', this.onWheel.bind(this), { passive: false })
        this.gRef.current?.addEventListener('mousemove', this.onMouseMove.bind(this), { passive: false })
        this.pointerRef.current?.addEventListener('mousedown', this.onPointerMouseDown.bind(this), { passive: false })
        this.gRef.current?.addEventListener('touchmove', this.onMouseMove.bind(this), { passive: false })
        this.pointerRef.current?.addEventListener('touchstart', this.onPointerMouseDown.bind(this), { passive: false })
        //        this.gRef.current?.addEventListener("touchstart", this.onPointerMouseDown.bind(this), {passive: false});
    }
    get value() {
        return this.state.value
    }
    onWheel(event: any) {
        event.preventDefault()
        if (this.props.viewmode !== 'slider') return
        let v = this.state.value
        v = v - 0.1 * Math.sign(event.deltaY)
        if (v > 1) v = 1
        if (v < 0) v = 0
        if (v !== this.value && this.props.onChange !== undefined) this.props.onChange(v)
        this.setState({ value: v })
    }

    onBarClick(event: any) {
        const rect = event.currentTarget.getBoundingClientRect()
        const padding = 0
        const elH = rect.height
        let calcValue: number
        const y =
            (event.type === 'touchmove' ? event.touches[0].clientY : event.clientY) -
            event.currentTarget.getBoundingClientRect().top
        calcValue = 1 - (y - padding) / (elH - 2 * padding)
        if (calcValue < 0) calcValue = 0
        if (calcValue > 1) calcValue = 1
        calcValue = Math.round(calcValue * 10) / 10
        if (calcValue !== this.value && this.props.onChange !== undefined) this.props.onChange(calcValue)
        this.setState({ value: calcValue })
    }

    onPointerMouseDown(event: any) {
        event.preventDefault()
        this.capture = true
    }

    onMouseLeave(event: any) {
        if (this.capture) this.onBarClick(event)
        this.capture = false
    }

    onMouseMove(event: any) {
        event.preventDefault()
        if (this.capture) this.onBarClick(event)
    }

    render(): React.ReactNode {
        let y
        let h
        switch (this.props.viewmode) {
            case 'chart': {
                const v = this.props.value !== undefined ? this.props.value : 0
                y = `${(1 - v) * 100}%`
                h = `${v * 100}%`
                break
            }
            case 'slider':
            default:
                y = '0'
                h = '100%'
        }
        return (
            <svg
                ref={this.svgRef}
                xmlns='http://www.w3.org/2000/svg'
                xmlnsXlink='http://www.w3.org/1999/xlink'
                width='100%'
                height='10em'
                className='plutchik-chart-slider'
                onClick={() => (this.props.onClick ? this.props.onClick() : null)}
                style={this.props.onClick ? { cursor: 'pointer' } : {}}
            >
                {this.props.viewmode === 'chart' ? (
                    <rect className='plutchik-dotted-frame' x='0.25em' y='0' width='1em' height='100%' />
                ) : (
                    <></>
                )}
                <g
                    ref={this.gRef}
                    onClick={this.onBarClick.bind(this)}
                    onMouseLeave={this.onMouseLeave.bind(this)}
                    onMouseUp={this.onMouseLeave.bind(this)}
                >
                    <rect
                        style={{
                            fill: `var(--plutchik-${this.props.emotion}-color)`,
                            cursor: this.props.viewmode === 'chart' ? 'default' : 'pointer',
                        }}
                        x='0.25em'
                        y={y}
                        width='1em'
                        height={h}
                    />
                    {this.props.viewmode === 'slider' ? (
                        <rect
                            ref={this.pointerRef}
                            style={{
                                fill: `var(--plutchik-${this.props.emotion}-color)`,
                                stroke: 'white',
                                cursor: 'pointer',
                            }}
                            x='0em'
                            y={`calc(${(1 - this.state.value) * 100}% - ${1 - this.state.value}em)`}
                            width='1.5em'
                            height='1em'
                            rx={this.capture ? '0.1em' : '0.5em'}
                        />
                    ) : (
                        <></>
                    )}
                </g>
                <g className='plutchik-emotion-text'>
                    <text style={{ fill: `var(--plutchik-${this.props.emotion}-color)` }} x='0' y='100%'>
                        {ML(this.props.emotion, this.props.language)}
                    </text>
                </g>
            </svg>
        )
    }
}

interface IChartsProps {
    vector: IEmotionVector
    label: string
    onClick?: (emotion: Emotion) => void
    gridArea?: string
}
interface IChartsState {}

export class Charts extends React.Component<IChartsProps, IChartsState> {
    private onEmotionClick(emotion: Emotion) {
        if (this.props.onClick) this.props.onClick(emotion)
    }

    render(): React.ReactNode {
        return (
            <div className='plutchik-charts-container' style={{ gridArea: this.props.gridArea }}>
                <div className='plutchik-charts-label'>{this.props.label}</div>
                {Object.values(Emotion).map((v, i) => {
                    let val: number | undefined = this.props.vector[v]
                    val = val ? val : 0
                    return (
                        <Chart
                            viewmode='chart'
                            disabled={false}
                            value={val}
                            emotion={v}
                            key={i}
                            onClick={this.props.onClick ? this.onEmotionClick.bind(this, v) : undefined}
                        />
                    )
                })}
            </div>
        )
    }
}
