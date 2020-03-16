(function(){
    'use strict';

    function Border(position, width, closed) {
        this.leftPosition = position - width / 2;
        this.rightPosition = position + width / 2;
        this.closed = closed;
    }

    // export Border
    window.Border = Border;

}());