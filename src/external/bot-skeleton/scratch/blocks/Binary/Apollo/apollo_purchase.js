import { localize } from '@deriv-com/translations';
import { excludeOptionFromContextMenu, modifyContextMenu } from '../../../utils';
import { getApolloPurchaseTypes } from './shared';

window.Blockly.Blocks.apollo_purchase = {
    init() {
        this.jsonInit(this.definition());
    },
    definition() {
        return {
            message0: localize('Purchase {{ contract_type }}', { contract_type: '%1' }),
            message1: localize('multiple contracts {{ is_multiple }} quantity {{ quantity }}', {
                is_multiple: '%1',
                quantity: '%2',
            }),
            args0: [
                {
                    type: 'field_dropdown',
                    name: 'PURCHASE_LIST',
                    options: getApolloPurchaseTypes(),
                },
            ],
            args1: [
                {
                    type: 'field_checkbox',
                    name: 'MULTIPLE_CONTRACTS',
                    checked: false,
                },
                {
                    type: 'field_number',
                    name: 'CONTRACT_QUANTITY',
                    value: 1,
                    min: 1,
                    max: 100,
                    precision: 1,
                },
            ],
            previousStatement: null,
            colour: window.Blockly.Colours.Special1.colour,
            colourSecondary: window.Blockly.Colours.Special1.colourSecondary,
            colourTertiary: window.Blockly.Colours.Special1.colourTertiary,
            tooltip: localize('Buy a contract, optionally several at once.'),
            category: window.Blockly.Categories.Before_Purchase,
        };
    },
    meta() {
        return {
            display_name: localize('Purchase (multiple contracts)'),
            description: localize(
                'Use this block to purchase a contract of the selected type. Tick "multiple contracts" to buy several contracts at once. This block can only be used within the Purchase conditions block.'
            ),
            key_words: localize('buy'),
        };
    },
    customContextMenu(menu) {
        const menu_items = [localize('Enable Block'), localize('Disable Block')];
        excludeOptionFromContextMenu(menu, menu_items);
        modifyContextMenu(menu);
    },
    restricted_parents: ['before_purchase'],
};

window.Blockly.JavaScript.javascriptGenerator.forBlock.apollo_purchase = block => {
    const purchase_type = block.getFieldValue('PURCHASE_LIST');
    const is_multiple = block.getFieldValue('MULTIPLE_CONTRACTS') === 'TRUE';
    const quantity = is_multiple ? Math.max(1, parseInt(block.getFieldValue('CONTRACT_QUANTITY'), 10) || 1) : 1;

    if (quantity > 1) {
        return `Bot.purchase('${purchase_type}', { quantity: ${quantity} });\n`;
    }
    return `Bot.purchase('${purchase_type}');\n`;
};
