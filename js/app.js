/* ==========================================================
   Diploconnect11 - application logic (routing, views, events)
   Routes use the URL hash (#/feed, #/network, #/u/<id>) so the
   site works on Vercel and GitHub Pages without server config.
   ========================================================== */
(() => {
  'use strict';

  const $ = (sel, el = document) => el.querySelector(sel);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  let me = null;
  let page = '';
  let modalHandler = null;
  const openComments = new Set();

  /* ---------- small helpers ---------- */
  const go = path => { location.hash = '#' + path; };

  const timeAgo = ts => {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return 'just now';
    const m = Math.floor(s / 60);
    if (m < 60) return m + ' min ago';
    const h = Math.floor(m / 60);
    if (h < 24) return h + (h === 1 ? ' hour ago' : ' hours ago');
    const d = Math.floor(h / 24);
    if (d < 30) return d + (d === 1 ? ' day ago' : ' days ago');
    return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const initials = name => name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const hue = id => { let h = 0; for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };
  const avatar = (u, size = 'md') => `<span class="avatar ${size}" style="--h:${hue(u.id)}" aria-hidden="true">${esc(initials(u.name))}</span>`;

  const logo = () => `<svg class="logo" viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><path d="M16 2l12 7v14l-12 7-12-7V9z" fill="var(--green)"/><circle cx="16" cy="16" r="5" fill="var(--gold)"/></svg>`;

  const options = (list, selected, placeholder) =>
    (placeholder ? `<option value="">${esc(placeholder)}</option>` : '') +
    list.map(o => `<option ${o === selected ? 'selected' : ''}>${esc(o)}</option>`).join('');

  const years = (from, to) => { const a = []; for (let y = to; y >= from; y--) a.push(String(y)); return a; };

  function field(label, name, o = {}) {
    const id = 'f-' + name;
    const req = o.required ? 'required' : '';
    let input;
    if (o.options) {
      input = `<select id="${id}" name="${name}" ${req}>${options(o.options, o.value, o.placeholder)}</select>`;
    } else if (o.rows) {
      input = `<textarea id="${id}" name="${name}" rows="${o.rows}" maxlength="${o.maxlen || 1000}" placeholder="${esc(o.placeholder || '')}" ${req}>${esc(o.value || '')}</textarea>`;
    } else {
      input = `<input id="${id}" name="${name}" type="${o.type || 'text'}" value="${esc(o.value || '')}" placeholder="${esc(o.placeholder || '')}" autocomplete="${o.ac || 'off'}" ${o.minlen ? `minlength="${o.minlen}"` : ''} ${o.maxlen ? `maxlength="${o.maxlen}"` : ''} ${o.list ? `list="${o.list}"` : ''} ${req}>`;
    }
    return `<div class="field"><label for="${id}">${esc(label)}</label>${input}${o.hint ? `<p class="hint">${esc(o.hint)}</p>` : ''}</div>`;
  }

  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  /* ---------- profile strength ---------- */
  function strength(u) {
    const checks = [
      [!!(u.about && u.about.trim().length >= 40), 'Write a short about section next.'],
      [u.skills.length >= 3, 'Add at least three skills next.'],
      [u.education.length >= 1, 'Add your education next.'],
      [u.certs.length >= 1, 'Add a certification next.'],
      [!!(u.location && u.location.trim()), 'Add your location next.']
    ];
    const done = checks.filter(c => c[0]).length;
    const missing = checks.find(c => !c[0]);
    return { pct: done * 20, next: missing ? missing[1] : 'Your profile is complete.' };
  }

  /* ---------- modal ---------- */
  function openModal(title, body, submitLabel, handler) {
    const d = $('#modal');
    modalHandler = handler;
    d.innerHTML = `
      <form data-form="modal" class="modal-form" novalidate>
        <header><h2 id="modal-title">${esc(title)}</h2><button type="button" class="link-btn" data-action="close-modal">Close</button></header>
        <div class="modal-body">${body}<p class="form-error" role="alert" hidden></p></div>
        <footer><button type="button" class="btn" data-action="close-modal">Cancel</button><button class="btn primary">${esc(submitLabel)}</button></footer>
      </form>`;
    d.showModal();
    const first = d.querySelector('input, textarea, select');
    if (first) first.focus();
  }
  const closeModal = () => { const d = $('#modal'); if (d.open) d.close(); modalHandler = null; };

  function formError(form, msg) {
    const el = $('.form-error', form);
    if (!el) return;
    el.textContent = msg;
    el.hidden = !msg;
  }

  /* ---------- header ---------- */
  function renderHeader() {
    const h = $('#header');
    if (!me) {
      h.innerHTML = `<div class="bar">
        <a class="brand" href="#/">${logo()}<span>${APP_NAME}</span></a>
        <nav class="nav" aria-label="Account"><a class="btn ghost" href="#/login">Log in</a><a class="btn primary" href="#/signup">Join now</a></nav>
      </div>`;
      return;
    }
    const req = Store.incoming(me.id).length;
    const active = p => (page === p ? 'aria-current="page"' : '');
    h.innerHTML = `<div class="bar">
      <a class="brand" href="#/feed">${logo()}<span>${APP_NAME}</span></a>
      <form class="search" data-form="global-search" role="search">
        <input name="q" type="search" placeholder="Search people, skills, colleges" aria-label="Search people, skills or colleges">
      </form>
      <nav class="nav" aria-label="Main">
        <a href="#/feed" ${active('feed')}>Home</a>
        <a href="#/network" ${active('network')}>Network${req ? `<span class="badge">${req}</span>` : ''}</a>
        <a href="#/profile" ${active('profile')}>Profile</a>
        <button class="link-btn" data-action="logout">Log out</button>
      </nav>
    </div>`;
  }

  /* ---------- views ---------- */
  function landingView() {
    return `
    <section class="hero">
      <div class="hero-copy">
        <h1>Bihar's diploma engineers, in one professional network.</h1>
        <p class="lead">Build a profile with your SBTE diploma, skills and certifications. Find classmates, seniors and alumni from polytechnic colleges across Bihar.</p>
        <div class="cta">
          <a class="btn primary lg" href="#/signup">Create your profile</a>
          <a class="btn lg" href="#/login">Log in</a>
        </div>
        <p class="hint">Open to students, diploma holders and engineers from colleges affiliated with the State Board of Technical Education, Bihar.</p>
      </div>
      <div class="sample" aria-label="Sample profile">
        <div class="sample-top">${avatar(SEED_USERS[0], 'lg')}<div><h2>Priya Kumari</h2><p>Diploma student in Electrical Engineering</p><p class="muted">Government Polytechnic, Muzaffarpur</p></div></div>
        <h3>Skills</h3>
        <ul class="chips"><li>PLC Programming</li><li>SCADA</li><li>Electrical Wiring</li></ul>
        <h3>Certifications</h3>
        <p><strong>PLC and SCADA Fundamentals</strong><br><span class="muted">NSDC Skill India, 2025</span></p>
        <h3>Education</h3>
        <p><strong>Diploma, Electrical Engineering</strong><br><span class="muted">SBTE Bihar, 2023 to 2026</span></p>
        <p class="sample-note">Sample profile</p>
      </div>
    </section>

    <section class="band">
      <div class="wrap">
        <h2>Everything a hiring manager looks for, on one page</h2>
        <div class="trio">
          <div><h3>Education</h3><p>List your diploma, your lateral entry degree and any course after it, with the years.</p></div>
          <div><h3>Skills</h3><p>Show the tools you actually use, from AutoCAD and SolidWorks to PLC, Python and surveying.</p></div>
          <div><h3>Certifications</h3><p>Add NPTEL, NSDC, CIPET and company certificates with the issuer, year and a link to verify.</p></div>
        </div>
      </div>
    </section>

    <section class="wrap colleges">
      <h2>Only for SBTE Bihar colleges</h2>
      <p class="lead">You choose your college when you join, and only polytechnics affiliated with SBTE Bihar are on the list.</p>
      <ul class="college-list">${SBTE_COLLEGES.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
    </section>`;
  }

  function signupView() {
    return `
    <section class="auth">
      <h1>Join ${APP_NAME}</h1>
      <p class="lead">Create your profile in about two minutes.</p>
      <form data-form="signup" class="stack" novalidate>
        ${field('Full name', 'name', { required: true, maxlen: 60, ac: 'name' })}
        ${field('Email', 'email', { type: 'email', required: true, ac: 'email' })}
        ${field('Password', 'password', { type: 'password', required: true, minlen: 8, ac: 'new-password', hint: 'At least 8 characters.' })}
        ${field('I am a', 'role', { options: ROLES, required: true })}
        ${field('SBTE affiliated college', 'college', { options: SBTE_COLLEGES, placeholder: 'Select your college', required: true, hint: 'Only colleges affiliated with SBTE Bihar are listed.' })}
        ${field('Branch', 'branch', { options: BRANCHES, placeholder: 'Select your branch', required: true })}
        ${field('Diploma passing year', 'year', { options: years(1995, new Date().getFullYear() + 3), placeholder: 'Select year', required: true, hint: 'Choose your expected year if you are still studying.' })}
        ${field('SBTE registration number', 'regno', { required: true, maxlen: 20, hint: 'Printed on your admit card or marksheet.' })}
        <label class="check"><input type="checkbox" name="confirm" required> I study or studied at this college.</label>
        <p class="form-error" role="alert" hidden></p>
        <button class="btn primary lg">Create account</button>
      </form>
      <p class="switch">Already a member? <a href="#/login">Log in</a></p>
    </section>`;
  }

  function loginView() {
    return `
    <section class="auth">
      <h1>Log in</h1>
      <form data-form="login" class="stack" novalidate>
        ${field('Email', 'email', { type: 'email', required: true, ac: 'email' })}
        ${field('Password', 'password', { type: 'password', required: true, ac: 'current-password' })}
        <p class="form-error" role="alert" hidden></p>
        <button class="btn primary lg">Log in</button>
      </form>
      <p class="switch">New here? <a href="#/signup">Create your profile</a></p>
    </section>`;
  }

  function suggestions(n) {
    const mine = new Set(me.skills.map(s => s.toLowerCase()));
    return Store.users()
      .filter(u => u.id !== me.id && Store.status(me.id, u.id) === 'none')
      .map(u => ({
        u,
        score: (u.college === me.college ? 3 : 0) + (u.branch === me.branch ? 2 : 0) + u.skills.filter(s => mine.has(s.toLowerCase())).length
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, n)
      .map(x => x.u);
  }

  function connectButtons(id, size = 'sm') {
    const s = Store.status(me.id, id);
    if (s === 'connected') return `<span class="pill ok">Connected</span>`;
    if (s === 'sent') return `<button class="btn ${size}" data-action="withdraw" data-id="${id}">Withdraw request</button>`;
    if (s === 'received') return `<button class="btn primary ${size}" data-action="accept" data-id="${id}">Accept</button><button class="btn ${size}" data-action="ignore" data-id="${id}">Ignore</button>`;
    return `<button class="btn primary ${size}" data-action="connect" data-id="${id}">Connect</button>`;
  }

  function personRow(u) {
    return `<article class="person">
      <a class="person-main" href="#/u/${u.id}">${avatar(u, 'md')}<span><strong>${esc(u.name)}</strong><span class="line">${esc(u.headline)}</span><span class="line muted">${esc(u.college)}</span></span></a>
      <div class="person-actions">${connectButtons(u.id)}</div>
    </article>`;
  }

  function postHtml(p) {
    const a = Store.user(p.userId);
    if (!a) return '';
    const liked = p.likes.includes(me.id);
    const open = openComments.has(p.id);
    const comments = p.comments.map(c => {
      const cu = Store.user(c.userId);
      return cu ? `<li>${avatar(cu, 'xs')}<div><a href="#/u/${cu.id}"><strong>${esc(cu.name)}</strong></a> <span class="muted">${timeAgo(c.at)}</span><p>${esc(c.text)}</p></div></li>` : '';
    }).join('');
    return `<article class="post panel">
      <header>
        ${avatar(a, 'sm')}
        <div><a href="#/u/${a.id}"><strong>${esc(a.name)}</strong></a><span class="line muted">${esc(a.headline)}</span><time class="line muted">${timeAgo(p.at)}</time></div>
        ${p.userId === me.id ? `<button class="link-btn danger" data-action="delete-post" data-id="${p.id}">Delete</button>` : ''}
      </header>
      <p class="post-body">${esc(p.text)}</p>
      <footer>
        <button class="link-btn ${liked ? 'on' : ''}" data-action="like" data-id="${p.id}" aria-pressed="${liked}">${liked ? 'Liked' : 'Like'} (${p.likes.length})</button>
        <button class="link-btn" data-action="toggle-comments" data-id="${p.id}" aria-expanded="${open}">Comments (${p.comments.length})</button>
      </footer>
      ${open ? `<div class="comments"><ul>${comments}</ul>
        <form data-form="comment" data-id="${p.id}" class="comment-form"><input name="text" maxlength="300" placeholder="Write a comment" aria-label="Write a comment" required><button class="btn sm primary">Post</button></form></div>` : ''}
    </article>`;
  }

  function feedView() {
    const st = strength(me);
    const sugg = suggestions(4);
    return `<div class="layout">
      <aside class="side">
        <section class="panel mini">
          ${avatar(me, 'lg')}
          <h2><a href="#/profile">${esc(me.name)}</a></h2>
          <p>${esc(me.headline)}</p>
          <p class="muted">${esc(me.college)}</p>
          <div class="meter" role="img" aria-label="Profile strength ${st.pct} percent"><span style="width:${st.pct}%"></span></div>
          <p class="hint">Profile strength ${st.pct}%. ${esc(st.next)}</p>
          <a class="btn sm" href="#/profile">Open profile</a>
        </section>
      </aside>

      <section class="feed" aria-label="Posts">
        <form class="panel composer" data-form="post">
          <label class="sr" for="post-text">Share an update</label>
          <textarea id="post-text" name="text" rows="3" maxlength="1000" placeholder="Share a project, an internship lead or a question for other diploma engineers" required></textarea>
          <div class="composer-row"><span class="hint">Visible to all members.</span><button class="btn primary">Post</button></div>
        </form>
        ${Store.posts().map(postHtml).join('') || '<p class="empty">No posts yet. Share the first update.</p>'}
      </section>

      <aside class="side">
        <section class="panel">
          <h2 class="panel-title">People you may know</h2>
          ${sugg.length ? sugg.map(personRow).join('') : '<p class="empty">You are connected with everyone here.</p>'}
          <a class="more" href="#/network">See all members</a>
        </section>
      </aside>
    </div>`;
  }

  function networkView(params) {
    const tab = params.get('tab') || 'discover';
    const q = (params.get('q') || '').trim();
    const college = params.get('college') || '';
    const branch = params.get('branch') || '';
    const req = Store.incoming(me.id);
    const conns = Store.connectionsOf(me.id);

    let body = '';
    if (tab === 'requests') {
      body = req.length
        ? req.map(id => Store.user(id)).filter(Boolean).map(personRow).join('')
        : '<p class="empty">No pending requests.</p>';
    } else if (tab === 'connections') {
      body = conns.length
        ? conns.map(id => Store.user(id)).filter(Boolean).map(u => `<article class="person">
            <a class="person-main" href="#/u/${u.id}">${avatar(u, 'md')}<span><strong>${esc(u.name)}</strong><span class="line">${esc(u.headline)}</span><span class="line muted">${esc(u.college)}</span></span></a>
            <div class="person-actions"><button class="btn sm" data-action="disconnect" data-id="${u.id}">Remove</button></div></article>`).join('')
        : '<p class="empty">You have no connections yet. Find people in the Discover tab.</p>';
    } else {
      const needle = q.toLowerCase();
      const list = Store.users().filter(u => {
        if (u.id === me.id) return false;
        if (college && u.college !== college) return false;
        if (branch && u.branch !== branch) return false;
        if (!needle) return true;
        return [u.name, u.headline, u.college, u.branch, u.skills.join(' ')].join(' ').toLowerCase().includes(needle);
      });
      body = `<form class="filters" data-form="network-filter">
          <input type="hidden" name="tab" value="discover">
          <input name="q" type="search" value="${esc(q)}" placeholder="Name, skill or keyword" aria-label="Search members">
          <select name="college" aria-label="Filter by college">${options(SBTE_COLLEGES, college, 'All colleges')}</select>
          <select name="branch" aria-label="Filter by branch">${options(BRANCHES, branch, 'All branches')}</select>
          <button class="btn primary">Search</button>
        </form>
        <p class="hint">${list.length} ${list.length === 1 ? 'member' : 'members'} found</p>
        ${list.map(personRow).join('') || '<p class="empty">No members match. Try fewer filters.</p>'}`;
    }

    const tabLink = (t, label, count) => `<a href="#/network?tab=${t}" ${tab === t ? 'aria-current="page"' : ''}>${label}${count != null ? ` (${count})` : ''}</a>`;
    return `<section class="wrap narrow">
      <h1>My network</h1>
      <nav class="tabs" aria-label="Network sections">${tabLink('discover', 'Discover')}${tabLink('requests', 'Requests', req.length)}${tabLink('connections', 'Connections', conns.length)}</nav>
      <div class="panel list">${body}</div>
    </section>`;
  }

  function profileView(u) {
    const isMe = u.id === me.id;
    const conns = Store.connectionsOf(u.id).length;
    const st = strength(u);
    const add = (action, label) => (isMe ? `<button class="btn sm" data-action="${action}">${label}</button>` : '');
    const del = (action, id) => (isMe ? `<button class="link-btn danger" data-action="${action}" data-id="${id}">Remove</button>` : '');

    const edu = u.education.length ? u.education.map(e => `<li><div><strong>${esc(e.school)}</strong><span class="line">${esc(e.degree)}${e.field ? ', ' + esc(e.field) : ''}</span><span class="line muted">${esc(e.start || '')}${e.start && e.end ? ' to ' : ''}${esc(e.end || '')}</span></div>${del('delete-edu', e.id)}</li>`).join('') : '<li class="empty">No education added yet.</li>';
    const skills = u.skills.length ? u.skills.map(s => `<li>${esc(s)}${isMe ? `<button class="chip-x" data-action="delete-skill" data-id="${esc(s)}" aria-label="Remove ${esc(s)}">x</button>` : ''}</li>`).join('') : '<li class="empty">No skills added yet.</li>';
    const certs = u.certs.length ? u.certs.map(c => {
      const safe = /^https?:\/\//i.test(c.url || '');
      return `<li><div><strong>${esc(c.name)}</strong><span class="line">${esc(c.issuer)}${c.year ? ', ' + esc(c.year) : ''}</span>${safe ? `<a class="line" href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">View credential</a>` : ''}</div>${del('delete-cert', c.id)}</li>`;
    }).join('') : '<li class="empty">No certifications added yet.</li>';

    return `<section class="wrap narrow profile">
      <div class="panel head">
        <div class="head-band"></div>
        <div class="head-body">
          ${avatar(u, 'xl')}
          <div class="head-info">
            <h1>${esc(u.name)}</h1>
            <p>${esc(u.headline)}</p>
            <p class="muted">${esc(u.college)}, SBTE Bihar</p>
            <p class="muted">${esc(u.role)}, ${esc(u.branch)}${u.location ? '. ' + esc(u.location) : ''}</p>
            <p class="muted">${conns} ${conns === 1 ? 'connection' : 'connections'}</p>
          </div>
          <div class="head-actions">
            ${isMe ? `<button class="btn primary" data-action="edit-profile">Edit profile</button><button class="btn" data-action="print">Save as PDF</button>` : connectButtons(u.id, '')}
            ${!isMe && Store.status(me.id, u.id) === 'connected' ? `<button class="btn" data-action="disconnect" data-id="${u.id}">Remove connection</button>` : ''}
          </div>
        </div>
        ${isMe ? `<div class="head-strength"><div class="meter" role="img" aria-label="Profile strength ${st.pct} percent"><span style="width:${st.pct}%"></span></div><p class="hint">Profile strength ${st.pct}%. ${esc(st.next)}</p></div>` : ''}
      </div>

      <div class="panel block"><div class="block-head"><h2>About</h2></div>
        <p class="about">${u.about ? esc(u.about) : '<span class="empty">No about section yet.</span>'}</p></div>

      <div class="panel block"><div class="block-head"><h2>Education</h2>${add('add-edu', 'Add education')}</div><ul class="entries">${edu}</ul></div>

      <div class="panel block"><div class="block-head"><h2>Skills</h2>${add('add-skill', 'Add skills')}</div><ul class="chips">${skills}</ul></div>

      <div class="panel block"><div class="block-head"><h2>Certifications</h2>${add('add-cert', 'Add certification')}</div><ul class="entries">${certs}</ul></div>
    </section>`;
  }

  const notFoundView = () => `<section class="auth"><h1>Page not found</h1><p class="lead">That page does not exist.</p><a class="btn primary" href="#/">Go home</a></section>`;

  /* ---------- router ---------- */
  function route(scrollTop = true) {
    me = Store.me();
    const hash = location.hash.slice(1) || '/';
    const [path, qs] = hash.split('?');
    const parts = path.split('/').filter(Boolean);
    const params = new URLSearchParams(qs || '');
    page = parts[0] || '';

    const isPublic = ['', 'login', 'signup'].includes(page);
    if (!me && !isPublic) return go('/login');
    if (me && isPublic) return go('/feed');

    let html;
    switch (page) {
      case '': html = landingView(); break;
      case 'login': html = loginView(); break;
      case 'signup': html = signupView(); break;
      case 'feed': html = feedView(); break;
      case 'network': html = networkView(params); break;
      case 'profile': html = profileView(me); break;
      case 'u': {
        const u = Store.user(parts[1]);
        if (!u) { html = notFoundView(); break; }
        if (u.id === me.id) { page = 'profile'; }
        html = profileView(u);
        break;
      }
      default: html = notFoundView();
    }
    renderHeader();
    $('#app').innerHTML = html;
    if (scrollTop) window.scrollTo(0, 0);
  }

  /* ---------- modal forms for the profile ---------- */
  function editProfileModal() {
    openModal('Edit profile', `
      ${field('Full name', 'name', { value: me.name, required: true, maxlen: 60 })}
      ${field('Headline', 'headline', { value: me.headline, required: true, maxlen: 120, hint: 'For example: Diploma student in Civil Engineering, learning Revit.' })}
      ${field('I am a', 'role', { options: ROLES, value: me.role, required: true })}
      ${field('College', 'college', { options: SBTE_COLLEGES, value: me.college, required: true })}
      ${field('Branch', 'branch', { options: BRANCHES, value: me.branch, required: true })}
      ${field('Location', 'location', { value: me.location, maxlen: 60, placeholder: 'City, State' })}
      ${field('About', 'about', { value: me.about, rows: 5, maxlen: 600, hint: 'Up to 600 characters.' })}
    `, 'Save changes', d => {
      if (!d.name.trim() || !d.headline.trim()) return 'Name and headline are required.';
      Store.updateUser(me.id, {
        name: d.name.trim(), headline: d.headline.trim(), role: d.role, college: d.college, branch: d.branch,
        location: d.location.trim(), about: d.about.trim()
      });
      toast('Profile saved');
    });
  }

  function addEducationModal() {
    openModal('Add education', `
      ${field('School or college', 'school', { required: true, maxlen: 100, placeholder: 'Government Polytechnic, Darbhanga' })}
      ${field('Degree', 'degree', { required: true, maxlen: 60, placeholder: 'Diploma, B.Tech (lateral entry), ITI' })}
      ${field('Field of study', 'field', { maxlen: 60, placeholder: 'Civil Engineering' })}
      ${field('Start year', 'start', { options: years(1990, new Date().getFullYear() + 5), placeholder: 'Select year' })}
      ${field('End year (or expected)', 'end', { options: years(1990, new Date().getFullYear() + 8), placeholder: 'Select year' })}
    `, 'Add education', d => {
      if (!d.school.trim() || !d.degree.trim()) return 'School and degree are required.';
      if (d.start && d.end && +d.end < +d.start) return 'End year cannot be before the start year.';
      me.education.push({ id: Store.uid(), school: d.school.trim(), degree: d.degree.trim(), field: d.field.trim(), start: d.start ? +d.start : '', end: d.end ? +d.end : '' });
      me.education.sort((a, b) => (b.end || 0) - (a.end || 0));
      Store.updateUser(me.id, { education: me.education });
      toast('Education added');
    });
  }

  function addSkillModal() {
    openModal('Add skills', `
      <datalist id="skill-list">${SKILL_SUGGESTIONS.map(s => `<option value="${esc(s)}">`).join('')}</datalist>
      ${field('Skills', 'skills', { required: true, list: 'skill-list', maxlen: 200, placeholder: 'AutoCAD, Surveying, Python', hint: 'Separate several skills with commas.' })}
    `, 'Add skills', d => {
      const incoming = d.skills.split(',').map(s => s.trim()).filter(Boolean);
      if (!incoming.length) return 'Enter at least one skill.';
      const have = new Set(me.skills.map(s => s.toLowerCase()));
      const fresh = incoming.filter(s => s.length <= 40 && !have.has(s.toLowerCase()));
      if (!fresh.length) return 'These skills are already on your profile.';
      if (me.skills.length + fresh.length > 30) return 'You can add up to 30 skills.';
      Store.updateUser(me.id, { skills: [...me.skills, ...fresh] });
      toast(fresh.length === 1 ? 'Skill added' : 'Skills added');
    });
  }

  function addCertModal() {
    openModal('Add certification', `
      ${field('Certification name', 'name', { required: true, maxlen: 100, placeholder: 'PLC and SCADA Fundamentals' })}
      ${field('Issued by', 'issuer', { required: true, maxlen: 80, placeholder: 'NPTEL, NSDC, CIPET, Coursera' })}
      ${field('Year', 'year', { options: years(2000, new Date().getFullYear()), placeholder: 'Select year' })}
      ${field('Credential link (optional)', 'url', { type: 'url', maxlen: 300, placeholder: 'https://' })}
    `, 'Add certification', d => {
      if (!d.name.trim() || !d.issuer.trim()) return 'Name and issuer are required.';
      const url = d.url.trim();
      if (url && !/^https?:\/\//i.test(url)) return 'The credential link must start with http:// or https://';
      me.certs.push({ id: Store.uid(), name: d.name.trim(), issuer: d.issuer.trim(), year: d.year ? +d.year : '', url });
      me.certs.sort((a, b) => (b.year || 0) - (a.year || 0));
      Store.updateUser(me.id, { certs: me.certs });
      toast('Certification added');
    });
  }

  /* ---------- click actions ---------- */
  const actions = {
    logout() { Store.logout(); toast('Logged out'); go('/'); },
    'close-modal': closeModal,
    print() { window.print(); },
    'edit-profile': editProfileModal,
    'add-edu': addEducationModal,
    'add-skill': addSkillModal,
    'add-cert': addCertModal,

    connect(el) { Store.request(me.id, el.dataset.id); toast('Request sent'); route(false); },
    withdraw(el) { Store.remove(me.id, el.dataset.id); toast('Request withdrawn'); route(false); },
    accept(el) { Store.accept(el.dataset.id, me.id); toast('You are now connected'); route(false); },
    ignore(el) { Store.remove(me.id, el.dataset.id); route(false); },
    disconnect(el) {
      const u = Store.user(el.dataset.id);
      if (u && confirm(`Remove ${u.name} from your connections?`)) { Store.remove(me.id, u.id); route(false); }
    },

    like(el) { Store.toggleLike(el.dataset.id, me.id); route(false); },
    'toggle-comments'(el) {
      const id = el.dataset.id;
      if (openComments.has(id)) openComments.delete(id); else openComments.add(id);
      route(false);
    },
    'delete-post'(el) { if (confirm('Delete this post?')) { Store.deletePost(el.dataset.id); route(false); } },

    'delete-edu'(el) { Store.updateUser(me.id, { education: me.education.filter(e => e.id !== el.dataset.id) }); route(false); },
    'delete-cert'(el) { Store.updateUser(me.id, { certs: me.certs.filter(c => c.id !== el.dataset.id) }); route(false); },
    'delete-skill'(el) { Store.updateUser(me.id, { skills: me.skills.filter(s => s !== el.dataset.id) }); route(false); }
  };

  document.addEventListener('click', e => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const fn = actions[el.dataset.action];
    if (fn) { e.preventDefault(); fn(el); }
  });

  /* ---------- form submissions ---------- */
  document.addEventListener('submit', async e => {
    const form = e.target.closest('form[data-form]');
    if (!form) return;
    e.preventDefault();
    const kind = form.dataset.form;
    const data = Object.fromEntries(new FormData(form));

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    switch (kind) {
      case 'signup': {
        const email = data.email.trim().toLowerCase();
        if (Store.byEmail(email)) return formError(form, 'An account with this email already exists. Log in instead.');
        if (!SBTE_COLLEGES.includes(data.college)) return formError(form, 'Choose a college from the SBTE Bihar list.');
        if (!/^[A-Za-z0-9\/-]{5,20}$/.test(data.regno.trim())) return formError(form, 'Enter your SBTE registration number using 5 to 20 letters or digits.');
        const year = parseInt(data.year, 10);
        const user = Store.addUser({
          id: Store.uid(),
          name: data.name.trim(),
          email,
          passHash: await Store.hash(data.password),
          role: data.role,
          college: data.college,
          branch: data.branch,
          regNo: data.regno.trim().toUpperCase(),
          headline: `${data.role}, ${data.branch}`,
          location: '',
          about: '',
          skills: [],
          education: [{ id: Store.uid(), school: data.college, degree: 'Diploma', field: data.branch, start: year - 3, end: year }],
          certs: [],
          createdAt: Date.now()
        });
        Store.login(user.id);
        Store.welcomeRequests(user.id);
        toast('Welcome to ' + APP_NAME + '. Complete your profile to get noticed.');
        go('/profile');
        break;
      }

      case 'login': {
        const u = Store.byEmail(data.email);
        const ok = u && u.passHash && u.passHash === await Store.hash(data.password);
        if (!ok) return formError(form, 'Email or password is incorrect.');
        Store.login(u.id);
        go('/feed');
        break;
      }

      case 'post': {
        const text = data.text.trim();
        if (!text) return;
        Store.addPost(me.id, text);
        route(false);
        break;
      }

      case 'comment': {
        const text = data.text.trim();
        if (!text) return;
        Store.addComment(form.dataset.id, me.id, text);
        openComments.add(form.dataset.id);
        route(false);
        break;
      }

      case 'global-search': {
        go('/network?tab=discover&q=' + encodeURIComponent(data.q.trim()));
        break;
      }

      case 'network-filter': {
        const p = new URLSearchParams();
        p.set('tab', 'discover');
        ['q', 'college', 'branch'].forEach(k => { if (data[k]) p.set(k, data[k].trim()); });
        go('/network?' + p.toString());
        break;
      }

      case 'modal': {
        if (!modalHandler) return;
        const err = modalHandler(data);
        if (err) return formError(form, err);
        closeModal();
        route(false);
        break;
      }
    }
  });

  document.addEventListener('change', e => {
    if (e.target.matches('.filters select')) e.target.form.requestSubmit();
  });

  $('#modal').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });

  window.addEventListener('hashchange', () => route(true));
  route(false);
})();
