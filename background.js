chrome.runtime.onMessage.addListener((pozadavek, odesilatel, odeslatOdpoved) => {
    // --- ČSFD ---
    if (pozadavek.akce === "stahniCSFD") {
        fetch(pozadavek.url)
            .then(odpoved => odpoved.text())
            .then(async htmlText => {
                try {
                    let match = null;

                    // 1. Chytrá detekce podle názvu (vybere přesnou shodu s URL slugi)
                    if (pozadavek.nazev) {
                        let upravenyNazev = pozadavek.nazev
                            .toLowerCase()
                            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/(^-|-$)/g, '');

                        let regexPresny = new RegExp('href="(\\/film\\/\\d+-' + upravenyNazev + '[^"]*)"', 'i');
                        match = htmlText.match(regexPresny);
                    }

                    // 2. Fallback: Pokud přesnou shodu nenajde, vezme první výsledek
                    if (!match) {
                        match = htmlText.match(/href="(\/film\/[^"]+)"/);
                    }

                    if (match && match[1]) {
                        let filmUrl = 'https://www.csfd.cz' + match[1];
                        const detailOdpoved = await fetch(filmUrl);
                        const detailHtml = await detailOdpoved.text();
                        odeslatOdpoved({ success: true, url: filmUrl, detailHtml: detailHtml });
                    } else {
                        odeslatOdpoved({ success: false });
                    }
                } catch (e) {
                    odeslatOdpoved({ success: false });
                }
            })
            .catch(() => odeslatOdpoved({ success: false }));
            
        return true;
    }

    // --- IMDb ---
    if (pozadavek.akce === "stahniIMDb") {
        fetch(pozadavek.url)
            .then(odpoved => odpoved.text())
            .then(async htmlText => {
                try {
                    const match = htmlText.match(/href="(\/title\/tt\d+[^"]*)"/);
                    if (match && match[1]) {
                        let cistaUrl = match[1].split('?')[0];
                        let filmUrl = 'https://www.imdb.com' + cistaUrl;
                        
                        const detailOdpoved = await fetch(filmUrl);
                        const detailHtml = await detailOdpoved.text();
                        odeslatOdpoved({ success: true, url: filmUrl, detailHtml: detailHtml });
                    } else {
                        odeslatOdpoved({ success: false });
                    }
                } catch (e) {
                    odeslatOdpoved({ success: false });
                }
            })
            .catch(() => odeslatOdpoved({ success: false }));
            
        return true;
    }
});