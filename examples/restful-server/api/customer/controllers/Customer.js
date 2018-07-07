'use strict';

/**
 * Customer.js controller
 *
 * @description: A set of functions called "actions" for managing `Customer`.
 */

module.exports = {

  /**
   * Retrieve customer records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    return strapi.services.customer.fetchAll(ctx.query);
  },

  /**
   * Retrieve a customer record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.customer.fetch(ctx.params);
  },

  /**
   * Count customer records.
   *
   * @return {Number}
   */

  count: async (ctx) => {
    return strapi.services.customer.count(ctx.query);
  },

  /**
   * Create a/an customer record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.customer.add(ctx.request.body);
  },

  /**
   * Update a/an customer record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.customer.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an customer record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.customer.remove(ctx.params);
  }
};
