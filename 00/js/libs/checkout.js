(function(shoptet) {

    /**
     * Toggle another shipping address in 2nd step of order
     *
     * This function does not accept any arguments.
     */
    function toggleAnotherShipping(scroll) {
        if (typeof scroll === 'undefined') {
            scroll = true;
        }
        var $el = $('#shipping-address');
        var $billCountryId = $('#billCountryId');
        var $regionSelect = $('.region-select');

        if ($el.hasClass('visible')) {
            $el.removeClass('visible');
            toggleRequiredAttributes($el, 'remove', false);

            var defaultCountryVal = $billCountryId.find('option[data-default-option]').val();
            var defaultRegionVal = $regionSelect.find('option[data-default-option]').val();
            var $defaultBillRegionId = $('.region-select[data-country=' + defaultCountryVal + ']');
            $billCountryId.val(defaultCountryVal);
            $defaultBillRegionId.val(defaultRegionVal);
            shoptet.global.restoreDefaultRegionSelect($defaultBillRegionId, defaultRegionVal);
            shoptet.validatorZipCode.updateZipValidPattern($billCountryId);
            shoptet.validatorCompanyId.updateCompanyIdValidPattern();
        } else {
            $el.addClass('visible');
            toggleRequiredAttributes($el, 'add', false);
            if (scroll) {
                scrollToEl($el);
            }
        }

        var $billRegionId = $('#billRegionId');
        var $billRegionIdInput = $('#billRegionIdInput');
        var $billCountryIdInput = $('#billCountryIdInput');

        $billCountryId.attr('disabled', !$billCountryId.is(':disabled'));
        $regionSelect.attr('disabled', $billRegionIdInput.is(':disabled'));

        $billCountryIdInput.attr({
            'disabled': !$billCountryIdInput.is(':disabled'),
            'value': $billCountryId.find('option:selected').val()
        });
        $billRegionIdInput.attr({
            'disabled': !$billRegionIdInput.is(':disabled'),
            'value': $billRegionId.find('option:selected').val()
        });
        $('#deliveryRegionId').attr({
            'value': $billRegionId.find('option:selected').val()
        });
    }



    /**
     * Compares height of two elements
     *
     * @param {Object} $elToCompare
     * $elToCompare = element to compare
     * @param {Object} $comparedElement
     * $comparedElement = compared element
     */
    function compareHeight($elToCompare, $comparedElement) {
        return $elToCompare.height() < $comparedElement.height();
    }

    /**
     * Fix sidebar in ordering process
     *
     * This function does not accept any arguments.
     */
    function fixSidebar() {
        var windowHeight = $(window).height();
        var sidebarHeight = shoptet.checkout.$checkoutSidebar.height();
        var offset = shoptet.checkout.$checkoutContent.offset();
        var scrollTop = $(document).scrollTop();
        var headerHeight = shoptet.abilities.feature.fixed_header ? $('#header').height() : 0;
        if (windowHeight + scrollTop < document.documentElement.scrollHeight) {
            if ((offset.top < scrollTop + headerHeight) && detectResolution(shoptet.config.breakpoints.md)) {
                if (windowHeight - headerHeight > sidebarHeight) {
                    shoptet.checkout.$checkoutSidebar.css({
                        'position': 'relative',
                        'top': scrollTop - offset.top + headerHeight
                    });
                } else {
                    var bottomLine = offset.top + sidebarHeight;
                    if (windowHeight + scrollTop > bottomLine) {
                        shoptet.checkout.$checkoutSidebar.css({
                            'position': 'relative',
                            'top': scrollTop - sidebarHeight + windowHeight - offset.top
                        });
                    } else {
                        shoptet.checkout.$checkoutSidebar.css({
                            'position': 'static'
                        });
                    }
                }
            } else {
                shoptet.checkout.$checkoutSidebar.removeAttr('style');
            }
        }
    }

    /**
     * Helper function for fixing sidebar in ordering process
     *
     * This function does not accept any arguments.
     */
    function handleWithSidebar() {
        if (
            !compareHeight(shoptet.checkout.$checkoutContent, shoptet.checkout.$checkoutSidebar)
        ) {
            fixSidebar();
        } else {
            shoptet.checkout.$checkoutSidebar.removeAttr('style');
        }
    }

    shoptet.checkout = shoptet.checkout || {};
    shoptet.scripts.libs.checkout.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'checkout');
    });
    shoptet.checkout.$checkoutContent = $('#checkoutContent');
    shoptet.checkout.$checkoutSidebar = $('#checkoutSidebar');
    shoptet.checkout.handleWithSidebar = handleWithSidebar;

    document.addEventListener("DOMContentLoaded", function() {
        if (detectResolution(shoptet.config.breakpoints.md) && shoptet.checkout.$checkoutSidebar.length) {
            if (
                !compareHeight(shoptet.checkout.$checkoutContent, shoptet.checkout.$checkoutSidebar)
            ) {
                fixSidebar();
            }

            $(window).bind('scroll', function() {
                handleWithSidebar();
            });

            $('html').bind('contentResized', function() {
                if (
                    !compareHeight(shoptet.checkout.$checkoutContent, shoptet.checkout.$checkoutSidebar)
                ) {
                    fixSidebar();
                } else {
                    shoptet.checkout.$checkoutSidebar.removeAttr('style');
                }
            });
        }

        // remember customer data (via ajax)
        var $orderForm = $('#order-form');
        if ($orderForm.length) {
            var lastData = $orderForm.serialize();
            $('#order-form input').blur(function() {
                var data = $(this).closest('form').serialize();
                if (data != lastData) {
                    $.post('/action/OrderingProcess/step2CustomerAjax/', data);
                    lastData = data;
                }
            });
        }

        var $document = $(document);
        $document.on('click', '#orderFormButton', function() {
            $('#orderFormSubmit').click();
        });

        $document.on('click', '#orderFormSubmit', function() {
            var $el = $('input[name="shippingId"].choose-branch:checked');
            if ($el.length) {
                var code = $el.attr('data-code');
                var $label = $el.siblings('label');
                var $chosen = $label.find('.chosen');
                if (!$chosen.length) {
                    if ($label.find('.zasilkovna-choose').length && !$label.find('.zasilkovna-default').length) {
                        return true;
                    }
                    showMessage(shoptet.messages['choose-' + code], 'error', '', false, false);
                    scrollToEl($label);
                    return false;
                }
            }
        });

        $('#shippingAddressBox').on('change', function() {
            var $fields = $('#shipping-address .form-option-block').find('input');
            if (this.value == '-1') {
                $fields.each(function() {
                    $(this).val('');
                });
            } else {
                shoptet.checkoutShared.setFieldValues($(this).find('option:selected').data('record'));
            }
            /* Validate */
            $fields.each(function() {
                shoptet.scripts.signalNativeEvent('change', this);
            });
        }).change();

        $document.on('change', '.ordering-process #deliveryRegionId', function() {
            var $parentForm = $(this).parents('form');
            shoptet.cart.ajaxSubmitForm(
                $parentForm.attr('action'),
                $parentForm[0],
                'functionsForStep1',
                true,
                true
            );
        });

        // Change country in checkout process
        $document.on('change', '#select-country-payment select', function() {
            if ($(this).hasClass('not-ajax')) {
                return false;
            } else {
                if (
                    $('#deliveryCountryId').val() != deliveryCountryIdValue
                    ||
                    $('#payment-currency').val() != currencyCode
                ) {
                    var $parentForm = $(this).parents('form');
                    shoptet.cart.ajaxSubmitForm(
                        $parentForm.attr('action'),
                        $parentForm[0],
                        'functionsForStep1',
                        true,
                        true
                    );
                }
            }
        });
    });

})(shoptet);
