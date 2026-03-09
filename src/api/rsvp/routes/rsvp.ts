/**
 * rsvp router - disable core routes, only use custom submit
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::rsvp.rsvp', {
  except: ['find', 'findOne', 'create', 'update', 'delete'],
});
