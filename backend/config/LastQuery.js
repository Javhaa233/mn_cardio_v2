class LastQuery {
  static Query = '';
  static setQuery(q) {
    this.Query = q;
  }
  static getQuery() {
    return this.Query;
  }
}

module.exports = LastQuery;
