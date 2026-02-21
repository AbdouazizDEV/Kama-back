import { ILitigeRepository, LitigeFilters } from '@/core/domain/repositories/ILitigeRepository';
import { Litige, StatutLitige, TypeLitige } from '@/core/domain/entities/Litige.entity';
import { supabase } from '../supabase.client';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SupabaseLitigeRepository implements ILitigeRepository {
  async findById(id: string): Promise<Litige | null> {
    const litigeData = await prisma.litige.findUnique({
      where: { id },
      include: {
        commentaires: {
          orderBy: { date: 'asc' },
        },
      },
    });

    if (!litigeData) return null;

    return this.mapToEntity(litigeData);
  }

  async findAll(filters?: LitigeFilters): Promise<Litige[]> {
    const where: any = {};

    if (filters?.statut) {
      where.statut = filters.statut;
    }
    if (filters?.type) {
      where.type = filters.type;
    }
    if (filters?.locataireId) {
      where.locataireId = filters.locataireId;
    }
    if (filters?.proprietaireId) {
      where.proprietaireId = filters.proprietaireId;
    }

    const litigesData = await prisma.litige.findMany({
      where,
      include: {
        commentaires: {
          orderBy: { date: 'asc' },
        },
      },
      orderBy: { dateCreation: 'desc' },
    });

    return litigesData.map((item) => this.mapToEntity(item));
  }

  async save(litige: Litige): Promise<void> {
    await prisma.litige.create({
      data: {
        id: litige.id,
        reservationId: litige.reservationId || undefined,
        locataireId: litige.locataireId,
        proprietaireId: litige.proprietaireId,
        type: litige.type,
        description: litige.description,
        statut: litige.statut,
        resolution: litige.resolution || undefined,
        dateCreation: litige.dateCreation,
        dateModification: litige.dateModification,
        commentaires: {
          create: litige.commentaires.map((comment) => ({
            auteurId: comment.auteurId,
            contenu: comment.contenu,
            date: comment.date,
          })),
        },
      },
    });
  }

  async update(litige: Litige): Promise<void> {
    // Mettre à jour le litige
    await prisma.litige.update({
      where: { id: litige.id },
      data: {
        statut: litige.statut,
        resolution: litige.resolution || undefined,
        dateModification: litige.dateModification,
      },
    });

    // Mettre à jour les commentaires (supprimer les anciens et créer les nouveaux)
    await prisma.commentaireLitige.deleteMany({
      where: { litigeId: litige.id },
    });

    if (litige.commentaires.length > 0) {
      await prisma.commentaireLitige.createMany({
        data: litige.commentaires.map((comment) => ({
          litigeId: litige.id,
          auteurId: comment.auteurId,
          contenu: comment.contenu,
          date: comment.date,
        })),
      });
    }
  }

  private mapToEntity(data: any): Litige {
    const litige = new Litige(
      data.id,
      data.reservationId,
      data.locataireId,
      data.proprietaireId,
      data.type as TypeLitige,
      data.description,
      data.statut as StatutLitige,
      new Date(data.dateCreation),
      new Date(data.dateModification),
      data.resolution,
      []
    );

    // Ajouter les commentaires
    if (data.commentaires && Array.isArray(data.commentaires)) {
      data.commentaires.forEach((comment: any) => {
        litige.addComment(comment.auteurId, comment.contenu);
      });
    }

    return litige;
  }
}
