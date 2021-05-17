let modal = null;

function setInnerHTML(parent, html) {
    parent.innerHTML = '';
    parent.innerHTML = html;
    const scripts = parent.querySelectorAll('script');
    scripts.forEach((script) => {
        // Dangerous, but only way to eval scripts loaded externally
        eval(script.innerHTML);
    });
}

async function openInModal(event, link) {
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
        link.addEventListener('click', (event) => openInModal(event, link));
    })
    modal.show();
}

window.addEventListener('load', () => {
    modal = new bootstrap.Modal(document.getElementById('page-content-modal'), {});
    document.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', (event) => openInModal(event, link));
    });
});
