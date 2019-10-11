export const imports = {
  'docs/components/RestfulCollection.mdx': () =>
    import(/* webpackPrefetch: true, webpackChunkName: "docs-components-restful-data-container" */ 'docs/components/RestfulCollection.mdx'),
  'docs/components/RestfulRender.mdx': () =>
    import(/* webpackPrefetch: true, webpackChunkName: "docs-components-restful-render" */ 'docs/components/RestfulRender.mdx'),
  'docs/methods/request.mdx': () =>
    import(/* webpackPrefetch: true, webpackChunkName: "docs-methods-request" */ 'docs/methods/request.mdx'),
  'docs/methods/setupEnvironment.mdx': () =>
    import(/* webpackPrefetch: true, webpackChunkName: "docs-methods-setup-environment" */ 'docs/methods/setupEnvironment.mdx'),
  'docs/instances/Resource.mdx': () =>
    import(/* webpackPrefetch: true, webpackChunkName: "docs-instances-resource" */ 'docs/instances/Resource.mdx'),
  'docs/instances/Store.mdx': () =>
    import(/* webpackPrefetch: true, webpackChunkName: "docs-instances-store" */ 'docs/instances/Store.mdx'),
  'docs/instances/ResourceType.mdx': () =>
    import(/* webpackPrefetch: true, webpackChunkName: "docs-instances-resource-type" */ 'docs/instances/ResourceType.mdx'),
}
