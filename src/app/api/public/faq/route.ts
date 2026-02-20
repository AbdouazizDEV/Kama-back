import { NextResponse } from 'next/server';
import { ApiResponse } from '@/shared/utils/ApiResponse';

/**
 * @swagger
 * /api/public/faq:
 *   get:
 *     summary: Questions fréquemment posées
 *     tags: [Public]
 *     security: []
 *     responses:
 *       200:
 *         description: Liste des questions fréquemment posées
 */
export async function GET() {
  const faq = [
    {
      id: 1,
      question: 'Comment puis-je créer une annonce ?',
      reponse: 'Pour créer une annonce, vous devez d\'abord créer un compte en tant que propriétaire. Une fois connecté, vous pourrez accéder à la section "Créer une annonce" et remplir le formulaire avec les détails de votre bien.',
    },
    {
      id: 2,
      question: 'Quels types de biens puis-je louer ?',
      reponse: 'Kama propose la location de plusieurs types de biens : appartements, maisons, terrains et véhicules. Chaque catégorie a ses propres caractéristiques et options de recherche.',
    },
    {
      id: 3,
      question: 'Comment fonctionne le système de réservation ?',
      reponse: 'Une fois que vous avez trouvé un bien qui vous intéresse, vous pouvez faire une demande de réservation. Le propriétaire recevra votre demande et pourra l\'accepter ou la refuser. Une fois acceptée, vous pourrez procéder au paiement.',
    },
    {
      id: 4,
      question: 'Quels sont les moyens de paiement acceptés ?',
      reponse: 'Kama accepte plusieurs moyens de paiement : Airtel Money, Moov Money, Stripe (cartes bancaires) et paiement en espèces. Le moyen de paiement peut varier selon le propriétaire.',
    },
    {
      id: 5,
      question: 'Puis-je annuler une réservation ?',
      reponse: 'Oui, vous pouvez annuler une réservation tant qu\'elle n\'a pas été acceptée par le propriétaire. Une fois acceptée, les conditions d\'annulation dépendent de la politique du propriétaire.',
    },
    {
      id: 6,
      question: 'Comment puis-je contacter un propriétaire ?',
      reponse: 'Une fois qu\'une réservation est créée, vous pouvez communiquer avec le propriétaire via le système de messagerie intégré à la plateforme.',
    },
    {
      id: 7,
      question: 'Les annonces sont-elles vérifiées ?',
      reponse: 'Oui, toutes les annonces sont soumises à une modération avant d\'être publiées. Notre équipe vérifie les informations et les photos pour garantir la qualité des annonces.',
    },
    {
      id: 8,
      question: 'Y a-t-il des frais de service ?',
      reponse: 'Les frais de service varient selon le type de bien et la durée de location. Ces informations sont indiquées clairement lors de la création de la réservation.',
    },
  ];

  return NextResponse.json(
    ApiResponse.success(faq, 'FAQ récupérée avec succès'),
    { status: 200 }
  );
}
