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

class OrderController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const orders = await Order.findAll({
      where: {
        canceled_at: null,
      },
      order: ['product'],
      limit: 20,
      offset: (page - 1) * 20,
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

  async store(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string().required(),
      deliverer_id: Yup.string().required(),
      recipient_id: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed.' });
    }

    const deliverer = await Deliverer.findByPk(req.body.deliverer_id);
    if (!deliverer || !deliverer.active) {
      return res.status(400).json({ error: 'The Deliverer is not Valid.' });
    }

    const recipient = await Recipient.findByPk(req.body.recipient_id);
    if (!recipient) {
      return res.status(400).json({ error: 'The Recipient is not Valid.' });
    }

    const { id, product } = await Order.create(req.body);

    return res.json({ id, product });
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

  async delete(req, res) {
    const order = await Order.findByPk(req.params.id);

    if (order.canceled_at !== null) {
      return res.status(400).json({
        error: `The Order is already canceled`,
      });
    }

    order.canceled_at = new Date();
    const { id, product, canceled_at } = await order.save();

    return res.json({ id, product, canceled_at });
  }
}

export default new OrderController();
