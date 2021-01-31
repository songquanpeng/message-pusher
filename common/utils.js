const lexer = require('marked').lexer;
const parser = require('marked').parser;

function md2html(markdown) {
  return parser(lexer(markdown));
}

module.exports = {
  md2html,
};
