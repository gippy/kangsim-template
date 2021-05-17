let loadedSlides = 0;
let maybeHasMoreItems = true;
let currentSliderOffset = 0;
let displaysMultiple = window.outerWidth > 991;
let resizeTimeout;

/**
 * Tahle funkce nacita novinky z endpointu nastaveneho do attributu `data-additional-news-href` u elementu `.posouvaci-novinky`
 * Vzdy odesle dotaz v tomto formatu `<data-additional-news-href>?offset=<aktualne zobrazeny pocet novinek>`.
 * Pokud endpoint vrati prazdnou odpoved, tak se nastavi promenna `maybeHasMoreItems` na `false` a uz se dalsi novinky nenactou.
 * @returns {void}
 */
async function loadMoreSlides() {
    const slider = document.querySelector('.posouvaci-novinky');
    const href = slider.getAttribute('data-additional-news-href');
    if (!href) return;

    try {
        const response = await fetch(`${href}?offset=${loadedSlides - 1}`);
        const additionalSlides = await response.text();
        const slidesRow = document.querySelector('.posouvaci-novinky-obsah .row');
        slidesRow.innerHTML = slidesRow.innerHTML + additionalSlides;
        const nextLoadedSlides = document.querySelectorAll('.posouvaci-novinky-obsah .row .col-lg-4').length;
        // Dotaz vratil prazdnou stranku bez novinek, tim padem dalsi novinky uz nejsou dostupne
        if (nextLoadedSlides === loadedSlides) maybeHasMoreItems = false;
        loadedSlides = nextLoadedSlides;
    } catch (error) {
        console.error(error);
    }
}

/**
 * Posouva novinky doprava, kdyz narazi na posledni tak zkusi nacist dalsi novinky.
 * Pokud uz pri predchozim nacteni byla nactena posledni novinka, tak uz to tato funkce dal nezkousi.
 * @param {Event} event
 * @returns {void}
 */
function nextSlide(event) {
    event.preventDefault();
    const maxOffset = displaysMultiple ? loadedSlides - 3 : loadedSlides - 1;
    if (currentSliderOffset >= maxOffset) return;
    const slidesRow = document.querySelector('.posouvaci-novinky-obsah .row');
    currentSliderOffset += 1;
    const offsetPercentage = displaysMultiple ? 33.33 : 100;
    slidesRow.style.transform = `translate(${-currentSliderOffset * offsetPercentage}%, 0)`;

    // If we are one item before the last slide, try to load more slides
    if (maybeHasMoreItems && currentSliderOffset === maxOffset) loadMoreSlides();
}

/**
 * Posouva novinky doleva, kdyz narazi na prvni tak uz dal neposouva a nereaguje na klikani.
 * @param {Event} event
 * @returns {void}
 */
function prevSlide(event) {
    event.preventDefault();
    if (currentSliderOffset === 0) return;
    const slidesRow = document.querySelector('.posouvaci-novinky-obsah .row');
    currentSliderOffset -= 1;
    const offsetPercentage = displaysMultiple ? 33.33 : 100;
    slidesRow.style.transform = `translate(${-currentSliderOffset * offsetPercentage}%, 0)`;
}

/**
 * Pri zmene velikosti okna vyresetuje aktualni posuvnik novinek. Tato funkce se vola aby se
 * zajistilo spravne zobrazeni novinek, pokud uzivatel zmeni velikost okna natolik, ze se prepne
 * layout z mobilu na desktop a naopak.
 * Aby se predeslo pretizeni CPU tak se tato funkce vola az 300ms po posledni zmene velikosti okna.
 */
function debouncedResetSlider() {
    if (resizeTimeout) window.clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(() => {
        displaysMultiple = window.outerWidth > 991;
        const slidesRow = document.querySelector('.posouvaci-novinky-obsah .row');
        currentSliderOffset = 0;
        slidesRow.style.transform = `translate(${-currentSliderOffset * 33.33}%, 0)`;
    }, 300);
}

function initSlider(slider) {
    const controls = slider.querySelectorAll('.posouvaci-novinky-ovladani button');
    controls[0].addEventListener('click', prevSlide);
    controls[1].addEventListener('click', nextSlide);

    loadedSlides = document.querySelectorAll('.posouvaci-novinky-obsah .row .col-lg-4').length;

    window.addEventListener('resize', debouncedResetSlider);
}

window.addEventListener('load', () => {
    const slider = document.querySelector('.posouvaci-novinky');
    if (!slider) return;
    initSlider(slider);
});
