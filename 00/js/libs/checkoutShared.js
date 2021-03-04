(function(shoptet) {

    /**
     * Set active shipping and payment
     * Used in ordering process, step 2
     *
     * This function does not accept any arguments.
     */
    function setActiveShippingAndPayments() {
        if (shoptet.abilities.elements.recapitulation_in_checkout) {
            var container = '<div id="shipping-billing-summary" class="order-recapitulation"></div>';
            $('.order-summary-item.price').before(container);
        }
        var $shippingAndBillingTables = $('.shipping-billing-table');
        $shippingAndBillingTables.each(function() {
            if ($(this).find('input[type="radio"]:checked').length) {
                $(this).find('input[type="radio"]:checked').closest('.radio-wrapper').addClass('active');
            } else {
                // For case when selected method was inactivated in the meantime
                // and there is no checked input
                $(this).find('input[type="radio"]').first().closest('.radio-wrapper').addClass('active');
            }
        });
        shoptet.checkoutShared.callShippingBillingRelations();
    }

    /**
     * Call relations between shipping and billing
     * Used in ordering process, step 2
     *
     * This function does not accept any arguments.
     */
    function callShippingBillingRelations() {
        var billingIds = $('#order-shipping-methods .radio-wrapper.active')
            .find('input:checked').attr('data-relations');
        shoptet.checkoutShared.changePaymentRelations(billingIds);
    }

    /**
     * Activate payments related to selected shipping,
     * deactivate others
     *
     * @param {String} billingIds
     * billingIds = ids of possible payments of selected shipping
     */
    function changePaymentRelations(billingIds) {
        if (billingIds) {
            $('#order-billing-methods .radio-wrapper').addClass('inactive-child');
            $('.billing-name').addClass('inactive');
            $('.billing-name').removeClass('active');
            var $radios = $('input[name="billingId"], input[name="gopayPayInstrument"]');
            $radios.prop('disabled', true);
            $('.table-payu').css('display', 'none');

            billingIds = billingIds.split(',');
            $.each(billingIds, function(i) {
                var val = $.trim(billingIds[i]);
                $('#billingId-' + val).prop('disabled', false);
                //gopay radio
                $('.billingId-' + val).prop('disabled', false);
                // Adding class to a label
                var $activeBilling = $('.name-billingId-' + val);
                $activeBilling.removeClass('inactive').addClass('active');
                $activeBilling.parents('.radio-wrapper').removeClass('inactive-child');
            });
            // Checked GoPay inputs switches billingId attriute of hidden input
            if ($('#order-billing-methods .radio-wrapper.active').find('input[name="gopayPayInstrument"]').length) {
                $('.gopay-billing').attr('name', 'billingId');
            } else {
                $('.gopay-billing').removeAttr('name');
                $('input[name="gopayPayInstrument"]').prop('checked', false);
            }
            // Payu table and inputs behavior
            if (!$('#payu-template label').hasClass('inactive')) {
                $('.table-payu').css('display', 'block');
            }
            if (!$('#payu-template').hasClass('active')) {
                $('#payu-template input').prop('checked', false);
            }
        }
        shoptet.checkoutShared.checkIsSelectedActive();
    }

    /**
     * Replacing chosen shipping&billing
     * Used in ordering process, step 1
     *
     * This function does not accept any arguments.
     */
    function replacingChosenShippingAndBilling() {
        var $shippingAndBillingTables = $('.shipping-billing-table');
        var $shippingAndBillingSummary = $('#shipping-billing-summary');
        $shippingAndBillingSummary.html('');
        $shippingAndBillingTables.each(function() {
            var $activeLine = $(this).find('.radio-wrapper.active');
            if (!$activeLine.length) {
                // TODO: remove this if it doesn't appear in test
                var err = 'Should not happen. Please let @vracovsky know how you were able to display '
                + 'this error message. Code: replacingChosenShippingAndBilling';
                console.error(err);
                $activeLine = $(this).find('.radio-wrapper:first');
                $activeLine.find('input').prop('checked', true);
            }
            var tableCode = $activeLine.closest('.shipping-billing-table').attr('data-type-code');
            var ev;
            if (tableCode === 'shipping') {
                // Shipping
                ev = 'ShoptetShippingMethodUpdated';
                shoptet.checkoutShared.activeShipping = $activeLine[0];
            } else {
                // Billing
                ev = 'ShoptetBillingMethodUpdated';
                shoptet.checkoutShared.activeBilling = $activeLine[0];
            }
            shoptet.scripts.signalCustomEvent(ev);
            var activeLineText = $activeLine.find('.shipping-billing-name').clone();
            activeLineText.find('.question-tooltip').remove();
            activeLineText = activeLineText.text();
            var singleLine;
            singleLine = '<div class="recapitulation-single recapitulation-shipping-billing">'
                + '<span class="recapitulation-shipping-billing-label">'
                + $activeLine.closest('.shipping-billing-table').attr('data-type')
                + ':</span> <strong class="recapitulation-shipping-billing-info"><span>'
                + $activeLine.find('.payment-shipping-price').html()
                + '</span> ' + activeLineText + '</strong></div>';
            $shippingAndBillingSummary.append(singleLine);
        });
        $shippingAndBillingSummary.find('.recapitulation-single:last').addClass('last');
        shoptet.checkoutShared.displaySelectedPriceByShippingBillingMethods();
    }

    /**
     * Display price corresponding to selected shipping and billing methods
     *
     * This function does not accept any arguments.
     */
    function displaySelectedPriceByShippingBillingMethods() {
        if ($('#order-shipping-methods').length) {
            var shippingActive = '';
            var billingActive = '';
            var $activeShippingEl = $('#order-shipping-methods .radio-wrapper.active');
            var $activeBillingEl = $('#order-billing-methods .radio-wrapper.active');

            if ($activeShippingEl.length) {
                shippingActive = $activeShippingEl.data('id');
            }

            if ($activeBillingEl.length) {
                billingActive = $activeBillingEl.data('id');
            }

            if (shippingActive !== '') {
                shippingActive = shippingActive.replace('shipping-', '');
            }

            if (billingActive !== '') {
                billingActive = billingActive.replace('billing-', '');
            }

            shoptet.checkoutShared.updatePriceSummary(shippingActive, billingActive);
        }
    }

    /**
     * Check if selected billing method is active
     * Used in ordering process, step 2
     *
     * This function does not accept any arguments.
     */
    function checkIsSelectedActive() {
        if ($('#order-billing-methods .radio-wrapper.active label').hasClass('inactive')) {
            $('#order-billing-methods .radio-wrapper.active input').prop('checked', false);
            $('#order-billing-methods .radio-wrapper.active').removeClass('active');
            var checkerLocker = 0;
            $('#order-billing-methods .radio-wrapper').each(function() {
                if (checkerLocker === 0 && !$(this).find('label').hasClass('inactive')) {
                    $(this).find('input').prop('checked', true);
                    $(this).addClass('active');
                    checkerLocker = 1;
                }
            });
        }
        shoptet.checkoutShared.replacingChosenShippingAndBilling();
    }

    /**
     * PayU handling
     * Used in ordering process, step 1
     *
     * This function does not accept any arguments.
     */
    function payu() {
        var payuTable = document.getElementById('payu_');
        var payuTemplate = document.getElementById('payu-template');
        if (payuTable && payuTemplate) {
            payuTemplate.appendChild(payuTable);
            if (payuTemplate.querySelector('input[name="billingId"]:checked')) {
                if (payuTable.querySelector('input[value="' + shoptet.config.payuPayType + '"]')) {
                    // If the PayU payment method is specified we check it...
                    payuTable.querySelector('input[value="' + shoptet.config.payuPayType + '"]').checked = true;
                } else {
                    // ...otherwise we check the first possible payment method
                    payuTable.querySelector('input').checked = true;
                }
            }
            payuTable.addEventListener('mousedown', function(e) {
                e.stopPropagation();
            });
            var payuInputs = payuTable.querySelectorAll('.table-payu input');
            if (payuInputs) {
                for (var i = 0; i < payuInputs.length; i++) {
                    payuInputs[i].addEventListener('mousedown', function(e) {
                        e.stopPropagation();
                        var activeLine = document.querySelector('.payu-billing-info');
                        if (!activeLine.classList.contains('active')) {
                            document.querySelector(
                                '#order-billing-methods .radio-wrapper.active input'
                            ).checked = false;
                            document.querySelector(
                                '#order-billing-methods .radio-wrapper.active'
                            ).classList.remove('active');
                            activeLine.classList.add('active')
                            activeLine.querySelector('input').checked = true;
                            shoptet.checkoutShared.replacingChosenShippingAndBilling();
                        }
                    });
                }
            }
        }
    }

    /**
     * Used in ordering process
     *
     * This function does not accept any arguments.
     */
    function getStatedValues() {
        deliveryCountryIdValue = $('#deliveryCountryId').val();
        regionCountryIdValue = $('#deliveryRegionId').val();
        currencyCode = $('#payment-currency').val();
        shoptet.checkoutShared.deliveryCountryId = deliveryCountryIdValue;
        shoptet.checkoutShared.regionCountryId = regionCountryIdValue;
        shoptet.checkoutShared.currencyCode = currencyCode;
        shoptet.scripts.signalCustomEvent('ShoptetBaseShippingInfoObtained');
    }

    /**
     * Fill form values in 2nd step
     *
     * @param {Object} $fields
     * $fields = JSON object with selected delivery address
     */
    function setFieldValues($fields) {
        if (!$fields) {
            return false;
        }
        for (key in $fields) {
            if ($fields.hasOwnProperty(key)) {
                if (document.getElementById(key)) {
                    var field = $('#'+key);
                    field.val($fields[key]);
                }
            }
        }
    }

    function displayApplePay() {
        try {
            if (window.ApplePaySession && window.ApplePaySession.canMakePayments()) {
                $('.apple-pay').show();
            }
        } catch (err) {}
    }

    function updatePrice(e) {
        var priceHolder = e.target.querySelector('.payment-shipping-price');
        priceHolder.innerHTML = e.detail.price.withVat.ShoptetFormatAsCurrency();
        priceHolder.setAttribute('data-shipping-price', e.detail.price.withVat);
        priceHolder.setAttribute('data-shipping-price-wv', e.detail.price.withoutVat);
        var priceNotSpecified = e.target.querySelector('.shipping-price-not-specified');
        if (priceNotSpecified) {
            priceNotSpecified.classList.remove('shipping-price-not-specified');
        }
        shoptet.checkoutShared.afterPriceChange();
    }

    /**
     * Recalculate price summary in ordering process
     *
     * @param {String} shippingActive
     * shippingActive = id of selected shipping method
     * @param {String} billingActive
     * billingActive = id of selected billing method
     */
    function updatePriceSummary(shippingActive, billingActive) {
        var shippingPrice = document.querySelector('[data-shipping-price-id="' + shippingActive + '"]');
        var billingPrice = document.querySelector('[data-billing-price-id="' + billingActive + '"]');
        var cartPriceWithVat = document.querySelector('[data-price-total]');
        var cartPriceWithoutVat = document.querySelector('[data-price-total-wv]');
        if (cartPriceWithoutVat === null) {
            // Workaround for non VAT payers
            cartPriceWithoutVat = document.createElement('span');
        }
        // TODO:
        var shippingPriceNotSpecified = shippingPrice.querySelector('.shipping-price-not-specified');
        var prices = {
            shipping: {
                withVat: Number(shippingPrice.getAttribute('data-shipping-price')),
                withoutVat: Number(shippingPrice.getAttribute('data-shipping-price-wv'))
            },
            billing: {
                withVat: Number(billingPrice.getAttribute('data-billing-price')),
                withoutVat: Number(billingPrice.getAttribute('data-billing-price-wv'))
            },
            cart: {
                withVat: Number(cartPriceWithVat.getAttribute('data-price-total')),
                withoutVat: Number(cartPriceWithoutVat.getAttribute('data-price-total-wv')),
            }
        };
        // TODO: improve not specified behavior
        var calculatedPriceWithVat = prices.shipping.withVat + prices.billing.withVat + prices.cart.withVat;
        if (shoptet.config.documentsRounding !== "0") {
            calculatedPriceWithVat = Math.round(calculatedPriceWithVat);
        }
        var calculatedPriceWithoutVat = prices.shipping.withoutVat + prices.billing.withoutVat + prices.cart.withoutVat;
        cartPriceWithVat.innerHTML = shippingPriceNotSpecified ? shoptet.messages.specifyShippingMethod
            : calculatedPriceWithVat.ShoptetFormatAsCurrency();
        cartPriceWithoutVat.innerHTML = shippingPriceNotSpecified ? shoptet.messages.specifyShippingMethod
            : calculatedPriceWithoutVat.ShoptetFormatAsCurrency();
    }

    function afterPriceChange() {
        shoptet.checkoutShared.callShippingBillingRelations();
    }

    function setupExternalShipping() {
        var externalShippingWrappers = document.querySelectorAll('[data-external-script="true"]');
        if (externalShippingWrappers) {
            for (var i = 0; i < externalShippingWrappers.length; i++) {
                (function(i) {
                    externalShippingWrappers[i].addEventListener(
                        'ShoptetExternalShippingChanged',
                        function(e) {
                            var branchInfo = e.target.querySelector('.specify-shipping-method');
                            branchInfo.classList.add('chosen');
                            var branchLabel = branchInfo.querySelector('.specified-shipping-method-branch');
                            var idInput = e.target.querySelector('.external-shipping-method-branch-id');
                            var labelInput = e.target.querySelector('.external-shipping-method-branch-label');
                            var priceInputWithVat =
                                e.target.querySelector('.external-shipping-method-branch-price-with-vat');
                            var priceInputWithoutVat =
                                e.target.querySelector('.external-shipping-method-branch-price-without-vat');
                            var shippingPrice = e.target.querySelector('.payment-shipping-price');
                            shippingPrice.setAttribute(
                                'data-shipping-price',
                                e.detail.price.withVat
                            );
                            shippingPrice.setAttribute(
                                'data-shipping-price-wv',
                                e.detail.price.withoutVat
                            );
                            branchLabel.innerHTML = e.detail.branch.label;
                            idInput.setAttribute('value', e.detail.branch.id);
                            labelInput.setAttribute('value', e.detail.branch.label);
                            priceInputWithVat.setAttribute('value', e.detail.price.withVat);
                            priceInputWithoutVat.setAttribute('value', e.detail.price.withoutVat);
                            shoptet.checkoutShared.updatePrice(e);
                        }
                    );
                })(i);
            }
        }

        var specifyLinks = document.querySelectorAll('.specify-shipping-method');
        if (specifyLinks) {
            for (var i = 0; i < specifyLinks.length; i++) {
                (function(i) {
                    var link = specifyLinks[i];
                    link.addEventListener('click', function(e) {
                        e.preventDefault();
                        var $parentsElement = $(this).closest('.radio-wrapper');
                        $parentsElement[0].dispatchEvent(new CustomEvent('ShoptetShipping_ShippingMethodSelected'));
                    });
                })(i);
            }
        }
    }

    /**
     * Assign functionality to links of external shippings
     *
     * @param {Object} wrapper
     * wrapper = external shipping method (.radio-wrappper)
     * @param {Object} link
     * link = link to update selected shipping
     * @param {Object} e
     * e = fired event
     */
    function handleExternalShippingLinks(wrapper, link, e) {
        if (!link.classList.contains('chosen') || e.target.closest('a')) {
            var externalScriptId = wrapper.getAttribute('data-external-script-code');
            try {
                var externalScript = shoptet.externalShipping[externalScriptId];
                shoptet.modal.open({
                    html: externalScript.modalContent,
                    width: externalScript.modalWidth || shoptet.modal.config.widthMd,
                    className: externalScript.modalClass || shoptet.modal.config.classMd,
                    onComplete: function() {
                        externalScript.onComplete(wrapper)
                    },
                    onClosed: function() {
                        externalScript.onClosed(wrapper)
                    }
                });
            } catch (ex) {
                console.error(ex);
            }
        } else {
            shoptet.checkoutShared.afterPriceChange();
        }
    }

    /**
     * Attach event listeners and add functionality for elements in checkout
     *
     * This function does not accept any arguments.
     */
    function setupDeliveryShipping() {
        var $document = $(document);
        if (typeof personalCollectionUrl !== 'undefined') {
            $document.on('click', '.personal-collection-choose-branch a', function(e) {
                e.preventDefault();
                var $parentsElement = $(this).closest('.radio-wrapper');
                $parentsElement.find('.personal-collection-choose-branch[name="shippingId"]').prop('checked', true);
                shoptet.checkoutShared.chooseABranchModal(
                    personalCollectionUrl,
                    '#personal-collection-wrapper',
                    '#personalCollectionPointId',
                    '.personal-collection-point-id'
                );
            });

            $document.on('click', '#personal-collection-wrapper a.enabled', function(e) {
                e.preventDefault();
                var pointId = $(this).data('point-id');
                var pointTitle = $(this).data('point-title');
                var completePointName = shoptet.messages['chosenBranch'] + ': ' + pointTitle + ' ';
                var changePointLink = $('<a href="#" class="chosen">' + shoptet.messages['change'] + '</a>');
                $('.personal-collection-choose-branch').html(completePointName).append(changePointLink);
                $('.personal-collection-point-id').val(pointId);
                shoptet.modal.close();
            });

        }

        var postDeliveryPoints = [];
        if (typeof naPostuUrl !== 'undefined') {
            postDeliveryPoints.push({
                prefix: 'na-postu',
                url: naPostuUrl
            });
        }
        if (typeof doBalikovnyUrl !== 'undefined') {
            postDeliveryPoints.push({
                prefix: 'do-balikovny',
                url: doBalikovnyUrl
            });
        }
        if (typeof hupostPostaPontUrl !== 'undefined') {
            postDeliveryPoints.push({
                prefix: 'posta-pont',
                url: hupostPostaPontUrl
            });
        }

        for (var i = 0; i < postDeliveryPoints.length; i++) {
            (function(i) {
                $document.on('click', '.' + postDeliveryPoints[i].prefix + '-choose-post a', function(e) {
                    e.preventDefault();
                    $parentsElement = $(this).closest('.radio-wrapper');
                    shoptet.modal.open({
                        maxWidth: shoptet.modal.config.maxWidth,
                        href: postDeliveryPoints[i].url,
                        width: shoptet.modal.config.widthMd,
                        className: shoptet.modal.config.classMd,
                        onComplete: function() {
                            shoptet.modal.resize();
                        }
                    });
                });
                $document.on(
                    'click',
                    '#' + postDeliveryPoints[i].prefix + '-result .'
                    + postDeliveryPoints[i].prefix + '-choose-button',
                    function() {
                        var $tr = $(this).closest('tr');
                        var address = $.trim($tr.find('.' + postDeliveryPoints[i].prefix + '-address').html());
                        var newString = shoptet.messages['chosenPost'] + ' ' + address + ' ';
                        var $newLink = $('<a href="#" class="chosen">' + shoptet.messages['change'] + '</a>');
                        $parentsElement.find('.' + postDeliveryPoints[i].prefix + '-choose-post')
                            .html(newString).append($newLink).show(0);
                        if (postDeliveryPoints[i].prefix === 'posta-pont') {
                            var branchId = $.trim($tr.find('.' + postDeliveryPoints[i].prefix + '-branch-id').html());
                            $('#' + postDeliveryPoints[i].prefix + '-hidden').val(branchId);
                        } else {
                            var zipCode = $.trim($tr.find('.' + postDeliveryPoints[i].prefix + '-zip-code').html());
                            $('#' + postDeliveryPoints[i].prefix + '-hidden').val(zipCode);
                        }
                        shoptet.modal.close();
                    }
                );
            })(i);
        }

        if (typeof ulozenkaUrl !== 'undefined') {

            $document.on('click', '.ulozenka-choose a', function(e) {
                e.preventDefault();
                $parentsElement = $(this).closest('.radio-wrapper');
                shoptet.checkoutShared.chooseABranchModal(
                    ulozenkaUrl + '?id=' + $parentsElement.find('.ulozenka-choose-branch').attr('value')
                    + '&deliveryCountryId=' + $('#deliveryCountryId').val(),
                    '#ulozenka-wrapper',
                    '#branchId',
                    '.ulozenka-branch-id'
                );
            });

            $document.on('submit', '#ulozenka-form', function(e) {
                e.preventDefault();
                var name = $('#ulozenka-wrapper .branch-name').text();
                var newString = shoptet.messages['chosenBranch'] + ': ' + name + ' ';
                var $newLink = $('<a href="#" class="chosen">' + shoptet.messages['change'] + '</a>');
                $parentsElement.find('.ulozenka-choose').html(newString).append($newLink).show(0);
                $parentsElement.find('.ulozenka-branch-id').val($('#branchId option:selected').val());
                shoptet.checkoutShared.modalMagic();
            });

            $document.on('change', '#branchId', function() {
                var id = $('option:selected', this).val();
                if ($.trim(id) != '') {
                    $('#ulozenka-form .loader').removeClass('no-display');
                    $('#ulozenka-form .branch-saved').removeClass('branch-saved-visible').addClass('no-display');
                    $.ajax({
                        url: '/action/Ulozenka/getBranchInformation/?id=' + id,
                        type: 'GET',
                        success: function(responseData) {
                            $('#ulozenka-wrapper .detail-information').html(responseData);
                            $('#ulozenka-form .loader').addClass('no-display');
                            $('#ulozenka-form .branch-saved').addClass('branch-saved-visible')
                                .removeClass('no-display');
                            $('#ulozenka-form').submit();
                            shoptet.modal.resize();
                        },
                        error: function() {
                            showMessage(shoptet.messages['ajaxError'], 'warning', '', false, false);
                            $('#ulozenka-form .loader').addClass('no-display');
                        }
                    });
                }
            });

        }

        if (typeof zasilkovnaUrl !== 'undefined') {
            $document.on('click', '.zasilkovna-choose a', function(e) {
                e.preventDefault();
            });
        }

        if (typeof glsParcelShopUrl !== 'undefined') {
            var glsParcelShopId = '';
            var glsParcelShopName = '';
            var glsModalOpen = false;

            $document.on('click', '.gls-parcel-shop-choose a', function(e) {
                e.preventDefault();
                if (glsModalOpen) {
                    return;
                }
                glsModalOpen = true;
                $parentsElement = $(this).closest('.radio-wrapper');
                shoptet.modal.open({
                    href: glsParcelShopUrl,
                    width : shoptet.modal.config.widthLg,
                    className: shoptet.modal.config.classLg,
                    onComplete: function() {
                        shoptet.modal.resize();
                    },
                    onCleanup: function() {
                        glsModalOpen = false;
                        if (glsParcelShopId) {
                            var completeBranchName = glsParcelShopName + ' ';
                            var $newLink = $('<a href="#" class="chosen">' + shoptet.messages['change'] + '</a>');
                            $parentsElement.find('.gls-parcel-shop-choose')
                                .html(completeBranchName).append($newLink).show(0);
                            $('input#gls-parcel-shop-hidden').val(glsParcelShopId);
                        }
                    }
                });
            });

            $document.on('click', '.gls-parcel-shop-confirm', function() {
                shoptet.modal.close();
            });

            window.glsPSMap_OnSelected_Handler = function(data) {
                glsParcelShopId = data.pclshopid;
                glsParcelShopName = data.name;
                $('#psitems-canvas > div:not(#' + glsParcelShopId + ')')
                    .removeClass('psSelected').removeClass('psOver');
                var $confirmWrapper = $('.gls-parcel-shop-confirm-wrapper');
                if ($confirmWrapper.hasClass('no-display')) {
                    $('.gls-parcel-shop-confirm-wrapper').removeClass('no-display');
                    shoptet.modal.resize();
                }
            }
        }

        if (typeof dpdParcelShopUrl !== 'undefined') {

            $document.on('click', '.dpd-cz-parcel-shop-choose a', function(e) {
                e.preventDefault();
                $parentsElement = $(this).closest('.radio-wrapper');
                shoptet.checkoutShared.chooseABranchModal(
                    dpdParcelShopUrl,
                    '#dpd-cz-parcel-shop-wrapper',
                    '#dpdParcelShopBranchId',
                    '.dpd-cz-branch-id'
                );
            });

            $document.on('submit', '#dpd-cz-parcel-shop-form', function(e) {
                e.preventDefault();
                var branchName = $('#dpd-cz-parcel-shop-wrapper .branch-name').text();
                var branchStreet = $('#dpd-cz-parcel-shop-wrapper .branch-street').text();
                var branchCity = $('#dpd-cz-parcel-shop-wrapper .branch-city').text();
                var branchZip = $('#dpd-cz-parcel-shop-wrapper .branch-zip').text();
                var completeBranchName = shoptet.messages['chosenBranch'] + ': '
                    + branchCity + ' ' + branchName + ' (' + branchStreet + ', ' + branchZip + ' ' + branchCity + ') ';
                var $newLink = $('<a href="#" class="chosen">' + shoptet.messages['change'] + '</a>');
                $parentsElement.find('.dpd-cz-parcel-shop-choose').html(completeBranchName).append($newLink).show(0);
                $parentsElement.find('.dpd-cz-branch-id').val($('#dpdParcelShopBranchId option:selected').val());
                shoptet.checkoutShared.modalMagic();
            });

            $document.on('change', '#dpdParcelShopBranchId', function() {
                var id = $('option:selected', this).val();
                if ($.trim(id) !== '') {
                    $('#dpd-cz-parcel-shop-form .loader').removeClass('no-display');
                    $('#dpd-cz-parcel-shop-form .branch-saved').removeClass('branch-saved-visible');
                    $.ajax({
                        url: '/action/DpdParcelShop/getBranchInformation/?id=' + id,
                        type: 'GET',
                        success: function(responseData) {
                            $('#dpd-cz-parcel-shop-wrapper .detail-information').html(responseData);
                            $('#dpd-cz-parcel-shop-form .loader').addClass('no-display');
                            shoptet.modal.resize();
                            $('#dpd-cz-parcel-shop-form .branch-saved').addClass('branch-saved-visible');
                            $('#dpd-cz-parcel-shop-form').submit();
                        },
                        error: function() {
                            showMessage(shoptet.messages['ajaxError'], 'warning', '', false, false);
                            $('#dpd-cz-parcel-shop-form .loader').addClass('no-display');
                        }
                    });
                }
            });

        }

        if (typeof isDpdOnSaturday !== 'undefined') {
            // TODO: check this!
            $document.on('click', '.dpd-check-zip a', function(event) {
                event.preventDefault();
                $('#dpd-zip-check-modal .dpd-zip-check-result').hide();
                $('#dpd-zip-check-text').val('');
                $('#dpd-zip-check-modal').show();
                shoptet.modal.open({
                    maxWidth: shoptet.modal.config.maxWidth,
                    width: shoptet.modal.config.widthLg,
                    className: shoptet.modal.config.classLg,
                    inline: true,
                    href: '#dpd-zip-check-modal',
                    onClosed: function() {
                        $('#dpd-zip-check-modal').hide();
                    }
                });
            });

            $('#dpd-zip-check-modal form').on('submit', function(event) {
                event.preventDefault();
                $('#dpd-zip-check-modal .dpd-zip-check-result').hide();
                var zip = $('#dpd-zip-check-text').val();
                if (zip !== '') {
                    $.ajax({
                        url: '/action/DpdPrivate/checkSaturdayZipCode/?zipCode=' + zip,
                        success: function(response) {
                            if (response == '1') {
                                $('#dpd-zip-check-valid').show();
                            } else {
                                $('#dpd-zip-check-invalid').show();
                            }

                            shoptet.modal.resize();
                        },
                        error: function() {
                        }
                    });
                }

            });
        }

        if (typeof pplPartnerUrl !== 'undefined') {
            $document.on('click', '.ppl-choose a', function(e) {
                e.preventDefault();
                $parentsElement = $(this).closest('.radio-wrapper');
                shoptet.checkoutShared.chooseABranchModal(
                    pplPartnerUrl,
                    '#ppl-partner-cz-wrapper',
                    '#pplPartnerBranchId',
                    '#ppl-partner-cz-branch-id'
                );
            });

            $document.on('submit', '#ppl-partner-cz-form', function(e) {
                e.preventDefault();
                var name = $('#ppl-partner-cz-wrapper .branch-name').text();
                var newString = shoptet.messages['chosenBranch'] + ': ' + name + ' ';
                var $newLink = $('<a href="#" class="chosen">' + shoptet.messages['change'] + '</a>');
                $parentsElement.find('.ppl-choose').html(newString).append($newLink).show(0);
                $('#ppl-partner-cz-branch-id').val($('#pplPartnerBranchId option:selected').val());
                shoptet.checkoutShared.modalMagic();
            });

            $document.on('change', '#pplPartnerBranchId', function() {
                var id = $('option:selected', this).val();
                if ($.trim(id) != '') {
                    $('#ppl-partner-cz-form .loader').removeClass('no-display');
                    $('#ppl-partner-cz-form .branch-saved').removeClass('branch-saved-visible');
                    $.ajax({
                        url: '/action/PplPartner/getBranchInformation/?id=' + id,
                        type: 'GET',
                        success: function(responseData) {
                            $('#ppl-partner-cz-wrapper .detail-information').html(responseData);
                            $('#ppl-partner-cz-form .loader').addClass('no-display');
                            shoptet.modal.resize();
                            $('#ppl-partner-cz-form .branch-saved').addClass('branch-saved-visible');
                            $('#ppl-partner-cz-form').submit();
                        },
                        error: function() {
                            showMessage(shoptet.messages['ajaxError'], 'warning', '', false, false);
                            $('#ppl-partner-cz-form .loader').addClass('no-display');
                        }
                    });
                }
            });

        }
    }

    /**
     * Handler for choosing branches
     *
     * @param {String} href
     * href = href of loaded colorbox
     * @param {String} branchWrap
     * branchWrap = parent element of displayed select, which has to be focused
     * @param {String} branchId
     * branchId = id of selected branch
     * @param {String} branchInput
     * branchInput = selector of input element holding selected branch id
     * branchInput = selector of input element holding selected branch id
     */
    function chooseABranchModal(href, branchWrap, branchId, branchInput) {
        shoptet.modal.open({
            maxWidth: shoptet.modal.config.maxWidth,
            maxHeight: shoptet.modal.config.maxHeight,
            width: shoptet.modal.config.widthMd,
            className:shoptet.modal.config.ClassMd,
            href: href,
            onComplete: function() {
                $(branchWrap + ' select:first').focus();
                $(branchId + ' option[value="' + $(branchInput).val() + '"]').attr('selected', 'selected');
                $(branchId).trigger('change');
            }
        });
    }

    /**
     * Handler for dynamic resize of modal window
     *
     * This function does not accept any arguments.
     */
    function modalMagic() {
        if ($('.branch-saved:visible').length) {
            $('.branch-saved').click(function() {
                shoptet.modal.close();
            });
        }
        return false;
    }

    document.addEventListener('DOMContentLoaded', function() {
        shoptet.checkoutShared.getStatedValues();
        shoptet.checkoutShared.setActiveShippingAndPayments();
        shoptet.checkoutShared.displayApplePay();
        shoptet.checkoutShared.setupDeliveryShipping();
        shoptet.checkoutShared.payu();
        shoptet.checkoutShared.setupExternalShipping();
        if (typeof changeCountryAndRegions === 'function') {
            changeCountryAndRegions();
        }
        var elements = document.querySelectorAll('.shipping-billing-table .radio-wrapper');
        for (var i = 0; i < elements.length; i++) {
            elements[i].addEventListener('mousedown', function(e) {
                e.stopPropagation();
                var label = this.querySelector('label');
                if (label.classList.contains('inactive')) {
                    return false;
                }
                var table = this.closest('.shipping-billing-table');
                var activeWrappers = table.querySelectorAll('.radio-wrapper.active');
                if (activeWrappers) {
                    for (var i = 0; i < activeWrappers.length; i++) {
                        activeWrappers[i].classList.remove('active');
                        activeWrappers[i].querySelector('label').classList.remove('active');
                        var inputs = activeWrappers[i].querySelectorAll('input[name="billingId"]');
                        for (var i = 0; i < inputs.length; i++) {
                            inputs[i].checked = false;
                        }
                    }
                }
                this.classList.add('active');
                var input = this.querySelector('input[name="billingId"]');
                if (!input) {
                    input = this.querySelector('input[name="shippingId"]');
                }
                if (input) {
                    if (!input.checked) {
                        input.checked = true;
                    }
                    if (input.classList.contains('payu')) {
                        var payuTable = document.querySelector('.table-payu');
                        if (payuTable && !payuTable.querySelector('input:checked')) {
                            // Check the first specific PayU billing method
                            payuTable.querySelector('input[name="pay_type"]').checked = true;
                        }
                    }
                }
                var link = this.querySelector('a');
                if (this.getAttribute('data-external-script-code')) {
                    shoptet.checkoutShared.handleExternalShippingLinks(this, link, e);
                } else {
                    shoptet.checkoutShared.callShippingBillingRelations();
                    if (link) {
                        if (
                            link.classList.contains('zasilkovna-name')
                            && !link.querySelector('.zasilkovna-default')
                        ) {
                            return;
                        }
                        if (!link.classList.contains('chosen') || e.target instanceof HTMLAnchorElement) {
                            var ev = new CustomEvent('click', { bubbles: true });
                            link.dispatchEvent(ev);
                        }
                    }
                }
            });
        }
    });

    shoptet.checkoutShared = shoptet.checkoutShared || {};
    shoptet.scripts.libs.checkoutShared.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'checkoutShared');
    });

})(shoptet);
