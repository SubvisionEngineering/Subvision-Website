// Intersection Observer for story cards
document.addEventListener('DOMContentLoaded', function() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.2
    });

    // Observe all story cards
    document.querySelectorAll('.story-card').forEach(card => {
        observer.observe(card);
    });
}); 