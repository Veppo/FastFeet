import * as Yup from 'yup';
import Deliverer from '../models/Deliverer';
import File from '../models/File';

class DelivererController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const deliverers = await Deliverer.findAll({
      where: {
        active: true,
      },
      order: ['name'],
      limit: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'name', 'email'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['url', 'id', 'path'],
        },
      ],
    });
    return res.json(deliverers);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed.' });
    }

    const delivererExists = await Deliverer.findOne({
      where: { email: req.body.email },
    });

    if (delivererExists) {
      return res.status(400).json({
        error: `Deliverer with email ${req.body.email} already exists.`,
      });
    }

    const { id, name, email } = await Deliverer.create(req.body);

    return res.json({ id, name, email });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
      name: Yup.string(),
      email: Yup.string().email(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed.' });
    }

    const deliverer = await Deliverer.findByPk(req.body.id);

    if (deliverer.email !== req.body.email) {
      const delivererExists = await Deliverer.findOne({
        where: { email: req.body.email },
      });

      if (delivererExists) {
        return res.status(400).json({
          error: `Deliverer with email ${req.body.email} already exists.`,
        });
      }
    }

    if (!deliverer.active) {
      return res
        .status(400)
        .json({ error: 'An inactive deliverer cannot be edited.' });
    }

    const { id, name, email } = await deliverer.update(req.body);

    return res.json({ id, name, email });
  }

  async delete(req, res) {
    const deliverer = await Deliverer.findByPk(req.params.id);

    if (!deliverer.active) {
      return res.status(400).json({
        error: `The Deliverer is already inactive`,
      });
    }

    deliverer.active = false;
    const { id, name, email, active } = await deliverer.save();

    return res.json({ id, name, email, active });
  }
}

export default new DelivererController();
