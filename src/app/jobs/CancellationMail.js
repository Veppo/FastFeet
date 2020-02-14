import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class CancellationMail {
  get key() {
    return 'CancellationMail';
  }

  async handle({ data }) {
    const { delivery, problem } = data;

    await Mail.sendMail({
      to: `${delivery.deliveryman.name} <${delivery.deliveryman.email}>`,
      subject: `Delivery of ${delivery.product} was cancelled`,
      template: 'cancellation',
      context: {
        deliveryman: delivery.deliveryman.name,
        recipient: delivery.recipient.name,
        date: format(
          parseISO(delivery.canceled_at),
          "'Cancelada dia' dd 'de' MMMM', às' H:mm'h'",
          {
            locale: pt,
          }
        ),
        description: problem ? problem.description : `Desistência do Cliente.`,
      },
    });
  }
}

export default new CancellationMail();
