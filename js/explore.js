import { state } from './state.js';
import { openPostDetailsModal } from './profile.js';

export function renderExplore(container) {
  container.innerHTML = '';

  const exploreWrapper = document.createElement('div');
  exploreWrapper.className = 'explore-wrapper';

  // 1. Search Bar Top & Categories Horizontal Chips
  exploreWrapper.innerHTML = `
    <div class="explore-search-container">
      <div class="search-input-wrapper">
        <i class="fas fa-search search-icon"></i>
        <input type="text" id="explore-search-input" placeholder="Search accounts, tags, places...">
        <button class="clear-search-btn" id="clear-search-btn" style="display: none;"><i class="fas fa-times-circle"></i></button>
      </div>
      <div class="search-results-overlay" id="search-results-overlay"></div>
    </div>

    <div class="explore-chips-container" id="explore-chips-container">
      <button class="explore-chip active" data-category="all">For You</button>
      <button class="explore-chip" data-category="travel">Travel</button>
      <button class="explore-chip" data-category="aesthetic">Aesthetic</button>
      <button class="explore-chip" data-category="minimalism">Minimalism</button>
      <button class="explore-chip" data-category="coding">Coding</button>
    </div>
    
    <!-- Explore Grid -->
    <div class="explore-grid-container" id="explore-grid-container"></div>
  `;

  container.appendChild(exploreWrapper);

  const searchInput = exploreWrapper.querySelector('#explore-search-input');
  const clearBtn = exploreWrapper.querySelector('#clear-search-btn');
  const resultsOverlay = exploreWrapper.querySelector('#search-results-overlay');
  const gridContainer = exploreWrapper.querySelector('#explore-grid-container');
  const chipContainer = exploreWrapper.querySelector('#explore-chips-container');

  renderExploreGrid(gridContainer, 'all');

  // Chip category clicking
  const chips = chipContainer.querySelectorAll('.explore-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      renderExploreGrid(gridContainer, chip.dataset.category);
    });
  });

  // Search input listeners
  searchInput.addEventListener('input', (e) => {
    const val = e.target.value.trim().toLowerCase();
    if (val !== '') {
      clearBtn.style.display = 'block';
      resultsOverlay.classList.add('active');
      renderSearchResults(val, resultsOverlay);
    } else {
      clearBtn.style.display = 'none';
      resultsOverlay.classList.remove('active');
      resultsOverlay.innerHTML = '';
    }
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.style.display = 'none';
    resultsOverlay.classList.remove('active');
    resultsOverlay.innerHTML = '';
  });
}

function renderExploreGrid(container, category = 'all') {
  container.innerHTML = '';

  // Collect all available posts (both system feed and user uploads)
  const allPosts = [...state.posts, ...state.currentUser.posts];
  let filteredPosts = allPosts;

  // Filter based on selected category tags
  if (category !== 'all') {
    filteredPosts = allPosts.filter(post => {
      const text = `${post.caption} ${post.location} ${post.username}`.toLowerCase();
      if (category === 'travel') {
        return text.includes('shibuya') || text.includes('tokyo') || text.includes('rain') || text.includes('travel') || text.includes('japan');
      } else if (category === 'minimalism') {
        return text.includes('desk') || text.includes('laptop') || text.includes('workspace') || text.includes('cozy') || text.includes('cup');
      } else if (category === 'aesthetic') {
        return text.includes('neon') || text.includes('sunset') || text.includes('bioluminescent') || text.includes('vaporwave') || text.includes('forest');
      } else if (category === 'coding') {
        return text.includes('code') || text.includes('coding') || text.includes('developer') || text.includes('pwa') || text.includes('studio') || text.includes('engineer');
      }
      return true;
    });
  }

  const uniquePosts = Array.from(new Set(filteredPosts.map(p => p.id)))
                            .map(id => filteredPosts.find(p => p.id === id));

  if (uniquePosts.length === 0) {
    container.innerHTML = `<div class="explore-empty-state"><h2>No posts in this category</h2><p>Try exploring other collections!</p></div>`;
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'explore-grid';

  uniquePosts.forEach((post, idx) => {
    const gridItem = document.createElement('div');
    const isLarge = idx % 5 === 0;
    gridItem.className = `explore-grid-item ${isLarge ? 'large-item' : ''}`;
    
    gridItem.innerHTML = `
      <img src="${post.image}" class="${post.filterClass || ''}" alt="Explore content">
      <div class="explore-item-overlay">
        <span><i class="fas fa-heart"></i> ${post.likes}</span>
        <span><i class="fas fa-comment"></i> ${post.comments.length}</span>
      </div>
    `;

    gridItem.addEventListener('click', () => {
      openPostDetailsModal(post.id);
    });

    grid.appendChild(gridItem);
  });

  container.appendChild(grid);
}

function renderSearchResults(query, container) {
  // Search state accounts
  const mockAccounts = [
    { username: 'alex_adventures', name: 'Alex Robinson', avatar: 'assets/app-icon.png', tag: 'Travel Photography' },
    { username: 'creative_soul', name: 'Sarah Miller', avatar: 'assets/avatar-current.png', tag: 'Visual Artist' },
    { username: 'neon_dreamer', name: 'Kaelen Vance', avatar: 'assets/story-1.png', tag: 'Vaporwave Producer' },
    { username: 'pixel_pioneer', name: 'Piyush Explorer', avatar: 'assets/avatar-current.png', tag: 'Software Engineer' }
  ];

  const filtered = mockAccounts.filter(acc => 
    acc.username.toLowerCase().includes(query) || 
    acc.name.toLowerCase().includes(query)
  );

  if (filtered.length === 0) {
    container.innerHTML = `<div class="search-empty-state">No results found for "${query}"</div>`;
    return;
  }

  container.innerHTML = `
    <div class="search-results-list">
      ${filtered.map(acc => `
        <div class="search-result-item" data-username="${acc.username}">
          <img src="${acc.avatar}" alt="${acc.username}">
          <div class="search-result-meta">
            <span class="search-result-username">${acc.username}</span>
            <span class="search-result-name">${acc.name} • ${acc.tag}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Attach search result click redirect
  const items = container.querySelectorAll('.search-result-item');
  items.forEach(item => {
    item.addEventListener('click', () => {
      const username = item.dataset.username;
      
      // If search result is current user, navigate to profile
      if (username === state.currentUser.username) {
        const navProfile = document.querySelector('[data-view="profile"]');
        if (navProfile) navProfile.click();
      } else {
        // Show detail info for the user or prompt
        alert(`Navigating to mock profile of @${username}`);
      }

      // Close search results overlay
      const input = document.getElementById('explore-search-input');
      const clearBtn = document.getElementById('clear-search-btn');
      if (input) input.value = '';
      if (clearBtn) clearBtn.style.display = 'none';
      container.classList.remove('active');
      container.innerHTML = '';
    });
  });
}
