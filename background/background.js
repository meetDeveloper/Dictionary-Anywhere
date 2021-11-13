const GOOGLE_SPEECH_URI = 'https://www.google.com/speech-api/v1/synthesize',

    DEFAULT_HISTORY_SETTING = {
        enabled: true
    };

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const { word, lang } = request, 
        url = `https://www.google.com/search?hl=${lang}&q=define+${word}&gl=US`;
    
    fetch(url, { 
            method: 'GET',
            credentials: 'omit'
        })
        .then((response) => response.text())
        .then((text) => {
            const document = new DOMParser().parseFromString(text, 'text/html'),
                content = extractMeaning(document, { word, lang });

            sendResponse({ content });

            content && browser.storage.local.get().then((results) => {
                let history = results.history || DEFAULT_HISTORY_SETTING;
        
                history.enabled && saveWord(content)
            });
        })

    return true;
});

function extractMeaning (document, context) {
    if (!document.querySelector("[data-dobid='hdw']")) { return null; }
    
    var word = document.querySelector("[data-dobid='hdw']").textContent,
        definitionDivNodeList = document.querySelectorAll("div[data-dobid='dfn']"),
        meaningArray = [];
        
    if(definitionDivNodeList) {
        definitionDivNodeList.forEach((definitionDiv) => {
            if (definitionDiv) {
                var meaning = ""
                definitionDiv.querySelectorAll("span").forEach( function(span) {
                    if(!span.querySelector("sup")) {
                        meaning = meaning + span.textContent;
                    }
                });
                meaningArray.push(meaning);
            }
        });
    }
        
    for(var i = 0; i < meaningArray.length; i++) {
        meaningArray[i] = meaningArray[i][0].toUpperCase() + meaningArray[i].substring(1);
    }

    var audio = document.querySelector("audio[jsname='QInZvb']"),
        source = document.querySelector("audio[jsname='QInZvb'] source"),
        audioSrc = source && source.getAttribute('src');

    if (audioSrc) {
        !audioSrc.includes("http") && (audioSrc = audioSrc.replace("//", "https://"));
    }
    else if (audio) {
        let exactWord = word.replace(/·/g, ''), // We do not want syllable seperator to be present.
            
        queryString = new URLSearchParams({
            text: exactWord, 
            enc: 'mpeg', 
            lang: context.lang, 
            speed: '0.4', 
            client: 'lr-language-tts', 
            use_google_only_voices: 1
        }).toString();

        audioSrc = `${GOOGLE_SPEECH_URI}?${queryString}`;
    }

    return { word: word, meaningArray: meaningArray, audioSrc: audioSrc };
};

function saveWord (content) {
    let word = content.word,
        meaningArray = content.meaningArray,
      
        storageItem = browser.storage.local.get('definitions');

        storageItem.then((results) => {
            let definitions = results.definitions || {};

            definitions[word] = meaningArray.join(' ');
            browser.storage.local.set({
                definitions
            });
        })
}
