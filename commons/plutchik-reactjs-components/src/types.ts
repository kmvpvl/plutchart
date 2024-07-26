export enum Emotion {
    joy = "joy",
    trust = "trust",
    fear = "fear",
    surprise = "surprise",
    sadness = "sadness",
    disgust = "disgust",
    anger = "anger",
    anticipation = "anticipation"
};

export enum ComplexEmotion {
    love = 'love',
    guilt = 'guilt',
    delight = 'delight',
    submission = 'submission',
    curiosity = 'curiosity',
    sentimentality = 'sentimentality',
    awe = 'awe',
    despair = 'despair',
    shame = 'shame',
    disappointment = 'disappointment',
    unbelief = 'unbelief',
    outrage = 'outrage',
    remorse = 'remorse',
    envy = 'envy',
    pessimism = 'pessimism',
    contempt = 'contempt',
    cynicism = 'cynicism',
    morbidness = 'morbidness',
    aggression = 'aggression',
    pride = 'pride',
    dominance = 'dominance',
    optimism = 'optimism',
    hope = 'hope',
    anxiety = 'anxiety',    
}

export type EmotionType = keyof typeof Emotion;
export type ComplexEmotionType = keyof typeof ComplexEmotion;

export interface IEmotionVector {
    joy: number;
    trust: number;
    fear: number;
    surprise: number;
    sadness: number;
    disgust: number;
    anger: number;
    anticipation: number;
}
