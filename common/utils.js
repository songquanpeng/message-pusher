const lexer = require('marked').lexer;
const parser = require('marked').parser;

function md2html(markdown) {
  if (markdown) {
    return parser(lexer(markdown));
  }
  return markdown;
}

module.exports = {
  md2html,
};
