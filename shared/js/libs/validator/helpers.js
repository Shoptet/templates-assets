/**
 * Required fields in registration process - required only when visible
 *
 * @param {Object} $el
 * $el = element containing fields that have to be required
 * @param {String} job
 * job = accepts 'remove' and 'add', specifies if we want to
 * add or remove required attributes
 * @param {Boolean} preserveNoJsValidation
 */
window.toggleRequiredAttributes = ($el, job, preserveNoJsValidation) => {
    if (job === 'remove') {
        $.each($el.find(':required'), function() {
            $(this).removeAttr('required').attr('data-required', 'required');
            $(this).addClass('js-validate');
        });
        $.each($el.find('.js-validate'), function() {
            shoptet.validator.removeErrorMessage(this);
            $(this).addClass('js-validation-suspended')
                .removeClass('js-error-field')
                .attr(
                    'data-original-value',
                    $(this).val()
                ).attr(
                    'data-original-autocomplete',
                    $(this).attr('autocomplete')
                ).attr(
                    'autocomplete',
                    'autocomplete-off'
                ).val('');
        });
        if (!preserveNoJsValidation) {
            $.each($el.find('[data-disabled-validation]'), function() {
                $(this).addClass('no-js-validation');
                $(this).removeAttr('data-disabled-validation');
            });
        }
    } else {
        $.each($el.find('[data-required]'), function() {
            $(this).removeAttr('data-required').attr('required', 'required');
        });
        $.each($el.find('.js-validation-suspended'), function() {
            $(this).removeClass('js-validation-suspended').attr(
                'autocomplete',
                $(this).attr('data-original-autocomplete')
            ).val($(this).attr('data-original-value'))
                .removeAttr('data-original-autocomplete').removeAttr('data-original-value');
            $(this)[0].dispatchEvent(new Event('change'));
        });
        if (!preserveNoJsValidation) {
            $.each($el.find('.no-js-validation'), function() {
                $(this).removeClass('no-js-validation');
                $(this).attr('data-disabled-validation', true);
            });
        }
    }
}
