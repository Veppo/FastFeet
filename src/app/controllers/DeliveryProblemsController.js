import DeliveryProblems from '../schemas/DeliveryProblems';

import Delivery from '../models/Delivery';

class DeliveryProblemsController {
  async index(req, res) {
    const { deliveryId } = req.params;

    let problemsQuery = DeliveryProblems.find({
      delivery_id: deliveryId,
    }).sort({ createdAt: 'desc' });

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
}

export default new DeliveryProblemsController();
