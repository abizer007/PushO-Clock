module.exports = {
  async rewrites() {
    return [
      { source: '/api/:username.svg', destination: '/api/:username' }
    ];
  }
};
