import * as Yup from 'yup';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class DeliverymanController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const delivereymen = await Deliveryman.finddAll({
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
    return res.json(delivereymen);
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

    /**
     * Validate E-mail
     */
    const deliverymanExists = await Deliveryman.findOne({
      where: { email: req.body.email },
    });

    if (deliverymanExists) {
      return res.status(400).json({
        error: `Deliveryman with email ${req.body.email} already exists.`,
      });
    }

    const { id, name, email } = await Deliveryman.create(req.body);

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

    const deliveryman = await Deliveryman.findByPk(req.body.id);

    /**
     * Validate E-mail
     */
    if (req.body.email && deliveryman.email !== req.body.email) {
      const delivererExists = await Deliveryman.findOne({
        where: { email: req.body.email },
      });

      if (delivererExists) {
        return res.status(400).json({
          error: `Deliveryman with email ${req.body.email} already exists.`,
        });
      }
    }

    if (!deliveryman.active) {
      return res
        .status(400)
        .json({ error: 'An inactive deliveryman cannot be edited.' });
    }

    const { id, name, email } = await deliveryman.update(req.body);

    return res.json({ id, name, email });
  }

  async delete(req, res) {
    const deliveryman = await Deliveryman.findByPk(req.params.id);

    /**
     * Validate deliveryman
     */
    if (!deliveryman) {
      return res.status(400).json({
        error: `Invalid Deliveryman`,
      });
    }

    /**
     * Validate if it's already deleted
     */
    if (!deliveryman.active) {
      return res.status(400).json({
        error: `The Deliveryman is already inactive`,
      });
    }

    deliveryman.active = false;
    const { id, name, email, active } = await deliveryman.save();

    return res.json({ id, name, email, active });
  }
}

export default new DeliverymanController();
