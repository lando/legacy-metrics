// const _ = require('lodash');
const {Octokit} = require('@octokit/core');
const octokit = new Octokit();

module.exports = {
  onPreBuild: async ({netlifyConfig}) => {
    const owner = 'lando';
    const repo = 'legacy-metrics';
    const tags = await octokit.request('GET /repos/{owner}}/{repo}/tags', {owner, repo});
    console.log(tags);
    console.log(netlifyConfig.build.environment);
  },
};
