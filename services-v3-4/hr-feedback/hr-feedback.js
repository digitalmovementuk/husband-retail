/**
 * Husband Retail homepage, v2.3 draft (2026-11-09). Layer B, loaded after the theme's main.js.
 * Each block exits quietly when its markup is not on the page.
 */
(function () {
	'use strict';

	var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/* ---- hero: one clip, looping slowly; under reduced motion it never loads (poster only) ---- */
	document.querySelectorAll('#home-hero video[data-hr-rate]').forEach(function (v) {
		var rate = parseFloat(v.getAttribute('data-hr-rate')) || 1;
		var apply = function () { try { v.defaultPlaybackRate = rate; v.playbackRate = rate; } catch (e) {} };
		apply();
		v.addEventListener('loadedmetadata', apply);
		v.addEventListener('play', apply);
		if (reduced) { try { v.pause(); } catch (e) {} }
		/* phones: poster only (the source carries media="(min-width: 761px)"; this covers browsers that ignore it) */
		if (window.matchMedia('(max-width: 760px)').matches) {
			try { v.pause(); } catch (e) {}
			var s = v.querySelector('source');
			if (s && v.currentSrc) { s.parentNode.removeChild(s); v.removeAttribute('src'); try { v.load(); } catch (e) {} }
		}
	});

	/* ---- closed menu: keep its links out of the tab order ---- */
	var menu = document.getElementById('hr-menu');
	var burger = document.getElementById('hr-burger');
	if (menu && burger && 'inert' in menu) {
		var sync = function () { menu.inert = !menu.classList.contains('is-open'); };
		burger.addEventListener('click', function () { menu.inert = false; }, true);
		new MutationObserver(sync).observe(menu, { attributes: true, attributeFilter: ['class'] });
		sync();
	}

	/* ---- logo band: pause / play button (hover and focus pause in CSS) ---- */
	document.querySelectorAll('[data-hr-trust]').forEach(function (band) {
		var btn = band.querySelector('[data-hr-trust-toggle]');
		if (!btn) { return; }
		var txt = btn.querySelector('.hr-trust__toggle-txt');
		btn.addEventListener('click', function () {
			var paused = !band.classList.contains('is-paused');
			band.classList.toggle('is-paused', paused);
			btn.setAttribute('aria-pressed', String(paused));
			btn.setAttribute('aria-label', paused ? 'Play logo motion' : 'Pause logo motion');
			if (txt) { txt.textContent = paused ? 'Play' : 'Pause'; }
		});
	});

	/* ---- selected work: numbered selector for the featured card (user-driven, no autoplay) ---- */
	document.querySelectorAll('[data-hr-feat]').forEach(function (root) {
		var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
		var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
		var tiles = Array.prototype.slice.call(root.querySelectorAll('.hr-flip[data-feat]'));
		if (!tabs.length) { return; }
		var show = function (i, focus) {
			tabs.forEach(function (t, j) {
				var on = j === i;
				t.setAttribute('aria-selected', String(on));
				t.tabIndex = on ? 0 : -1;
				t.classList.toggle('is-on', on);
				var p = panels[j];
				if (!p) { return; }
				p.classList.toggle('is-active', on);
				if (on) { p.removeAttribute('aria-hidden'); p.inert = false; p.removeAttribute('inert'); }
				else { p.setAttribute('aria-hidden', 'true'); p.inert = true; }
			});
			var id = panels[i] ? panels[i].id : '';
			tiles.forEach(function (t) { t.classList.toggle('is-featured', t.getAttribute('data-feat') === id); });
			if (focus) { tabs[i].focus(); }
		};
		tabs.forEach(function (t, i) {
			t.addEventListener('click', function () { show(i); });
			t.addEventListener('keydown', function (e) {
				var n = null;
				if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { n = (i + 1) % tabs.length; }
				if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { n = (i - 1 + tabs.length) % tabs.length; }
				if (e.key === 'Home') { n = 0; }
				if (e.key === 'End') { n = tabs.length - 1; }
				if (n !== null) { e.preventDefault(); show(n, true); }
			});
		});
		var start = 0;
		tabs.forEach(function (t, i) { if (t.getAttribute('aria-selected') === 'true') { start = i; } });
		show(start);
	});

	/* ---- project tiles: on touch screens 761 px and wider, the first tap flips, the second opens ---- */
	var touchFlip = window.matchMedia('(hover: none) and (min-width: 761px)');
	var unflip = function (except) {
		document.querySelectorAll('.hr-flip.is-flipped').forEach(function (t) { if (t !== except) { t.classList.remove('is-flipped'); } });
	};
	document.querySelectorAll('.hr-flip__card').forEach(function (card) {
		card.addEventListener('click', function (e) {
			if (!touchFlip.matches) { return; }
			var tile = card.closest('.hr-flip');
			if (!tile) { return; }
			if (!tile.classList.contains('is-flipped')) {
				e.preventDefault();
				unflip(tile);
				tile.classList.add('is-flipped');
			} else if (card.tagName !== 'A') {
				tile.classList.remove('is-flipped');
			}
		});
	});
	document.addEventListener('click', function (e) {
		if (!e.target.closest || !e.target.closest('.hr-flip')) { unflip(null); }
	});

	/* ---- founder film: a still poster until data-video-src holds a file; then a real play button ---- */
	document.querySelectorAll('[data-hr-film]').forEach(function (fig) {
		var src = (fig.getAttribute('data-video-src') || '').trim();
		var frame = fig.querySelector('.hr-film__frame');
		if (!src || !frame) { return; }
		var soon = frame.querySelector('.hr-film__soon');
		if (soon) { soon.parentNode.removeChild(soon); }
		var btn = document.createElement('button');
		btn.type = 'button';
		btn.className = 'hr-film__play';
		btn.setAttribute('aria-label', 'Play the film with Paul Husband, founder');
		frame.appendChild(btn);
		btn.addEventListener('click', function () {
			var img = frame.querySelector('img');
			var v = document.createElement('video');
			v.src = src;
			v.controls = true;
			v.playsInline = true;
			v.setAttribute('playsinline', '');
			if (img) { v.poster = img.currentSrc || img.src; }
			frame.classList.add('hr-film__frame--video');
			frame.innerHTML = '';
			frame.appendChild(v);
			var p = v.play();
			if (p && p.catch) { p.catch(function () {}); }
			v.focus();
		});
	});

	window.hrFeedback = { reduced: reduced };
})();
