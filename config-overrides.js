module.exports = function override(config) {
  // Tìm rule liên quan đến source-map-loader
  const rules = config.module.rules.find(rule => Array.isArray(rule.oneOf)).oneOf;
  const sourceMapRule = rules.find(rule => rule.loader && rule.loader.includes('source-map-loader'));
  if (sourceMapRule) {
    sourceMapRule.exclude = [/node_modules/];
  }
  return config;
};