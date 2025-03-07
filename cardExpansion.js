/**
 * Handles the expansion and collapse of mission cards
 */
function initializeMissionCards() {
    const expansionButtons = document.querySelectorAll('.toggle-btn');
    
    expansionButtons.forEach(button => {
        button.addEventListener('click', handleCardExpansion);
    });
}

/**
 * Toggles the expansion state of a mission card
 * @param {Event} event - The click event
 */
function handleCardExpansion(event) {
    const button = event.currentTarget;
    const card = button.closest('.ui-card');
    const contentWrapper = card.querySelector('.card-body-wrapper');
    
    contentWrapper.classList.toggle('expanded');
    
    // Update aria-expanded state for accessibility
    const isExpanded = contentWrapper.classList.contains('expanded');
    button.setAttribute('aria-expanded', isExpanded);
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeMissionCards); 