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

    function resolveCurrencySymbolPosition(symbolPosition) {
        if (typeof symbolPosition !== 'undefined') {
            return symbolPosition;
        }
        return shoptet.config.currencySymbolLeft;
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

    function formatAsCurrency(currencySymbol, currencyPosition, decimalPlaces, decimalSeparator, thousandSeparator) {
        var number = this;
        var symbol = resolveCurrencySymbol(currencySymbol);
        var positionLeft = resolveCurrencySymbolPosition(currencyPosition);
        return ((!positionLeft ? symbol : '')
            + ' ' + number.ShoptetFormatNumber(decimalPlaces, decimalSeparator, thousandSeparator)
            + (positionLeft ? (' ' + symbol) : '')).trim();
    }

    Number.prototype.ShoptetFormatNumber = formatNumber;
    Number.prototype.ShoptetFormatAsCurrency = formatAsCurrency;

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
     * @param {String} action
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

        if (action === 'increase') {
            value += (min > 1) ? 1 : min;
        } else {
            value -= (min > 1) ? 1 : min;
        }

        if (value < min || value > max) {
            return false;
        }

        el.value = shoptet.helpers.toLocaleFloat(value, decimals, true);

        if (typeof callback === 'function') {
            callback();
        }

        return true;
    }

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

    shoptet.helpers = shoptet.helpers || {};
    shoptet.scripts.libs.helpers.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'helpers');
    });

})(shoptet);
