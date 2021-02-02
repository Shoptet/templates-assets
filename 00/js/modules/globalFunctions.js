// TODO: move these declarations to filters and unify with 2G
var categoryMinValue = parseInt($('#categoryMinValue').text());
var categoryMaxValue = parseInt($('#categoryMaxValue').text());
var currencyExchangeRate = shoptet.helpers.toFloat($('#currencyExchangeRate').text());

// Colorbox defaults
// $.colorbox.settings.opacity must be identical as alpha channel of @overlay-bg in theme-variables.less
$.colorbox.settings.opacity = shoptet.modal.config.opacity;
$.colorbox.settings.maxWidth = shoptet.modal.config.maxWidth;
$.colorbox.settings.initialWidth = shoptet.modal.config.widthMd;
$.colorbox.settings.initialHeight = shoptet.modal.config.initialHeight;
shoptet.config.bodyClasses = 'user-action-visible' +
    ' navigation-window-visible' +
    ' cart-window-visible' +
    ' search-window-visible' +
    ' login-window-visible' +
    ' currency-window-visible' +
    ' language-window-visible' +
    ' register-window-visible' +
    ' menu-helper-visible' +
    ' submenu-visible' +
    ' top-navigation-menu-visible' +
    ' categories-window-visible';
/**
 * Function for displaying information messages
 *
 * @param {String} content
 * content = text of message
 * @param {String} type
 * type = part of CSS class, which defines the type of message - success, info, warning, error
 * @param {String} id
 * id = id of element affected by queued action which can be cancelled
 * @param {Boolean} cancel
 * cancel = if set to true, function renders link to cancel queued action
 * @param {Boolean} overlay
 * overlay = if set to true, message is rendered as modal over the overlayed content
 */
function showMessage(content, type, id, cancel, overlay, parent) {
    parent = parent || '.messages';
    if (typeof id === 'undefined') {
        id = '';
    }
    if (typeof cancel === 'undefined') {
        cancel = false;
    }
    if (typeof overlay === 'undefined') {
        overlay = false;
    }
    hideMsg(true);
    clearTimeout(shoptet.config.dismiss);

    if ($('.msg').length) {
        hideMsg(true);
    }

    if (cancel !== false) {
        cancel = ' <a href="#" class="cancel-action" data-id="' + id + '">' + shoptet.messages['cancel'] + '</a>';
    } else {
        cancel = '';
    }
    $('<div class="msg msg-' + type + '"><div class="container">' + content + cancel + '</div></div>').prependTo(parent);
    if (overlay === true) {
        $('<div class="overlay visible" />').appendTo('body');
        $('body').addClass('msg-visible');
    }

    dismissMessages();
}

/**
 * Function for hiding information messages
 *
 * @param {Boolean} action
 */
function hideMsg(action) {
    $('body').removeClass('msg-visible');
    if (typeof action != 'undefined') {
        $('.msg, .overlay.visible').remove();
    } else {
        $('.msg, .overlay.visible').addClass('hidden');
        setTimeout(function() {
            $('.msg, .overlay.visible').remove();
        }, shoptet.config.animationDuration);
    }

}

/**
* Dismiss messages from notifier
*
* This function does not accept any arguments.
*/
function dismissMessages() {
    shoptet.runtime.dismiss = setTimeout(function() {
        hideMsg();
    }, shoptet.config.dismissTimeout);
}

/**
 * Function for cancelling queued actions
 *
 * @param {String} id
 * id = id of element affected by cancelled action,
 * if called without id, function only hide message
 */
function cancelAction(id) {
    if (typeof id == 'undefined') {
        hideMsg();
    } else {
        $('#' + id).removeClass('hidden').removeAttr('id');
        clearTimeout(removeItem);
        hideMsg();
    }
}

/**
 * Displays spinner during the AJAX call
 *
 * This function does not accept any arguments.
 */
function showSpinner() {
    $('body').addClass('spinner-visible').append('<div class="overlay spinner"><div class="loader" /></div>');
}

/**
 * Hides spinner after the AJAX call is complete
 *
 * This function does not accept any arguments.
 */
function hideSpinner() {
    $('.overlay.spinner').addClass('invisible');
    setTimeout(function() {
        $('body').removeClass('spinner-visible');
        $('.overlay.spinner').detach();
    }, shoptet.config.animationDuration);
}

/**
 * Displays tooltips
 *
 * This function does not accept any arguments.
 */
function initTooltips() {
    $('.tooltip').hide();
    $('.show-tooltip').tooltip({
        html: true,
        placement: 'auto',
        container: 'body'
    });
}

/**
 * Detect width of system scrollbars
 *
 * This function does not accept any arguments.
 */
function getScrollBarWidth() {
    var inner = document.createElement('p');
    inner.style.width = '100%';
    inner.style.height = '200px';

    var outer = document.createElement('div');
    outer.style.position = 'absolute';
    outer.style.top = '0px';
    outer.style.left = '0px';
    outer.style.visibility = 'hidden';
    outer.style.width = '200px';
    outer.style.height = '150px';
    outer.style.overflow = 'hidden';
    outer.appendChild (inner);

    document.body.appendChild (outer);
    var w1 = inner.offsetWidth;
    outer.style.overflow = 'scroll';
    var w2 = inner.offsetWidth;
    if (w1 == w2) w2 = outer.clientWidth;

    document.body.removeChild (outer);

    return (w1 - w2);
}

/**
 * Detect width of display
 *
 * @param {Number} resolution
 * resolution = value in pixels we want to test,
 * if current resolution is bigger, function returns true
 */
function detectResolution(resolution) {
    return parseInt($(window).width()) + getScrollBarWidth() > resolution;
}

/**
 * Detect if page was scrolled
 *
 * @param {String} direction
 * direction = direction of scroll
 */
function detectScrolled(direction) {
    if (!shoptet.abilities.feature.fixed_header) {
        return;
    }
    var classToRemove;
    var top = 0;
    var adminBarHeight =
        $('.admin-bar').length
        ? $('.admin-bar').height()
        : 0;
    var topNavigationBarHeight =
        $('.top-navigation-bar').length
        ? $('.top-navigation-bar').height()
        : 0;
    detectResolution(shoptet.config.breakpoints.sm) ? top = topNavigationBarHeight + adminBarHeight : top = 0;

    if (direction === 'up') {
        classToRemove = 'scrolled-down';
    } else {
        classToRemove = 'scrolled-up';
    }

    if ($(window).scrollTop() > top) {
        $('html').addClass('scrolled scrolled-' + direction);
        $('html').removeClass(classToRemove);
        if (!$('body').hasClass('submenu-visible') && !$('body').hasClass('menu-helper-visible') ) {
            shoptet.menu.hideNavigation();
        }
    } else {
        $('html').removeClass('scrolled scrolled-up scrolled-down');
        shoptet.menu.hideSubmenu();
    }
}

/**
 * Toggle text of HTML element
 *
 * @param {Object} $el
 * $el = HTML element whose text has to be changed
 * @param {String} text
 * text = current text of an element
 * @param {String} showText
 * showText = text that has to be to displayed
 * @param {String} hideText
 * hideText = text that has to be to hidden
 */
function toggleText($el, text, showText, hideText) {
    if(text == hideText) {
        $el.attr('data-text', hideText);
        $el.html(showText);
    } else {
        $el.attr('data-text', showText);
        $el.html(hideText);
    }
}

/**
 * Toggle contact informations in ordering process
 *
 * @param {Object} $el
 * $el = HTML element which has to be changed
 */
function toggleContacts($el) {
    var text = $el.html();
    var hideText = shoptet.messages['hideContacts'];
    var showText = $el.attr('data-original-text');
    $el.siblings('.box').toggleClass('visible');
    $el.toggleClass('expanded');
    toggleText($el, text, showText, hideText);
}

var delay = (function() {
    var timer = 0;
    return function (callback, ms) {
        clearTimeout(timer);
        timer = setTimeout(callback, ms);
    };
})();

/**
* Scroll page to element
*
* @param {Object} $el
* $el = HTML element to which the page should scroll
*/
function scrollToEl($el) {
    var $message = $('.messages .msg');
    var messageHeight = $message.length ? $message.outerHeight() : 0;

    var offset = $el.offset();
    var margin = ($('#header').css('position') === 'fixed' || shoptet.abilities.feature.fixed_header)
        ? $('#header').outerHeight()
        : 0;
    if ($('.admin-bar').length && detectResolution(shoptet.config.breakpoints.sm)) {
        var adminBarHeight = $('.admin-bar').height();
    } else {
        var adminBarHeight = 0;
    }
    $('html, body').stop(true, true).animate(
        {
            scrollTop: offset.top - messageHeight - margin - adminBarHeight - 10
        },
        shoptet.config.animationDuration
    );
}

/**
* Unveil images
*
* This function does not accept any arguments.
*/
function unveilImages() {
    $('img').unveil(100, function() {
        if (!$('body').hasClass('unveiled')) {
            setTimeout(function() {
                shoptet.products.sameHeightOfProducts();
                if (detectResolution(shoptet.config.breakpoints.sm)) {
                    if ($('.carousel').length) {
                        setCarouselHeight($('.carousel-inner'));
                        $('body').addClass('carousel-set');
                    }
                }
            }, shoptet.config.unveilTimeout);
        }
        $('body').addClass('unveiled');
    });
    if ($('.carousel').length && !$('body').hasClass('carousel-set')) {
        setCarouselHeight($('.carousel-inner'));
    }
}

/**
* Set carousel height to be equal like highest image to prevent element jump after fade
*
* @param {Object} $carousel
* $carousel = carousel element
*/
function setCarouselHeight($carousel) {
    $carousel.removeAttr('style');
    var maxHeight = 0;
    $('.carousel .item').addClass('active');
    $carousel.find('img').each(function () {
        var h = $(this).height();
        if (h > maxHeight) {
            maxHeight = h;
        }
    });
    $('.carousel .item').removeClass('active');
    $('.carousel .item:first-child').addClass('active');
    $carousel.css('min-height', maxHeight);
}

/**
* Init colorbox elements
*
* This function does not accept any arguments.
*/
function initColorbox() {
    $('.variant-image a').colorbox();

    var $lightboxes = {};
    $('a[data-gallery]').each(function() {
        $lightboxes[$(this).data('gallery')] = 1;
    });

    if(!$.isEmptyObject($lightboxes)) {
        for(var key in $lightboxes) {
            $('*[data-gallery="' + key + '"]').colorbox({
                rel: key,
                maxWidth: shoptet.modal.config.maxWidth,
                width: shoptet.modal.config.widthLg,
                className: shoptet.modal.config.classLg
            });
        }
    }
}

/**
* Add space for "footer" on mobile resolution
*
* This function does not accept any arguments.
*/
function addPaddingToOverallWrapper() {
    if (!shoptet.abilities.feature.positioned_footer) {
        return;
    }
    if (!detectResolution(shoptet.config.breakpoints.sm)) {
        var topNavigationBarHeight = $('.top-navigation-bar').outerHeight();
        $('.overall-wrapper').css('padding-bottom', topNavigationBarHeight);
    } else {
        $('.overall-wrapper').css('padding-bottom', 0);
    }
}

/**
* Detect video background in header
*
* @param {Object} $video
* $video = handled video element
*/
function detectVideoBackground($video) {
    return $video.length > 0;
}

/**
* Detect video background height
*
* @param {Object} $videoWrapper
* $videoWrapper = header background video wrapper
*/
function detectVideoBackgroundHeight($videoWrapper) {
    return $videoWrapper.height();
}

/**
* Pause video (if it is not)
*
* @param {Object} $video
* $video = handled video element
*/
function pauseVideo($video) {
    if (!$video[0].paused) {
        $video[0].pause();
    }
}

/**
* Resume video (if it is not)
*
* @param {Object} $video
* $video = handled video element
*/
function resumeVideo($video) {
    if ($video[0].paused) {
        $video[0].play();
    }
}

/**
* Pause/resume header video background
*
* @param {Object} $video
* $video = handled video element
* @param {Object} $videoWrapper
* $videoWrapper = header background video wrapper
*/
function handleWithVideo($video, $videoWrapper) {
    var offset = $videoWrapper.offset();
    var scrollTop = $('body').scrollTop();
    if (offset.top + detectVideoBackgroundHeight($videoWrapper) > scrollTop) {
        // video is still in viewport
        resumeVideo($video);
    } else {
        // video is not in viewport
        pauseVideo($video);
    }
}

/*
 * Move element after selector
 */
function moveElementAfterSelector($whatSelector, $whereSelector) {
    $whatSelector.insertAfter($whereSelector);
}

function updateQueryStringParameter(key, value) {
    var url = window.location.href;
    var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    var separator = url.indexOf('?') !== -1 ? "&" : "?";

    if (url.match(re)) {
        window.location.href = url.replace(re, '$1' + key + "=" + value + '$2');
    } else {
        window.location.href = url + separator + key + "=" + value;
    }
}

/* Elements available for activating by location hash */
var availableElementsIds = ['#ratingWrapper'];
var hashUnveiledElements = [];
var hashHiddenElements = [];
hashUnveiledElements['#ratingWrapper'] = ['#rate-form'];
hashHiddenElements['#ratingWrapper'] = ['.rate-form-trigger'];

/**
 * Activate tabs by location hash
 *
 * @param {String} elementId
 * tabId = id of activated element
 */
function unveilElementByHash(elementId) {
    if ($(elementId).parents('.tab-pane').length) {
        var $el = $('[data-toggle="tab"][href="#' + $(elementId).attr('data-parent-tab') + '"]');
        $el.tab('show');
    }
    if ($(hashUnveiledElements[elementId]).length) {
        for (i = 0; i < $(hashUnveiledElements[elementId]).length; i++) {
            $(hashUnveiledElements[elementId][i]).removeClass('js-hidden');
        }
        for (i = 0; i < $(hashHiddenElements[elementId]).length; i++) {
            $(hashHiddenElements[elementId][i]).addClass('js-hidden');
        }
    }
    $(window).load(function() {
        setTimeout(function() {
            scrollToEl($(elementId));
        }, shoptet.config.animationDuration + 1);
    });
}

/**
 * Convert location.search string to JS object
 *
 * This function does not accept any arguments.
 */
function locationSearchToObject() {
    var locationSearch = window.location.search.substring(1).split("&");
    var object = {};

    locationSearch.forEach(function(pair) {
        if (pair !== '') {
            var splittedPair = pair.split("=");
            object[decodeURIComponent(splittedPair[0])] = decodeURIComponent(splittedPair[1]);
        }
    });

    return object;
}

/**
 * Get offset of an element relative to its parent
 *
 * @param {Object} $el
 * $el = element to which we want to get its position
 * @param {Object} $parent
 * $parent = optional parent element
 */
function getRelativeOffset($el, $parent) {
    if (typeof $parent === 'undefined') {
        $parent = $el.parent();
    }
    var elOffset = $el.offset();
    var parentOffset = $parent.offset();
    var relativeOffset = {};
    relativeOffset.top = elOffset.top - parentOffset.top;
    relativeOffset.left = elOffset.left - parentOffset.left;
    return relativeOffset;
}

function fixTooltipAfterChange(element) {
    $(element).tooltip('fixTitle').tooltip('setContent');
    if ($(element).hasClass('hovered')) {
        $(element).tooltip('show');
    }
}

function initDatepickers() {
    $('.datepicker.birthdate').each(function() {
        var $elem = $(this);
        $elem.datepicker({
            changeMonth: true,
            changeYear: true,
            yearRange: 'c-110;c:+0'
        });
        if ($elem.data('value')) {
            $elem.datepicker('setDate', new Date($elem.data('value')))
        }
        if ($elem.data('format')) {
            $elem.datepicker('option', 'dateFormat', $elem.data('format'))
        }
    })
}

function resizeEndCallback() {
    shoptet.products.sameHeightOfProducts();
    setTimeout(function() {
        detectFilters();
    }, 1000);
    shoptet.products.setThumbnailsDirection();
    shoptet.products.checkThumbnails(shoptet.config.thumbnailsDirection, 'set', true);
    if (detectResolution(shoptet.abilities.config.navigation_breakpoint)) {
        shoptet.menu.splitMenu();
        if ($('.overlay').length > 0) {
            shoptet.menu.toggleMenu();
        }
    }
    shoptet.products.sameHeightOfProducts();
    shoptet.products.splitWidgetParameters();

    if ($('.carousel').length) {
        setCarouselHeight($('.carousel-inner'));
    }
    shoptet.modal.shoptetResize();
    addPaddingToOverallWrapper();

    if (typeof shoptet.checkout !== 'undefined' && shoptet.checkout.$checkoutSidebar.length) {
        if (!detectResolution(shoptet.config.breakpoints.sm)) {
            shoptet.checkout.$checkoutSidebar.removeAttr('style');
        } else {
            shoptet.checkout.handleWithSidebar();
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {

    if ($('.regions-wrapper').length) {
        shoptet.global.toggleRegionsWrapper();
    }

    $('html').on('change', '#billCountryId, #deliveryCountryId', function() {
        shoptet.global.updateSelectedRegions($(this));
        shoptet.global.toggleRegionsWrapper();
        shoptet.validatorZipCode.updateZipValidPattern($(this));
    });

    var hash = window.location.hash;
    if (hash.length) {
        for (i = 0; i < availableElementsIds.length; i++) {
            availableElementsIds[i];
            if (availableElementsIds[i] === hash) {
                if ($(hash).length) {
                    unveilElementByHash(hash);
                }
                break;
            }
        }
    }

    window.onbeforeprint = unveilImages();

    if (!detectResolution(shoptet.config.breakpoints.sm)) {
        addPaddingToOverallWrapper();
    }

    detectScrolled('up');

    var lastScrollTop = 0;
    var $headerVideoWrapper = $('#videoWrapper');
    var headerVideoBackgroundExists = detectVideoBackground($headerVideoWrapper);
    if (headerVideoBackgroundExists) {
        var $headerVideo = $('#videoWrapper video');
        setTimeout(function() {
            handleWithVideo($headerVideo, $headerVideoWrapper);
        }, 1000);
    }

    $(window).scroll(function() {

        if (headerVideoBackgroundExists) {
            handleWithVideo($headerVideo, $headerVideoWrapper);
        }

        var st = $(this).scrollTop();
        if (st > lastScrollTop) {
            // downscroll code
            detectScrolled('down');
        } else {
           // upscroll code
           detectScrolled('up');
        }
        lastScrollTop = st;
    });

    unveilImages();

    $('.content-window-in').scroll(function() {
        $('img').unveil();
    });

    // Cookies agreement
    $('.CookiesOK').on('click', function(e) {
        e.preventDefault();
        shoptet.cookie.create('CookiesOK', 'agreed', {days: $('.CookiesOK').data('cookie-notice-ttl')});
        $('.cookies').fadeOut(shoptet.config.animationDuration);
        setTimeout(function() {
            $('.cookies').remove();
        }, shoptet.config.animationDuration);
        if($('.site-msg.information').length) {
            $('.site-msg.information').css('bottom', $('.site-msg.information').offset().left);
        }
    });

    // Site agreement
    $('html').on('click', '#site-agree-button', function(e) {
        e.preventDefault();
        shoptet.cookie.create(
            shoptet.config.agreementCookieName,
            'agreed',
            {days: shoptet.config.agreementCookieExpire}
        );
        shoptet.modal.close();
    });

    // Information banner
    $('.js-close-information-msg').on('click', function() {
        shoptet.cookie.create('informationBanner', '1', {days: 1});
        $('.site-msg.information').fadeOut(shoptet.config.animationDuration);
        setTimeout(function() {
            $('.site-msg.information').remove();
        }, shoptet.config.animationDuration);
    });

    if ($('.site-agreement').length) {
        if ($(this).hasClass('show-only')) {
            var showOnly = true;
        } else {
            var showOnly = false;
        }
        var content = $('.site-agreement').html();
        shoptet.modal.open({
            opacity: '.95',
            closeButton: showOnly,
            overlayClose: showOnly,
            html: shoptet.content.colorboxHeader + content + shoptet.content.colorboxFooter,
            className: shoptet.modal.config.classMd,
            width: shoptet.modal.config.widthMd,
            onClosed: function() {
                $('.site-agreement').remove();
            }
        });
    }

    $('html').on('click', '.colorbox-close', function(e) {
        e.preventDefault();
        shoptet.modal.close();
    });

    // Init form validator
    shoptet.validator.initValidator($('form'));

    // Prevent click on disabled links
    $('html').on('click', 'a.disabled', function(e) {
        e.preventDefault();
    });

    // Dismiss messages
    $('html').on('click', '.msg', function() {
        hideMsg();
    });
    $('html').on('click', '.cancel-action', function(e) {
        e.stopPropagation();
    });

    $('html').on('click', '.hide-content-windows', function(e) {
        e.preventDefault();
        shoptet.global.hideContentWindows();
    });

    $('html').on('touchend click', '.toggle-window, .toggle-window-arr, .toggle-trigger', function(e) {
        if (e.type === 'touchend' || !$(this).attr('data-redirect')) {
            e.preventDefault();
        }
        if ($(this).hasClass('hide-content-windows')) {
            shoptet.global.hideContentWindows();
            return;
        }
        var target = $(this).attr('data-target');
        if (!$(this).hasClass('hovered') || target === 'navigation') {
            shoptet.global.showPopupWindow(target, true);
        }
        $(this).removeClass('hovered');
    });

    var hidePopupWindow;
    $('html').on('mouseenter', '.popup-widget, .hovered-nav, .menu-helper', function() {
        clearTimeout(hidePopupWindow);
    });

    $('html').on('mouseleave', '.popup-widget, .hovered-nav', function() {
        if ($(this).hasClass('login-widget') || $(this).hasClass('register-widget')) {
            if ($(this).find('input:focus').length) {
                return false;
            }
        }
        hidePopupWindow = setTimeout(function() {
            $('body').removeClass(shoptet.config.bodyClasses);
        }, shoptet.config.animationDuration);
        $(this).removeClass('hovered');
    });

    $('html').on('mouseenter', '.toggle-window[data-hover="true"]', function(e) {
        $(this).addClass('hovered');
        e.preventDefault();
        clearTimeout(hidePopupWindow);
        var target = $(this).attr('data-target');
        if (!$('body').hasClass(target + '-window-visible')) {
            var show = (target === 'cart' && !$(this).hasClass('full')) ? false : true;
            shoptet.global.showPopupWindow(target, show);
        }
    });

    $('html').on('mouseleave', '.toggle-window[data-hover="true"]', function() {
        if (detectResolution(shoptet.abilities.config.navigation_breakpoint)) {
            hidePopupWindow = setTimeout(function() {
                $('body').removeClass(shoptet.config.bodyClasses);
            }, shoptet.config.animationDuration);
        }
    });

    // Close all windows with ESC key
    var escClasses = '';
    escClasses += '.user-action-visible, ';
    escClasses += '.top-navigation-menu-visible, ';
    escClasses += '.user-action-visible input:focus';
    $('html').on('keyup', escClasses, function(e) {
        if(e.keyCode === shoptet.common.keyCodes.escape) {
            $('body').removeClass(shoptet.config.bodyClasses);
            if ($('.overlay').length > 0) {
                $('.overlay').detach();
            }
            if ($('.msg').length > 0) {
                hideMsg();
            }
        }
    });
    $('html').on('keyup', 'input, textarea', function(e) {
        e.stopPropagation();
    });

    $('#carousel').on('slide.bs.carousel', function () {
        $('#carousel img').each(function(){
            var $this = $(this);
            $this.attr('src', $this.attr('data-src'));
        });
    });

    // Go to detail of a highlighted product, Tango template only
    $('html').on('click', '.js-product-clickable', function(e) {
        e.stopPropagation();
        if ($(e.target).hasClass('js-product-clickable')) {
            window.location.href = $('a.name', this).attr('href');
        }
    });

    // Show/hide more in top products
    $('html').on('click', '.products-top .button-wrapper .toggle-top-products', function(e) {
        e.preventDefault();
        var $this = $(this);
        if ($this.parents().siblings('.inactive').length) {
            $this.parents().siblings('.inactive').addClass('revealed').removeClass('inactive');
        } else {
            $this.parents().siblings('.revealed').addClass('inactive').removeClass('revealed');
        }
        var text = $this.text();
        var hideText = text;
        var showText = $this.attr('data-text');
        toggleText($this, text, showText, hideText);
    });

    $('html').on('click', '.cancel-action', function(e) {
        e.preventDefault();
        id = $(this).attr('data-id');
        if (id === '') {
            cancelAction();
        } else {
            cancelAction(id);
        }
    });

    // Unveil hidden elements
    $('html').on('change, click', '[data-unveil]', function(e) {
        var $this = $(this);
        if ($this.context.localName === "a") {
            e.preventDefault();
        }
        if ($this.attr('data-unveil') === 'category-filter-hover') {
            $this.parent('.filter-section').hide();
        }
        $('#' + $this.attr('data-unveil')).toggleClass('visible');
        if ($this.attr('data-unveil') === 'filters') {
            if ($('#filters').hasClass('visible')) {
                $('body').addClass('filters-visible');
            } else {
                $('body').removeClass('filters-visible');
            }
        }
        if ($this.parents('.unveil-wrapper').length) {
            $this.parents('.unveil-wrapper').toggleClass('unveiled');
        }
        if ($this.attr('data-text')) {
            toggleText($this, $this.text(), $this.text(), $this.attr('data-text'));
        }
        $('html').trigger('contentResized');
    });

    $('html').on('click', '.js-window-location', function(e) {
        e.preventDefault();
        window.location.href = $(this).attr('data-url');
    });

    // Tooltips
    initTooltips();

    // Colorbox
    initColorbox();

    // Tabs
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        var href = e.target.getAttribute('href');
        // Auto open comment form if no comments exists
        var $discussionForm = $(href).find('.discussion-form');
        var $discussionContent = $(href).find('.vote-wrap');
        if ($discussionForm.length) {
            if (!$discussionContent.length) {
                $('.add-comment .comment-icon').trigger('click');
            }
        }
        var external = e.target.getAttribute('data-external');
        var forceScroll = e.target.getAttribute('data-force-scroll');
        $(href + ' img').unveil();
        if (external) {
            $('.shp-tabs > li').removeClass('active');
            $('.shp-tabs > li > a[href="' + href + '"]').parents('li').addClass('active');
        }
        if($(this).parents('.responsive-nav').length > 0) {
            var parentUl = $(this).parents('ul:first');
            $(this).parents('.responsive-nav').find('ul').not(parentUl).find('li').removeClass('active');
        }
        if (!detectResolution(shoptet.config.breakpoints.sm) || forceScroll) {
            scrollToEl($(href).parents('.shp-tabs-wrapper'));
        }
        if (typeof shoptet.products.sameHeightOfProducts === 'function') {
            shoptet.products.sameHeightOfProducts();
        }
        shoptet.products.splitWidgetParameters();

    });

    // Toggle categories menu
    $('html').on('click', '#categories .expandable:not(.external) > a > span, #categories .expandable:not(.external) > .topic > a > span',  function(e) {
        e.stopPropagation();
        e.preventDefault();
        $(this).closest('.expandable').toggleClass('expanded');
    });

    $('html').on('click', '.link-icon.chat, .link-icon.watchdog', function(e) {
        e.preventDefault();
        shoptet.modal.open({
            href: $(this).attr('href'),
            width : shoptet.modal.config.widthSm,
            className: shoptet.modal.config.classSm,
            onComplete: function() {
                shoptet.validator.initValidator($('form'));
            }
        });
    });

    $('html').on('click', 'a.colorbox, a.p-main-image.cbox', function(e) {
        e.preventDefault();
        shoptet.modal.open({
            href: $(this).attr('href'),
            maxWidth: shoptet.modal.config.maxWidth,
            width : shoptet.modal.config.widthLg,
            className: shoptet.modal.config.classLg
        });
    });

    // Print page
    $('.link-icon.print').on('click', function(e) {
        e.preventDefault();
        window.print();
    });

    $('html').on('click', '.toggle-contacts', function() {
        toggleContacts($(this));
        $('html').trigger('contentResized');
    });

    $('html').on('click', '.toggle-contacts > a', function(e) {
        e.preventDefault();
    });


    // Open share window by clickin' on social icons
    $('html').on('click', '.share a', function(e) {
        e.preventDefault();
        window.open($(this).attr('href'), '', 'width=600, height=600');
    });

    // Affiliate center
    $('.html-code textarea').click(function() {
        $(this).focus().select();
    });
    $('html').on('click', '.url-generation-box .btn', function() {
        var $container = $(this).closest('.affiliate-banner');
        var $newHtmlCodeContainer = $container.find('.url-generation-box .html-code').clone(true, true);
        var val = new String($newHtmlCodeContainer.find('textarea').val());

        $newHtmlCodeContainer.removeClass('no-display').addClass('generated').find('textarea').val(val);
        $container.find('.generated').remove();
        $container.append($newHtmlCodeContainer);
    });

    if ($('#onlinePaymentButton').length) {
        // Redirect from recapitulation page to provider's online payment after 5 seconds
            if (!$('#onlinePaymentButton').parents('.suspend-redirect').length) {
                var paymentTimeout = setTimeout(function () {
                    shoptet.events.paymentButtonClicked = true;
                    window.location.href = $('#onlinePaymentButton').attr('href');
                }, 5000);
        }

        // Confirm before page unload on recapitulation page with online payment button
        $('#onlinePaymentButton').click(function() {
            if (shoptet.events.paymentButtonClicked) {
                return false;
            }

            shoptet.events.paymentButtonClicked = true;
            if (paymentTimeout) {
                clearTimeout(paymentTimeout);
            }
        });
        window.onbeforeunload = function() {
            if (typeof(shoptet.events.paymentButtonClicked) === 'undefined') {
                return '';
            }
        };
    }

    if($('.query-string-param').length) {
        $('.query-string-param a').click(function(e) {
            e.preventDefault();

            var params = $(this).attr('href').split('=');
            updateQueryStringParameter(params[0], params[1]);
        });
    }

    var search = window.location.search;
    if (search.length) {
        var searchValues = locationSearchToObject();
        if (searchValues.email) {
            $('input[name="email"]').val(searchValues.email);
        }
        if (searchValues.buyerName) {
            $('input[name="fullName"]').val(searchValues.buyerName);
        }
        if (searchValues.preselectStars) {
            var numberOfStars = parseInt(searchValues.preselectStars);

            $('.star-wrap .star').removeClass('star-on current').addClass('star-off');
            $('.rate-list').removeClass('current');
            $('.rate-list .star').removeClass('star-on current').addClass('star-off');
            for (var i = 1; i <= numberOfStars; i++) {
                var ratingElementStar = $('.star-wrap [data-score="' + i + '"]');
                ratingElementStar.removeClass('star-off').addClass('star-on');
                if (i === numberOfStars) {
                    ratingElementStar.addClass('current');

                    var rateList = $('.rate-list [data-score="' + i + '"]');
                    var rateListStar = $('.rate-list[data-score="' + i + '"] .star');
                    rateList.addClass('current');
                    rateListStar.removeClass('star-off').addClass('star-on');
                }
            }
        }
    }

    $('html').on('click', '.js-scroll-top', function(e) {
        e.preventDefault();
        var $target;
        var $trigger = $(this);
        if (typeof $trigger.attr("data-target") !== 'undefined') {
            $target = $($trigger.attr("data-target"));
        } else {
            if ($('#products').length) {
                $target = $('#products');
            } else if ($('#newsWrapper').length) {
                $target = $('#newsWrapper');
            } else if ($('#ratingWrapper').length) {
                $target = $('#ratingWrapper');
            } else if ($('.products').length) {
                $target = $('.products');
            }
        }

        if ($target.length === 0) {
            return false;
        }

        scrollToEl($target);
    });

    $('html').on('click', '.toggle-coupon-input-button', function(e) {
        $(this).next('.discount-coupon').slideToggle();
        $(this).toggleClass('discount-coupon-visible');
    });

    initDatepickers();

    if ($('.site-msg.information').length && $('.site-msg.cookies').length) {
        var msgOffset = $('.cookie-ag-wrap').outerHeight() + $('.site-msg.information').offset().left;
        $('.site-msg.information').css('bottom', msgOffset);
    }

    /* thumbnail function override */
    $('.show360image').on('click', function() {
        $('.p-thumbnails-inner a.p-thumbnail').removeClass('highlighted');
        $(this).addClass('highlighted');
        $(this).parents('.p-image-wrapper').find('.p-image').hide();
        $(this).parents('.p-image-wrapper').find('.image360').show();
    });

});

// Necessary for split/simple variants - unify with 2nd gen
function resolveImageFormat() {
    return true;
}

(function(shoptet) {

    /**
     * Hide window displayed by user interaction
     *
     * @param {String} target
     * target = part of selector of affected HTML element
     */
    function hideContentWindows(target) {
        var classesToRemove = shoptet.config.bodyClasses;
        if (typeof target !== 'undefined') {
            classesToRemove = classesToRemove.replace(target, '');
        }
        $('body').removeClass(classesToRemove);
    }

    /**
     * Helper function for displaying/hiding user action windows on hover
     *
     * @param {String} target
     * target = part of selector of affected HTML element
     * @param {Boolean} show
     * show = when set to true, function will only hide other windows (used for empty cart)
     *
     */
    function showPopupWindow(target, show) {
        shoptet.global.hideContentWindows(target);

        if (!show) {
            return false;
        }

        if (target === 'cart') {
            //hide EU cookies
            if (!detectResolution(shoptet.config.breakpoints.md)) {
                $('.cookies').hide();
            }
            if (typeof shoptet.events.cartLoaded === 'undefined') {
                shoptet.events.cartLoaded = true;
                $('body').addClass('ajax-pending');
                var callback = function() {
                    // Track FB pixel for templates with extended AJAX cart
                    if (typeof shoptet.content.initiateCheckoutData !== 'undefined') {
                        if (typeof fbq !== 'undefined') {
                            fbq('track', 'InitiateCheckout', shoptet.content.initiateCheckoutData);
                            delete shoptet.content.initiateCheckoutData;
                        }
                    }
                    $('body').removeClass('ajax-pending');
                };
                setTimeout(function() {
                    shoptet.cart.getCartContent(false, callback);
                }, 0);
            }
        }

        if (target === 'navigation') {
            if (!$('body').hasClass('navigation-window-visible')) {
                setTimeout(function() {
                    $(document).trigger('menuUnveiled');
                }, shoptet.config.animationDuration);
            }
        }
        var currentTarget = target + '-window-visible';
        if ($('body').hasClass(currentTarget)) {
            $('body').removeClass('user-action-visible');
        } else {
            $('body').addClass('user-action-visible');
        }
        $('body').toggleClass(target + '-window-visible');
        if (target === 'search' && $('body').hasClass('search-window-visible')) {
            setTimeout(function() {
                $('.content-window .search .search-form input').focus();
            }, shoptet.config.animationDuration);
        }
        if (target === 'register') {
            if ($('.user-action-register .loader').length) {
                var successCallback = function(response) {
                    var requestedDocument = shoptet.common.createDocumentFromString(response.getPayload());
                    var content =  $(requestedDocument).find("#register-form");
                    $('.user-action-register .loader').remove();
                    content.appendTo('.place-registration-here');
                    if (!$('#additionalInformation').hasClass('visible')) {
                        toggleRequiredAttributes($('#additionalInformation'), 'remove', false);
                    }
                    shoptet.validator.initValidator($('#register-form'));
                    initDatepickers();
                    shoptet.scripts.signalDomLoad('ShoptetDOMRegisterFormLoaded');
                };
                shoptet.ajax.makeAjaxRequest(
                    shoptet.config.registerUrl,
                    shoptet.ajax.requestTypes.get,
                    '',
                    {
                        'success': successCallback
                    },
                    {
                        'X-Shoptet-XHR': 'Shoptet_Coo7ai'
                    }
                );
            }
        }
        // Unveil images after the window is displayed
        $('.content-window img, .user-action img').unveil();
        $('.content-window img, .user-action img').trigger('unveil');
    }

    /**
     * Update regions by clickin' on "Another shipping" in ordering process
     *
     * @param {Object} $el
     * $el = Country select element which has changed
     */
    function updateSelectedRegions($el) {
        if ($el.attr('id') === 'billCountryId') {
            inputPrefix = 'bill';
            $('#billCountryIdInput').attr('disabled', true);
        } else if ($el.attr('id') === 'deliveryCountryId') {
            var inputPrefix = 'delivery';
            $('#deliveryCountryIdInput').attr('disabled', true);
        } else {
            return false;
        }

        var id = $el.find('option:selected').val();
        $('.region-select').attr({
            'disabled': true,
            'id': '',
            'name': ''
        }).addClass('hide');
        $('.region-select[data-country="' + id + '"]').attr({
            'disabled': false,
            'id': inputPrefix + 'RegionId',
            'name': inputPrefix + 'RegionId'
        }).removeClass('hide');
    }

    /**
     * Toggle regions wrapper
     *
     * This function does not accept any arguments.
     */
    function toggleRegionsWrapper() {
        var $regionsWrapper = $('.regions-wrapper');
        var allRegions = $regionsWrapper.find('select');
        var invisibleRegions = $regionsWrapper.find('select.hide');
        if (allRegions.length > invisibleRegions.length) {
            $regionsWrapper.show();
        } else {
            $regionsWrapper.hide();
        }
    }

    /**
     * Restore default regions by clickin' on "Another shipping" in ordering process
     *
     * @param {Object} $el
     * $el = Default region select
     * @param {String} val
     * val = Default region value
     */
    function restoreDefaultRegionSelect($el, val) {
        $('#billRegionIdInput').val(val);
        $('.region-select').addClass('hide');
        $el.removeClass('hide');
        shoptet.global.toggleRegionsWrapper();
    }

    shoptet.global = shoptet.global || {};
    shoptet.scripts.libs.global.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'global');
    });

})(shoptet);
