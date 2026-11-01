import { localize } from '@deriv-com/translations';
import { modifyContextMenu } from '../../../utils';
import { APOLLO_DEFAULT_OPTIONS, getVariableName, optionMutation } from './shared';

window.Blockly.Blocks.variables_set_option = {
    ...optionMutation,
    init() {
        this.options_ = APOLLO_DEFAULT_OPTIONS.slice();
        this.jsonInit(this.definition());
    },
    definition() {
        return {
            message0: localize('set {{ variable }} to {{ option }}', { variable: '%1', option: '%2' }),
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
            colour: window.Blockly.Colours.Special2.colour,
            colourSecondary: window.Blockly.Colours.Special2.colourSecondary,
            colourTertiary: window.Blockly.Colours.Special2.colourTertiary,
            previousStatement: null,
            nextStatement: null,
            tooltip: localize('Set a variable to one of a fixed list of options.'),
            category: window.Blockly.Categories.Variables,
        };
    },
    meta() {
        return {
            display_name: localize('Set variable to option'),
            description: localize('Assigns one of a fixed list of options to a variable'),
        };
    },
    customContextMenu(menu) {
        modifyContextMenu(menu);
    },
};

window.Blockly.JavaScript.javascriptGenerator.forBlock.variables_set_option = block => {
    const option = block.getFieldValue('OPTION');
    return `${getVariableName(block)} = ${JSON.stringify(option)};\n`;
};
