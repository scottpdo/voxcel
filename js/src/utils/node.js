var $ = require('zepto-browserify').$;

module.exports = function node(tag, html, classes, container) {
    var node = $('<' + tag + '>');
    if ( html ) node.html(html);

    if ( classes ) {
        classes.split(' ').forEach(function(c) {
            node.addClass(c);
        });
    }

    if ( container ) container.append(node);

    return node;
};