import { DESTINATION_COUNT, OFFER_COUNT, POINT_COUNT, TYPES } from './const.js';
import { getDestination } from './destination.js';
import { getOffer } from './offer.js';
import { getPoint } from './point.js';
import { getRandomInteger, getRandomValue } from '../utils.js';
//сервис для моделей
export default class MockService {
  #destinations = [];
  #offers = [];
  #points = [];

  constructor (){
    this.#destinations = this.#generateDestinations();
    this.#offers = this.#generateOffers();
    this.#points = this.#generatePoints();
  }

  get destinations(){
    return this.#destinations;
  }

  get offers(){
    return this.#offers;
  }

  get points(){
    return this.#points;
  }

  #generateDestinations(){
    return Array.from({
      length: DESTINATION_COUNT
    }, () => getDestination());
  }

  #generateOffers(){
    return TYPES.map((type) => ({
      type,
      offers: Array.from({length: getRandomInteger(0, OFFER_COUNT)}, () => getOffer(type))
    }));
  }

  #generatePoints(){
    return Array.from({
      length: POINT_COUNT
    }, () => {
      const type = getRandomValue(TYPES);
      const destination = getRandomValue(this.destinations);
      const hasOffers = getRandomInteger(0,1);
      const offersByType = this.offers.find((offerByType) => offerByType.type === type);
      const offerIds = (hasOffers) ? offersByType.offers.slice(0, getRandomInteger(0, TYPES.length)).map((offer) => offer.id) : [];

      return getPoint(type, destination.id, offerIds);
    });
  }
}
