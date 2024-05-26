import { render } from './framework/render.js';
import BoardPresenter from './presenter/board-presenter.js';
import PointsModel from './model/points-model.js';
import DestinationModel from './model/destinations-model.js';
import OffersModel from './model/offers-model.js';
import FilterModel from './model/filter-model.js';
import FilterPresenter from './presenter/filter-presenter.js';
import NewPointButtonView from './view/new-point-button-view.js';
import PointsApiService from './service/points-api-service.js';
import DestinationsApiService from './service/destinations-api-service.js';
import OffersApiService from './service/offers-api-service.js';
import TripInfoPresenter from './presenter/trip-info-presenter.js';
import { AUTHORIZATION, END_POINT } from './const.js';

const headerInfoContainer = document.querySelector('.trip-main');
const filterContainer = document.querySelector('.trip-controls__filters');
const tripContainer = document.querySelector('.trip-events');

const destinationsModel = new DestinationModel({ destinationsApiService: new DestinationsApiService(END_POINT, AUTHORIZATION) });
const offersModel = new OffersModel({ offersApiService: new OffersApiService(END_POINT, AUTHORIZATION) });
const pointsModel = new PointsModel({ pointsApiService: new PointsApiService(END_POINT, AUTHORIZATION) });
const filterModel = new FilterModel();

const newPointButtonComponent = new NewPointButtonView({
  onClick: handleNewPointButtonClick
});

const tripInfoPresenter = new TripInfoPresenter({
  container: headerInfoContainer,
  pointsModel,
  destinationsModel,
  offersModel
});

const tripPresenter = new BoardPresenter({
  tripContainer,
  pointsModel,
  destinationsModel,
  offersModel,
  filterModel,
  onNewPointDestroy: handleNewPointFormClose,
  newPointButtonComponent
});

const filterPresenter = new FilterPresenter({
  filterContainer,
  filterModel,
  pointsModel
});

function handleNewPointFormClose() {
  newPointButtonComponent.element.disabled = false;
}

function handleNewPointButtonClick() {
  tripPresenter.createPoint();
  newPointButtonComponent.element.disabled = true;
}

async function initModels() {
  await destinationsModel.init();
  await offersModel.init();
  await pointsModel.init();
  render(newPointButtonComponent, headerInfoContainer);
}

tripInfoPresenter.init();
filterPresenter.init();
tripPresenter.init();
initModels();
