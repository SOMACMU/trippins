var mapView = (function($) { var _ = {
	settings: {
		preload: false,
		slideDuration: 500,
		layoutDuration: 750,
		thumbnailsPerRow: 2,
		mainSide: 'right'
	},
	 $window: null,
	 $body: null,
	 $main: null,
	 $sideColumn: null,
	 $viewer: null,
	 $toggle: null,
	 $navNext: null,
	 $navPrevious: null,
	 slides: [],
	 current: null,
	 locked: false,

	 initProperties: function() {

		_.$window = $(window);
		_.$body = $('body');
		_.$thumbnails = $('#thumbnails');
		_.$viewer = $('#viewer');
		_.$main = $('#main');
		_.$toggle = $('.toggle');
		if (skel.vars.IEVersion < 9)
			_.$window
		.on('resize', function() {
			window.setTimeout(function() {
				_.$viewer.css('width', _.$window.width() - _.$main.width());
			}, 100);
		})
		.trigger('resize');
	},
	initEvents: function() {
			_.$window.on('load', function() {

			_.$body.removeClass('is-loading-0');

			window.setTimeout(function() {
				_.$body.removeClass('is-loading-1');
			}, 100);

			window.setTimeout(function() {
				_.$body.removeClass('is-loading-2');
			}, 100 + Math.max(_.settings.layoutDuration - 150, 0));

		});

			// Disable animations/transitions on resize.
			var resizeTimeout;

			_.$window.on('resize', function() {
				_.$body.addClass('is-loading-0');
				window.clearTimeout(resizeTimeout);

				resizeTimeout = window.setTimeout(function() {
					_.$body.removeClass('is-loading-0');
				}, 100);

			});
			// Hide main wrapper on tap (<= medium only).
			_.$viewer.on('touchend', function() {

				if (skel.breakpoint('medium').active)
					_.hide();

			});
		_.$toggle.on('click', function() {
			_.toggle();
		});
			// Prevent event from bubbling up to "hide event on tap" event.
			_.$toggle.on('touchend', function(event) {
				event.stopPropagation();
			});

		},
	initViewer: function() {

	},
	init: function() {

		// IE<10: Zero out transition delays.
		if (skel.vars.IEVersion < 10) {
			_.settings.slideDuration = 0;
			_.settings.layoutDuration = 0;

		}
		// Skel.
		skel.breakpoints({
			xlarge: '(max-width: 1680px)',
			large: '(max-width: 1280px)',
			medium: '(max-width: 980px)',
			small: '(max-width: 736px)',
			xsmall: '(max-width: 480px)'
		});
		// Everything else.
		_.initProperties();
		_.initViewer();
		_.initEvents();
	},
	show: function() {
		if (!_.$body.hasClass('fullscreen'))
			return;

		// Show main wrapper.
		_.$body.removeClass('fullscreen');

		// Focus.
		_.$main.focus();

	},
	hide: function() {

		// Already hidden? Bail.
		if (_.$body.hasClass('fullscreen'))
			return;

		// Hide main wrapper.
		_.$body.addClass('fullscreen');

		// Blur.
		_.$main.blur();

	},
	toggle: function() {

	 	if (_.$body.hasClass('fullscreen')) {
	 		_.show();
		}
	 	else {
	 		_.hide();
		}

	 },

	}; return _; })(jQuery);

$(document).ready(function() {
	mapView.init();
});
