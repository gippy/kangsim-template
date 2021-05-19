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

// Use either onScroll or throttledOnScroll
window.addEventListener('scroll', onScroll)
