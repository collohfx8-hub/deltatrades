import { localize } from '@deriv-com/translations';
import { modifyContextMenu } from '../../../utils';
import { APOLLO_DEFAULT_OPTIONS, getVariableName, optionMutation } from './shared';

window.Blockly.Blocks.variables_is_option = {
    ...optionMutation,
    init() {
        this.options_ = APOLLO_DEFAULT_OPTIONS.slice();
        this.jsonInit(this.definition());
    },
    definition() {
        return {
            message0: localize('{{ variable }} is {{ option }}', { variable: '%1', option: '%2' }),
            args0: [
                {
                    type: 'field_variable',
                    name: 'VAR',
                    variable: localize('item'),
                },
                {
                    type: 'field_dropdown',
                    name: 'OPTION',
                    options: () => this.options_ || APOLLO_DEFAULT_OPTIONS,
                },
            ],
            output: 'Boolean',
            outputShape: window.Blockly.OUTPUT_SHAPE_ROUND,
            colour: window.Blockly.Colours.Base.colour,
            colourSecondary: window.Blockly.Colours.Base.colourSecondary,
            colourTertiary: window.Blockly.Colours.Base.colourTertiary,
            tooltip: localize('True when the variable equals the selected option.'),
            category: window.Blockly.Categories.Variables,
        };
    },
    meta() {
        return {
            display_name: localize('Variable is option'),
            description: localize('Returns true when the variable equals the selected option'),
        };
    },
    customContextMenu(menu) {
        modifyContextMenu(menu);
    },
};

window.Blockly.JavaScript.javascriptGenerator.forBlock.variables_is_option = block => {
    const option = block.getFieldValue('OPTION');
    return [
        `${getVariableName(block)} === ${JSON.stringify(option)}`,
        window.Blockly.JavaScript.javascriptGenerator.ORDER_EQUALITY,
    ];
};
