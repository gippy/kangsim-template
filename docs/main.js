
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
(function () {
    'use strict';

    window.modal = null;

    function setInnerHTML(parent, html) {
        parent.innerHTML = html;
        Array.from(parent.querySelectorAll("script")).forEach((oldScript) => {
            const newScript = document.createElement("script");
            Array.from(oldScript.attributes).forEach( attr => newScript.setAttribute(attr.name, attr.value) );
            newScript.appendChild(document.createTextNode(oldScript.innerHTML));
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });
    }

    async function openInModal(event) {
        const link = event.target;
        // Do not open links to pages that should open in new window in modal
        if (link.target === '_blank') return;

        // If link starts with # it's a link inside the main page, skip it too.
        const href = link.getAttribute('href');
        if (href.startsWith('#')) return;

        // Stop the normal link event
        event.preventDefault();

        // Download the html content of the new page
        let content = '';
        try {
            const response = await fetch(link.href);
            content = await response.text();
        } catch (error) {
            // If content load failed, log error in console and exit
            console.error(error);
            return;
        }

        const modalContentElement = document.querySelector('#page-content-modal .modal-actual-body');
        // If for some reason the modal is not part of DOM log error and exit
        if (!modalContentElement) {
            console.error(`Document element with selector '${modalContentElement}' does not exist.`);
            return;
        }
        setInnerHTML(modalContentElement, content);
        // If the new modal content contains links, ensure that they also open in this modal
        modalContentElement.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', openInModal);
        });
        window.modal.show();
    }

    window.addEventListener('load', (event) => {
        window.modal = new bootstrap.Modal(document.getElementById('page-content-modal'), {});
        document.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', openInModal);
        });
    });

}());
