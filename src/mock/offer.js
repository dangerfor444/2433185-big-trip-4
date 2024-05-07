import { getRandomInteger, getRandomValue } from '../utils/common.js';
import { OFFERS_NAMES } from './const.js';

function generateOffersByType(type) {

  const maxPrice = 150;

  return {
    type: type,
    offers: Array.from({ length: getRandomInteger(1, 5) }, generateOffer)
  };

  function generateOffer() {
    return {
      id: crypto.randomUUID(),
      title: getRandomValue(OFFERS_NAMES),
      price: getRandomInteger(5, maxPrice)
    };
  }
}

export { generateOffersByType };
