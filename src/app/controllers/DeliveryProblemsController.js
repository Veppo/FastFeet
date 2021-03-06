import DeliveryProblems from '../schemas/DeliveryProblems';
import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';
import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';

class DeliveryProblemsController {
  async index(req, res) {
    const { deliveryId } = req.params;

    let problemsQuery = DeliveryProblems.find().sort({ createdAt: 'desc' });

    if (deliveryId) {
      problemsQuery = problemsQuery.where(`delivery_id`).equals(deliveryId);
    }

    const problems = await problemsQuery.exec();
    return res.json(problems);
  }

  async store(req, res) {
    const { deliveryId } = req.params;

    const { product } = await Delivery.findByPk(deliveryId);

    const problem = await DeliveryProblems.create({
      description: `Problem reported for the Delivery code ${deliveryId}, for Product ${product}.`,
      delivery_id: deliveryId,
    });

    return res.json(problem);
  }

  async delete(req, res) {
    const { problemId } = req.params;

    const problem = await DeliveryProblems.findById(problemId);
    const delivery = await Delivery.findByPk(problem.delivery_id, {
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name', 'email'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['name'],
        },
      ],
    });

    if (delivery.canceled_at) {
      return res.status(400).json({
        error: `The Delivery is already canceled`,
      });
    }

    delivery.canceled_at = new Date();
    const { id, product, canceled_at } = await delivery.save();

    await Queue.add(CancellationMail.key, {
      delivery,
      problem,
    });

    return res.json({
      id,
      product,
      canceled_at,
      description: problem.description,
    });
  }
}

export default new DeliveryProblemsController();
