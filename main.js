document.documentElement.classList.add('js');

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const on = (el, ev, fn, opts) => { if (el) el.addEventListener(ev, fn, opts); };

// Theme toggle (persisted when storage is available)
const root = document.documentElement;
const isDark = () =>
    root.getAttribute('data-theme') === 'dark' ||
    (!root.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);

on($('#theme-toggle'), 'click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable */ }
});

// Mobile menu
const navList = $('#nav-list');
const navToggle = $('#nav-toggle');
if (navList && navToggle) {
    const setMenu = (open) => {
        navList.classList.toggle('open', open);
        navToggle.setAttribute('aria-expanded', String(open));
        navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    on(navToggle, 'click', () => setMenu(!navList.classList.contains('open')));
    $$('a', navList).forEach((a) => on(a, 'click', () => setMenu(false)));
    on(document, 'keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
}

// Header border once scrolled
const header = $('#header');
if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
}

// Reveal on scroll, and highlight the current section in the nav
if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    $$('.reveal').forEach((el) => io.observe(el));

    const links = $$('.nav__list a[href^="#"]');
    if (links.length) {
        const spy = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (!e.isIntersecting) return;
                links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        links.forEach((l) => { const s = $(l.getAttribute('href')); if (s) spy.observe(s); });
    }
} else {
    $$('.reveal').forEach((el) => el.classList.add('in'));
}

// Copy email
const copyBtn = $('#copy-email');
const copyStatus = $('#copy-status');
on(copyBtn, 'click', async () => {
    const email = copyBtn.dataset.email;
    try {
        await navigator.clipboard.writeText(email);
        copyStatus.textContent = 'Copied ' + email;
    } catch (e) {
        copyStatus.textContent = 'Copy failed. My email is ' + email;
    }
    setTimeout(() => { copyStatus.textContent = ''; }, 3000);
});

// Contact form: submits in the background to FormSubmit; falls back to mailto if it fails
const form = $('#contact-form');
const formStatus = $('#form-status');
on(form, 'submit', async (e) => {
    e.preventDefault();
    const btn = $('.cform__submit', form);
    const data = new FormData(form);

    if (data.get('_honey')) return; // bot trap
    if (!form.checkValidity()) {
        formStatus.textContent = 'Please fill in your name, a valid email and a message.';
        form.reportValidity();
        return;
    }

    const fallback = () => {
        const subject = encodeURIComponent('Message from your portfolio site');
        const body = encodeURIComponent(data.get('message') + '\n\n' + data.get('name') + ' (' + data.get('email') + ')');
        formStatus.innerHTML = 'That did not go through. <a href="mailto:sshivaum@gmail.com?subject=' + subject + '&body=' + body + '">Send it by email instead</a>.';
    };

    btn.disabled = true;
    formStatus.textContent = 'Sending...';
    try {
        const res = await fetch('https://formsubmit.co/ajax/sshivaum@gmail.com', {
            method: 'POST',
            headers: { 'Accept': 'application/json' },
            body: data,
        });
        const out = await res.json().catch(() => ({}));
        if (res.ok && String(out.success) === 'true') {
            formStatus.textContent = 'Thanks, your message is on its way. I will reply soon.';
            form.reset();
        } else {
            fallback();
        }
    } catch (err) {
        fallback();
    } finally {
        btn.disabled = false;
    }
});

const yr = $('#year');
if (yr) yr.textContent = new Date().getFullYear();
