import React from 'react'
import './toast.css'
type ToastCounter = number
export interface IToastsProps {
    placesCount: number
}
interface IToast {
    type: ToastType
    code?: number
    message: string
    description?: string
    autohide?: number
    saveInHistory?: boolean
    modal?: boolean
}

interface IToastExtProps extends IToast {
    shown: boolean
    uid: ToastCounter
}
export interface IToastsState {
    toasts: Array<IToastExtProps>
}
export enum ToastType {
    error = 'error',
    warning = 'warning',
    info = 'info',
}

export default class Toasts extends React.Component<IToastsProps, IToastsState> {
    private toastCounter: number = 0
    state: IToastsState = {
        toasts: [],
    }
    public addToast(toast: IToast) {
        const nState: IToastsState = this.state
        const extToast: IToastExtProps = {
            shown: false,
            uid: this.toastCounter++,
            ...toast,
        }
        if (extToast.autohide === undefined && extToast.type === ToastType.info && !extToast.modal)
            extToast.autohide = 3
        nState.toasts.push(extToast)
        this.setState(nState)
        if (extToast.autohide !== undefined) {
            setTimeout(this.onHide.bind(this, extToast.uid), extToast.autohide * 1000)
        }
    }
    onHide(uidToast: ToastCounter) {
        const nState: IToastsState = this.state
        const found = nState.toasts.findIndex((toast) => toast.uid === uidToast)
        if (found !== -1) {
            if (nState.toasts[found].saveInHistory) {
                nState.toasts[found].shown = true
            } else nState.toasts.splice(found, 1)
        }
        this.setState(nState)
    }
    render(): React.ReactNode {
        const countModal = this.state.toasts.filter((t) => !t.shown && t.modal).length
        const countToShow = this.state.toasts.filter((t) => !t.shown).length
        return (
            <div
                className={`plutchik-toasts-container${countModal > 0 ? '-modal' : ''}`}
                style={countToShow === 0 ? { display: 'none' } : {}}
            >
                {countModal > 0 ? <div className='plutchik-toasts-fade'></div> : <></>}
                <div className='plutchik-toast-container-center'>
                    {this.props.placesCount < countToShow ? (
                        <span className='plutchik-toast-container-count-label'>
                            Hide all {countToShow > 9 ? '9+' : countToShow}
                        </span>
                    ) : (
                        <></>
                    )}
                    {this.state.toasts
                        .filter((toast) => !toast.shown)
                        .filter((t, i) => i < this.props.placesCount && t)
                        .map((toast) => (
                            <Toast key={toast.uid} {...toast} onHide={this.onHide.bind(this)} />
                        ))}
                </div>
            </div>
        )
    }
}

export interface IToastProps extends IToast {
    onHide?: (uid: ToastCounter) => void
    uid: ToastCounter
}
export interface IToastState {
    showDescription: boolean
}

export class Toast extends React.Component<IToastProps, IToastState> {
    state: IToastState = {
        showDescription: false,
    }
    toggleDescription() {
        const nState: IToastState = this.state
        nState.showDescription = !nState.showDescription
        nState.showDescription = this.props.description !== undefined ? nState.showDescription : false
        this.setState(nState)
    }
    render(): React.ReactNode {
        return (
            <div className={`plutchik-toast-container-${this.props.type}`}>
                <span
                    onClick={() => {
                        if (this.props.onHide) this.props.onHide(this.props.uid)
                    }}
                    className='plutchik-toast-close-button'
                >
                    <span>+</span>
                </span>
                {/*<span className="plutchik-toast-copy-button"></span>*/}
                {this.props.description !== undefined ? (
                    <span
                        onClick={this.toggleDescription.bind(this)}
                        className={`plutchik-toast-description-button${this.state.showDescription ? '-selected' : ''}`}
                    >
                        <span>∴</span>
                    </span>
                ) : (
                    <></>
                )}
                <div className='plutchik-toast-message'>{this.props.message}</div>
                {this.state.showDescription ? (
                    <div className='plutchik-toast-description'>{this.props.description}</div>
                ) : (
                    <></>
                )}
            </div>
        )
    }
}
