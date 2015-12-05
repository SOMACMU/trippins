
var parallelism = (function($) { var _ = {
			settings: {
					popupOverlayColor: '#1a1f2c',
					popupOverlayOpacity: 0.75,
					autoStyleMobile: true,
					centerVertically: true,
					introDelay: 600,
					introSpeed: 750,
					itemHeight: 230,
					itemWidth: 300,
					marginBottom: 0,
					marginTop: 0,
					verticalNudge: -50,
					maxRows: 3,
					minRows: 1,
					padding: 5,
					paddingColor: '#fff',
					resetScroll: true,
					scrollFactor: 1,
					scrollKeyAmount: 50,
					scrollWheelTarget: 'window',
					scrollZoneAmount: 10,
					scrollZoneDelay: 20,
					scrollZoneWidth: 40,
					thumbDelay: 1200,
					thumbDelaySpread: 1500,
					thumbSpeed: 750,
					useBlurFilter: true,
					useScrollKeys: true,
					useScrollZones: true
			},

			isTouch: false,
			objects: {},

			initDesktop: function() {

				var $SZ = $(''), $SZLeft, $SZRight;

				var	windowHeight = _.objects.window.height() - _.settings.marginTop - _.settings.marginBottom,
					windowWidth = _.objects.window.width(),
					itemHeight = _.settings.itemHeight,
					itemCount = _.objects.items.length,
					itemsWidth = 0,
					rows = 0,
					rowWidth,
					SZIntervalId;

					_.objects.window._parallelism_update = function() {
							var i, j, x, y, t;
							rows = Math.min(Math.max(Math.floor(windowHeight / itemHeight) - 1, 1), _.settings.maxRows);
							while ( rows > _.settings.minRows && (itemsWidth / rows) < windowWidth )
								rows--;

							rowWidth = Math.ceil( (itemsWidth / rows) * 1.1 );

							var w = 0, iw;
							var rowStart = 0, rowPos = 0, rowEnded = false;

							_.objects.items.each(function(i) {
								var $item = $(this);
								iw = $item.data('width');
								if (w + iw >= rowWidth) {
									rowEnded = true;
									rowEnd = i - 1;
								}
								else if (i + 1 >= itemCount) {
									w += iw;
									rowEnded = true;
									rowEnd = i;
								}

								if (rowEnded) {
									var pt = 0;
									_.objects.items.slice(rowStart, rowEnd + 1).each(function(j) {
										var $item = $(this);
										var p = (($item.data('width') / w) * 100.00);

										if (pt + p > 100.00
										||	( (rowStart + j) == rowEnd && pt + p < 100.00))
											 p = 100.00 - pt;

										$item.css('width', p + '%');
										pt += p;

									});
									w = 0;
									rowStart = i;
									rowPos++;
									rowEnded = false;
								}
								w += iw;
							});

							_.objects.reel
								.css('height', (itemHeight * rows) + (_.settings.padding * 2))
								.css('width', rowWidth);

							_.objects.main
								.css('height', (itemHeight * rows) + (_.settings.padding * 2));

							if (_.settings.centerVertically)
								_.objects.main
									.css('top', '50%')
									.css('margin-top', (-1 * (_.objects.main.outerHeight() / 2)) + _.settings.verticalNudge);

							window.setTimeout(function() {
								$SZ
									.css('height', _.objects.main.outerHeight())
									.css('top', _.objects.main.offset().top);
							}, _.settings.introDelay);

					};

					_.objects.window.resize(function() {
							windowWidth = _.objects.window.width();
							windowHeight = _.objects.window.height() - _.settings.marginTop - _.settings.marginBottom;

							if (Math.max(Math.floor(windowHeight / itemHeight) - 1, 1) != rows)
								_.objects.window._parallelism_update();

							$SZ._parallelism_update();
					});

					_.objects.reel
						.css('overflow-y', 'hidden')
						.css('margin', '0 auto')
						.css('border', 'solid ' + _.settings.padding + 'px ' + _.settings.paddingColor)
						.css('box-shadow', '0 0 0 ' + _.settings.padding + 'px ' + _.settings.paddingColor);

					if (_.IEVersion < 9)
						_.objects.reel.show();
					else if (_.IEVersion < 10) {

						_.objects.reel.fadeTo(0,0.0001);

						window.setTimeout(function() {
							_.objects.reel.fadeTo(_.settings.introSpeed, 1);
						}, _.settings.introDelay);

					}
					else {
						_.objects.reel.css('opacity', 0);

						window.setTimeout(function() {
							_.objects.reel
								.h5u_xcss('transition', 'opacity ' + (_.settings.introSpeed / 1000.00) + 's ease-in-out')
								.css('opacity', 1);
						}, _.settings.introDelay);

					}

					_.objects.items
						.css('box-shadow', '0px 0px 0px ' + _.settings.padding + 'px ' + _.settings.paddingColor)
						.css('border', 'solid ' + _.settings.padding + 'px ' + _.settings.paddingColor);

					_.objects.items.each(function(i) {
						var	$item = $(this), $img = $item.find('img');
						var w, h;

						w = parseInt($item.data('width'));

						if (!w)
							w = _.settings.itemWidth;

							h = _.settings.itemHeight;

							itemsWidth += w;

							$item
								.css('position', 'relative')
								.css('width', w)
								.css('height', h);

							if ($img.length > 0) {
								var $itemInner, $h2;
								$img
									.css('position', 'absolute')
									.css('width', '100%')
									.css('height', 'auto')
									.css('min-height', '100%')
									.css('top', 0)
									.css('left', 0)
									.attr('title', $item.text());

									$item.wrapInner('<div class="inner" />');
									$itemInner = $item.children('.inner');
									$itemInner
										.css('position', 'relative')
										.css('display', 'block')
										.css('-webkit-backface-visibility', 'hidden')
										.css('width', '100%')
										.css('height', '100%');

									if (_.IEVersion < 9)
										$itemInner.show();
									else if (_.IEVersion < 10) {

										$itemInner.hide();

										window.setTimeout(function() {
											$itemInner.fadeIn(_.settings.thumbSpeed);
										}, _.settings.thumbDelay + Math.floor(Math.random() * _.settings.thumbDelaySpread));

									}
									else {
										$itemInner.css('opacity', 0);
										$itemInner.h5u_xcss('transition', 'opacity ' + (_.settings.thumbSpeed / 1000.00) + 's ease-in-out');

										window.setTimeout(function() {
											$itemInner.css('opacity', 1);
										}, _.settings.thumbDelay + Math.floor(Math.random() * _.settings.thumbDelaySpread));

									}

									$img.attr('src', $img.attr('src'));
							}
					});

					if (_.isTouch)
						_.objects.main
							.css('overflow-x', 'auto')
							.css('overflow-y', 'hidden')
							.h5u_xcss('overflow-scrolling', 'touch');
					else
						_.objects.main.css('overflow', 'hidden');

						if (_.IEVersion < 9)
							_.objects.main.css('overflow-x', 'scroll');
						else {
							var scrollHandler = function(e) {
								var	delta = (e.detail ? e.detail * -10 : e.wheelDelta) * _.settings.scrollFactor;
								_.objects.main.scrollLeft( _.objects.main.scrollLeft() - delta );
								$SZ._parallelism_update();
								e.preventDefault();
								e.stopPropagation();
							};

							var st;

							if (_.settings.scrollWheelTarget == 'reel')
								st = _.objects.main[0];
							else
								st = _.objects.window[0];

							st.addEventListener('DOMMouseScroll', scrollHandler, false);
							st.addEventListener('mousewheel', scrollHandler, false);

						}

						if (_.settings.resetScroll)
							window.setTimeout(function() {
								_.objects.main.scrollLeft(0);
							}, 0);

						if (!_.isTouch && _.settings.useScrollZones) {
							_.objects.body.append('<div class="SZRight" style="right: 0;" />');
							_.objects.body.append('<div class="SZLeft" style="left: 0;" />');

							$SZLeft = _.objects.body.children('.SZLeft');
							$SZRight = _.objects.body.children('.SZRight');
							$SZ = $SZLeft.add($SZRight);

							$SZ
								.css('position', 'fixed')
								.css('width', _.settings.scrollZoneWidth)
								.css('height', 100)
								.css('z-index', 100)
								.css('background', 'rgba(255,255,255,0)') // Required due to a weird IE bug (affects <=10)
								.css('top', 0);

							$SZ._parallelism_update = function() {
								if (_.objects.main.scrollLeft() == 0)
									$SZLeft.hide();
								else
									$SZLeft.show();

								if (_.objects.main.scrollLeft() + $(window).width() >= _.objects.reel.outerWidth())
									$SZRight.hide();
								else
									$SZRight.show();
							};

							$SZRight.bind('mouseenter', function(e) {
								SZIntervalId = window.setInterval(function() {
									_.objects.main.scrollLeft( _.objects.main.scrollLeft() + (_.settings.scrollZoneAmount * _.settings.scrollFactor) );
									$SZ._parallelism_update();
								}, _.settings.scrollZoneDelay);
								return false;
							});

							$SZLeft.bind('mouseenter', function(e) {
								SZIntervalId = window.setInterval(function() {
									_.objects.main.scrollLeft( _.objects.main.scrollLeft() - (_.settings.scrollZoneAmount * _.settings.scrollFactor) );
									$SZ._parallelism_update();
								}, _.settings.scrollZoneDelay);
								return false;
							});

							$SZ.bind('mouseleave', function(e) {
								window.clearInterval(SZIntervalId);
							});
						}
						else
							$SZ._parallelism_update = function() {};

					if (_.settings.useScrollKeys) {
						_.objects.window.keydown(function(e) {
							if ($('.poptrox-popup').is(':visible'))
								return;
							switch (e.keyCode) {
								case 39:
									window.clearInterval(SZIntervalId);
									_.objects.main.scrollLeft( _.objects.main.scrollLeft() + (_.settings.scrollKeyAmount * _.settings.scrollFactor) );
									$SZ._parallelism_update();
									return false;
								case 37:
									window.clearInterval(SZIntervalId);
									_.objects.main.scrollLeft( _.objects.main.scrollLeft() - (_.settings.scrollKeyAmount * _.settings.scrollFactor) );
									$SZ._parallelism_update();
									return false;
								default:
									break;
							}
						});
					}

					_.objects.reel.poptrox({
						onPopupClose: (_.settings.useBlurFilter ? (function() { _.objects.wrapper.removeClass('overlayed'); }) : null),
						onPopupOpen: (_.settings.useBlurFilter ? (function() { _.objects.wrapper.addClass('overlayed'); }) : null),
						overlayColor: _.settings.popupOverlayColor,
						overlayOpacity: _.settings.popupOverlayOpacity,
						popupCloserText: '',
						popupLoaderText: '',
						selector: '.thumb a.image',
						usePopupCaption: true,
						usePopupCloser: false,
						usePopupDefaultStyling: false,
						usePopupNav: true
					});

					_.objects.window.trigger('resize');

			},

			initMobile: function() {
				if (_.settings.autoStyleMobile) {
						_.objects
							.items
							.css('border', 'solid ' + Math.ceil(_.settings.padding / 2) + 'px ' + _.settings.paddingColor);

						_.objects.items.filter('.thumb')
							.css('margin-top', (-1 * Math.ceil(_.settings.padding / 2)) + 'px')
							.filter(':nth-child(2n)')
							.css('border-right', 0);
					}

				_.objects.items.each(function() {
					var $item = $(this), $img = $item.find('img');

					$img
						.css('opacity', 0);

					$item
						.css('background-image', 'url("' + $img.attr('src') + '")')
						.css('background-position', 'center center')
						.css('background-size', 'cover');

				});

				_.objects.reel.poptrox({
					onPopupClose: (_.settings.useBlurFilter ? (function() { _.objects.wrapper.removeClass('overlayed'); }) : null),
					onPopupOpen: (_.settings.useBlurFilter ? (function() { _.objects.wrapper.addClass('overlayed'); }) : null),
					overlayColor: _.settings.popupOverlayColor,
					overlayOpacity: _.settings.popupOverlayOpacity,
					popupSpeed: 0,
					selector: '.thumb a.image',
					useBodyOverflow: false,
					usePopupCaption: false,
					usePopupCloser: false,
					usePopupDefaultStyling: false,
					usePopupLoader: false,
					usePopupNav: false,
					windowMargin: 0
				});
			},

			init: function() {
				skel
					.breakpoints({
						desktop: '(min-width: 737px)',
						mobile: '(max-width: 736px)'
					})
					.viewport({
						breakpoints: {
							desktop: {
								width: 1200,
								scalable: false
							}
						}
					});

				_.isTouch = skel.vars.touch;
				_.IEVersion = skel.vars.IEVersion;

				$.fn.h5u_xcss = function(k, v) {
					return $(this)
						.css('-webkit-' + k, v)
						.css('-moz-' + k, v)
						.css('-o-' + k, v)
						.css('-ms-' + k, v)
						.css(k, v);
				};

				$(function() {
						_.objects.window = $(window),
						_.objects.wrapper = $('#wrapper'),
						_.objects.body = $('body'),
						_.objects.main = $('#main'),
						_.objects.reel = $('#reel'),
						_.objects.items = _.objects.main.find('.item');

						_.objects.window.on('load', function() {
							skel
								.on('+desktop', function() {
									_.initDesktop();
								})
								.on('+mobile', function() {
									_.initMobile();
								})
								.on('-desktop -mobile', function() {
									window.setTimeout(function() {
										location.reload(true);
									}, 50);
								});
						});
				});
			}
}; return _; })(jQuery);

parallelism.init();
