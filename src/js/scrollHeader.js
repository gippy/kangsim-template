const navbar = document.querySelector('header nav')

// OnScroll event handler
const onScroll = () => {
    // Get scroll value
    const scroll = document.documentElement.scrollTop

    // If scroll value is more than 0 - add class
    if (scroll > 16) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled")
    }
}

// When window scroll this adds a scrolled class to the navbar
window.addEventListener('scroll', onScroll)
onScroll();

// When user clicks on links in navbar and navbar is open, it automatically closes it (on mobile)
const navLinks = document.querySelectorAll('.navbar-nav:not(.social) .nav-link');
let bsCollapse;
navLinks.forEach((link) => {
    link.addEventListener('click', () => {
        if (window.outerWidth > 992) return;
        if (!bsCollapse) {
            const menuToggle = document.querySelector('.navbar-collapse');
            bsCollapse = new bootstrap.Collapse(menuToggle);
        }
        bsCollapse.hide();
    });
});
