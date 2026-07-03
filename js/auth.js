// Authentication Views Module

import { loginUser, registerUser } from './state.js';
import { switchView, showToast } from './app.js';

export function renderLogin(container) {
  container.innerHTML = `
    <div class="auth-view-wrapper">
      <div class="auth-card">
        <h1 class="instagram-logo-text auth-logo">Instagram</h1>
        
        <form id="login-form" class="auth-form">
          <div class="auth-input-group">
            <input type="text" id="login-username" required placeholder="Username or Email" value="pixel_pioneer">
          </div>
          <div class="auth-input-group">
            <input type="password" id="login-password" required placeholder="Password" value="password123">
          </div>
          
          <button type="submit" class="auth-btn">Log In</button>
        </form>
        
        <div class="auth-divider">
          <span>OR</span>
        </div>
        
        <div class="auth-prefill-section">
          <p>Demo accounts (password is password123):</p>
          <div class="demo-chips">
            <button class="demo-chip" data-user="pixel_pioneer">pixel_pioneer</button>
            <button class="demo-chip" data-user="alex_adventures">alex_adventures</button>
            <button class="demo-chip" data-user="creative_soul">creative_soul</button>
          </div>
        </div>
      </div>
      
      <div class="auth-card switch-card">
        <p>Don't have an account? <a href="#" id="link-to-register">Sign up</a></p>
      </div>
    </div>
  `;

  // Pre-fill button event listeners
  const demoChips = container.querySelectorAll('.demo-chip');
  demoChips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      const username = chip.dataset.user;
      container.querySelector('#login-username').value = username;
      container.querySelector('#login-password').value = 'password123';
    });
  });

  // Switch to Register page click
  container.querySelector('#link-to-register').addEventListener('click', (e) => {
    e.preventDefault();
    renderRegister(container);
  });

  // Submit Login Action
  const form = container.querySelector('#login-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.auth-btn');
    btn.textContent = 'Logging in...';
    btn.disabled = true;

    const usernameOrEmail = form.querySelector('#login-username').value;
    const password = form.querySelector('#login-password').value;

    try {
      await loginUser(usernameOrEmail, password);
      showToast('Logged in successfully!', 'success');
      // Force reload/navigation to Home
      window.location.reload(); 
    } catch (err) {
      btn.textContent = 'Log In';
      btn.disabled = false;
      showToast(err.message || 'Incorrect credentials', 'error');
    }
  });
}

export function renderRegister(container) {
  container.innerHTML = `
    <div class="auth-view-wrapper">
      <div class="auth-card">
        <h1 class="instagram-logo-text auth-logo">Instagram</h1>
        <p class="auth-tagline">Sign up to see photos and videos from your friends.</p>
        
        <form id="register-form" class="auth-form">
          <div class="auth-input-group">
            <input type="email" id="reg-email" required placeholder="Email Address">
          </div>
          <div class="auth-input-group">
            <input type="text" id="reg-name" required placeholder="Full Name">
          </div>
          <div class="auth-input-group">
            <input type="text" id="reg-username" required placeholder="Username">
          </div>
          <div class="auth-input-group">
            <input type="password" id="reg-password" required placeholder="Password">
          </div>
          <div class="auth-input-group">
            <input type="text" id="reg-bio" placeholder="Bio (Optional)">
          </div>
          
          <button type="submit" class="auth-btn">Sign Up</button>
        </form>
      </div>
      
      <div class="auth-card switch-card">
        <p>Have an account? <a href="#" id="link-to-login">Log in</a></p>
      </div>
    </div>
  `;

  // Switch to Login page click
  container.querySelector('#link-to-login').addEventListener('click', (e) => {
    e.preventDefault();
    renderLogin(container);
  });

  // Submit Register Action
  const form = container.querySelector('#register-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.auth-btn');
    btn.textContent = 'Creating account...';
    btn.disabled = true;

    const email = form.querySelector('#reg-email').value;
    const name = form.querySelector('#reg-name').value;
    const username = form.querySelector('#reg-username').value;
    const password = form.querySelector('#reg-password').value;
    const bio = form.querySelector('#reg-bio').value;

    try {
      await registerUser(username, name, email, password, bio);
      showToast('Account registered successfully!', 'success');
      window.location.reload();
    } catch (err) {
      btn.textContent = 'Sign Up';
      btn.disabled = false;
      showToast(err.message || 'Registration failed', 'error');
    }
  });
}
