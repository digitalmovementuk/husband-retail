/**
 * Husband Retail — front-end behaviour.
 *
 * Five small things, all lifted from the approved prototypes: nav state,
 * overlay menu, hero video crossfade, the founder scroll scrub, reveal-on-scroll
 * and stat counters. The FAQ accordion is <details>, so it needs nothing here.
 */
(function () {
	'use strict';

	var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	document.documentElement.classList.remove('no-js');

	/* ---- nav: solid once scrolled, transparent while the menu is open ---- */
	var nav = document.getElementById('hr-nav');
	var menu = document.getElementById('hr-menu');
	var burger = document.getElementById('hr-burger');

	// Recomputed on scroll AND whenever something else moves the page (closing the
	// menu restores the scroll position without firing a scroll event).
	var syncNav = function () {
		if (!nav) { return; }
		nav.classList.toggle('is-scrolled', window.scrollY > 40 && !(menu && menu.classList.contains('is-open')));
	};

	if (nav) {
		window.addEventListener('scroll', syncNav, { passive: true });
		window.addEventListener('hashchange', syncNav);
		window.addEventListener('load', syncNav);
		syncNav();
	}

	// Keep native details semantics while animating height in both directions.
	var menuGroups = [];
	if (menu) {
		menu.querySelectorAll('.hr-menu__group details').forEach(function (group) {
			var summary = group.querySelector('summary');
			var links = group.querySelector('.sub-menu');
			var animation = null;
			var expanded = group.open;
			var settle = function () {
				group.open = expanded;
				group.classList.remove('is-closing');
				group.style.overflow = '';
				animation = null;
			};
			var reset = function () {
				if (animation) { animation.cancel(); }
				expanded = false;
				summary.setAttribute('aria-expanded', 'false');
				links.inert = true;
				settle();
			};
			summary.setAttribute('aria-expanded', String(expanded));
			links.inert = !expanded;
			summary.addEventListener('click', function (event) {
				event.preventDefault();
				var start = group.getBoundingClientRect().height;
				if (animation) { animation.cancel(); }
				expanded = !expanded;
				summary.setAttribute('aria-expanded', String(expanded));
				links.inert = !expanded;
				group.open = true;
				group.classList.toggle('is-closing', !expanded);
				if (reduced || !group.animate) { settle(); return; }
				var end = expanded ? group.scrollHeight : summary.getBoundingClientRect().height;
				group.style.overflow = 'hidden';
				animation = group.animate([
					{ height: start + 'px' }, { height: end + 'px' }
				], { duration: 320, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)' });
				animation.onfinish = settle;
			});
			menuGroups.push({ reset: reset });
		});
	}

	if (burger && menu && nav) {
		var setMenu = function (open) {
			menu.classList.toggle('is-open', open);
			nav.classList.toggle('is-menu-open', open);
			burger.setAttribute('aria-expanded', String(open));
			document.body.style.overflow = open ? 'hidden' : '';
			if (!open) {
				menuGroups.forEach(function (group) { group.reset(); });
			}
			syncNav();
		};

		burger.addEventListener('click', function () {
			setMenu(!menu.classList.contains('is-open'));
		});
		menu.querySelectorAll('a').forEach(function (a) {
			a.addEventListener('click', function () { setMenu(false); });
		});
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); }
		});
	}

	/* ---- hero: crossfade the background clips, caption follows ---- */
	document.querySelectorAll('[data-hero]').forEach(function (hero) {
		var slides = Array.prototype.slice.call(hero.querySelectorAll('.hr-hero__slide'));
		var dots = Array.prototype.slice.call(hero.querySelectorAll('.hr-hero__dots button'));
		var caption = hero.querySelector('.hr-hero__caption');
		var interval = parseInt(hero.getAttribute('data-hero-interval'), 10) || 7000;
		var video = function (i) { return slides[i] && slides[i].querySelector('video'); };
		var cur = 0;
		var timer;

		// Seat every clip at frame 0 so a switch never shows a visible seek.
		slides.forEach(function (slide, i) {
			var v = video(i);
			if (!v) { return; }
			var seat = function () { try { v.currentTime = 0; } catch (e) {} };
			if (v.readyState >= 1) { seat(); } else { v.addEventListener('loadedmetadata', seat, { once: true }); }
			if (i === 0 && !reduced) {
				var p = v.play();
				if (p && p.catch) { p.catch(function () {}); }
			} else {
				v.pause();
			}
		});

		if (slides.length < 2) { return; }

		var go = function (i) {
			i = (i + slides.length) % slides.length;
			if (i === cur) { return; }
			var prev = cur;

			var vIn = video(i);
			if (vIn && !reduced) {
				try { vIn.currentTime = 0; } catch (e) {}
				var play = vIn.play();
				if (play && play.catch) { play.catch(function () {}); }
			}

			slides[prev].classList.remove('is-active');
			slides[i].classList.add('is-active');
			if (dots[prev]) { dots[prev].classList.remove('is-active'); }
			if (dots[i]) { dots[i].classList.add('is-active'); }
			cur = i;

			if (caption) {
				var next = slides[i].getAttribute('data-caption') || '';
				if (next !== caption.textContent) {
					caption.style.opacity = 0;
					window.setTimeout(function () {
						caption.textContent = next;
						caption.style.opacity = 1;
					}, 220);
				}
			}

			// Rewind the outgoing clip only once it is fully invisible.
			window.setTimeout(function () {
				if (cur === prev) { return; }
				var vOut = video(prev);
				if (!vOut) { return; }
				try { vOut.pause(); vOut.currentTime = 0; } catch (e) {}
			}, 1180);
		};

		var start = function () { timer = window.setInterval(function () { go(cur + 1); }, interval); };
		dots.forEach(function (d, i) {
			d.addEventListener('click', function () {
				window.clearInterval(timer);
				go(i);
				start();
			});
		});

		if (!reduced) { start(); }
	});

	/* ---- founder: scroll position drives --p, which drives wash + copy ---- */
	var founders = Array.prototype.slice.call(document.querySelectorAll('[data-founder]'));
	if (founders.length && !reduced) {
		var scrub = function () {
			founders.forEach(function (el) {
				var r = el.getBoundingClientRect();
				var p = (window.innerHeight - r.top) / (window.innerHeight * 0.62);
				el.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
			});
		};
		var ticking = false;
		window.addEventListener('scroll', function () {
			if (ticking) { return; }
			ticking = true;
			window.requestAnimationFrame(function () { scrub(); ticking = false; });
		}, { passive: true });
		window.addEventListener('resize', scrub, { passive: true });
		scrub();
	}

	/* ---- reveal on scroll ---- */
	var reveals = document.querySelectorAll('.hr-reveal');
	if (reveals.length) {
		if (reduced || !('IntersectionObserver' in window)) {
			reveals.forEach(function (el) { el.classList.add('is-in'); });
		} else {
			var io = new IntersectionObserver(function (entries) {
				entries.forEach(function (e) {
					// Also reveal anything already scrolled past — an anchor link or a
					// restored scroll position would otherwise leave it invisible.
					if (!e.isIntersecting && e.boundingClientRect.bottom > 0) { return; }
					e.target.classList.add('is-in');
					io.unobserve(e.target);
				});
			}, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
			reveals.forEach(function (el) { io.observe(el); });
		}
	}

	/* ---- project index: filter the grid by scope ---- */
	document.querySelectorAll('[data-filter-group]').forEach(function (group) {
		var grid = document.getElementById(group.getAttribute('data-filter-group'));
		if (!grid) { return; }

		var chips = Array.prototype.slice.call(group.querySelectorAll('[data-filter]'));
		var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-scope]'));
		var pins = Array.prototype.slice.call(document.querySelectorAll('.hr-atlas__pin > a'));
		var count = document.querySelector('[data-filter-count]');
		var one = count ? (count.getAttribute('data-count-one') || 'project') : '';
		var many = count ? (count.getAttribute('data-count-many') || 'projects') : '';

		var apply = function (value) {
			var shown = 0;

			cards.forEach(function (card) {
				// Pad both sides so "leasing" never matches inside another slug.
				var scope = ' ' + (card.getAttribute('data-scope') || '') + ' ';
				var match = value === 'all' || scope.indexOf(' ' + value + ' ') > -1;
				card.hidden = !match;
				if (match) { shown++; }
			});

			chips.forEach(function (chip) {
				var on = chip.getAttribute('data-filter') === value;
				chip.classList.toggle('is-on', on);
				chip.setAttribute('aria-pressed', String(on));
			});

			if (count) { count.textContent = shown + ' ' + (shown === 1 ? one : many); }
		};

		chips.forEach(function (chip) {
			chip.addEventListener('click', function () { apply(chip.getAttribute('data-filter')); });
		});

		// A pin's target card can be hidden by the active filter, and a browser
		// will not scroll to a hidden anchor — so any pin click clears the
		// filter back to "all" first, before the browser follows the link.
		pins.forEach(function (pin) {
			pin.addEventListener('click', function () { apply('all'); });
		});
	});

	/* ---- stat counters ---- */
	var counters = document.querySelectorAll('[data-count]');
	if (counters.length) {
		var run = function (el) {
			var target = parseFloat(el.getAttribute('data-count'));
			var out = el.querySelector('.hr-stat__n') || el;
			if (isNaN(target)) { return; }
			if (reduced) { out.textContent = target.toLocaleString(); return; }

			var dur = 1500;
			var began = performance.now();
			var step = function (now) {
				var p = Math.min((now - began) / dur, 1);
				out.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target).toLocaleString();
				if (p < 1) { window.requestAnimationFrame(step); }
			};
			window.requestAnimationFrame(step);
		};

		if (!('IntersectionObserver' in window)) {
			counters.forEach(run);
		} else {
			var cio = new IntersectionObserver(function (entries) {
				entries.forEach(function (e) {
					if (!e.isIntersecting) { return; }
					run(e.target);
					cio.unobserve(e.target);
				});
			}, { threshold: 0.6 });
			counters.forEach(function (el) { cio.observe(el); });
		}
	}
})();
