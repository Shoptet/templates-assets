(function(shoptet) {

    function toFloat(value) {
        if (typeof(value) !== 'string') {
            value = value + '';
        }
        return parseFloat(value.replace(shoptet.config.decSeparator, '.'));
    }

    function toLocaleFloat(value, decimals, trim) {
        if (typeof value === 'number') {
            value = value.toFixed(decimals === 'undefined' ? 0 : decimals).toString();

            if (trim && value.indexOf('.') != -1) {
                value = value.replace(/\.?0*$/, '');
            }
            return value.replace('.', shoptet.config.decSeparator);
        }
        return value;
    }

    function resolveDecimalSeparator(decimalSeparator) {
        if (typeof decimalSeparator !== 'undefined') {
            return decimalSeparator;
        }
        return shoptet.config.decSeparator;
    }

    function resolveThousandSeparator(thousandSeparator) {
        if (typeof thousandSeparator !== 'undefined') {
            return thousandSeparator;
        }
        return shoptet.config.thousandSeparator;
    }

    function resolveDecimalPlaces(decimalPlaces) {
        if (typeof decimalPlaces !== 'undefined') {
            if (!isNaN(decimalPlaces)) {
                return Math.abs(decimalPlaces);
            }
        }
        if (!isNaN(shoptet.config.decPlaces)) {
            return Math.abs(shoptet.config.decPlaces);
        }
        return 0;
    }

    function resolveCurrencySymbol(symbol) {
        if (typeof symbol !== 'undefined') {
            return symbol;
        }
        return shoptet.config.currencySymbol;
    }

    function resolveCurrencySymbolPosition(symbolPositionLeft) {
        if (typeof symbolPositionLeft !== 'undefined') {
            return symbolPositionLeft;
        }
        return parseInt(shoptet.config.currencySymbolLeft);
    }

    function formatNumber(decimalPlaces, decimalSeparator, thousandSeparator) {
        var number = this;
        var decSep, decPlaces;
        var thSep = resolveThousandSeparator(thousandSeparator);
        if (!Number.isInteger(number.valueOf())) {
            decSep = resolveDecimalSeparator(decimalSeparator);
            decPlaces = resolveDecimalPlaces(decimalPlaces);
        } else {
            decSep = 0;
            decPlaces = 0;
        }
        var s = number < 0 ? '-' : '';
        var i = parseInt(number = Math.abs(+number || 0).toFixed(decPlaces)) + '';
        var j = (j = i.length) > 3 ? j % 3 : 0;
        return s + (j ? i.substr(0, j) + thSep : '')
            + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thSep)
            + (decPlaces ? decSep + Math.abs(number - i).toFixed(decPlaces).slice(2) : '');
    }

    /**
     * Format currency the same way as on backend
     * If you omit all arguments, default values of currency will be used
     *
     * @param {String} currencySymbol
     * currencySymbol = symbol or code of currency
     * @param {Boolean} currencyPositionLeft
     * currencyPositionLeft = whether the symbol is located left to the number
     * @param {Number} decimalPlaces
     * decimalPlaces = number of decimal places
     * @param {String} decimalSeparator
     * decimalSeparator = separator of decimals
     * @param {String} thousandSeparator
     * thousandSeparator = separator of thousands
     */
    function formatAsCurrency(
        currencySymbol,
        currencyPositionLeft,
        decimalPlaces,
        decimalSeparator,
        thousandSeparator
    ) {
        var number = this;
        var symbol = resolveCurrencySymbol(currencySymbol);
        var positionLeft = resolveCurrencySymbolPosition(currencyPositionLeft);
        return ((positionLeft ? symbol : '')
            + number.ShoptetFormatNumber(decimalPlaces, decimalSeparator, thousandSeparator)
            + (!positionLeft ? (' ' + symbol) : '')).trim();
    }

    function roundForSk(price) {
        if (price == 0) {
            return 0.00;
        }

        if (Math.abs(price) <= 0.02) {
            return 0.05 * price / Math.abs(price);
        }

        return Math.round(price * 100 / 5) / 100 * 5;
    }

    function roundForHu(price) {
        return Math.round(price / 5) * 5;
    }

    // @see PriceHelper.php::roundForDocumentWithMode()
    function roundForDocument(rounding = Number(shoptet.config.documentsRounding), documentPriceDecimalPlaces = Number(shoptet.config.documentPriceDecimalPlaces)) {
        var number = this;
        var pow = Math.pow(10, documentPriceDecimalPlaces);

        switch (rounding) {
            case 1:
                return Math.ceil(number * pow) / pow;
            case 2 :
                return Math.floor(number * pow) / pow;
            case 3 :
                return Math.round(number *  pow) / pow;
            case 4 :
                return roundForHu(number);
            case 5 :
                return roundForSk(number);
            default:
                return number;
        }
    }

    Number.prototype.ShoptetFormatNumber = formatNumber;
    Number.prototype.ShoptetFormatAsCurrency = formatAsCurrency;
    Number.prototype.ShoptetRoundForDocument = roundForDocument;

    function resolveMinimumAmount(decimals) {
        switch (decimals) {
            case 1:
                return 0.1;
            case 2:
                return 0.01;
            case 3:
                return 0.001;
            default:
                return 1;
        }
    }

    /**
     * Increase/decrease quantity of products in input
     * by clickin' on arrows
     * Decimals, min and max values are passed by data-attributes
     *
     * @param {Object} el
     * el = input field that have to be updated
     * @param {Number} min
     * decimals = minimum allowed amount
     * @param {Number} max
     * max = maximum allowed amount
     * @param {Number} decimals
     * decimals = allowed decimal places
     * @param {'increase'|'decrease'} action - accepts 'increase' or 'decrease'
     * action = accepts 'increase' or 'decrease'
     * @param {Function} callback
     * callback = optional callback after quantity update
     */
    function updateQuantity(el, min, max, decimals, action, callback) {
        var value = shoptet.helpers.toFloat(el.value);

        if (isNaN(value)) {
            return false;
        }

        var decimals = typeof decimals !== 'undefined'
            ? toFloat(decimals) : 0;

        var min = typeof min !== 'undefined'
            ? toFloat(min) : resolveMinimumAmount(decimals);
        var max = typeof max !== 'undefined'
            ? toFloat(max) : toFloat(shoptet.config.defaultProductMaxAmount);

        var quantity = shoptet.helpers.toFloat($(el).attr('data-quantity'));
        var diff = quantity - value;

        value = updateQuantityInner(value, min, decimals, action);

        if (!isNaN(quantity)) {
            quantity = updateQuantityInner(quantity, min, decimals, action);
            value = quantity;
        }

        if (value < min) {
            if (action === 'decrease') {
                $(el).siblings('.js-decrease-tooltip').tooltip('show');
                $(el).siblings('.js-remove-pcs-tooltip').tooltip().show();
                return false;
            }
            value = min;
        } else if(value > max) {
            if (action === 'increase') {
                $(el).siblings('.js-increase-tooltip').tooltip('show');
                $(el).siblings('.js-add-pcs-tooltip').tooltip().show();
                return false;
            }
            value = max;
        } else {
            shoptet.variantsCommon.hideQuantityTooltips();
        }

        if (!isNaN(quantity)) {
            $(el).attr('data-quantity', quantity);
            value = quantity - diff;
        }

        el.value = value;

        if (typeof callback === 'function') {
            callback();
        }

        return true;
    }

    /**
     * Increase/decrease quantity of products in input
     *
     * @param {number} value - current value 
     * @param {number} min - minimum allowed amount
     * @param {number} decimals - allowed decimal places
     * @param {'increase'|'decrease'} action - accepts 'increase' or 'decrease'
     * @returns {number} - new value
     */
    function updateQuantityInner(value, min, decimals, action) {
        if (action === 'increase') {
            value += (min > 1) ? 1 : min;
        } else if (action === 'decrease') {
            value -= (min > 1) ? 1 : min;
        }

        return shoptet.helpers.toFloat(value.toFixed(decimals));
    }

    $('html').on('click', function(e){
        if(!$(e.target).is('.decrease, .increase, .remove-pcs, .add-pcs')){
            if($('.tooltip').length) {
                shoptet.variantsCommon.hideQuantityTooltips();
            }
        }
    })

    $('.cart-widget, .product').on('mouseleave', function() {
        if($('.tooltip').length) {
            shoptet.variantsCommon.hideQuantityTooltips();
        }
    });

    document.addEventListener('ShoptetCartUpdated', function() {
        if($('.tooltip').length) {
            shoptet.variantsCommon.hideQuantityTooltips();
        }
    });

    function isTouchDevice() {
        var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
        var mq = function(query) {
            return window.matchMedia(query).matches;
        };
        if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
            return true;
        }
        var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
        return mq(query);
    }

    function enableUpdatePreview(updateCode) {
      shoptet.cookie.create(`update_management_preview_${updateCode}`, 1, { years: 1 })
      window.location.reload()
    }

    function isApplePayAvailable() {
        try {
            if (window.ApplePaySession && window.ApplePaySession.canMakePayments()) {
                return true;
            }

            return false;
        } catch (err) {
            return false;
        }
    }

    shoptet.helpers = shoptet.helpers || {};
    shoptet.scripts.libs.helpers.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'helpers');
    });

})(shoptet);
