(function(shoptet) {

    function isTokenExpired() {
        let t = new Date().getTime();
        let ti = shoptet.csrf.tokenIssuedAt;
        return t - ti > shoptet.csrf.tokenValidity;
    }

    function injectToken(f) {
        if (f.querySelector == undefined) {
            return;
        }

        let i = f.querySelector('[name=__csrf__]');
        if (i) {
            i.value = shoptet.csrf.token;
        } else {
            let i = document.createElement('input');
            i.setAttribute('type', 'hidden');
            i.setAttribute('name', '__csrf__');
            i.setAttribute('value', shoptet.csrf.token);
            f.appendChild(i);
        }
    }

    function validateToken() {
        var response;
        $.ajax({
            type: 'POST',
            url: shoptet.csrf.validateURL,
            data: {
                __csrf__: shoptet.csrf.token
            },
            async: false
        })
            .done(function() {
                response = true;
            })
            .fail(function() {
                response = false;
            });

        return response;
    }

    if (shoptet.csrf.enabled) {
        shoptet.csrf = shoptet.csrf || {};
        shoptet.scripts.libs.csrf.forEach(function(fnName) {
            var fn = eval(fnName);
            shoptet.scripts.registerFunction(fn, 'csrf');
        });
        shoptet.csrf.tokenIssuedAt = new Date().getTime();
        /*
            The validity has to be synced with $csrf_window in cms/packages/Security/CSRFTrait.php
            The maximum validity of the token is 6h 59m when it is generated right at the
            top of the hour; so instead we have to count with 5h 59m and subtract five more
            minutes just for sure.
         */
        shoptet.csrf.tokenValidity = 1000 * 60 * 59 * 6;

        document.addEventListener("DOMContentLoaded", function() {
            var selector;
            if (shoptet.csrf.formsSelector === '') {
                selector = 'form';
            } else {
                selector = 'form' + '.' + shoptet.csrf.formsSelector;
            }
            document.querySelectorAll(selector).forEach(function(form) {
                shoptet.csrf.injectToken(form);
            });
        });

        if (shoptet.csrf.submitListener) {
            document.addEventListener('submit', function(e) {
                if (e.target && (shoptet.csrf.formsSelector === '' || e.target.classList.contains(shoptet.csrf.formsSelector))) {
                    var prevDefaultPrevented = e.defaultPrevented;
                    e.preventDefault();
                    e.stopPropagation();
                    shoptet.csrf.injectToken(e.target);
                    if (shoptet.csrf.isTokenExpired() && !shoptet.csrf.validateToken()) {
                        var modalContent = shoptet.csrf.invalidTokenModal;
                        shoptet.modal.open({
                            html: shoptet.content.colorboxHeader + modalContent + shoptet.content.colorboxFooter,
                            className: shoptet.modal.config.classMd,
                            width: shoptet.modal.config.widthMd
                        });
                        return false;
                    }
                    if (!prevDefaultPrevented) {
                        e.target.submit();
                    }
                }
            });
        }
    }

})(shoptet);
