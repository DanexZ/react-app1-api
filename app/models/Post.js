const Model = require("./Model");
const moment = require("moment");
const timezone = require("moment-timezone");

class Post extends Model {
  constructor(data) {
    super();
    this.data = data;
    this.errors = [];
  }

  validate(data) {
    this.title = data.title;
    this.body = data.body;
    this.user_id = data.user_id;
    this.created_at = moment().tz("Europe/Warsaw").format("YYYY-MM-DD HH:mm:ss");

    //todo make some validate here
  }
}

module.exports = Post;
