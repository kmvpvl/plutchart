import {
	Chart,
	Emotion,
	Flower,
	IEmotionVector,
	Pending,
	Toaster,
	ToastType,
} from "plutchik-reactjs-components";
import React, { ReactNode } from "react";
import "./assess.css";
import MLString, { ML } from "../../model/mlstring";
import { serverFetch } from "../../model/common";

export interface ITGLoginInfo {
    tguserid?: string;
    sessiontoken?: string;
    querycheckstring?: string;
}

export interface IAssessProps {
	tgLoginInfo: ITGLoginInfo;
	toaster?: React.RefObject<Toaster>;
	pending?: React.RefObject<Pending>;
}

export interface IAssessState {
	contentItem?: any;
	org?: any;
	user?: any;
	curVector: IEmotionVector;
}

export default class Assess extends React.Component<
	IAssessProps,
	IAssessState
> {
	private sliders: any = {};
	constructor(props: any) {
		super(props);
		Array.from(Object.values(Emotion)).forEach(
			(v) => (this.sliders[v] = React.createRef())
		);
	}
	state: IAssessState = {
		curVector: {
			joy: 0,
			trust: 0,
			fear: 0,
			surprise: 0,
			sadness: 0,
			disgust: 0,
			anger: 0,
			anticipation: 0,
		},
	};
	componentDidMount(): void {
		this.getNextContentItem();
	}
	private prepareHeaders(): Headers {
		const headers = new Headers();
		if (this.props.tgLoginInfo.querycheckstring) headers.append("plutchik-tgquerycheckstring", this.props.tgLoginInfo.querycheckstring);
		if (this.props.tgLoginInfo.tguserid) headers.append("plutchik-tguid", this.props.tgLoginInfo.tguserid);
		if (this.props.tgLoginInfo.sessiontoken) headers.append("plutchik-sessiontoken", this.props.tgLoginInfo.sessiontoken);
		return headers;
	}
	getNextContentItem() {
		this.props.pending?.current?.incUse();
		serverFetch(
			"getnextcontentitem",
			"POST",
			this.prepareHeaders(),
			undefined,
			(res) => {
				this.props.pending?.current?.decUse();

				const nState: IAssessState = this.state;
				nState.contentItem = res.contentitem;
				nState.contentItem.name = new MLString(
					nState.contentItem.name
				);
				nState.contentItem.description = new MLString(
					nState.contentItem.description
				);
				nState.user = res.user;
				nState.curVector = {
					joy: 0,
					trust: 0,
					fear: 0,
					surprise: 0,
					sadness: 0,
					disgust: 0,
					anger: 0,
					anticipation: 0,
				};
				Array.from(Object.values(Emotion)).forEach((v) =>
					this.sliders[v].current?.setState({ value: 0 })
				);
				this.setState(nState);
			},
			(err) => {
				this.props.pending?.current?.decUse();
				switch (err.code) {
					case "notfound":
						const nState: IAssessState = this.state;
						nState.contentItem = undefined;
						this.setState(nState);
						break;
					default:
						this.props.toaster?.current?.addToast({
							message: err.code,
							type: ToastType.error,
							modal: true,
							saveInHistory: true,
							description: err.message,
						});
				}
			}
		);
	}

	assessContentItem() {
		this.props.pending?.current?.incUse();
		serverFetch(
			"addassessment",
			"POST",
			this.prepareHeaders(),
			JSON.stringify({
				assessmentinfo: {
					cid: this.state.contentItem?._id,
					assignid: this.state.contentItem?.assignid,
					vector: this.state.curVector,
				},
			}),
			(res) => {
				this.props.pending?.current?.decUse();
				this.getNextContentItem();
			},
			(err) => {
				this.props.pending?.current?.decUse();
				switch (err.code) {
					default:
						this.props.toaster?.current?.addToast({
							message: err.code,
							type: ToastType.error,
							modal: true,
							saveInHistory: true,
							description: err.message,
						});
				}
			}
		);
	}

	onVectorChange(emotion: Emotion, newValue: number) {
		const nState: IAssessState = this.state;
		nState.curVector[emotion] = newValue;
		this.setState(nState);
	}

	render(): ReactNode {
		const lang = this.state.user?.nativelanguage;
		if (this.state.contentItem !== undefined)
			return (
				<div className="assess-container">
					<div className="assess-organization-name">
						{this.state.contentItem?.assignname
							? this.state.contentItem.assignname
							: ""}
					</div>
					<div className="assess-content-item-name-area">
						<div className="assess-content-item-name">
							{this.state.contentItem?.name.toString(lang)}
						</div>
					</div>
					<div className="assess-flower">
						<Flower width="100px" vector={this.state.curVector} />
					</div>
					<div className="assess-content-item">
						{this.state.contentItem?.type === "image" ? (
							<img
								src={this.state.contentItem?.url}
								alt={this.state.contentItem?.name}
							></img>
						) : (
							<></>
						)}
					</div>
					<div className="assess-controls-label">
						{ML("My emotions", lang)}
					</div>
					<div className="assess-controls">
						{Array.from(Object.values(Emotion)).map((v, i) => (
							<Chart
								ref={this.sliders[v]}
								key={i}
								emotion={v}
								viewmode="slider"
								onChange={this.onVectorChange.bind(this, v)}
								language={lang}
							/>
						))}
					</div>
					<div className="assess-buttons">
						<button onClick={() => this.assessContentItem()}>
							{ML("Assess", lang)}
						</button>
						<button onClick={() => this.getNextContentItem()}>
							{ML("Skip", lang)}
						</button>
						{/*<button>⚠️</button>
          <button>📈</button>*/}
					</div>
				</div>
			);
		else return <div className="assess-no-content">
			<div>{ML("There is not more content items to assess. Ask your HR manager or psychologist to add ones")}</div>
			<button onClick={() => this.getNextContentItem()}>{ML("Press button to request new content items")}</button>
		</div>;
	}
}
