import { Op } from 'sequelize';
import Deliverer from '../models/Deliverer';
import Recipient from '../models/Recipient';
import Delivery from '../models/Delivery';
import File from '../models/File';

class StatusController {
  async index(req, res) {
    const { delivererId } = req.params;

    const deliveries = await Delivery.findAll({
      where: {
        deliverer_id: delivererId,
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
          model: Deliverer,
          as: 'deliverer',
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
