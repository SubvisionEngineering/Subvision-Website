document.addEventListener('DOMContentLoaded', () => {
  const gradientTabs = new GradientTeamTabs();
  const contactTabs = new ContactStyleTeamTabs();
  const glassTabs = new GlassTeamTabs();

  // Get all tab buttons
  const tabButtons = document.querySelectorAll('.tab-button');
  const versionTitles = {
    'executives': 'Executive Team',
    'software': 'Software Team',
    'mechatronics': 'Mechatronics Team',
    'electronics': 'Electronics Team',
    'sem': 'Sem Team',
    'business': 'Business Team',
    'graphics': 'Graphics Team'
  };

  // Define team order for slot animation
  const teamOrder = ['Execs', 'Software', 'Mechatronics', 'Electronics', 'Sem', 'Business', 'Graphics'];
  
  function getTeamsBetween(currentTeam, targetTeam) {
    const currentIndex = teamOrder.indexOf(currentTeam);
    const targetIndex = teamOrder.indexOf(targetTeam);
    const teams = [];
    
    if (currentIndex === targetIndex) return teams;
    
    // Determine direction and create array of teams to show
    const direction = targetIndex > currentIndex ? 1 : -1;
    let i = currentIndex;
    while (i !== targetIndex) {
      i = (i + direction + teamOrder.length) % teamOrder.length;
      teams.push(teamOrder[i]);
    }
    
    return teams;
  }

  async function animateSlotMachine(element, currentTeam, targetTeam) {
    const teamsBetween = getTeamsBetween(currentTeam.replace(' Team', ''), targetTeam);
    const container = document.createElement('div');
    container.className = 'slot-container';
    element.innerHTML = '';
    element.appendChild(container);

    // Start with current team
    const current = document.createElement('div');
    current.className = 'slot-item';
    current.textContent = currentTeam;
    container.appendChild(current);

    // Animate through intermediate teams
    const delay = 100; // Delay between each team
    for (let i = 0; i < teamsBetween.length; i++) {
      await new Promise(resolve => setTimeout(resolve, delay));
      
      const prev = container.querySelector('.slot-item');
      prev.style.transform = 'translateY(-100%)';
      prev.style.opacity = '0';
      
      const next = document.createElement('div');
      next.className = 'slot-item';
      next.textContent = `${teamsBetween[i]} Team`;
      next.style.transform = 'translateY(100%)';
      next.style.opacity = '0';
      container.appendChild(next);
      
      // Force reflow
      void next.offsetWidth;
      
      next.style.transform = 'translateY(0)';
      next.style.opacity = '1';
      
      // Remove previous after animation
      setTimeout(() => prev.remove(), 150);
    }

    // Final team
    await new Promise(resolve => setTimeout(resolve, delay));
    const prev = container.querySelector('.slot-item');
    prev.style.transform = 'translateY(-100%)';
    prev.style.opacity = '0';
    
    const final = document.createElement('div');
    final.className = 'slot-item';
    final.textContent = `${targetTeam} Team`;
    final.style.transform = 'translateY(100%)';
    final.style.opacity = '0';
    container.appendChild(final);
    
    // Force reflow
    void final.offsetWidth;
    
    final.style.transform = 'translateY(0)';
    final.style.opacity = '1';
    
    setTimeout(() => prev.remove(), 150);
  }

  const teamContents = document.querySelectorAll('.team-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const teamId = button.dataset.team;
      
      // Hide all team contents
      teamContents.forEach(content => {
        content.classList.add('hidden');
      });

      // Show selected team content
      const selectedTeam = document.getElementById(`${teamId}-team`);
      if (selectedTeam) {
        selectedTeam.classList.remove('hidden');
      }

      // Update active state of buttons
      tabButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');
    });
  });

  // Remove any intersection observers if they exist
  if (window.teamObserver) {
    window.teamObserver.disconnect();
  }

  // Business team data
  const businessTeam = {
    leader: {
      name: "Nicole Villaraso",
      role: "Business Lead",
      linkedin: "#"
    },
    members: [
      {
        name: "Zahid Hassan Joy",
        role: "Business Development",
        linkedin: "#"
      },
      {
        name: "Henry",
        role: "Business Operations",
        linkedin: "#"
      },
      {
        name: "Member 3",
        role: "Business Analytics",
        linkedin: "#"
      }
    ]
  };

  // Get all tab buttons and team sections
  const teamSections = document.querySelectorAll('.team-section');
  
  // Function to create business team HTML
  function createBusinessTeamHTML() {
    const leaderHTML = `
      <div class="leader-section">
        <div class="member-card">
          <img src="/placeholder.svg?height=100&width=100" alt="" class="member-avatar">
          <div class="member-info">
            <h3 class="member-name">${businessTeam.leader.name}</h3>
            <p class="member-title">${businessTeam.leader.role}</p>
            <div class="member-social">
              <a href="${businessTeam.leader.linkedin}" class="social-link" aria-label="LinkedIn">
                <i class="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    `;

    const membersHTML = businessTeam.members.map(member => `
      <div class="member-card">
        <img src="/placeholder.svg?height=100&width=100" alt="" class="member-avatar">
        <div class="member-info">
          <h3 class="member-name">${member.name}</h3>
          <p class="member-title">${member.role}</p>
          <div class="member-social">
            <a href="${member.linkedin}" class="social-link" aria-label="LinkedIn">
              <i class="fab fa-linkedin-in"></i>
            </a>
          </div>
        </div>
      </div>
    `).join('');

    return `
      <div class="team-header">
        <h2 class="team-title">Business Team</h2>
        <p class="team-description">Driving growth and managing operations to ensure company success.</p>
      </div>
      ${leaderHTML}
      <div class="members-row">
        ${membersHTML}
      </div>
    `;
  }

  // Handle tab clicks
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const teamType = button.getAttribute('data-tab');
      const selectedTeamTitle = document.querySelector('.selected-team');
      const businessSection = document.getElementById('business');
      
      // Update active states
      tabButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');

      // Hide all sections first
      teamSections.forEach(section => {
        section.classList.remove('active');
      });

      // Update selected team title
      const teamName = button.querySelector('.tab-label').getAttribute('data-text');
      selectedTeamTitle.textContent = `${teamName} Team`;

      // Show business team content only when business tab is clicked
      if (teamType === 'business') {
        businessSection.innerHTML = createBusinessTeamHTML();
        businessSection.classList.add('active');
      }
    });
  });

  // Initialize with executives team
  // renderTeam('executives');
}); 