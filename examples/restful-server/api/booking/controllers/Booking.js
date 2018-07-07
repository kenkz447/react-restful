'use strict';

/**
 * Booking.js controller
 *
 * @description: A set of functions called "actions" for managing `Booking`.
 */

module.exports = {

  /**
   * Retrieve booking records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    return strapi.services.booking.fetchAll(ctx.query);
  },

  /**
   * Retrieve a booking record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.booking.fetch(ctx.params);
  },

  /**
   * Count booking records.
   *
   * @return {Number}
   */

  count: async (ctx) => {
    return strapi.services.booking.count(ctx.query);
  },

  /**
   * Create a/an booking record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.booking.add(ctx.request.body);
  },

  /**
   * Update a/an booking record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.booking.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an booking record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.booking.remove(ctx.params);
  }
};
