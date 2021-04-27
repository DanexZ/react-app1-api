const Model = require("./Model");
const moment = require("moment");
const timezone = require("moment-timezone");

class Follow extends Model {
  constructor(data) {
    super();
    this.data = data;
    this.errors = [];
  }
}

module.exports = Follow;
