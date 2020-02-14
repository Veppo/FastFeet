import { Op } from 'sequelize';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';
import Delivery from '../models/Delivery';
import File from '../models/File';

class StatusController {
  async index(req, res) {
    const { deliverymanId } = req.params;

    const deliveries = await Delivery.findAll({
      where: {
        deliveryman_id: deliverymanId,
        canceled_at: null,
        end_date: {
          [Op.ne]: null,
        },
      },
      order: ['product'],
      attributes: ['id', 'product', 'end_date'],
      include: [
        {
          model: File,
          as: 'signature',
          attributes: ['url', 'id', 'path'],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['id', 'name'],
        },
      ],
    });
    return res.json(deliveries);
  }
}

export default new StatusController();
