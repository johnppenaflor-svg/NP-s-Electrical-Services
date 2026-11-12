const SUPABASE_URL = 'https://rtcqvhelhgdwytvlmxit.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_FG0u_9abHNzAwPV1j5C66w_OKMNT_0t';

const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function signUp(email, password) {
  const { error } = await db.auth.signUp({ email, password });
  if (error) return alert(error.message);
  alert('Check your email to confirm your account.');
}

async function signIn(email, password) {
  const { error } = await db.auth.signInWithPassword({ email, password });
  if (error) return alert(error.message);
  window.location.href = 'dashboard.html';
}

async function signOut() {
  await db.auth.signOut();
  window.location.href = 'login.html';
}

async function requireLogin() {
  const { data: { user } } = await db.auth.getUser();
  if (!user) window.location.href = 'login.html';
  return user;
}

async function submitQuote(name, phone, service, message) {
  const { data: { user } } = await db.auth.getUser();
  if (!user) return alert('Please sign in first.');
  const { error } = await db
    .from('quote_requests')
    .insert({ user_id: user.id, name, phone, service, message });
  if (error) return alert(error.message);
  alert('Request sent!');
}