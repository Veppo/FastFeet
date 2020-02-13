import * as Yup from 'yup';
import {
  isAfter,
  isBefore,
  setSeconds,
  setMinutes,
  setHours,
  parseISO,
} from 'date-fns';
import { Op } from 'sequelize';
import Deliverer from '../models/Deliverer';
import Recipient from '../models/Recipient';
import Delivery from '../models/Delivery';
import File from '../models/File';

class DeliveryController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const deliveries = await Delivery.findAll({
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
    return res.json(deliveries);
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

    /**
     * Validate Deliverer
     */
    const deliverer = await Deliverer.findByPk(req.body.deliverer_id);
    if (!deliverer || !deliverer.active) {
      return res.status(400).json({ error: 'The Deliverer is not Valid.' });
    }

    /**
     * Validate Recipient
     */
    const recipient = await Recipient.findByPk(req.body.recipient_id);
    if (!recipient) {
      return res.status(400).json({ error: 'The Recipient is not Valid.' });
    }

    const { id, product } = await Delivery.create(req.body);

    return res.json({ id, product });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed.' });
    }

    const delivery = await Delivery.findByPk(req.body.id);

    /**
     * Validate Canceled Date
     */
    if (delivery.canceled_at) {
      return res.status(400).json({ error: 'Delivery was Canceled.' });
    }

    /**
     * Validate Start Date
     */
    const startDate = parseISO(req.body.start_date);
    const limInit = setSeconds(setMinutes(setHours(startDate, '08'), '00'), 0);
    const limEnd = setSeconds(setMinutes(setHours(startDate, '18'), '00'), 0);

    if (isBefore(startDate, limInit) || isAfter(startDate, limEnd)) {
      return res.status(400).json({ error: 'Invalid Start Date.' });
    }

    /**
     * Validate End Date
     */
    if (
      req.body.end_date &&
      !req.body.start_date &&
      delivery.start_date === null
    ) {
      return res.status(400).json({
        error: "The order can't have an end-date without having an start-date.",
      });
    }

    const endDate = parseISO(req.body.end_date);
    if (isBefore(endDate, startDate)) {
      return res
        .status(400)
        .json({ error: "End date can't be before the start date." });
    }

    /**
     * Validate Max (5/day) Deliveries
     */
    const dailyCount = await Delivery.count({
      where: {
        deliverer_id: delivery.deliverer_id,
        start_date: {
          [Op.between]: [limInit, limEnd],
        },
      },
      group: ['id'],
    });

    if (dailyCount.length > 4) {
      return res.status(400).json({
        error: `The Deliverer already delivered 5 orders that day.`,
      });
    }

    const { id, product } = await delivery.update(req.body);

    return res.json({ id, product });
  }

  async delete(req, res) {
    const delivery = await Delivery.findByPk(req.params.id);

    if (delivery.canceled_at !== null) {
      return res.status(400).json({
        error: `The Delivery is already canceled`,
      });
    }

    delivery.canceled_at = new Date();
    const { id, product, canceled_at } = await delivery.save();

    return res.json({ id, product, canceled_at });
  }
}

export default new DeliveryController();
