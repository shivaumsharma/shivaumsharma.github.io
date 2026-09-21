document.documentElement.classList.add('js');

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// Theme toggle (persisted when storage is available)
const root = document.documentElement;
const isDark = () =>
    root.getAttribute('data-theme') === 'dark' ||
    (!root.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);

$('#theme-toggle').addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable */ }
});

// Mobile menu
const navList = $('#nav-list');
const navToggle = $('#nav-toggle');
const setMenu = (open) => {
    navList.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
};
navToggle.addEventListener('click', () => setMenu(!navList.classList.contains('open')));
$$('a', navList).forEach((a) => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

// Header border once scrolled
const header = $('#header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Reveal on scroll, and highlight the current section in the nav
if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    $$('.reveal').forEach((el) => io.observe(el));

    const links = $$('.nav__list a');
    const spy = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (!e.isIntersecting) return;
            links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach((l) => { const s = $(l.getAttribute('href')); if (s) spy.observe(s); });
} else {
    $$('.reveal').forEach((el) => el.classList.add('in'));
}

// Copy email
const copyBtn = $('#copy-email');
const status = $('#copy-status');
copyBtn.addEventListener('click', async () => {
    const email = copyBtn.dataset.email;
    try {
        await navigator.clipboard.writeText(email);
        status.textContent = 'Copied ' + email;
    } catch (e) {
        status.textContent = 'Copy failed. My email is ' + email;
    }
    setTimeout(() => { status.textContent = ''; }, 3000);
});

$('#year').textContent = new Date().getFullYear();
