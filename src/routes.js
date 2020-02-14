import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import RecipientController from './app/controllers/RecipientController';
import SessionController from './app/controllers/SessionController';
import DeliverymanController from './app/controllers/DeliverymanController';
import FileController from './app/controllers/FileController';

import authMiddleware from './app/middlewares/auth';
import DeliveryController from './app/controllers/DeliveryController';
import StatusController from './app/controllers/StatusController';
import HistoryController from './app/controllers/HistoryController';
import DeliveryProblemsController from './app/controllers/DeliveryProblemsController';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.get('/recipients', RecipientController.list);
routes.post('/recipients', RecipientController.store);
routes.put('/recipients', RecipientController.update);

routes.get('/deliverymen', DeliverymanController.index);
routes.get('/deliverymen/:deliverymanId/deliveries', StatusController.index);
routes.get('/deliverymen/:deliverymanId/history', HistoryController.index);
routes.post('/deliverymen', DeliverymanController.store);
routes.put('/deliverymen', DeliverymanController.update);
routes.delete('/deliverymen/:id', DeliverymanController.delete);

routes.get('/delivery', DeliveryController.index);
routes.post('/delivery', DeliveryController.store);
routes.put('/delivery', DeliveryController.update);
routes.delete('/delivery/:id', DeliveryController.delete);

routes.get('/delivery/:deliveryId/problems', DeliveryProblemsController.index);
routes.get('/delivery/problems', DeliveryProblemsController.index);
routes.post('/delivery/:deliveryId/problems', DeliveryProblemsController.store);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
