/* Husband Retail · service pages v2 · behaviour (service.js)
   Draft v2.1 · 2026-11-09 · no dependencies, loaded with defer, one file for all five pages.
   1. Enter-view reveals (.svc-reveal, .svc-reveal-media): skipped under prefers-reduced-motion.
   2. Project cards (home v2.2 tile pattern, binding update 3): from 761 px the key figures fade in over
      the photo. Hover shows them in CSS (mouse); the "Key figures" button toggles them for keyboard and
      touch; on touch screens a first tap on the photo shows them and a second tap opens the project.
      A tap elsewhere or Escape hides them. At 760 px and below they sit below the photo (CSS, no script).
   3. Logo band (home #trust pattern, v3.0): the pause button stops both rows and flips aria-pressed;
      hover and focus pause in CSS. Under reduced motion CSS shows one static set and hides the button.
   4. Focus areas open at desktop as cards; on phones (760 px and below) they start closed (A8.12).
   5. Phone rails (situations, projects) get a tab stop and a label only while they scroll sideways.
   6. FAQ (v3.1, kept in v3.2): from 981 px the first answer is open at load (NN/g accordion guidance: it
      signals the pattern and balances the FAQ photo); phones keep every question collapsed (A8.12).
   Every block exits quietly when its markup is absent. v3.2 · 2026-11-11 (unchanged since v3.1) */
(function () {
	'use strict';
	var root = document.querySelector('main.svc');
	if (!root) { return; }
	var mq = function (q) { return window.matchMedia ? window.matchMedia(q).matches : false; };
	var reduced = mq('(prefers-reduced-motion: reduce)');

	/* Restore legacy scope links while keeping the optional scope panel compact. */
	function openLinkedScope() {
		var id;
		try { id = decodeURIComponent(window.location.hash.slice(1)); } catch (_) { return; }
		var anchor = id && document.getElementById(id);
		if (!anchor || !anchor.classList.contains('svc-anchor')) { return; }
		var next = anchor.nextElementSibling;
		while (next && next.classList.contains('svc-anchor')) { next = next.nextElementSibling; }
		if (next && next.matches('details.svc-areas-disclosure')) { next.open = true; }
	}
	openLinkedScope();
	window.addEventListener('hashchange', openLinkedScope);

	/* ---- 1. reveals ---- */
	var reveals = root.querySelectorAll('.svc-reveal, .svc-reveal-media');
	function showAll() { reveals.forEach(function (el) { el.classList.add('is-in'); }); }
	if (reveals.length && !reduced && 'IntersectionObserver' in window) {
		var vh = window.innerHeight || document.documentElement.clientHeight;
		// Anything already on screen (or scrolled past) shows at once, so nothing flickers on load.
		reveals.forEach(function (el) {
			if (el.getBoundingClientRect().top < vh * 0.9) { el.classList.add('is-in'); }
		});
		root.classList.add('svc-motion');
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (e) {
				// Reveal on entry, and also when a fast scroll or an anchor jump has already passed it.
				if (e.isIntersecting || e.boundingClientRect.top < 0) {
					e.target.classList.add('is-in');
					io.unobserve(e.target);
				}
			});
		}, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
		reveals.forEach(function (el) { if (!el.classList.contains('is-in')) { io.observe(el); } });
		// Safety nets: an anchor jump or a print never leaves content hidden.
		window.addEventListener('hashchange', showAll);
		window.addEventListener('beforeprint', showAll);
	}

	/* ---- 2. project cards ---- */
	var cards = root.querySelectorAll('[data-svc-project]');
	function setFlip(card, on) {
		var btn = card.querySelector('[data-svc-flip]');
		card.classList.toggle('is-flipped', on);
		if (!btn) { return; }
		btn.setAttribute('aria-pressed', String(on));
		var txt = btn.querySelector('[data-svc-flip-label]');
		if (txt) { txt.textContent = on ? 'Photo' : 'Key figures'; }
	}
	cards.forEach(function (card) {
		var btn = card.querySelector('[data-svc-flip]');
		var area = card.querySelector('.svc-project__flip');
		if (btn) {
			btn.addEventListener('click', function (e) {
				e.stopPropagation();
				setFlip(card, !card.classList.contains('is-flipped'));
			});
		}
		if (area) {
			// Touch screens from 761 px: a first tap on the photo shows the figures, a second opens the project.
			area.addEventListener('click', function (e) {
				if (e.target.closest('[data-svc-flip]')) { return; }
				if (!mq('(hover: none)') || !mq('(min-width: 761px)')) { return; }
				if (card.classList.contains('is-flipped')) {
					var link = card.querySelector('.svc-project__title a');
					if (link) { window.location.href = link.href; }
					return;
				}
				setFlip(card, true);
			});
		}
		card.addEventListener('keydown', function (e) {
			if (e.key === 'Escape' && card.classList.contains('is-flipped')) {
				setFlip(card, false);
				if (btn) { btn.focus(); }
			}
		});
	});
	if (cards.length) {
		document.addEventListener('click', function (e) {
			cards.forEach(function (card) {
				if (card.classList.contains('is-flipped') && !card.contains(e.target)) { setFlip(card, false); }
			});
		});
	}
	/* ---- 3. logo band ---- */
	var band = root.querySelector('[data-svc-trust]');
	var tbtn = band && band.querySelector('[data-svc-trust-toggle]');
	if (tbtn) {
		tbtn.addEventListener('click', function () {
			var paused = !band.classList.contains('is-paused');
			band.classList.toggle('is-paused', paused);
			tbtn.setAttribute('aria-pressed', String(paused));
			tbtn.setAttribute('aria-label', paused ? 'Play logo motion' : 'Pause logo motion');
			var txt = tbtn.querySelector('.svc-trust__toggle-txt');
			if (txt) { txt.textContent = paused ? 'Play' : 'Pause'; }
		});
	}

	/* ---- 4. focus areas ---- */
	if (mq('(max-width: 760px)')) {
		root.querySelectorAll('details[data-svc-areas]').forEach(function (d) {
			var a = null;
			try { a = window.location.hash && document.getElementById(decodeURIComponent(window.location.hash.slice(1))); } catch (_) {}
			if (!(a && a.classList.contains('svc-anchor'))) { d.open = false; }
		});
	}

	/* ---- 6. FAQ: first answer open from 981 px ---- */
	if (mq('(min-width: 981px)')) {
		var faq = root.querySelector('.svc-faq .hr-faq__item');
		if (faq && !root.querySelector('.svc-faq .hr-faq__item[open]')) { faq.open = true; }
	}
})();
