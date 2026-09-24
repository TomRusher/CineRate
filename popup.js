document.addEventListener('DOMContentLoaded', async () => {
    const csfdToggle = document.getElementById('toggleCsfd');
    const imdbToggle = document.getElementById('toggleImdb');
    const saveBtn = document.getElementById('saveBtn');

    // 1. Načíst uložený stav při otevření okénka
    const data = await chrome.storage.sync.get({ showCsfd: true, showImdb: true });
    csfdToggle.checked = data.showCsfd;
    imdbToggle.checked = data.showImdb;

    // 2. Uložit nastavení a obnovit stránku po kliknutí na tlačítko
    saveBtn.addEventListener('click', async () => {
        // Uložení do paměti
        await chrome.storage.sync.set({ 
            showCsfd: csfdToggle.checked, 
            showImdb: imdbToggle.checked 
        });

        // Nalezení aktuálně otevřené záložky v prohlížeči
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                // Provedení refreshe stránky (F5)
                chrome.tabs.reload(tabs[0].id);
            }
            // Zavření popup okénka po uložení
            window.close();
        });
    });
});