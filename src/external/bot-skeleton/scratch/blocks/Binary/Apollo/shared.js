import { localize } from '@deriv-com/translations';

// Contract types offered by the Apollo purchase blocks. Kept static so bots exported
// from other Apollo-compatible builders always load with their saved values.
export const getApolloPurchaseTypes = () => [
    [localize('Digits Over'), 'DIGITOVER'],
    [localize('Digits Under'), 'DIGITUNDER'],
    [localize('Digits Even'), 'DIGITEVEN'],
    [localize('Digits Odd'), 'DIGITODD'],
    [localize('Digits Matches'), 'DIGITMATCH'],
    [localize('Digits Differs'), 'DIGITDIFF'],
    [localize('Rise'), 'CALL'],
    [localize('Fall'), 'PUT'],
];

export const APOLLO_PREDICTION_TYPES = ['DIGITOVER', 'DIGITUNDER', 'DIGITMATCH', 'DIGITDIFF'];

export const APOLLO_DEFAULT_OPTIONS = [
    ['Even', 'Even'],
    ['Odd', 'Odd'],
    ['Rise', 'Rise'],
    ['Fall', 'Fall'],
    ['Over4', 'Over4'],
    ['Under5', 'Under5'],
];

const isValidOptions = options =>
    Array.isArray(options) &&
    options.length > 0 &&
    options.every(option => Array.isArray(option) && option.length === 2);

// Shared (de)serialisation for blocks with a configurable list of dropdown options.
// Supports both XML mutations (<mutation options="...">) and JSON extra state.
export const optionMutation = {
    mutationToDom() {
        const container = window.Blockly.utils.xml.createElement('mutation');
        container.setAttribute('options', encodeURIComponent(JSON.stringify(this.options_)));
        return container;
    },
    domToMutation(xmlElement) {
        const raw = xmlElement.getAttribute('options');
        if (!raw) return;
        try {
            const parsed = JSON.parse(decodeURIComponent(raw));
            if (isValidOptions(parsed)) this.options_ = parsed;
        } catch (e) {
            // Keep default options
        }
    },
    saveExtraState() {
        return { options: this.options_ };
    },
    loadExtraState(state) {
        if (isValidOptions(state?.options)) this.options_ = state.options;
    },
};

export const getVariableName = block =>
    // eslint-disable-next-line no-underscore-dangle
    window.Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VAR'), window.Blockly.Variables.CATEGORY_NAME);
