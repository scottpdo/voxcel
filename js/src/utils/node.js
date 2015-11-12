import { $ } from 'zepto-browserify';

let node = (tag, html, classes, container) => {
    let node = $('<' + tag + '>');
    if ( html ) node.html(html);

    if ( classes ) {
        classes.split(' ').forEach(c => {
            node.addClass(c);
        });
    }

    if ( container ) container.append(node);

    return node;
};

export default node;