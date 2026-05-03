function smartEstateSiteRoot() {
  if (typeof window.__SMARTESTATE_SITE_ROOT__ === 'string') {
    return window.__SMARTESTATE_SITE_ROOT__;
  }
  const parts = window.location.pathname.split('/').filter(Boolean);
  const idx = parts.indexOf('pages');
  if (idx === 0) return '/';
  if (idx > 0) return `/${parts.slice(0, idx).join('/')}/`;
  if (!parts.length) return '/';
  const last = parts[parts.length - 1];
  if (last.includes('.')) parts.pop();
  if (!parts.length) return '/';
  return `/${parts.join('/')}/`;
}

function escapeHtml(str) {
  if (str == null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const USER_PROPERTIES_KEY = 'smartEstateSubmittedProperties';

function loadUserSubmittedProperties() {
  try {
    const raw = localStorage.getItem(USER_PROPERTIES_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch (_) {
    return [];
  }
}

function saveUserSubmittedProperties(list) {
  localStorage.setItem(USER_PROPERTIES_KEY, JSON.stringify(list));
}

document.addEventListener('DOMContentLoaded', () => {
  const siteRoot = smartEstateSiteRoot();
  const loginHref = `${siteRoot}pages/login.html`;
  const profileHref = `${siteRoot}pages/profile.html`;

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const authPages = ['login.html', 'signup.html'];
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const user = JSON.parse(localStorage.getItem('smartEstateUser'));

  if (!isLoggedIn && !authPages.includes(currentPage) && currentPage !== '') {
    window.location.href = loginHref;
    return;
  }
  if (!isLoggedIn && currentPage === '') {
    window.location.href = loginHref;
    return;
  }

  const propertiesGrid = document.getElementById('properties-grid');
  const loader = document.getElementById('loader');
  const searchForm = document.getElementById('search-form');
  const filterType = document.getElementById('filter-type');
  const filterStatus = document.getElementById('filter-status');
  const navbar = document.querySelector('.navbar');
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  const navActions = document.querySelector('.nav-actions');

  // Update Navbar if logged in
  if (isLoggedIn && user && navActions && !authPages.includes(currentPage)) {
    const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
    navActions.innerHTML = `<a href="${profileHref}" class="profile-avatar" title="View Profile">${initial}</a>`;
  }
  // Theme Toggle Logic
  const savedTheme = localStorage.getItem('smartEstateTheme') || 'light';
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  }

  // Inject currency toggle and theme toggle
  if (navActions && !document.getElementById('currency-toggle')) {
    const actionsWrapper = document.createElement('div');
    actionsWrapper.style.display = 'flex';
    actionsWrapper.style.alignItems = 'center';
    actionsWrapper.style.gap = '0.5rem';

    actionsWrapper.innerHTML = `
      <select id="currency-toggle" style="background: transparent; border: 1px solid var(--border-color); border-radius: 6px; padding: 0.25rem 0.5rem; font-weight: 500; color: var(--dark-color); cursor: pointer; outline: none; font-family: inherit;">
        <option value="USD">USD ($)</option>
        <option value="INR">INR (₹)</option>
      </select>
      <button id="theme-toggle" class="theme-toggle-btn" title="Toggle Dark Mode" style="background: transparent; border: none; font-size: 1.5rem; color: var(--dark-color); cursor: pointer; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; transition: all 0.3s;">
        <i class="fa-solid ${savedTheme === 'dark' ? 'fa-lightbulb' : 'fa-moon'}"></i>
      </button>
    `;
    navActions.insertBefore(actionsWrapper, navActions.firstChild);

    const currencyToggle = document.getElementById('currency-toggle');
    const savedCurrency = localStorage.getItem('smartEstateCurrency') || 'USD';
    currencyToggle.value = savedCurrency;

    currencyToggle.addEventListener('change', (e) => {
      localStorage.setItem('smartEstateCurrency', e.target.value);
      window.location.reload();
    });

    const themeToggleBtn = document.getElementById('theme-toggle');
    themeToggleBtn.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('dark-mode');
      localStorage.setItem('smartEstateTheme', isDark ? 'dark' : 'light');
      
      const icon = themeToggleBtn.querySelector('i');
      if (isDark) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-lightbulb');
      } else {
        icon.classList.remove('fa-lightbulb');
        icon.classList.add('fa-moon');
      }
    });
  }

  // Mobile Menu Toggle
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      if (navActions) navActions.classList.toggle('active');
      
      const icon = mobileMenuBtn.querySelector('i');
      if (icon) {
        if (navLinks.classList.contains('active')) {
          icon.classList.remove('fa-bars');
          icon.classList.add('fa-xmark');
        } else {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars');
        }
      }
    });
  }

  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Format currency
  const formatCurrency = (amount) => {
    const currency = localStorage.getItem('smartEstateCurrency') || 'USD';
    
    if (currency === 'INR') {
      const convertedAmount = amount * 83.5; // Approximate exchange rate
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(convertedAmount);
    } else {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(amount);
    }
  };

  // Store globally for the modal
  window.currentProperties = [];  const sampleProperties = [
    { title: 'Modern Glass Villa', description: 'A stunning modern villa with floor-to-ceiling glass windows, offering panoramic views of the city. Features a smart home system and an infinity pool.', price: 2500000, location: 'Mumbai, MH', bedrooms: 5, bathrooms: 6, sqft: 4500, imageUrl: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'Villa', status: 'For Sale', featured: true },
    { title: 'Mediterranean Coastal Villa', description: 'Beautiful villa overlooking the ocean with extensive outdoor living spaces and private beach access.', price: 3200000, location: 'Chennai, TN', bedrooms: 6, bathrooms: 5.5, sqft: 5200, imageUrl: 'https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'Villa', status: 'For Sale', featured: true },
    { title: 'Tuscan Style Villa', description: 'Classic Italian architecture combined with modern luxury amenities in a secure gated community.', price: 1850000, location: 'Pune, MH', bedrooms: 4, bathrooms: 4, sqft: 3800, imageUrl: 'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'Villa', status: 'For Rent', featured: false },
    { title: 'Cozy Suburban Retreat', description: 'A beautiful family home situated in a quiet, friendly neighborhood. Features a large backyard perfect for entertaining, and a newly renovated kitchen.', price: 750000, location: 'Bangalore, KA', bedrooms: 4, bathrooms: 2.5, sqft: 2400, imageUrl: 'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'House', status: 'For Sale', featured: false },
    { title: 'Mountain View Cabin', description: 'Escape the city in this serene mountain view cabin. Surrounded by nature, it offers a large deck, hot tub, and a cozy stone fireplace.', price: 550000, location: 'Pune, MH', bedrooms: 3, bathrooms: 2, sqft: 2000, imageUrl: 'https://images.pexels.com/photos/209296/pexels-photo-209296.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'House', status: 'For Sale', featured: true },
    { title: 'Modern Minimalist House', description: 'Clean lines and open spaces define this contemporary masterpiece built with sustainable materials.', price: 920000, location: 'Hyderabad, TS', bedrooms: 3, bathrooms: 3, sqft: 2100, imageUrl: 'https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'House', status: 'For Sale', featured: false },
    { title: 'Traditional Family Home', description: 'Spacious home with a wrap-around porch and a large garden. Perfect for a growing family.', price: 680000, location: 'Chennai, TN', bedrooms: 5, bathrooms: 3.5, sqft: 3100, imageUrl: 'https://images.pexels.com/photos/210617/pexels-photo-210617.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'House', status: 'For Rent', featured: false },
    { title: 'Luxury Downtown Penthouse', description: 'Experience the pinnacle of urban living in this luxurious penthouse. Located in the heart of downtown, steps away from fine dining and entertainment.', price: 1250000, location: 'Delhi, DL', bedrooms: 3, bathrooms: 3.5, sqft: 2800, imageUrl: 'https://images.pexels.com/photos/277667/pexels-photo-277667.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'Apartment', status: 'For Sale', featured: true },
    { title: 'Chic Studio Apartment', description: 'Perfect city base. This stylishly furnished studio offers convenience and luxury in a compact space.', price: 3200, location: 'Kolkata, WB', bedrooms: 1, bathrooms: 1, sqft: 650, imageUrl: 'https://images.pexels.com/photos/275484/pexels-photo-275484.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'Apartment', status: 'For Rent', featured: false },
    { title: 'Modern High-Rise Apartment', description: 'Breathtaking city skyline views from the 42nd floor. Access to building amenities including gym and pool.', price: 850000, location: 'Bangalore, KA', bedrooms: 2, bathrooms: 2, sqft: 1100, imageUrl: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'Apartment', status: 'For Sale', featured: false },
    { title: 'Oceanfront Condo', description: 'Wake up to the sound of waves in this stunning oceanfront condo. Offers direct beach access, resort-style amenities, and a spacious balcony.', price: 4500, location: 'Mumbai, MH', bedrooms: 2, bathrooms: 2, sqft: 1200, imageUrl: 'https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'Condo', status: 'For Rent', featured: true },
    { title: 'Urban Loft Condo', description: 'Industrial chic design with exposed brick walls and high ceilings in a vibrant arts district.', price: 620000, location: 'Mumbai, MH', bedrooms: 1, bathrooms: 1.5, sqft: 950, imageUrl: 'https://images.pexels.com/photos/259950/pexels-photo-259950.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'Condo', status: 'For Sale', featured: false },
    { title: 'Luxury Resort Condo', description: 'Enjoy vacation living year-round with world-class amenities right at your doorstep.', price: 780000, location: 'Chennai, TN', bedrooms: 3, bathrooms: 2, sqft: 1500, imageUrl: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'Condo', status: 'For Sale', featured: true },
    { title: 'Historic Townhouse', description: 'Charm meets modern convenience in this beautifully restored historic townhouse. Features original hardwood floors, exposed brick, and a private courtyard.', price: 850000, location: 'Delhi, DL', bedrooms: 3, bathrooms: 2, sqft: 1800, imageUrl: 'https://images.pexels.com/photos/221540/pexels-photo-221540.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'Townhouse', status: 'For Sale', featured: false },
    { title: 'Modern Eco-Townhouse', description: 'LEED certified home with solar panels and energy efficient appliances throughout.', price: 720000, location: 'Bangalore, KA', bedrooms: 2, bathrooms: 2.5, sqft: 1400, imageUrl: 'https://images.pexels.com/photos/208736/pexels-photo-208736.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'Townhouse', status: 'For Sale', featured: true },
    { title: 'Elegant Brick Townhome', description: 'Spacious three-story layout located in a highly walkable neighborhood close to parks and schools.', price: 4200, location: 'Delhi, DL', bedrooms: 4, bathrooms: 3, sqft: 2200, imageUrl: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800', type: 'Townhouse', status: 'For Rent', featured: false }
  ].map((p, i) => ({ ...p, _id: i.toString() }));

  // Fetch properties from backend
  const fetchProperties = async (filters = {}) => {
    try {
      if (loader) loader.style.display = 'flex';
      if (propertiesGrid) propertiesGrid.innerHTML = '';
      
      let properties = [...loadUserSubmittedProperties(), ...sampleProperties];
      
      if (filters.location) {
        properties = properties.filter(p => p.location.toLowerCase().includes(filters.location.toLowerCase()));
      }
      if (filters.type) {
        properties = properties.filter(p => p.type === filters.type);
      }
      if (filters.status) {
        properties = properties.filter(p => p.status === filters.status);
      }

      window.currentProperties = properties; // Save for modal
      displayProperties(properties);
    } catch (error) {
      console.error('Error:', error);
      if (propertiesGrid) {
        propertiesGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
            <h3 style="color: #ef4444;">Error loading properties</h3>
            <p>Please try again later. Ensure the backend server is running.</p>
          </div>
        `;
      }
    } finally {
      if (loader) loader.style.display = 'none';
    }
  };

  // Display properties in grid
  const displayProperties = (properties) => {
    if (properties.length === 0) {
      propertiesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
          <h3>No properties found</h3>
          <p>Try adjusting your search criteria</p>
        </div>
      `;
      return;
    }

    propertiesGrid.innerHTML = properties.map(property => `
      <div class="property-card">
        <div class="property-image">
          <div class="property-badges">
            ${property.featured ? '<span class="badge badge-featured">Featured</span>' : ''}
            ${property.verificationProof ? '<span class="badge" style="background:#0f766e;color:#fff;font-size:0.7rem;">Verification</span>' : ''}
            <span class="badge badge-status ${property.status === 'For Rent' ? 'rent' : ''}">${property.status}</span>
          </div>
          <img src="${property.imageUrl ? property.imageUrl.replace('w=800', 'w=600') : ''}" alt="${escapeHtml(property.title)}" loading="lazy" decoding="async" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;">
          <div class="property-price">${formatCurrency(property.price)}${property.status === 'For Rent' ? '<span style="font-size:0.8rem;font-weight:normal">/mo</span>' : ''}</div>
        </div>
        <div class="property-content">
          <div class="property-type">${escapeHtml(property.type)}</div>
          <h3 class="property-title">${escapeHtml(property.title)}</h3>
          <div class="property-location">
            <i class="fa-solid fa-location-dot"></i> ${escapeHtml(property.location)}
          </div>
          <p class="property-description" style="color: var(--text-light); font-size: 0.95rem; margin-bottom: 1.25rem; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${escapeHtml(property.description)}
          </p>
          <div class="property-features">
            <div class="feature">
              <i class="fa-solid fa-bed"></i> ${property.bedrooms} Beds
            </div>
            <div class="feature">
              <i class="fa-solid fa-bath"></i> ${property.bathrooms} Baths
            </div>
            <div class="feature">
              <i class="fa-solid fa-vector-square"></i> ${property.sqft} sqft
            </div>
          </div>
          <button class="btn btn-outline" style="width: 100%; margin-top: 1.5rem;" onclick="openPropertyModal('${String(property._id)}')">View Full Details</button>
        </div>
      </div>
    `).join('');
  };

  // Handle Search
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const filterLocation = document.getElementById('filter-location');
      const filters = {
        location: filterLocation ? filterLocation.value : '',
        type: filterType.value,
        status: filterStatus.value
      };
      
      const propertiesSection = document.getElementById('properties');
      if (propertiesSection) {
        propertiesSection.scrollIntoView({ behavior: 'smooth' });
      }
      
      fetchProperties(filters);
    });
  }

  window.smartEstateRefetchProps = () => {
    const locEl = document.getElementById('filter-location');
    fetchProperties({
      location: locEl ? locEl.value : '',
      type: filterType ? filterType.value : '',
      status: filterStatus ? filterStatus.value : ''
    });
  };

  const addBtn = document.getElementById('btn-add-property');
  if (addBtn) addBtn.addEventListener('click', () => window.openAddPropertyModal(loginHref));

  // Initial fetch only if properties grid exists
  if (propertiesGrid) {
    fetchProperties();
  }
});

window.openAddPropertyModal = function (loginHref) {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  if (!isLoggedIn) {
    alert('Please sign in to add a listing.');
    if (loginHref) window.location.href = loginHref;
    return;
  }

  const existing = document.getElementById('add-property-modal');
  if (existing) existing.remove();

  const wrap = document.createElement('div');
  wrap.id = 'add-property-modal';
  wrap.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(15,23,42,0.82);backdrop-filter:blur(8px);z-index:2500;display:flex;align-items:center;justify-content:center;padding:1rem;overflow:auto;';
  wrap.innerHTML = `
    <div style="background:var(--white);border-radius:16px;max-width:520px;width:100%;max-height:90vh;overflow-y:auto;padding:1.75rem;box-shadow:0 25px 50px rgba(0,0,0,0.35);position:relative;">
      <button type="button" id="close-add-property" aria-label="Close" style="position:absolute;top:0.75rem;right:0.75rem;border:none;background:var(--bg-color);width:38px;height:38px;border-radius:50%;cursor:pointer;font-size:1.15rem;"><i class="fa-solid fa-xmark"></i></button>
      <h3 style="margin-bottom:0.35rem;color:var(--dark-color);padding-right:2rem;"><i class="fa-solid fa-plus-circle"></i> Add property</h3>
      <p style="color:var(--text-light);font-size:0.875rem;margin-bottom:1.25rem;">Explain why this listing is genuine so viewers can spot serious posts versus fake spam.</p>
      <form id="form-add-property">
        <label style="display:block;font-size:0.8rem;font-weight:600;color:var(--dark-color);margin-bottom:0.35rem;">Title</label>
        <input required name="title" style="width:100%;padding:0.6rem;margin-bottom:0.75rem;border-radius:8px;border:1px solid var(--border-color);font-family:inherit;">
        <label style="display:block;font-size:0.8rem;font-weight:600;color:var(--dark-color);margin-bottom:0.35rem;">Description</label>
        <textarea required name="description" rows="3" style="width:100%;padding:0.6rem;margin-bottom:0.75rem;border-radius:8px;border:1px solid var(--border-color);font-family:inherit;"></textarea>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.65rem;margin-bottom:0.75rem;">
          <div>
            <label style="display:block;font-size:0.8rem;font-weight:600;color:var(--dark-color);margin-bottom:0.35rem;">Price (USD)</label>
            <input required type="number" min="1" step="any" name="price" style="width:100%;padding:0.6rem;border-radius:8px;border:1px solid var(--border-color);font-family:inherit;">
          </div>
          <div>
            <label style="display:block;font-size:0.8rem;font-weight:600;color:var(--dark-color);margin-bottom:0.35rem;">Location</label>
            <input required name="location" placeholder="City, ST" style="width:100%;padding:0.6rem;border-radius:8px;border:1px solid var(--border-color);font-family:inherit;">
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.65rem;margin-bottom:0.75rem;">
          <div>
            <label style="display:block;font-size:0.8rem;font-weight:600;color:var(--dark-color);margin-bottom:0.35rem;">Beds</label>
            <input required type="number" min="0" step="any" name="bedrooms" value="2" style="width:100%;padding:0.6rem;border-radius:8px;border:1px solid var(--border-color);font-family:inherit;">
          </div>
          <div>
            <label style="display:block;font-size:0.8rem;font-weight:600;color:var(--dark-color);margin-bottom:0.35rem;">Baths</label>
            <input required type="number" min="0" step="any" name="bathrooms" value="2" style="width:100%;padding:0.6rem;border-radius:8px;border:1px solid var(--border-color);font-family:inherit;">
          </div>
          <div>
            <label style="display:block;font-size:0.8rem;font-weight:600;color:var(--dark-color);margin-bottom:0.35rem;">Sq ft</label>
            <input required type="number" min="100" step="1" name="sqft" value="1200" style="width:100%;padding:0.6rem;border-radius:8px;border:1px solid var(--border-color);font-family:inherit;">
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.65rem;margin-bottom:0.75rem;">
          <div>
            <label style="display:block;font-size:0.8rem;font-weight:600;color:var(--dark-color);margin-bottom:0.35rem;">Type</label>
            <select name="type" style="width:100%;padding:0.6rem;border-radius:8px;border:1px solid var(--border-color);font-family:inherit;">
              <option>House</option><option>Apartment</option><option>Villa</option><option>Condo</option><option>Townhouse</option>
            </select>
          </div>
          <div>
            <label style="display:block;font-size:0.8rem;font-weight:600;color:var(--dark-color);margin-bottom:0.35rem;">Status</label>
            <select name="status" style="width:100%;padding:0.6rem;border-radius:8px;border:1px solid var(--border-color);font-family:inherit;">
              <option>For Sale</option><option>For Rent</option>
            </select>
          </div>
        </div>
        <label style="display:block;font-size:0.8rem;font-weight:600;color:var(--dark-color);margin-bottom:0.35rem;">Photo URL <span style="font-weight:400;color:var(--text-light);">(optional)</span></label>
        <input type="url" name="imageUrl" placeholder="https://…" style="width:100%;padding:0.6rem;margin-bottom:0.75rem;border-radius:8px;border:1px solid var(--border-color);font-family:inherit;">
        <label style="display:block;font-size:0.8rem;font-weight:600;color:#047857;margin-bottom:0.35rem;">Verification / proof <span style="color:#b45309;font-weight:700;">*</span></label>
        <textarea required name="verificationProof" minlength="40" rows="4" placeholder="Briefly explain how this listing can be verified (registry number, gated-community ID you can share with agents, link to strata docs reference, utility bill match, registered agent name…). Helps reduce misleading posts." style="width:100%;padding:0.6rem;margin-bottom:0.5rem;border-radius:8px;border:1px solid #34d399;font-family:inherit;font-size:0.9rem;"></textarea>
        <p style="font-size:0.75rem;color:var(--text-light);margin-bottom:0.65rem;">Min. 40 characters. Serious posters can cite real identifiers; reviewers use this spot to weed out obvious fakes.</p>
        <label style="display:block;font-size:0.8rem;font-weight:600;color:var(--dark-color);margin-bottom:0.35rem;">Supporting file <span style="font-weight:400;color:var(--text-light);">(optional demo — file name saved only)</span></label>
        <input type="file" name="proofFile" accept=".pdf,.jpg,.jpeg,.png" style="width:100%;margin-bottom:0.75rem;font-size:0.85rem;">
        <label style="display:flex;align-items:flex-start;gap:0.5rem;font-size:0.85rem;color:var(--text-color);margin-bottom:1rem;cursor:pointer;">
          <input type="checkbox" name="confirmTruth" required style="margin-top:0.2rem;">
          <span>I confirm this listing description is truthful and that I can support the verification details above.</span>
        </label>
        <button type="submit" class="btn btn-primary" style="width:100%;padding:0.85rem;"><i class="fa-solid fa-check"></i> Publish listing</button>
      </form>
    </div>`;

  document.body.appendChild(wrap);
  wrap.addEventListener('click', e => {
    if (e.target === wrap) wrap.remove();
  });

  wrap.querySelector('#close-add-property').addEventListener('click', () => wrap.remove());

  wrap.querySelector('#form-add-property').addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const proof = String(fd.get('verificationProof') || '').trim();
    if (proof.length < 40) {
      alert('Please add more detail in Verification / proof (at least 40 characters).');
      return;
    }
    const proofFileInput = e.target.elements.proofFile;
    const attachmentName =
      proofFileInput && proofFileInput.files && proofFileInput.files.length
        ? proofFileInput.files[0].name
        : '';

    const defaultImg =
      'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=800';
    const img = String(fd.get('imageUrl') || '').trim() || defaultImg;

    const newProp = {
      _id: 'u-' + Date.now(),
      title: fd.get('title').trim(),
      description: fd.get('description').trim(),
      price: Number(fd.get('price')),
      location: fd.get('location').trim(),
      bedrooms: Number(fd.get('bedrooms')),
      bathrooms: Number(fd.get('bathrooms')),
      sqft: Number(fd.get('sqft')),
      imageUrl: img,
      type: fd.get('type'),
      status: fd.get('status'),
      featured: false,
      verificationProof: proof,
      proofAttachmentName: attachmentName || undefined
    };

    const list = loadUserSubmittedProperties();
    list.unshift(newProp);
    saveUserSubmittedProperties(list);
    wrap.remove();
    if (typeof window.smartEstateRefetchProps === 'function') window.smartEstateRefetchProps();
    else location.reload();
  });
};

// Property Modal Logic
window.openPropertyModal = function(propertyId) {
  const property = window.currentProperties.find(p => p._id === propertyId);
  if (!property) return;

  // Create modal container if it doesn't exist
  let modal = document.getElementById('property-details-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'property-details-modal';
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(8px);
      z-index: 2000; display: none; align-items: center; justify-content: center;
      padding: 1rem; opacity: 0; transition: opacity 0.3s ease;
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closePropertyModal();
    });
  }

  // Format currency helper
  const currency = localStorage.getItem('smartEstateCurrency') || 'USD';
  let formattedPrice;
  if (currency === 'INR') {
    formattedPrice = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(property.price * 83.5);
  } else {
    formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(property.price);
  }

  modal.innerHTML = `
    <div style="background: var(--white); border-radius: 16px; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); transform: translateY(20px); transition: transform 0.3s ease; position: relative;" id="modal-content-card">
      
      <!-- Close Button (Fixed) -->
      <button onclick="closePropertyModal()" style="position: absolute; top: 1rem; right: 1rem; z-index: 10; background: var(--nav-bg); backdrop-filter: blur(4px); border: none; width: 40px; height: 40px; border-radius: 50%; font-size: 1.25rem; cursor: pointer; color: var(--dark-color); display: flex; align-items: center; justify-content: center; transition: all 0.2s; box-shadow: var(--shadow-sm);">
        <i class="fa-solid fa-xmark"></i>
      </button>

      <!-- Hero Image (Smaller height, scrolls with content) -->
      <div style="position: relative; height: 250px; background: var(--bg-color);">
        <img src="${property.imageUrl ? property.imageUrl.replace('w=800', 'w=1200') : ''}" alt="${escapeHtml(property.title)}" loading="eager" decoding="async" style="width: 100%; height: 100%; object-fit: cover;">
      </div>
      
      <!-- Content Area -->
      <div style="padding: 2rem;">
        
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1.5rem;">
          
          <!-- Left Content -->
          <div style="flex: 1; min-width: 300px;">
            <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
              <span style="background: var(--primary-color); color: #fff; padding: 0.25rem 0.75rem; border-radius: 20px; font-weight: 600; font-size: 0.75rem; text-transform: uppercase;">${property.type}</span>
              <span style="background: var(--secondary-color); color: #fff; padding: 0.25rem 0.75rem; border-radius: 20px; font-weight: 600; font-size: 0.75rem; text-transform: uppercase;">${property.status}</span>
            </div>
            
            <h2 style="font-size: 2rem; color: var(--dark-color); margin-bottom: 0.5rem; line-height: 1.2;">${escapeHtml(property.title)}</h2>
            <p style="color: var(--text-light); font-size: 1rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
              <i class="fa-solid fa-location-dot"></i> ${escapeHtml(property.location)}
            </p>
          </div>
          
          <!-- Right Price Box -->
          <div style="text-align: right;">
            <span style="color: var(--text-light); font-size: 0.875rem; text-transform: uppercase; font-weight: 600;">Price</span>
            <div style="font-size: 2rem; font-weight: 700; color: var(--primary-color); line-height: 1; margin-top: 0.25rem;">
              ${formattedPrice}
              <span style="font-size: 1rem; font-weight: 500; color: var(--text-light);">${property.status === 'For Rent' ? '/mo' : ''}</span>
            </div>
          </div>
          
        </div>
        
        <!-- Specs -->
        <div style="display: flex; flex-wrap: wrap; gap: 2rem; padding: 1.5rem 0; border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); margin-bottom: 2rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 1rem; color: var(--dark-color);">
            <i class="fa-solid fa-bed" style="font-size: 1.25rem; color: var(--text-light);"></i>
            <strong>${property.bedrooms}</strong> <span style="color: var(--text-light);">Beds</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 1rem; color: var(--dark-color);">
            <i class="fa-solid fa-bath" style="font-size: 1.25rem; color: var(--text-light);"></i>
            <strong>${property.bathrooms}</strong> <span style="color: var(--text-light);">Baths</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 1rem; color: var(--dark-color);">
            <i class="fa-solid fa-vector-square" style="font-size: 1.25rem; color: var(--text-light);"></i>
            <strong>${property.sqft}</strong> <span style="color: var(--text-light);">sqft</span>
          </div>
        </div>
        
        <!-- Description -->
        <h3 style="font-size: 1.25rem; color: var(--dark-color); margin-bottom: 1rem;">About This Property</h3>
        <p style="color: var(--text-color); line-height: 1.7; font-size: 1.05rem; margin-bottom: 2rem;">
          ${escapeHtml(property.description)}
        </p>
        ${property.verificationProof ? `
        <div style="background:#ecfdf5;border:1px solid #34d399;border-radius:12px;padding:1.25rem;margin-bottom:2rem;">
          <h4 style="color:#047857;margin-bottom:0.5rem;font-size:1rem;"><i class="fa-solid fa-shield-halved"></i> Listing verification</h4>
          <p style="color:#334155;line-height:1.6;margin:0;font-size:0.95rem;">${escapeHtml(property.verificationProof)}</p>
          ${property.proofAttachmentName ? `<p style="margin-top:0.75rem;font-size:0.875rem;color:var(--text-light);"><i class="fa-solid fa-paperclip"></i> Proof document name: <strong>${escapeHtml(property.proofAttachmentName)}</strong> (stored locally on this demo site)</p>` : ''}
        </div>` : ''}
        
        <button class="btn btn-primary" style="width: 100%; font-size: 1.125rem; padding: 1rem; border-radius: 12px;" onclick="alert('Contacting Agent... This feature will be implemented in the next update!')">
          Contact Agent
        </button>
      </div>
    </div>
  `;

  modal.style.display = 'flex';
  // Trigger animation
  setTimeout(() => {
    modal.style.opacity = '1';
    document.getElementById('modal-content-card').style.transform = 'translateY(0)';
  }, 10);
  document.body.style.overflow = 'hidden'; // Prevent scrolling background
};

window.closePropertyModal = function() {
  const modal = document.getElementById('property-details-modal');
  if (modal) {
    modal.style.opacity = '0';
    document.getElementById('modal-content-card').style.transform = 'translateY(20px)';
    setTimeout(() => {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }, 300);
  }
};
