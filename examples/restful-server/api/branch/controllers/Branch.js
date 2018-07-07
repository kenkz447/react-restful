'use strict';

/**
 * Branch.js controller
 *
 * @description: A set of functions called "actions" for managing `Branch`.
 */

module.exports = {

  /**
   * Retrieve branch records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    return strapi.services.branch.fetchAll(ctx.query);
  },

  /**
   * Retrieve a branch record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.branch.fetch(ctx.params);
  },

  /**
   * Count branch records.
   *
   * @return {Number}
   */

  count: async (ctx) => {
    return strapi.services.branch.count(ctx.query);
  },

  /**
   * Create a/an branch record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.branch.add(ctx.request.body);
  },

  /**
   * Update a/an branch record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.branch.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an branch record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.branch.remove(ctx.params);
  }
};
