// Tento skript běží na pozadí a nemá omezení jako web kina
chrome.runtime.onMessage.addListener((pozadavek, odesilatel, odeslatOdpoved) => {
    
    // Pokud nás content.js poprosí o stažení ČSFD
    if (pozadavek.akce === "stahniCSFD") {
        console.log("Stahuji data z URL: " + pozadavek.url);
        
        fetch(pozadavek.url)
            .then(odpoved => odpoved.text()) // Získáme surový HTML kód stránky
            .then(htmlText => odeslatOdpoved({ html: htmlText }))
            .catch(chyba => odeslatOdpoved({ chyba: true }));
            
        return true; // Toto říká prohlížeči: "Počkej na asynchronní odpověď, nezavírej to hned."
    }
});