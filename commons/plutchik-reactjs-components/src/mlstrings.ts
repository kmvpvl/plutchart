const plutchik_strings = new Map([
    [
        `joy`,
        new Map([
            [`de`, `Freude`],
            [`fr`, `joie`],
            [`es`, `alegría`],
            [`uk`, `радість`],
            [`ru`, `радость`],
        ]),
    ],
    [
        `trust`,
        new Map([
            [`de`, `Vertrauen`],
            [`fr`, `confiance`],
            [`es`, `confianza`],
            [`uk`, `довіра`],
            [`ru`, `доверие`],
        ]),
    ],
    [
        `fear`,
        new Map([
            [`de`, `Furcht`],
            [`fr`, `peur`],
            [`es`, `miedo`],
            [`uk`, `страх`],
            [`ru`, `страх`],
        ]),
    ],
    [
        `surprise`,
        new Map([
            [`de`, `Erstaunen`],
            [`fr`, `surprendre`],
            [`es`, `asombro`],
            [`uk`, `здивування`],
            [`ru`, `удивление`],
        ]),
    ],
    [
        `sadness`,
        new Map([
            [`de`, `Missvergnügen`],
            [`fr`, `tristesse`],
            [`es`, `molestia`],
            [`uk`, `смуток`],
            [`ru`, `досада`],
        ]),
    ],
    [
        `disgust`,
        new Map([
            [`de`, `Ekel`],
            [`fr`, `dégoûter`],
            [`es`, `asco`],
            [`uk`, `огида`],
            [`ru`, `отвращение`],
        ]),
    ],
    [
        `anger`,
        new Map([
            [`de`, `Wut`],
            [`fr`, `colère`],
            [`es`, `enojo`],
            [`uk`, `гнів`],
            [`ru`, `злость`],
        ]),
    ],
    [
        `anticipation`,
        new Map([
            [`de`, `Vorwegnahme`],
            [`fr`, `anticipation`],
            [`es`, `anticipación`],
            [`uk`, `очікування`],
            [`ru`, `предвкушение`],
        ]),
    ],
    [
        `love`,
        new Map([
            [`de`, `Liebe`],
            [`fr`, `amour`],
            [`es`, `amar`],
            [`uk`, `любов`],
            [`ru`, `любовь`],
        ]),
    ],
    [
        `guilt`,
        new Map([
            [`de`, `Schuld`],
            [`fr`, `culpabilité`],
            [`es`, `culpa`],
            [`uk`, `почуття провини`],
            [`ru`, `вина`],
        ]),
    ],
    [
        `delight`,
        new Map([
            [`de`, `Freudentaumel`],
            [`fr`, `plaisir`],
            [`es`, `deleitar`],
            [`uk`, `захоплення`],
            [`ru`, `восторг`],
        ]),
    ],
    [
        `submission`,
        new Map([
            [`de`, `Vorlage`],
            [`fr`, `soumission`],
            [`es`, `envío`],
            [`uk`, `захоплення`],
            [`ru`, `подчинение`],
        ]),
    ],
    [
        `curiosity`,
        new Map([
            [`de`, `Neugier`],
            [`fr`, `curiosité`],
            [`es`, `curiosidad`],
            [`uk`, `допитливість`],
            [`ru`, `любопытство`],
        ]),
    ],
    [
        `sentimentality`,
        new Map([
            [`de`, `Sentimentalität`],
            [`fr`, `sentimentalité`],
            [`es`, `sentimentalismo`],
            [`uk`, `сентиментальність`],
            [`ru`, `сентиментальность`],
        ]),
    ],
    [
        `awe`,
        new Map([
            [`de`, `Scheu`],
            [`fr`, `admiration`],
            [`es`, `temor`],
            [`uk`, `трепет`],
            [`ru`, `трепет`],
        ]),
    ],
    [
        `despair`,
        new Map([
            [`de`, `verzweifeln`],
            [`fr`, `désespoir`],
            [`es`, `desesperación`],
            [`uk`, `відчай`],
            [`ru`, `отчаяние`],
        ]),
    ],
    [
        `shame`,
        new Map([
            [`de`, `Scham`],
            [`fr`, `honte`],
            [`es`, `lástima`],
            [`uk`, `сором`],
            [`ru`, `стыд`],
        ]),
    ],
    [
        `disappointment`,
        new Map([
            [`de`, `Enttäuschung`],
            [`fr`, `déception`],
            [`es`, `decepción`],
            [`uk`, `розчарування`],
            [`ru`, `разочарование`],
        ]),
    ],
    [
        `unbelief`,
        new Map([
            [`de`, `Unglaube`],
            [`fr`, `incrédulité`],
            [`es`, `incredulidad`],
            [`uk`, `невіра`],
            [`ru`, `неверие`],
        ]),
    ],
    [
        `outrage`,
        new Map([
            [`de`, `Empörung`],
            [`fr`, `outrage`],
            [`es`, `Indignacion`],
            [`uk`, `обурення`],
            [`ru`, `возмущение`],
        ]),
    ],
    [
        `remorse`,
        new Map([
            [`de`, `Gewissensbisse`],
            [`fr`, `remords`],
            [`es`, `remordimiento`],
            [`uk`, `каяття`],
            [`ru`, `раскаяние`],
        ]),
    ],
    [
        `envy`,
        new Map([
            [`de`, `Neid`],
            [`fr`, `envie`],
            [`es`, `envidiar`],
            [`uk`, `заздрість`],
            [`ru`, `зависть`],
        ]),
    ],
    [
        `pessimism`,
        new Map([
            [`de`, `Pessimismus`],
            [`fr`, `pessimisme`],
            [`es`, `pesimismo`],
            [`uk`, `песимізм`],
            [`ru`, `пессимизм`],
        ]),
    ],
    [
        `contempt`,
        new Map([
            [`de`, `Verachtung`],
            [`fr`, `mépris`],
            [`es`, `desprecio`],
            [`uk`, `презирство`],
            [`ru`, `презрение`],
        ]),
    ],
    [
        `cynicism`,
        new Map([
            [`de`, `Zynismus`],
            [`fr`, `cynisme`],
            [`es`, `cinismo`],
            [`uk`, `цинізм`],
            [`ru`, `цинизм`],
        ]),
    ],
    [
        `morbidness`,
        new Map([
            [`de`, `Morbidität`],
            [`fr`, `morbidité`],
            [`es`, `morbosidad`],
            [`uk`, `хворобливість`],
            [`ru`, `болезненность`],
        ]),
    ],
    [
        `aggression`,
        new Map([
            [`de`, `Aggression`],
            [`fr`, `agression`],
            [`es`, `agresión`],
            [`uk`, `агресія`],
            [`ru`, `агрессия`],
        ]),
    ],
    [
        `pride`,
        new Map([
            [`de`, `Stolz`],
            [`fr`, `fierté`],
            [`es`, `orgullo`],
            [`uk`, `гордість`],
            [`ru`, `гордость`],
        ]),
    ],
    [
        `dominance`,
        new Map([
            [`de`, `Dominanz`],
            [`fr`, `dominance`],
            [`es`, `dominio`],
            [`uk`, `домінування`],
            [`ru`, `доминирование`],
        ]),
    ],
    [
        `optimism`,
        new Map([
            [`de`, `Optimismus`],
            [`fr`, `optimisme`],
            [`es`, `optimismo`],
            [`uk`, `оптимізм`],
            [`ru`, `оптимизм`],
        ]),
    ],
    [
        `hope`,
        new Map([
            [`de`, `Hoffnung`],
            [`fr`, `espoir`],
            [`es`, `esperanza`],
            [`uk`, `надія`],
            [`ru`, `надежда`],
        ]),
    ],
    [
        `anxiety`,
        new Map([
            [`de`, `Angst`],
            [`fr`, `anxiété`],
            [`es`, `ansiedad`],
            [`uk`, `занепокоєння`],
            [`ru`, `беспокойство`],
        ]),
    ],
])

export function ML(str?: string, lang?: string): string {
    if (lang === undefined) {
        const params: string[] = window.location.search.substring(1).split('&')
        lang = window.navigator.language
        const lang_param = params.filter((v) => v.split('=')[0] === 'lang')
        if (lang_param !== undefined && lang_param.length > 0) lang = lang_param[0].split('=')[1]
    }
    if (str === undefined) return `Unknown string`
    if (lang === undefined) return str
    if (!plutchik_strings.has(str)) {
        console.log(`ML is absent in the list '${str?.substring(0, 15)}'... `)
        return str
    }
    const el = plutchik_strings.get(str)
    if (!el?.has(lang)) return str
    return el.get(lang) as string
}
