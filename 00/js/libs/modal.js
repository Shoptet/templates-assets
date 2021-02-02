(function(shoptet) {

    /**
     * Wrapper function to open colorbox or any other modal rendering script
     *
     * @param {Object} options
     * options = options provided to modal rendering library
     */
    function open(options) {
        // we can switch to any other library in future
        $.colorbox(options);
    }

    /**
     * Close modal window
     *
     * This function does not accept any arguments.
     */
    function close() {
        $.colorbox.close();
    }

    /**
     * Resize modal window directly
     *
     * @param {Object} options
     * options = dimensions passed to resize function
     */
    function resize(options) {
        $.colorbox.resize(options);
    }

    /**
     * Resize modal window for 1-3G
     *
     * This function does not accept any arguments.
     */
    function shoptetResize() {
        var width;
        var $colorbox = $('#colorbox');
        // 'colorbox-xs|sm|lg' is fallback for hardcoded classes in partners scripts
        if ($colorbox.hasClass('colorbox-xs') || $colorbox.hasClass(shoptet.modal.config.classXs)) {
            width = shoptet.modal.config.widthXs;
        } else if ($colorbox.hasClass('colorbox-sm') || $colorbox.hasClass(shoptet.modal.config.classSm)) {
            width = shoptet.modal.config.widthSm;
        } else if ($colorbox.hasClass('colorbox-lg') || $colorbox.hasClass(shoptet.modal.config.classLg)) {
            width = shoptet.modal.config.widthLg;
        } else {
            // colorbox.widthMd is default width of colorbox
            width = shoptet.modal.config.widthMd;
        }
        if (!detectResolution(shoptet.config.breakpoints.lg)) {
            var responsiveWidth;
            if (shoptet.abilities.about.generation === 3) {
                responsiveWidth = $('.content-wrapper').width()
            } else {
                responsiveWidth = $('#content').width() - 30
            }
            width = responsiveWidth > width ? width : responsiveWidth;
            shoptet.modal.resize({
                width: width
            });
        } else {
            shoptet.modal.resize({
                width: width
            });
        }
    }

    shoptet.modal = shoptet.modal || {};
    shoptet.scripts.libs.modal.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'modal');
    });

    shoptet.modal.config = {};
    shoptet.modal.config.opacity = 0.65;
    shoptet.modal.config.maxWidth = '98%';
    shoptet.modal.config.maxHeight = '95%';
    shoptet.modal.config.initialHeight = 480;
    shoptet.modal.config.widthXs = 300;
    shoptet.modal.config.widthSm = 500;
    shoptet.modal.config.widthMd = 700;
    shoptet.modal.config.widthLg = 1152;
    shoptet.modal.config.classXs = 'shoptet-modal-xs';
    shoptet.modal.config.classSm = 'shoptet-modal-sm';
    shoptet.modal.config.classMd = 'shoptet-modal-md';
    shoptet.modal.config.classLg = 'shoptet-modal-lg';

})(shoptet);
