function makeDexonlineLink(word) {
  return `https://dexonline.ro/definitie/${word}`;
}

function makeGoogleLink(word, language) {
  return `https://www.google.com/search?hl=${language}&q=define+${word}`;
}

function makeLink(word, language) {
    if(language === 'ro') {
        return makeDexonlineLink(word);
    } else {
        return makeGoogleLink(word, language);
    }
}