(function(shoptet) {
    var myCustomRuntimeObject = {};
    myCustomRuntimeObject.updated = false;
    // create content of modal
    var modalContent = document.createElement('div');
    var link = document.createElement('a');
    link.innerText = 'My custom link text';
    link.addEventListener('click', function (e) {
        e.preventDefault();
        // do all your necessary stuff here
        myCustomRuntimeObject.branchId = Math.ceil(Math.random(2) * 10);
        myCustomRuntimeObject.label =
            'Label of branch' + myCustomRuntimeObject.branchId;
        myCustomRuntimeObject.price = {
            withVat: 100,
            withoutVat: 82.64
        };
        // mark change of shipping here
        myCustomRuntimeObject.updated = true;
        shoptet.modal.close();
    });
    modalContent.appendChild(link);

    // do not ever rewrite shoptet nor shoptet.externalShipping object
    shoptet.externalShipping = shoptet.externalShipping || {};
    // `externalShippingTwo` - required shipping name in camelCase
    // must be identical as code of external shipping
    shoptet.externalShipping.externalShippingTwo = {
        modalContent: modalContent,
        onComplete: function(el) {
            // code executed after the modal is fully loaded
            // you have access to element containing your shipping method details
            console.log(el);
            // shoptet.modal.resize() has to be the last called function
            shoptet.modal.resize();
        },
        onClosed: function(el) {
            if (myCustomRuntimeObject.updated) {
                // set all necessary details about shipping
                // and fire event to update prices and labels in checkout
                var ev = new CustomEvent(
                    'ShoptetExternalShippingChanged',
                    {
                        detail: {
                            price: myCustomRuntimeObject.price,
                            branch: {
                                id: myCustomRuntimeObject.branchId,
                                label: myCustomRuntimeObject.label
                            }
                        }
                    }
                );
                el.dispatchEvent(ev);
                myCustomRuntimeObject.updated = false;
            }
        }
    };
    // parameters modalContent, onComplete and onClosed are required
    // optionally you can use also modalWidth and modalClass parameters
    // default values are shoptet.modal.config.widthMd and shoptet.modal.config.classMd

    // below are examples of events you should listen to
    // ShoptetBaseShippingInfoObtained is fired only once after page load
    // ShoptetShippingMethodUpdated and ShoptetBillingMethodUpdated are fired every time
    // when the shipping/billing method is changed/confirmed; even if it is caused by your shipping method
    document.addEventListener('ShoptetBaseShippingInfoObtained', function() {
        console.log(
            '%cdeliveryCountryId: ' + shoptet.checkoutShared.deliveryCountryId,
            'color: violet; font-size: 16px;'
        );
        console.log(
            '%cregionCountryId: ' + shoptet.checkoutShared.regionCountryId,
            'color: violet; font-size: 16px;'
        );
        console.log(
            '%ccurrencyCode: ' + shoptet.checkoutShared.currencyCode,
            'color: violet; font-size: 16px;'
        );
    });
    document.addEventListener('ShoptetShippingMethodUpdated', function() {
        console.log('%cactiveShipping:', 'color: orangered; font-size: 16px;');
        // currently the shoptet.checkoutShared.activeShipping is HTML div element containing
        // all information about shipping, you can access necessary information by query selector
        console.log(shoptet.checkoutShared.activeShipping);
    });
    document.addEventListener('ShoptetBillingMethodUpdated', function() {
        // currently the shoptet.checkoutShared.activeBilling is HTML div element containing
        // all information about billing, you can access necessary information by query selector
        console.log('%cactiveBilling:', 'color: orangered; font-size: 16px;');
        console.log(shoptet.checkoutShared.activeBilling);
    });
})(shoptet);
