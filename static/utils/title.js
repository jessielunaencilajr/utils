String.prototype.title = function() {
    return this.charAt(0).toUpperCase() + this.slice(1).replace('_',' ');
}