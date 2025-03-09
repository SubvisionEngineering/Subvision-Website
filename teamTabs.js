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

  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const versionContainer = this.closest('.tab-structure');
      const siblingButtons = versionContainer.querySelectorAll('.tab-button');
      const titleElement = versionContainer.querySelector('.selected-team');
      const isVersion2 = versionContainer.classList.contains('v2');
      
      // Remove active class from all buttons
      siblingButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      });

      // Add active class to clicked button
      this.classList.add('active');
      this.setAttribute('aria-pressed', 'true');

      // Get the team name
      const teamName = this.querySelector('.tab-label').textContent;
      const newText = `${teamName} Team`;

      if (isVersion2) {
        const currentText = titleElement.textContent;
        
        // Create wrapper to maintain dimensions
        const wrapper = document.createElement('div');
        wrapper.className = 'slot-wrapper';
        
        // Create text elements
        const oldTextEl = document.createElement('div');
        oldTextEl.className = 'slot-text';
        oldTextEl.textContent = currentText;
        
        const newTextEl = document.createElement('div');
        newTextEl.className = 'slot-text';
        newTextEl.textContent = newText;
        newTextEl.style.transform = 'translateY(100%)';
        newTextEl.style.opacity = '0';
        
        // Set up animation
        wrapper.appendChild(oldTextEl);
        wrapper.appendChild(newTextEl);
        
        // Store original content
        const originalContent = titleElement.innerHTML;
        
        // Apply animation
        titleElement.innerHTML = '';
        titleElement.appendChild(wrapper);
        
        // Trigger animations
        requestAnimationFrame(() => {
          oldTextEl.style.animation = 'slideOutUp 0.3s ease-out forwards';
          setTimeout(() => {
            newTextEl.style.animation = 'slideInUp 0.3s ease-out forwards';
          }, 150);
        });
        
        // Clean up after animation
        setTimeout(() => {
          titleElement.innerHTML = newText;
        }, 450);
      } else {
        // Original animation for other versions
        titleElement.classList.remove('animate');
        void titleElement.offsetWidth;
        titleElement.textContent = newText;
        titleElement.classList.add('animate');
      }
    });
  });

  // Remove any intersection observers if they exist
  if (window.teamObserver) {
    window.teamObserver.disconnect();
  }
}); 