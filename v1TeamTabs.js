class GradientTeamTabs {
  constructor() {
    this.container = document.querySelector('.v1');
    this.buttons = this.container.querySelectorAll('.tab-button');
    this.selectedTeam = this.container.querySelector('.selected-team');
    this.init();
  }

  init() {
    this.buttons.forEach(button => {
      button.addEventListener('click', (e) => this.handleTabClick(e));
    });
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

    // Update and animate title
    const teamName = button.querySelector('.tab-label').textContent;
    this.updateTeamTitle(teamName);
  }

  updateTeamTitle(teamName) {
    this.selectedTeam.classList.remove('animate');
    // Trigger reflow
    void this.selectedTeam.offsetWidth;
    this.selectedTeam.textContent = `${teamName} Team`;
    this.selectedTeam.classList.add('animate');
  }
} 