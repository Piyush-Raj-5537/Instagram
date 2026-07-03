import { addPost } from './state.js';

let selectedImageSrc = '';
let selectedFilterClass = '';

export function renderCreate(container) {
  // Reset local state variables
  selectedImageSrc = '';
  selectedFilterClass = '';

  container.innerHTML = '';

  const creatorWrapper = document.createElement('div');
  creatorWrapper.className = 'creator-wrapper';

  renderUploadScreen(creatorWrapper);
  container.appendChild(creatorWrapper);
}

function renderUploadScreen(container) {
  container.innerHTML = `
    <div class="creator-header">
      <h2>Create new post</h2>
      <button class="creator-next-btn" id="creator-next-btn" style="display: none;">Next</button>
    </div>
    
    <div class="creator-body upload-step" id="creator-body-content">
      <div class="drag-drop-area" id="drag-drop-area">
        <i class="far fa-images upload-icon"></i>
        <h3>Drag photos and videos here</h3>
        <button class="select-file-btn" id="select-file-btn">Select from computer</button>
        <input type="file" id="creator-file-input" accept="image/*" style="display: none;">
      </div>
    </div>
  `;

  const fileInput = container.querySelector('#creator-file-input');
  const selectBtn = container.querySelector('#select-file-btn');
  const dragArea = container.querySelector('#drag-drop-area');

  selectBtn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    handleFileSelect(e.target.files[0], container);
  });

  dragArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dragArea.classList.add('drag-active');
  });

  dragArea.addEventListener('dragleave', () => {
    dragArea.classList.remove('drag-active');
  });

  dragArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dragArea.classList.remove('drag-active');
    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0], container);
    }
  });
}

function handleFileSelect(file, container) {
  if (!file || !file.type.startsWith('image/')) {
    alert('Please select a valid image file.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    selectedImageSrc = e.target.result;
    renderEditScreen(container);
  };
  reader.readAsDataURL(file);
}

function renderEditScreen(container) {
  container.innerHTML = `
    <div class="creator-header">
      <button class="creator-back-btn" id="creator-back-btn"><i class="fas fa-arrow-left"></i></button>
      <h2>Edit Post</h2>
      <button class="creator-share-btn" id="creator-share-btn">Share</button>
    </div>
    
    <div class="creator-body edit-step">
      <div class="editor-pane-left">
        <div class="preview-image-container">
          <img src="${selectedImageSrc}" id="preview-image" alt="Preview Image">
        </div>
      </div>
      
      <div class="editor-pane-right">
        <!-- Tab Selectors -->
        <div class="editor-tabs">
          <button class="editor-tab-btn active" data-tab="filters">Filters</button>
          <button class="editor-tab-btn" data-tab="details">Details</button>
        </div>
        
        <!-- Filters panel -->
        <div class="editor-tab-panel active" id="panel-filters">
          <div class="filters-grid">
            <div class="filter-option" data-filter="">
              <img src="${selectedImageSrc}" alt="Normal">
              <span>Normal</span>
            </div>
            <div class="filter-option" data-filter="filter-clarendon">
              <img src="${selectedImageSrc}" class="filter-clarendon" alt="Clarendon">
              <span>Clarendon</span>
            </div>
            <div class="filter-option" data-filter="filter-gingham">
              <img src="${selectedImageSrc}" class="filter-gingham" alt="Gingham">
              <span>Gingham</span>
            </div>
            <div class="filter-option" data-filter="filter-moon">
              <img src="${selectedImageSrc}" class="filter-moon" alt="Moon">
              <span>Moon</span>
            </div>
            <div class="filter-option" data-filter="filter-sepia">
              <img src="${selectedImageSrc}" class="filter-sepia" alt="Sepia">
              <span>Sepia</span>
            </div>
            <div class="filter-option" data-filter="filter-lark">
              <img src="${selectedImageSrc}" class="filter-lark" alt="Lark">
              <span>Lark</span>
            </div>
          </div>
        </div>
        
        <!-- Details panel -->
        <div class="editor-tab-panel" id="panel-details">
          <div class="post-details-fields">
            <div class="caption-input-wrapper">
              <textarea id="creator-caption-field" placeholder="Write a caption..." maxlength="2200"></textarea>
            </div>
            <div class="location-input-wrapper">
              <i class="fas fa-map-marker-alt"></i>
              <input type="text" id="creator-location-field" placeholder="Add location">
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const previewImg = container.querySelector('#preview-image');
  const filterOptions = container.querySelectorAll('.filter-option');
  const shareBtn = container.querySelector('#creator-share-btn');
  const backBtn = container.querySelector('#creator-back-btn');
  const tabBtns = container.querySelectorAll('.editor-tab-btn');
  const panels = container.querySelectorAll('.editor-tab-panel');

  // Back button returns to upload screen
  backBtn.addEventListener('click', () => {
    renderUploadScreen(container);
  });

  // Tab switching
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      
      btn.classList.add('active');
      container.querySelector(`#panel-${btn.dataset.tab}`).classList.add('active');
    });
  });

  // Filter Selection
  filterOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      filterOptions.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      
      const filterClass = opt.dataset.filter;
      selectedFilterClass = filterClass;
      
      // Apply filter to main preview image
      previewImg.className = filterClass;
    });
  });

  // Share action
  shareBtn.addEventListener('click', () => {
    const caption = container.querySelector('#creator-caption-field').value;
    const location = container.querySelector('#creator-location-field').value;

    addPost({
      image: selectedImageSrc,
      caption: caption,
      location: location,
      filterClass: selectedFilterClass
    });

    // Trigger feedback and return to feed
    alert('Post shared successfully! 🚀');

    // Trigger navigate to home feed
    const navHome = document.querySelector('[data-view="feed"]');
    if (navHome) {
      navHome.click();
    }
  });
}
