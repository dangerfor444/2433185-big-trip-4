//import AbstractView from '../framework/view/abstract-view.js';
import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { formatDateToDateTime } from '../utils/point.js';
import { POINT_TYPES, POINT_EMPTY } from '../const.js';
import { capitalizeFirstLetter } from '../utils/common.js';

export default class EditPointView extends AbstractStatefulView {
  #destinations = null;
  #offers = null;
  #handleFormSubmit = null;
  #handleFormCancel = null;

  constructor({ point = POINT_EMPTY, destinations, offers, onFormSubmit, onFormCancel }) {
    super();
    this.#destinations = destinations;
    this.#offers = offers;
    this.#handleFormSubmit = onFormSubmit;
    this.#handleFormCancel = onFormCancel;

    this._setState(EditPointView.parsePointToState({point}));

    this._restoreHandlers();
  }

  get template() {
    return createEditPointViewTemplate({
      state: this._state,
      destinations: this.#destinations,
      offers: this.#offers
    });
  }

  reset = (point) => this.updateElement({point});

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormSubmit(EditPointView.parseStateToPoint(this._state));
  };

  #formCancelHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormCancel();
  };

  #typeChangeHandler = (evt) => {
    this.updateElement({
      point: {
        ...this._state.point,
        type:evt.target.value,
        offers: []
      }
    });
  };

  #destinationChangeHandler = (evt) => {
    const selectedDestination = this.#destinations
      .find((pointDestination) => pointDestination.name === evt.target.value);

    const selectedDestinationId = (selectedDestination)
      ? selectedDestination.id
      : null;

    this.updateElement({
      point: {
        ...this._state.point,
        destination: selectedDestinationId
      }
    });
  };

  #offerChangeHandler = () => {
    const checkedBoxes = Array.from(this.element.querySelectorAll('.event__offer-checkbox:checked'));

    this._setState({
      point: {
        ...this._state.point,
        offers: checkedBoxes.map((element) => element.dataset.offerId)
      }
    });
  };

  #priceChangeHandler = (evt) => {
    this._setState({
      point: {
        ...this._state.point,
        basePrice: evt.target.valueAsNumber
      }
    });
  };

  static parsePointToState = ({point}) => ({point});
  static parseStateToPoint = (state) => state.point;

  _restoreHandlers = () => {
    this.element.querySelector('form')
      .addEventListener('submit', this.#formSubmitHandler);

    this.element.querySelector('.event__rollup-btn')
      .addEventListener('click', this.#formCancelHandler);

    this.element.querySelector('.event__type-group')
      .addEventListener('change', this.#typeChangeHandler);

    this.element.querySelector('.event__input--destination')
      .addEventListener('change', this.#destinationChangeHandler);

    this.element.querySelector('.event__available-offers')
      .addEventListener('change', this.#offerChangeHandler);

    this.element.querySelector('.event__input--price')
      .addEventListener('change', this.#priceChangeHandler);
  };
}


function createEditPointViewTemplate({state, destinations, offers }) {
  const {point} = state;
  const { id, type, offers: selectedOffersIds, destination: destinationId, basePrice, dateFrom, dateTo } = point;
  const selectedDestination = destinations.find((destination) => destination.id === destinationId);
  const suitableOffers = offers.find((offer) => offer.type === type).offers;

  return /* html */ `
    <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type  event__type-btn" for="event-type-toggle-${id}">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle  visually-hidden" id="event-type-toggle-${id}" type="checkbox">

            ${createEventTypesTemplate({ pointId: id, eventTypes: POINT_TYPES, selectedType: type })}

          <div class="event__field-group  event__field-group--destination">
            <label class="event__label  event__type-output" for="event-destination-${id}">
              ${type}
            </label>
            <input class="event__input  event__input--destination" id="event-destination-${id}" type="text" name="event-destination" value="${selectedDestination.name}" list="destination-list-${id}">
            <datalist id="destination-list-${id}">
              ${createDestinationOptionsTemplate({ destinations })}
            </datalist>
          </div>

          <div class="event__field-group  event__field-group--time">
            <label class="visually-hidden" for="event-start-time-${id}">From</label>
            <input class="event__input  event__input--time" id="event-start-time-${id}" type="text" name="event-start-time" value="${formatDateToDateTime(dateFrom)}">
            &mdash;
            <label class="visually-hidden" for="event-end-time-${id}">To</label>
            <input class="event__input  event__input--time" id="event-end-time-${id}" type="text" name="event-end-time" value="${formatDateToDateTime(dateTo)}">
          </div>

          <div class="event__field-group  event__field-group--price">
            <label class="event__label" for="event-price-${id}">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input  event__input--price" id="event-price-${id}" type="text" name="event-price" value="${basePrice}">
          </div>

          <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">Delete</button>
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </header>
        <section class="event__details">
          <section class="event__section  event__section--offers">
            <h3 class="event__section-title  event__section-title--offers">Offers</h3>

            <div class="event__available-offers">
              ${createOffersTemplate({ pointId: id, selectedOffersIds, offers: suitableOffers })}
            </div>
          </section>

          <section class="event__section  event__section--destination">
            <h3 class="event__section-title  event__section-title--destination">Destination</h3>
            <p class="event__destination-description">${selectedDestination.description}</p>
            <div class="event__photos-container">
              <div class="event__photos-tape">
                ${createImagesTemplate({ destination: selectedDestination })}
              </div>
            </div>
            </section>
        </section>
      </form>
    </li>
  `;
}

function createEventTypesTemplate({ pointId, eventTypes, selectedType }) {
  return /* html */`
    <div class="event__type-list">
        <fieldset class="event__type-group">
          <legend class="visually-hidden">Event type</legend>
          ${eventTypes.map((type) => (`
          <div class="event__type-item">
            <input id="event-type-${type}-${pointId}" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type}" ${type === selectedType ? 'checked="checked"' : ''}>
            <label class="event__type-label  event__type-label--${type}" for="event-type-${type}-${pointId}">${capitalizeFirstLetter(type)}</label>
          </div>`)).join('')}
        </fieldset>
      </div>
    </div>`;
}

function createDestinationOptionsTemplate({ destinations }) {
  return destinations.map((destination) => `<option value="${destination.name}"></option>`).join('');
}

function createOffersTemplate({ pointId, selectedOffersIds, offers }) {
  return offers.reduce((result, offer) =>
    /* html */`${result}
    <div class="event__offer-selector">
      <input class="event__offer-checkbox  visually-hidden" id="event-offer-${offer.id}-${pointId}" type="checkbox" name="event-offer-${offer.id}" ${selectedOffersIds.includes(offer.id) ? 'checked' : ''}>
      <label class="event__offer-label" for="event-offer-${offer.id}-${pointId}">
        <span class="event__offer-title">${offer.title}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${offer.price}</span>
      </label>
    </div>`, ''
  );
}

function createImagesTemplate({ destination }) {
  return destination.pictures.reduce((result, picture) => `
    ${result}<img class="event__photo" src="${picture.src}" alt="${picture.description}">
  `, '');
}
