/**
 * Custom RSVP submit route
 */

/** @type {import('@strapi/strapi').Core.RouterConfig} */
export default {
  type: 'content-api',
  routes: [
    {
      method: 'POST',
      path: '/',
      handler: 'rsvp.submit',
      config: {
        auth: true,
      },
    },
  ],
};
