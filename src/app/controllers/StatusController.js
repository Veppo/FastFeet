import * as Yup from 'yup';
import {
  isAfter,
  isBefore,
  setSeconds,
  setMinutes,
  setHours,
  parseISO,
} from 'date-fns';
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

  async update(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed.' });
    }

    const order = await Order.findByPk(req.body.id);

    const startDate = parseISO(req.body.start_date);
    const limInit = setSeconds(setMinutes(setHours(startDate, '08'), '00'), 0);
    const limEnd = setSeconds(setMinutes(setHours(startDate, '18'), '00'), 0);

    if (isBefore(startDate, limInit) || isAfter(startDate, limEnd)) {
      return res.status(400).json({ error: 'Invalid Start Date.' });
    }

    if (
      req.body.end_date &&
      !req.body.start_date &&
      order.start_date === null
    ) {
      return res.status(400).json({
        error:
          'The order can not have an end-date without having an start-date.',
      });
    }

    const endDate = parseISO(req.body.end_date);
    if (isBefore(endDate, startDate)) {
      return res
        .status(400)
        .json({ error: 'End date can not be before the start date.' });
    }

    const { id, product } = await order.update(req.body);

    return res.json({ id, product });
  }
}

export default new StatusController();
