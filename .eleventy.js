module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  // Speakers and news are added as collections once that content exists:
  //   eleventyConfig.addCollection("speakers", c => c.getFilteredByGlob("src/speakers/*.md"));

  eleventyConfig.addFilter("jsonify", (value) => JSON.stringify(value));

  return {
    dir: {
      input: "src",
      includes: "_includes",
      layouts: "_includes/layouts",
      data: "_data",
      output: "_site"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
