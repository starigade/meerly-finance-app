// Metro configuration for React Native and Web
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add support for web
config.resolver.sourceExts = [...config.resolver.sourceExts, "mjs"];

module.exports = config;
