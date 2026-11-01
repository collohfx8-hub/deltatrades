import { localize } from '@deriv-com/translations';
import { excludeOptionFromContextMenu, modifyContextMenu } from '../../../utils';
import { APOLLO_PREDICTION_TYPES, getApolloPurchaseTypes } from './shared';

window.Blockly.Blocks.apollo_purchase2 = {
    init() {
        this.jsonInit(this.definition());

        this.getField('PURCHASE_LIST').setValidator(value => {
            this.updatePredictionVisibility(value);
            return value;
        });
        this.updatePredictionVisibility(this.getFieldValue('PURCHASE_LIST'));
    },
    definition() {
        return {
            message0: localize('Purchase {{ contract_type }}', { contract_type: '%1' }),
            message1: localize('prediction {{ prediction }}', { prediction: '%1' }),
            args0: [
                {
                    type: 'field_dropdown',
                    name: 'PURCHASE_LIST',
                    options: getApolloPurchaseTypes(),
                },
            ],
            args1: [
                {
                    type: 'input_value',
                    name: 'PREDICTION',
                    check: 'Number',
                },
            ],
            previousStatement: null,
            colour: window.Blockly.Colours.Special1.colour,
            colourSecondary: window.Blockly.Colours.Special1.colourSecondary,
            colourTertiary: window.Blockly.Colours.Special1.colourTertiary,
            tooltip: localize('Buy a contract. Prediction applies to digit contracts.'),
            category: window.Blockly.Categories.Before_Purchase,
        };
    },
    meta() {
        return {
            display_name: localize('Purchase with prediction'),
            description: localize(
                'Use this block to purchase a contract with its own prediction, e.g. for recovery trades. The prediction is used for Over, Under, Matches and Differs contracts. This block can only be used within the Purchase conditions block.'
            ),
            key_words: localize('buy prediction recovery'),
        };
    },
    updatePredictionVisibility(purchase_type) {
        const input = this.getInput('PREDICTION');
        if (!input) return;

        const should_show = APOLLO_PREDICTION_TYPES.includes(purchase_type);
        if (input.isVisible() !== should_show) {
            input.setVisible(should_show);
            if (this.rendered) this.render();
        }
    },
    customContextMenu(menu) {
        const menu_items = [localize('Enable Block'), localize('Disable Block')];
        excludeOptionFromContextMenu(menu, menu_items);
        modifyContextMenu(menu);
    },
    restricted_parents: ['before_purchase'],
};

window.Blockly.JavaScript.javascriptGenerator.forBlock.apollo_purchase2 = block => {
    const purchase_type = block.getFieldValue('PURCHASE_LIST');

    if (APOLLO_PREDICTION_TYPES.includes(purchase_type)) {
        const prediction = window.Blockly.JavaScript.javascriptGenerator.valueToCode(
            block,
            'PREDICTION',
            window.Blockly.JavaScript.javascriptGenerator.ORDER_NONE
        );
        if (prediction) {
            return `Bot.purchase('${purchase_type}', { prediction: ${prediction} });\n`;
        }
    }
    return `Bot.purchase('${purchase_type}');\n`;
};
