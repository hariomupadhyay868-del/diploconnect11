/* ==========================================================
   Diploconnect11 - data store
   Everything is saved in the browser's localStorage, so the
   site works on Vercel with no backend. To make it a real
   multi-user network, replace the functions below with calls
   to Firebase, Supabase or your own API. The rest of the app
   only talks to this Store object.
   ========================================================== */
const Store = (() => {
  const KEY = 'diploconnect11_db_v1';
  const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  let db;

  function seed() {
    const now = Date.now();
    return {
      users: SEED_USERS.map(u => ({ ...u, createdAt: now })),
      posts: SEED_POSTS.map(p => ({ id: uid(), userId: p.userId, text: p.text, at: now - p.h * 3600e3, likes: [], comments: [] })),
      connections: [],
      session: null
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data && Array.isArray(data.users)) return data;
      }
    } catch (e) { /* ignore and reseed */ }
    return seed();
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* storage full or blocked */ }
  }

  db = load();
  save();

  async function hash(text) {
    const salted = 'diploconnect11:' + text;
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salted));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    let h = 5381;
    for (let i = 0; i < salted.length; i++) h = ((h << 5) + h + salted.charCodeAt(i)) | 0;
    return 'x' + h;
  }

  const link = (a, b) => db.connections.find(c => (c.from === a && c.to === b) || (c.from === b && c.to === a));

  const api = {
    uid,
    hash,

    /* users and session */
    users: () => db.users,
    user: id => db.users.find(u => u.id === id),
    byEmail: email => db.users.find(u => u.email === String(email).trim().toLowerCase()),
    me() { return db.session ? api.user(db.session) || null : null; },
    login(id) { db.session = id; save(); },
    logout() { db.session = null; save(); },
    addUser(u) { db.users.push(u); save(); return u; },
    updateUser(id, patch) { Object.assign(api.user(id), patch); save(); },

    /* posts */
    posts: () => [...db.posts].sort((a, b) => b.at - a.at),
    addPost(userId, text) { db.posts.push({ id: uid(), userId, text, at: Date.now(), likes: [], comments: [] }); save(); },
    deletePost(id) { db.posts = db.posts.filter(p => p.id !== id); save(); },
    toggleLike(id, userId) {
      const p = db.posts.find(p => p.id === id);
      if (!p) return;
      const i = p.likes.indexOf(userId);
      if (i >= 0) p.likes.splice(i, 1); else p.likes.push(userId);
      save();
    },
    addComment(id, userId, text) {
      const p = db.posts.find(p => p.id === id);
      if (!p) return;
      p.comments.push({ id: uid(), userId, text, at: Date.now() });
      save();
    },

    /* connections: status is seen from the point of view of "a" */
    status(a, b) {
      const c = link(a, b);
      if (!c) return 'none';
      if (c.status === 'connected') return 'connected';
      return c.from === a ? 'sent' : 'received';
    },
    request(from, to) {
      if (from === to || api.status(from, to) !== 'none') return;
      db.connections.push({ from, to, status: 'pending', at: Date.now() });
      save();
    },
    accept(requester, me) {
      const c = db.connections.find(c => c.from === requester && c.to === me && c.status === 'pending');
      if (c) { c.status = 'connected'; save(); }
    },
    remove(a, b) {
      db.connections = db.connections.filter(c => !((c.from === a && c.to === b) || (c.from === b && c.to === a)));
      save();
    },
    connectionsOf: id => db.connections
      .filter(c => c.status === 'connected' && (c.from === id || c.to === id))
      .map(c => (c.from === id ? c.to : c.from)),
    incoming: id => db.connections.filter(c => c.status === 'pending' && c.to === id).map(c => c.from),

    /* gives a brand new member two incoming requests so the Requests tab is not empty */
    welcomeRequests(userId) {
      const me = api.user(userId);
      const score = u => (u.college === me.college ? 3 : 0) + (u.branch === me.branch ? 2 : 0);
      db.users
        .filter(u => u.seed)
        .sort((a, b) => score(b) - score(a))
        .slice(0, 2)
        .forEach(u => db.connections.push({ from: u.id, to: userId, status: 'pending', at: Date.now() }));
      save();
    },

    reset() { localStorage.removeItem(KEY); db = seed(); save(); }
  };

  return api;
})();
