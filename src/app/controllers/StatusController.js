import Deliverer from '../models/Deliverer';
import Recipient from '../models/Recipient';
import Order from '../models/Order';
import File from '../models/File';

class StatusController {
  async index(req, res) {
    const { delivererId } = req.params;

    const orders = await Order.findAll({
      where: {
        deliverer_id: delivererId,
        canceled_at: null,
        end_date: null,
      },
      order: ['product'],
      attributes: ['id', 'product'],
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
    return res.json(orders);
  }
}

export default new StatusController();
