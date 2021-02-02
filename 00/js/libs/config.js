(function(shoptet) {
    shoptet.config = shoptet.config || {};
    shoptet.config.animationDuration = 300;
    shoptet.config.dismissTimeout = 6000;
    shoptet.config.unveilTimeout = shoptet.custom.config.unveilTimeout || 1000;
    shoptet.config.adminBarTimeout = 800;

// Must be identically as media query breakpoints in CSS
    shoptet.config.breakpoints = {};
    shoptet.config.breakpoints.xs = 479;
    shoptet.config.breakpoints.sm = 767;
    shoptet.config.breakpoints.md = 991;
    shoptet.config.breakpoints.lg = 1199;
    shoptet.config.breakpoints.xl = 1439;

    shoptet.config.updateQuantityTimeout = 1000;

})(shoptet);
