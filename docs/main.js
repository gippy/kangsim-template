(function () {
    'use strict';

    let modal = null;

    function setInnerHTML(parent, html) {
      parent.innerHTML = '';
      parent.innerHTML = html;
      const scripts = parent.querySelectorAll('script');
      scripts.forEach(script => {
        // Dangerous, but only way to eval scripts loaded externally
        eval(script.innerHTML);
      });
    }

    async function openInModal(event, link) {
      // Do not open links to pages that should open in new window in modal
      if (link.target === '_blank') return; // If link starts with # it's a link inside the main page, skip it too.

      const href = link.getAttribute('href');
      if (href.startsWith('#')) return; // Stop the normal link event

      event.preventDefault(); // Download the html content of the new page

      let content = '';

      try {
        const response = await fetch(link.href);
        content = await response.text();
      } catch (error) {
        // If content load failed, log error in console and exit
        console.error(error);
        return;
      }

      const modalContentElement = document.querySelector('#page-content-modal .modal-actual-body'); // If for some reason the modal is not part of DOM log error and exit

      if (!modalContentElement) {
        console.error(`Document element with selector '${modalContentElement}' does not exist.`);
        return;
      }

      setInnerHTML(modalContentElement, content); // If the new modal content contains links, ensure that they also open in this modal

      modalContentElement.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', event => openInModal(event, link));
      });
      modal.show();
    }

    window.addEventListener('load', () => {
      modal = new bootstrap.Modal(document.getElementById('page-content-modal'), {});
      document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', event => openInModal(event, link));
      });
    });

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
        const nextLoadedSlides = document.querySelectorAll('.posouvaci-novinky-obsah .row .col-lg-4').length; // Dotaz vratil prazdnou stranku bez novinek, tim padem dalsi novinky uz nejsou dostupne

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
      slidesRow.style.transform = `translate(${-currentSliderOffset * offsetPercentage}%, 0)`; // If we are one item before the last slide, try to load more slides

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

    const navbar = document.querySelector('header nav'); // OnScroll event handler

    const onScroll = () => {
      // Get scroll value
      const scroll = document.documentElement.scrollTop; // If scroll value is more than 0 - add class

      if (scroll > 16) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    }; // When window scroll this adds a scrolled class to the navbar


    window.addEventListener('scroll', onScroll);
    onScroll(); // When user clicks on links in navbar and navbar is open, it automatically closes it (on mobile)

    const navLinks = document.querySelectorAll('.navbar-nav:not(.social) .nav-link');
    let bsCollapse;
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.outerWidth > 992) return;

        if (!bsCollapse) {
          const menuToggle = document.querySelector('.navbar-collapse');
          bsCollapse = new bootstrap.Collapse(menuToggle);
        }

        bsCollapse.hide();
      });
    });

}());
