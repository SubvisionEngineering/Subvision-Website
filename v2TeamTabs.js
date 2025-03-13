class ContactStyleTeamTabs {
  constructor() {
    this.container = document.querySelector('.v2');
    this.buttons = this.container.querySelectorAll('.tab-button');
    this.selectedTeam = this.container.querySelector('.selected-team');
    this.teamSections = document.querySelectorAll('.team-section');
    this.init();
  }

  init() {
    this.buttons.forEach(button => {
      button.addEventListener('click', (e) => this.handleTabClick(e));
    });
    // Initialize the slot wrapper
    this.createSlotWrapper();
    
    // Show initial team section (executives)
    this.showTeamSection('executives');
  }

  createSlotWrapper() {
    // Create initial slot wrapper and text
    const wrapper = document.createElement('div');
    wrapper.className = 'slot-wrapper';
    const text = document.createElement('div');
    text.className = 'slot-text';
    text.textContent = this.selectedTeam.textContent;
    wrapper.appendChild(text);
    this.selectedTeam.textContent = '';
    this.selectedTeam.appendChild(wrapper);
  }

  handleTabClick(e) {
    // Remove active class from all buttons
    this.buttons.forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
    });

    // Add active class to clicked button
    const button = e.currentTarget;
    button.classList.add('active');
    button.setAttribute('aria-pressed', 'true');

    // Get team ID and show corresponding section
    const teamId = button.getAttribute('data-tab');
    this.showTeamSection(teamId);

    // Update and animate title
    const teamName = button.querySelector('.tab-label').textContent;
    this.updateTeamTitle(`${teamName} Team`);

    // Reset card animations
    const cards = document.querySelectorAll('.team-member-card');
    cards.forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      void card.offsetWidth; // Force reflow
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    });
  }

  showTeamSection(teamId) {
    // Hide all team sections
    this.teamSections.forEach(section => {
      section.classList.remove('active');
    });

    // Show selected team section
    const activeSection = document.getElementById(teamId);
    if (activeSection) {
      activeSection.classList.add('active');
    }
  }

  updateTeamTitle(newText) {
    const wrapper = this.selectedTeam.querySelector('.slot-wrapper');
    const oldText = wrapper.querySelector('.slot-text');
    
    // Create new text element
    const newTextElement = document.createElement('div');
    newTextElement.className = 'slot-text';
    newTextElement.textContent = newText;
    
    // Add animations
    oldText.style.animation = 'slideOutUp 0.3s forwards';
    newTextElement.style.animation = 'slideInUp 0.3s forwards';
    
    // Add new text and remove old after animation
    wrapper.appendChild(newTextElement);
    setTimeout(() => {
      wrapper.removeChild(oldText);
    }, 300);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ContactStyleTeamTabs();
});