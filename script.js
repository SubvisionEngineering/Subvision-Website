// Select the hamburger and the mobile navigation menu
const hamburger = document.querySelector('.hamburger');
const mobileNav = document.querySelector('.nav-links-mobile');

// Toggle active class on hamburger and mobile navigation
hamburger.addEventListener('click', () => {
    mobileNav.classList.toggle('active'); // Show or hide the mobile menu
    hamburger.classList.toggle('active'); // Change hamburger icon state
});

// Close the mobile menu when a link is clicked
document.querySelectorAll('.nav-links-mobile a').forEach(link => {
    link.addEventListener('click', () => {
        mobileNav.classList.remove('active');
        hamburger.classList.remove('active');
    });
});
