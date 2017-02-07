/**
 * Stand alone polyfill allow only numbers on input of type number.
 *
 * While input filtering is already supported by default by some browsers, maximum length has not been implemented by
 * any. This script will solve both issue and make sure that only digits can be entered in input elements of type
 * number. If the optional attribute `max` is set, it will calculate it's length and mimic the `maxlength` behavior on
 * input of type text.
 *
 * Supports:
 *
 *  - Browsers: IE8+ and any other browsers.
 *
 * Limitations:
 *
 * - Must use an addEventListener polyfill (e.g. https://github.com/nbouvrette/eventListenerPolyfill) for IE8 support.
 * - Must use HTML5shiv (https://github.com/afarkas/html5shiv) for IE8 support.
 *
 * Usage:
 *
 * <input type="number" id="number" min="0" max="100">
 * <script>
 *     var number = document.getElementById("number");
 *     inputTypeNumberPolyfill.polyfillElement(number);
 * </script>
 */
window.inputTypeNumberPolyfill = {

    /**
     * Does the clipboard contain a numerical value?
     *
     * @private
     *
     * @param {Event} event - The paste event triggering this method.
     */
    clipboardIsNumeric: function (event) {
        event = (event) ? event : window.event;
        var clipboardData = (event.clipboardData) ? event.clipboardData.getData('Text') : window.clipboardData.getData('Text');
        var isNumber = /^\d+$/.test(clipboardData);
        return (isNumber);
    },

    /**
     * Is the clipboard data bigger than the element's maximum length?
     *
     * @private
     *
     * @param {Event} event - The paste event triggering this method.
     * @param {HTMLElement|HTMLInputElement} element - The HTML element.
     */
    eventIsBlockedByMaxWhenPasting: function (event, element) {
        var maximumValueLength = this.getMaxValueLength(element);
        if (maximumValueLength) {
            event = (event) ? event : window.event;
            var clipboardData = (event.clipboardData) ? event.clipboardData.getData('Text') : window.clipboardData.getData('Text');
            var clipboardDataLength = (typeof clipboardData == 'undefined') ? 0 : clipboardData.length;
            var selectedTextLength = this.getSelectedTextLength(event, element);
            return ((element.value.length + clipboardDataLength - selectedTextLength) > maximumValueLength);
        }
        return false;
    },

    /**
     * Get the selected text length.
     *
     * @private
     *
     * There are multiple bugs linked to selection in all major current browsers. This method works around the
     * documented problems mentioned below:
     *
     * - Chrome: http://stackoverflow.com/questions/21177489/selectionstart-selectionend-on-input-type-number-no-longer-allowed-in-chrome
     * - Firefox: https://bugzilla.mozilla.org/show_bug.cgi?id=85686
     *
     * @param {Event|KeyboardEvent} event - The event triggering this method.
     * @param {HTMLElement|HTMLInputElement} element - The HTML element.
     *
     * @returns {Number} Returns the selected text length or 0 when unable to get it.
     */
    getSelectedTextLength: function (event, element) {
        var selectionLength = 0;

        try {
            // Used by Firefox and modern IE (using a Chrome workaround).
            selectionLength = (element.selectionEnd - element.selectionStart);
            selectionLength = (typeof selectionLength == 'number' && !isNaN(selectionLength)) ? selectionLength : 0;
        } catch (error) {
        }

        if (!selectionLength) {
            if (window.getSelection) {
                // Used by Chrome.
                var selection = window.getSelection();
                selectionLength = (selection == 'undefined') ? 0 : selection.toString().length;
            } else if (document.selection && document.selection.type != 'None') {
                // Used IE8.
                var textRange = document.selection.createRange();
                selectionLength = textRange.text.length;
            }
        }

        return selectionLength;
    },

    /**
     * Is the next typed character blocked by element's maximum length?
     *
     * @private
     *
     * @param {KeyboardEvent} event - The Keyboard event triggering this method.
     * @param {HTMLElement|HTMLInputElement} element - The HTML element.
     */
    eventIsBlockedByMaxWhenTyping: function (event, element) {
        var maximumValueLength = this.getMaxValueLength(element);
        if (maximumValueLength) {
            event = (event) ? event : window.event;
            var selectedTextLength = this.getSelectedTextLength(event, element);
            var characterLength = this.getCharCodeLength(event);
            return ((element.value.length - selectedTextLength + characterLength) > maximumValueLength);
        }
        return false;
    },

    /**
     * Does the element have a max attribute set? And if it is valid, what is its length.
     *
     * @private
     *
     * @param {HTMLElement|HTMLInputElement} element - The HTML element.
     */
    getMaxValueLength: function (element) {
        var maximumValue = element.getAttribute('max');
        if (!maximumValue || !/^\d+$/.test(maximumValue)) {
            return 0;
        } else {
            return maximumValue.length;
        }
    },

    /**
     * Is the event's character a digit?
     *
     * @private
     *
     * @param {KeyboardEvent} event - The Keyboard event triggering this method.
     */
    eventKeyIsDigit: function (event) {
        event = (event) ? event : window.event;
        var keyCode = (event.which) ? event.which : event.keyCode;
        return (this.codeIsADigit(keyCode) || this.charCodeIsAllowed(event));
    },

    /**
     * Is a given keyboard event code (charCode or keyCode) a digit?
     *
     * @private
     *
     * @param {Number|Object} code - The Keyboard event key code.
     */
    codeIsADigit: function (code) {
        var stringCode = String.fromCharCode(code);
        return /^\d$/.test(stringCode);
    },

    /**
     * Is the charCode of this event allowed?
     *
     * @private
     *
     * Some browsers already filter keys for input of type number which means some `onkeypress` event will never get
     * triggered. For other browsers (e.g. Firefox) we need to filter which keys are pressed to only allow digits and
     * any other non typeable keys. There are 3 types of keys we want to let go through:
     *
     * - Digits.
     * - Non typeable characters (moving arrows, backspace, del, tab, etc.).
     * - Key combinations (alt, ctrl, shift, etc) - used for copy paste and other functionalities.
     *
     * @param {KeyboardEvent} event - The Keyboard event triggering this method.
     */
    charCodeIsAllowed: function (event) {
        event = (event) ? event : window.event;
        var charCode = event.charCode;
        var keyCode = (event.which) ? event.which : event.keyCode;
        charCode = (typeof charCode === 'undefined') ? keyCode : charCode; // IE8 fallback.

        if (charCode === 0) {
            // Non typeable characters are allowed.
            return true;
        } else if (event.altKey || event.ctrlKey || event.shiftKey || event.metaKey) {
            // All combinations are allowed.
            return true
        } else if (!this.codeIsADigit(charCode)) {
            // Any other character that is not a digit will be blocked.
            return false;
        }

        // The only characters left are numeric, so we let them through.
        return true;
    },

    /**
     * Get the character code length.
     *
     * @private
     *
     * @param {KeyboardEvent} event - The Keyboard event triggering this method.
     */
    getCharCodeLength: function (event) {
        event = (event) ? event : window.event;
        var charCode = event.charCode;
        var keyCode = (event.which) ? event.which : event.keyCode;
        charCode = (typeof charCode === 'undefined') ? keyCode : charCode; // IE8 fallback.

        if (charCode === 0) {
            // Non typeable characters have no length.
            return 0;
        } else if (event.altKey || event.ctrlKey || event.shiftKey || event.metaKey) {
            // All combinations have no length.
            return 0
        } else if (!this.codeIsADigit(charCode)) {
            // All non-allowed characters have 0 length (because they will be blocked).
            return 0;
        }

        return 1; // By default a character has a length of 1.
    },

    /**
     * Polyfill a given element.
     *
     * @param {HTMLElement|HTMLInputElement} element - The HTML element.
     */
    polyfillElement: function (element) {

        element.addEventListener('keypress', function (event) {
            if (!inputTypeNumberPolyfill.eventKeyIsDigit(event) ||
                inputTypeNumberPolyfill.eventIsBlockedByMaxWhenTyping(event, element)) {
                event.preventDefault();
            }
        });

        element.addEventListener('paste', function (event) {
            if (!inputTypeNumberPolyfill.clipboardIsNumeric(event) ||
                inputTypeNumberPolyfill.eventIsBlockedByMaxWhenPasting(event, element)) {
                event.preventDefault();
            }
        });

    }
};