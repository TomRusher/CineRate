console.log("CineRate: Spouštím rozhraní s načítáním procent (vždy červené)...");

function pridejHodnoceni() {
    const elementyFilmu = document.querySelectorAll('.qb-movie-name, h1.upper-case');
    
    if (elementyFilmu.length === 0) {
        return;
    }

    elementyFilmu.forEach((el) => {
        if (el.querySelector('.cinerate-container')) return;

        let nazevFilmu = el.innerText.trim();
        nazevFilmu = nazevFilmu.replace(/SLAVTE S NÁMI:\s*/gi, '').trim();

        if (nazevFilmu.length < 2 || nazevFilmu.length > 50) return;

        const kontejner = document.createElement('span');
        kontejner.className = 'cinerate-container';
        kontejner.style.marginLeft = '15px';

        const csfdBtn = document.createElement('a');
        const zakladniCsfdUrl = `https://www.csfd.cz/hledat/?q=${encodeURIComponent(nazevFilmu)}`;
        csfdBtn.href = zakladniCsfdUrl;
        csfdBtn.target = '_blank';
        csfdBtn.innerText = 'ČSFD';
        
        // Stabilní červená barva pro všechna tlačítka
        csfdBtn.style.backgroundColor = '#cc0000';
        csfdBtn.style.color = 'white';
        csfdBtn.style.fontSize = '12px';
        csfdBtn.style.fontWeight = 'bold';
        csfdBtn.style.padding = '3px 8px';
        csfdBtn.style.borderRadius = '4px';
        csfdBtn.style.textDecoration = 'none';
        csfdBtn.style.display = 'inline-block';
        csfdBtn.style.cursor = 'pointer';

        kontejner.appendChild(csfdBtn);
        el.appendChild(kontejner);

        // Odeslání požadavku na pozadí pro stažení procent
        // --- INTELIGENTNÍ DOPLNĚNÍ PROCENT A PŘÍMÉHO ODKAZU NA POZADÍ ---
        chrome.runtime.sendMessage({ akce: "stahniCSFD", url: zakladniCsfdUrl }, (odpoved) => {
            if (odpoved && odpoved.html) {
                try {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(odpoved.html, 'text/html');
                    
                    const prvnifilmOdkaz = doc.querySelector('a[href*="/film/"]');
                    
                    if (prvnifilmOdkaz) {
                        const suroveHref = prvnifilmOdkaz.getAttribute('href');
                        
                        if (suroveHref && suroveHref.includes('/film/')) {
                            const finalniCsfdUrl = suroveHref.startsWith('http') ? suroveHref : 'https://www.csfd.cz' + suroveHref;
                            csfdBtn.href = finalniCsfdUrl;

                            // Teď, když máme přímou URL detailu filmu, můžeme si stáhnout přímo tuto stránku, 
                            // kde ta třída .film-rating-average zaručeně je!
                            chrome.runtime.sendMessage({ akce: "stahniCSFD", url: finalniCsfdUrl }, (detailyOdpoved) => {
                                if (detailyOdpoved && detailyOdpoved.html) {
                                    const detailDoc = parser.parseFromString(detailyOdpoved.html, 'text/html');
                                    const ratingDiv = detailDoc.querySelector('.film-rating-average');
                                    
                                    if (ratingDiv) {
                                        const procentaText = ratingDiv.textContent.trim(); // např. "75%"
                                        const shodaCisla = procentaText.match(/(\d{1,3})/);
                                        
                                        if (shodaCisla) {
                                            const procenta = shodaCisla[1];
                                            csfdBtn.innerText = `ČSFD ${procenta}%`;
                                            console.log(`CineRate: Úspěšně získáno hodnocení ${procenta}% pro "${nazevFilmu}" z detailu filmu!`);
                                        }
                                    }
                                }
                            });
                        }
                    }
                } catch (e) {
                    console.log("Chyba při parsování HTML z ČSFD: ", e);
                }
            }
        });
    }); //
}

setTimeout(pridejHodnoceni, 2000);
setInterval(pridejHodnoceni, 3000);