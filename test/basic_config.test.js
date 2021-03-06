import '../bower_components/webcomponentsjs/webcomponents-loader';
import {assert, elementUpdated} from '@open-wc/testing';
import './hui-view-mock.js';
import '../power-wheel-card.js';
import {setCard, setCardAllInactive} from './test_main.js';

describe('<power-wheel-card> with most basic config', () => {
  let card, hass, config;

  /** Tests are extended in energy_capable. **/

  beforeEach(async () => {
    config = {
      type: "custom:power-wheel-card",
      solar_power_entity: "sensor.solar_power",
      grid_power_consumption_entity: "sensor.grid_power_consumption",
      grid_power_production_entity: "sensor.grid_power_production",
      color_icons: false,
    };
    hass = {
      states: {
        "sensor.solar_power": {
          attributes: {
            unit_of_measurement: "W",
            friendly_name: "Solar Power",
          },
          entity_id: "sensor.solar_power",
          state: "500.1",
        },
        "sensor.grid_power_consumption": {
          attributes: {
            unit_of_measurement: "W",
          },
          entity_id: "sensor.grid_power_consumption",
          state: "1799.9",
        },
        "sensor.grid_power_production": {
          attributes: {
            unit_of_measurement: "W",
          },
          entity_id: "sensor.grid_power_production",
          state: "0",
        },
      },
    };

    card = await setCard(hass, config);
  });

  const setCardProducingToGrid = async () => {
    hass.states['sensor.grid_power_consumption'].state = "0";
    hass.states['sensor.grid_power_production'].state = "50";
    card.setAttribute('hass', JSON.stringify(hass));
    await elementUpdated(card);
    await card.setConfig(config);
  };

  const setCardSolarConsuming = async () => {
    hass.states['sensor.solar_power'].state = "-5";
    hass.states['sensor.grid_power_consumption'].state = "5";
    hass.states['sensor.grid_power_production'].state = "0";
    card.setAttribute('hass', JSON.stringify(hass));
    await elementUpdated(card);
    await card.setConfig(config);
  };

  it('has set default config values', () => {
    assert.isFalse(card.config.color_icons, 'Card parameter color_icons should be set');
    assert.equal(card.config.production_is_positive, 1, 'Card parameter production_is_positive should be default 1');
    assert.isFalse(card.config.debug, 'Card parameter debug should be default false');
    assert.equal(card.config.title, 'Power wheel', 'Card parameter title should have default value');
    assert.equal(card.config.title_power, 'Power wheel', 'Card parameter title_power should have default value');
    assert.equal(card.config.title_energy, 'Power wheel', 'Card parameter title_energy should have default value');
    assert.equal(card.config.title_money, 'Power wheel', 'Card parameter title_money should have default value');
    assert.equal(card.config.power_decimals, 0, 'Card parameter power_decimals should have default value');
    assert.equal(card.config.energy_decimals, 3, 'Card parameter energy_decimals should have default value');
    assert.equal(card.config.money_decimals, 2, 'Card parameter money_decimals should have default value');
    assert.equal(card.config.money_unit, '€', 'Card parameter money_unit should have default value');
    assert.equal(card.config.consuming_color, 'var(--state-icon-unavailable-color, #bdbdbd)', 'Card parameter consuming_color should have default value');
    assert.equal(card.config.producing_color, 'var(--state-icon-unavailable-color, #bdbdbd)', 'Card parameter producing_color should have default value');
    assert.equal(card.config.active_arrow_color, 'var(--paper-item-icon-active-color, #fdd835)', 'Card parameter active_arrow_color should have default value');
    assert.equal(card.config.initial_view, 'power', 'Card parameter initial_view should have default value');
    assert.isFalse(card.config.invert_grid_colors, 'Card parameter invert_grid_colors should be default false');
    assert.isFalse(card.config.initial_auto_toggle_view, 'Card parameter initial_auto_toggle_view should be default false');
    assert.equal(card.config.auto_toggle_view_period, 10, 'Card parameter auto_toggle_view_period should have default value');
  });

  it('has set card property values after setConfig', () => {
    assert.isFalse(card.autoToggleView, 'Card property autoToggleView should be default false');
    assert.deepEqual(card.sensors, ["sensor.solar_power", "sensor.grid_power_consumption", "sensor.grid_power_production"], 'Card property sensors should have default value');
    assert.equal(card.view, 'power', 'Card property view should have default value');
    assert.equal(card.views.power.title, 'Power wheel', 'Card property views should have default value for power view title');
    assert.isFalse(card.views.power.batteryCapable, 'Card property views should have default value for power view battery capability');
    assert.equal(card.views.energy.title, 'Power wheel', 'Card property views should have default value for energy view title');
    assert.equal(card.views.money.title, 'Power wheel', 'Card property views should have default value for money view title');
    assert.isFalse(card.views.energy.capable, 'Card property views should have default value for energy capable');
    assert.isFalse(card.views.money.capable, 'Card property views should have default value for money capable');
    assert.isFalse(card.views.power.oneGridSensor, 'Card property views should have value set for power oneGridSensor');
    assert.isTrue(card.views.power.twoGridSensors, 'Card property views should have value set for power twoGridSensors');
  });

  it('has no warnings or errors', () => {
    assert.equal(card.shadowRoot.querySelectorAll('.message').length, 0, 'Number of messages should be zero');
  });

  it('uses color values', () => {
    // After testing this, the other tests can just check for class values 'inactive', 'consuming' and 'producing'.
    assert.equal(window.getComputedStyle(card.shadowRoot.querySelector('ha-icon.consuming'), null).getPropertyValue('color'), 'rgb(189, 189, 189)', 'Consuming icon color should be #bdbdbd');
    assert.equal(window.getComputedStyle(card.shadowRoot.querySelector('ha-icon.producing'), null).getPropertyValue('color'), 'rgb(189, 189, 189)', 'Producing icon color should be #bdbdbd');
    assert.equal(window.getComputedStyle(card.shadowRoot.querySelector('ha-icon.active'), null).getPropertyValue('color'), 'rgb(253, 216, 53)', 'Active arrow icon color should be #fdd835');
    assert.equal(window.getComputedStyle(card.shadowRoot.querySelector('ha-icon.inactive'), null).getPropertyValue('color'), 'rgb(189, 189, 189)', 'Inactive arrow icon color should be #bdbdbd');
  });

  it('displays values', () => {
    assert.equal(card.shadowRoot.querySelector('#title').innerText, 'Power wheel', 'Should have title');
    assert.equal(card.shadowRoot.querySelector('#unit').innerText, 'W', 'Should have unit');
  });

  it('has ui elements', () => {
    assert.equal(card.shadowRoot.querySelectorAll('#toggle-button').length, 0, 'Toggle button shouldn\'t be there');
    assert.isFalse(card.shadowRoot.querySelector('#unit').classList.contains('toggle'), 'Unit shouldn\'t be toggleable');
    assert.equal(card.shadowRoot.querySelector('#icon-solar').getAttribute('icon'), 'mdi:weather-sunny', 'Solar icon should be default icon');
    assert.equal(card.shadowRoot.querySelector('#icon-grid').getAttribute('icon'), 'mdi:transmission-tower', 'Grid icon should be default icon');
    assert.equal(card.shadowRoot.querySelector('#icon-home').getAttribute('icon'), 'mdi:home', 'Home icon should be default icon');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2grid').getAttribute('icon'), 'mdi:arrow-bottom-left', 'Solar2Grid icon should be normal icon');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2home').getAttribute('icon'), 'mdi:arrow-bottom-right', 'Solar2Home icon should be normal icon');
    assert.equal(card.shadowRoot.querySelector('#icon-grid2home').getAttribute('icon'), 'mdi:arrow-right', 'Grid2Home icon should be normal icon');
    assert.equal(card.shadowRoot.querySelector('#cell-solar').getAttribute('title'), 'More info:\nSolar Power', 'Solar title should be set');
    assert.equal(card.shadowRoot.querySelector('#cell-grid').getAttribute('title'), '', 'Grid title should be set');
    assert.equal(card.shadowRoot.querySelector('#cell-home').getAttribute('title'), '', 'Home title should be set');
    assert.isTrue(card.shadowRoot.querySelector('#cell-battery').classList.contains('hidden'), 'Battery cell should be disabled');
    assert.equal(card.shadowRoot.querySelector('#cell-solar2grid').getAttribute('title'), 'More info', 'Solar2Grid title should be set');
    assert.equal(card.shadowRoot.querySelector('#cell-solar2home').getAttribute('title'), '', 'Solar2Home title should be set');
    assert.equal(card.shadowRoot.querySelector('#cell-grid2home').getAttribute('title'), 'More info', 'Grid2Home title should be set');
    assert.isTrue(card.shadowRoot.querySelector('#cell-solar2battery').classList.contains('hidden'), 'Solar2Battery arrow should be disabled');
    assert.isTrue(card.shadowRoot.querySelector('#cell-grid2battery').classList.contains('hidden'), 'Grid2Battery arrow should be disabled');
    assert.isTrue(card.shadowRoot.querySelector('#cell-battery2home').classList.contains('hidden'), 'Battery2Home arrow should be disabled');
  });

  it('displays values when consuming from the grid', () => {
    assert.equal(card.shadowRoot.querySelector('#value-solar').innerText, '500', 'Solar should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid').innerText, '-1800', 'Grid should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-home').innerText, '-2300', 'Home should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2grid').innerText, '', 'Solar2Grid arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2home').innerText, '', 'Solar2Home arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2home').innerText, '', 'Grid2Home arrow shouldn\'t have a value');
  });

  it('has ui elements when consuming from the grid', () => {
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar').classList.contains('producing'), 'Solar icon should be producing');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid').classList.contains('consuming'), 'Grid icon should be consuming');
    assert.isTrue(card.shadowRoot.querySelector('#icon-home').classList.contains('consuming'), 'Home icon should be consuming');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2grid').getAttribute('icon'), 'mdi:arrow-bottom-left', 'Solar2Grid icon should be normal icon');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2home').getAttribute('icon'), 'mdi:arrow-bottom-right', 'Solar2Home icon should be normal icon');
    assert.equal(card.shadowRoot.querySelector('#icon-grid2home').getAttribute('icon'), 'mdi:arrow-right', 'Grid2Home icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2grid').classList.contains('inactive'), 'Solar2Grid arrow icon should be inactive');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2home').classList.contains('active'), 'Solar2Home arrow icon should be active');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid2home').classList.contains('active'), 'Grid2Home arrow icon should be active');
  });

  it('displays values when producing to the grid', async () => {
    await setCardProducingToGrid();

    assert.equal(card.shadowRoot.querySelector('#value-solar').innerText, '500', 'Solar should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid').innerText, '50', 'Grid should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-home').innerText, '-450', 'Home should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2grid').innerText, '', 'Solar2Grid arrow should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2home').innerText, '', 'Solar2Home arrow should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2home').innerText, '', 'Grid2Home arrow shouldn\'t have a value');
  });

  it('has ui elements when producing to the grid', async () => {
    await setCardProducingToGrid();

    assert.isTrue(card.shadowRoot.querySelector('#icon-solar').classList.contains('producing'), 'Solar icon should be producing');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid').classList.contains('producing'), 'Grid icon should be producing');
    assert.isTrue(card.shadowRoot.querySelector('#icon-home').classList.contains('consuming'), 'Home icon should be consuming');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2grid').getAttribute('icon'), 'mdi:arrow-bottom-left', 'Solar2Grid icon should be normal icon');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2home').getAttribute('icon'), 'mdi:arrow-bottom-right', 'Solar2Home icon should be normal icon');
    assert.equal(card.shadowRoot.querySelector('#icon-grid2home').getAttribute('icon'), 'mdi:arrow-right', 'Grid2Home icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2grid').classList.contains('active'), 'Solar2Grid arrow icon should be active');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2home').classList.contains('active'), 'Solar2Home arrow icon should be active');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid2home').classList.contains('inactive'), 'Grid2Home arrow icon should be inactive');
  });

  it('displays values when all sensor values are zero', async () => {
    await setCardAllInactive(card, hass, config);

    assert.equal(card.shadowRoot.querySelector('#value-solar').innerText, '0', 'Solar should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid').innerText, '0', 'Grid should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-home').innerText, '0', 'Home should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2grid').innerText, '', 'Solar2Grid arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2home').innerText, '', 'Solar2Home arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2home').innerText, '', 'Grid2Home arrow shouldn\'t have a value');
  });

  it('has ui elements when all sensor values are zero', async () => {
    await setCardAllInactive(card, hass, config);

    assert.isTrue(card.shadowRoot.querySelector('#icon-solar').classList.contains('inactive'), 'Solar icon should be inactive');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid').classList.contains('inactive'), 'Grid icon should be inactive');
    assert.isTrue(card.shadowRoot.querySelector('#icon-home').classList.contains('inactive'), 'Home icon should be inactive');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2grid').getAttribute('icon'), 'mdi:arrow-bottom-left', 'Solar2Grid icon should be normal icon');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2home').getAttribute('icon'), 'mdi:arrow-bottom-right', 'Solar2Home icon should be normal icon');
    assert.equal(card.shadowRoot.querySelector('#icon-grid2home').getAttribute('icon'), 'mdi:arrow-right', 'Grid2Home icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2grid').classList.contains('inactive'), 'Solar2Grid arrow icon should be inactive');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2home').classList.contains('inactive'), 'Solar2Home arrow icon should be inactive');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid2home').classList.contains('inactive'), 'Grid2Home arrow icon should be inactive');
  });

  it('displays values when solar inverter consumes power', async () => {
    await setCardSolarConsuming();

    assert.equal(card.shadowRoot.querySelector('#value-solar').innerText, '-5', 'Solar should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-grid').innerText, '-5', 'Grid should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-home').innerText, '0', 'Home should have correct value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2grid').innerText, '', 'Solar2Grid arrow shouldn\'t have a value');
    assert.equal(card.shadowRoot.querySelector('#value-solar2home').innerText, '', 'Solar2Home arrow should have a value');
    assert.equal(card.shadowRoot.querySelector('#value-grid2home').innerText, '', 'Grid2Home arrow shouldn\'t have a value');
  });

  it('has ui elements when solar inverter consumes power', async () => {
    await setCardSolarConsuming();

    assert.isTrue(card.shadowRoot.querySelector('#icon-solar').classList.contains('consuming'), 'Solar icon should be inactive');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid').classList.contains('consuming'), 'Grid icon should be inactive');
    assert.isTrue(card.shadowRoot.querySelector('#icon-home').classList.contains('inactive'), 'Home icon should be inactive');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2grid').getAttribute('icon'), 'mdi:arrow-bottom-left', 'Solar2Grid icon should be normal icon');
    assert.equal(card.shadowRoot.querySelector('#icon-solar2home').getAttribute('icon'), 'mdi:arrow-top-left', 'Solar2Home icon should be reversed icon');
    assert.equal(card.shadowRoot.querySelector('#icon-grid2home').getAttribute('icon'), 'mdi:arrow-right', 'Grid2Home icon should be normal icon');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2grid').classList.contains('inactive'), 'Solar2Grid arrow icon should be inactive');
    assert.isTrue(card.shadowRoot.querySelector('#icon-solar2home').classList.contains('active'), 'Solar2Home arrow icon should be inactive');
    assert.isTrue(card.shadowRoot.querySelector('#icon-grid2home').classList.contains('active'), 'Grid2Home arrow icon should be active');
  });

  it('updates when sensor value changes', async () => {
    assert.equal(card.shadowRoot.querySelector('#value-solar').innerText, '500', 'Solar should have value set');
    hass.states['sensor.solar_power'].state = "501";
    card.setAttribute('hass', JSON.stringify(hass));
    await elementUpdated(card);
    await card.setConfig(config);

    assert.equal(card.shadowRoot.querySelector('#value-solar').innerText, '501', 'Solar should have changed value');
  });

  it('has card size', () => {
    assert.equal(card.getCardSize(), 5, 'getCardSize should respond');
  });

});
