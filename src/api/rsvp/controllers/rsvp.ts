/**
 * rsvp controller
 */

import type { Context } from 'koa';

interface RsvpResponse {
  guest: string;
  asistencia: string;
  comida: string;
}

interface RsvpBody {
  data?: {
    invitation: string;
    responses: RsvpResponse[];
  };
}

export default {
  async submit(ctx: Context) {
    const { data } = ctx.request.body as RsvpBody;

    if (!data?.invitation || !Array.isArray(data?.responses)) {
      return ctx.badRequest('Invalid request body. Expected { data: { invitation: string, responses: array } }');
    }

    const { invitation: slug, responses } = data;

    // 1) Search for the invitation by slug
    const invitation = await strapi.documents('api::invitation.invitation').findFirst({
      filters: { slug: { $eq: slug } },
      status: 'published',
      populate: { guests: { fields: ['documentId'] } },
    });

    if (!invitation) {
      return ctx.notFound(`Invitation with slug "${slug}" not found`);
    }

    const validGuestIds = new Set(
      (Array.isArray(invitation.guests) ? invitation.guests : []).map(
        (g: { documentId: string }) => g.documentId
      )
    );

    const updated: Array<{ documentId: string }> = [];
    const errors: Array<{ documentId: string; error: string }> = [];

    // 2) Retrieve each guest and 3) Update asistencia, comida; 4) Set rsvp_status to Completado
    for (const { guest: documentId, asistencia, comida } of responses) {
      if (!validGuestIds.has(documentId)) {
        errors.push({ documentId, error: 'Guest not found or does not belong to this invitation' });
        continue;
      }

      try {
        await strapi.documents('api::guest.guest').update({
          documentId,
          data: {
            asistencia: asistencia as 'Acepto' | 'Declino',
            comida: comida as 'Vegetariana' | 'Carnivora',
            rsvp_status: 'Completado',
          },
        });
        updated.push({ documentId });
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        errors.push({ documentId, error: message });
      }
    }

    return ctx.send({
      data: {
        invitation: invitation.documentId,
        updated: updated.length,
        updatedGuests: updated,
        ...(errors.length > 0 && { errors }),
      },
    });
  },
};
