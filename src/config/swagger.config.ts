import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env.config';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'kama API',
      version: '1.0.0',
      description: 'API de la plateforme de location multi-catégories kama',
      contact: {
        name: 'kama Support',
        email: 'support@kama.com',
      },
    },
    servers: [
      {
        url: env.app.apiUrl,
        description: 'Serveur de développement',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
                details: { type: 'object' },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            nom: { type: 'string' },
            prenom: { type: 'string' },
            telephone: { type: 'string' },
            photoProfil: { type: 'string', nullable: true },
            typeUtilisateur: {
              type: 'string',
              enum: ['LOCATAIRE', 'PROPRIETAIRE', 'ETUDIANT', 'ADMIN'],
            },
            estActif: { type: 'boolean' },
            estVerifie: { type: 'boolean' },
            dateInscription: { type: 'string', format: 'date-time' },
          },
        },
        Annonce: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            titre: { type: 'string' },
            description: { type: 'string' },
            typeBien: {
              type: 'string',
              enum: ['APPARTEMENT', 'MAISON', 'TERRAIN', 'VEHICULE'],
            },
            prix: { type: 'number' },
            caution: { type: 'number' },
            ville: { type: 'string' },
            quartier: { type: 'string' },
            photos: { type: 'array', items: { type: 'string' } },
            estDisponible: { type: 'boolean' },
          },
        },
      },
    },
    // Pas de sécurité par défaut - chaque endpoint définit sa propre sécurité
  },
  apis: [
    './src/docs/swagger/*.ts', // Fichiers contenant la documentation
    './src/app/api/**/*.ts', // Route handlers pour auto-documentation
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
