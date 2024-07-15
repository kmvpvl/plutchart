import { ReactNode } from "react";
import "./login.css";
import React from "react";
import MLString from "../mlstrings";
export interface LoginProps {
    onLanguageChanged: (newLang: string)=>void;
}

export interface LoginState {
    language: string;
    lang_choosing: boolean; 
}

const strSignIn = new MLString({
    default: "Sign in", 
    values: new Map([
        ["en-US", "Sign in"],
        ["de", "Anmelden"],
        ["fr", "Se connecter"],
        ["es", "Iniciar sesión"],
        ["uk", "Увійти"],
        ["ru", "Войти"]])
});
  
const strSignUp = new MLString({
    default: "Sign up", 
    values: new Map([
        ["en-US", "Sign up"],
        ["de", "Melden Sie sich an"],
        ["fr", "S'inscrire"],
        ["es", "Inscribirse"],
        ["uk", "Зареєструватися"],
        ["ru", "Зарегистрироваться"]])
});


export default class Login extends React.Component<LoginProps, LoginState> {
    state:LoginState  = {
        language: MLString.getLang(),
        lang_choosing: false
    };
    private getLangEmoji(): string {
        switch(this.state.language.split('-')[0]) {
            case 'ru': return '🇷🇺';
            case 'es': return '🇪🇸';
            case 'de': return '🇩🇪';
            case 'uk': return '🇺🇦';
            case 'fr': return '🇫🇷';
            case 'en':
            default: return '🇬🇧'
        }
    }
    private callOnLanguageChanged(lang: string) {
        this.setState({language: lang, lang_choosing: false})
        this.props.onLanguageChanged(lang);
    }
    render(): ReactNode {
        return <span className="login-container">
            <span>
                <span className="login-button" onClick={evnt=>window.open(`https://t.me/${process.env.REACT_APP_PLUTCHART_BOT_USER_NAME}/`, '_blank')}>{strSignIn.toString()}</span>
                <br/><br/>
                <span className="login-button" onClick={evnt=>window.open(`https://t.me/${process.env.REACT_APP_PLUTCHART_BOT_USER_NAME}/?start=${process.env.REACT_APP_PLUTCHART_BOT_START_COMMAND}`, '_blank')}>{strSignUp.toString()}</span>
            </span>
            <select className="login-language" defaultValue={this.state.language.split('-')[0]} onChange={event=>{
                this.callOnLanguageChanged(event.currentTarget.value)
            }}>
                    <option value="en">🇬🇧</option>
                    <option value="fr">🇫🇷</option>
                    <option value="de">🇩🇪</option>
                    <option value="es">🇪🇸</option>
                    <option value="uk">🇺🇦</option>
                    <option value="ru">🇷🇺</option>
            </select>
        </span>
    }
}