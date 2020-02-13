import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import RecipientController from './app/controllers/RecipientController';
import SessionController from './app/controllers/SessionController';
import DelivererController from './app/controllers/DelivererController';
import FileController from './app/controllers/FileController';

import authMiddleware from './app/middlewares/auth';
import DeliveryController from './app/controllers/DeliveryController';
import StatusController from './app/controllers/StatusController';
import HistoryController from './app/controllers/HistoryController';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.get('/recipients', RecipientController.list);
routes.post('/recipients', RecipientController.store);
routes.put('/recipients', RecipientController.update);

routes.get('/deliverers', DelivererController.index);
routes.get('/deliverers/:delivererId/deliveries', StatusController.index);
routes.get('/deliverers/:delivererId/history', HistoryController.index);
routes.post('/deliverers', DelivererController.store);
routes.put('/deliverers', DelivererController.update);
routes.delete('/deliverers/:id', DelivererController.delete);

routes.get('/orders', DeliveryController.index);
routes.post('/orders', DeliveryController.store);
routes.put('/orders', DeliveryController.update);
routes.delete('/orders/:id', DeliveryController.delete);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
