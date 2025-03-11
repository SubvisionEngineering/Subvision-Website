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
    'sem': 'SEM Team',
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
      const teamType = button.getAttribute('data-tab');
      console.log(`Tab clicked: ${teamType}`); // Debug log
      
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
        console.log(`Hiding section: ${section.id}`); // Debug log
      });

      // Update selected team title
      const teamName = button.querySelector('.tab-label').getAttribute('data-text');
      const selectedTeamTitle = document.querySelector('.selected-team');
      selectedTeamTitle.textContent = `${teamName} Team`;

      // Show the selected team section
      const activeSection = document.getElementById(teamType);
      if (activeSection) {
        activeSection.classList.add('active');
        console.log(`Showing section: ${teamType}`); // Debug log
      } else {
        console.error(`Section with ID "${teamType}" not found!`); // Debug error
      }
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

  // Software team data
  const softwareTeam = {
    leader: {
      name: "Saketh Poori",
      role: "Software Lead",
      linkedin: "#"
    },
    members: [
      {
        name: "Emily Trinh",
        role: "Software Developer",
        linkedin: "#"
      },
      {
        name: "Valentino Tapia",
        role: "Software Developer",
        linkedin: "#"
      },
      {
        name: "Hayden Mai",
        role: "Software Developer",
        linkedin: "#"
      },
      {
        name: "Rodrigo Anasco",
        role: "Software Developer",
        linkedin: "#"
      },
      {
        name: "Tanvir Leon",
        role: "Software Developer",
        linkedin: "#"
      },
      {
        name: "Ahmed",
        role: "Software Developer",
        linkedin: "#"
      }
    ]
  };

  // SEM team data
  const semTeam = {
    leader: {
      name: "Abi",
      role: "SEM Lead",
      linkedin: "#"
    },
    members: [
      {
        name: "Laura Visbal Garcia",
        role: "SEM Member",
        linkedin: "#"
      },
      {
        name: "Shoaib",
        role: "SEM Member",
        linkedin: "#"
      },
      {
        name: "Theo",
        role: "SEM Member",
        linkedin: "#"
      },
      {
        name: "Theo",
        role: "SEM Member",
        linkedin: "#"
      },
      {
        name: "Karl",
        role: "SEM Member",
        linkedin: "#"
      },
      {
        name: "William",
        role: "SEM Member",
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

  // Add this debugging code at the end of the DOMContentLoaded event
  console.log("Available team sections:");
  document.querySelectorAll('.team-section').forEach(section => {
    console.log(`- ${section.id}`);
  });

  console.log("Available tab buttons:");
  document.querySelectorAll('.tab-button').forEach(button => {
    console.log(`- ${button.getAttribute('data-tab')}`);
  });

  // Check specifically for the mechatronics tab and section
  const mechTab = document.querySelector('.tab-button[data-tab="mechatronics"]');
  const mechSection = document.getElementById('mechatronics');

  if (mechTab) {
    console.log("Mechatronics tab found:", mechTab.getAttribute('data-tab'));
  } else {
    console.error("Mechatronics tab not found!");
  }

  if (mechSection) {
    console.log("Mechatronics section found:", mechSection.id);
  } else {
    console.error("Mechatronics section not found!");
  }

  // Test clicking the mechatronics tab programmatically
  document.querySelector('.tab-button[data-tab="mechatronics"]')?.click();
}); 

// Class definitions for the tab animations
class GradientTeamTabs {
  constructor() {
    this.container = document.querySelector('.v1');
    if (!this.container) return;
    
    this.buttons = this.container.querySelectorAll('.tab-button');
    this.selectedTeam = this.container.querySelector('.selected-team');
    
    this.init();
  }
  
  init() {
    this.buttons.forEach(button => {
      button.addEventListener('click', () => {
        this.updateActiveState(button);
        this.animateTeamTitle();
      });
    });
  }
  
  updateActiveState(activeButton) {
    this.buttons.forEach(button => {
      button.classList.remove('active');
      button.setAttribute('aria-pressed', 'false');
    });
    
    activeButton.classList.add('active');
    activeButton.setAttribute('aria-pressed', 'true');
  }
  
  animateTeamTitle() {
    this.selectedTeam.classList.remove('animate');
    void this.selectedTeam.offsetWidth; // Force reflow
    this.selectedTeam.classList.add('animate');
  }
}

class ContactStyleTeamTabs {
  constructor() {
    this.container = document.querySelector('.v2');
    if (!this.container) return;
    
    this.buttons = this.container.querySelectorAll('.tab-button');
    this.selectedTeam = this.container.querySelector('.selected-team');
    
    this.init();
  }
  
  init() {
    this.buttons.forEach(button => {
      button.addEventListener('click', (e) => this.handleTabClick(e));
    });
    
    // Initialize the slot wrapper
    this.createSlotWrapper();
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
    
    // Update and animate title
    const teamName = button.querySelector('.tab-label').textContent;
    this.updateTeamTitle(`${teamName} Team`);
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

class GlassTeamTabs {
  constructor() {
    this.container = document.querySelector('.v3');
    if (!this.container) return;
    
    this.buttons = this.container.querySelectorAll('.tab-button');
    this.selectedTeam = this.container.querySelector('.selected-team');
    
    this.init();
  }
  
  init() {
    this.buttons.forEach(button => {
      button.addEventListener('click', () => {
        this.updateActiveState(button);
        this.animateTeamTitle();
      });
    });
  }
  
  updateActiveState(activeButton) {
    this.buttons.forEach(button => {
      button.classList.remove('active');
      button.setAttribute('aria-pressed', 'false');
    });
    
    activeButton.classList.add('active');
    activeButton.setAttribute('aria-pressed', 'true');
  }
  
  animateTeamTitle() {
    this.selectedTeam.classList.remove('animate');
    void this.selectedTeam.offsetWidth; // Force reflow
    this.selectedTeam.classList.add('animate');
  }
} 
  // Add this at the end of the DOMContentLoaded event
  const semTabButton = document.querySelector('.tab-button[data-tab="sem"]');
  if (semTabButton) {
    console.log('SEM tab button found with data-tab:', semTabButton.getAttribute('data-tab'));
  } else {
    console.error('SEM tab button not found or missing data-tab attribute!');
    // Check all tab buttons
    const allButtons = document.querySelectorAll('.tab-button');
    console.log('All tab buttons:');
    allButtons.forEach((btn, index) => {
      console.log(`Button ${index + 1}:`, btn.getAttribute('data-tab'), btn.textContent.trim());
    });
  }

  // Check if SEM section exists
  const semSection = document.getElementById('sem');
  if (semSection) {
    console.log('SEM section found with ID:', semSection.id);
  } else {
    console.error('SEM section not found!');
  }
}); 