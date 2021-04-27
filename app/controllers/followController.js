const Follow = require("../models/Follow");
const User = require("../models/User");

exports.apiAddFollow = async (req, res) => {
  try {
    const follower_id = req.apiUser.id;
    const followed_username = req.params.username;

    console.log(follower_id);
    console.log(followed_username);

    const follow = new Follow();
    const user = new User();

    const followed_user = await user.where("username", followed_username).one().get();

    console.log(followed_user);

    const created_row_id = await follow.create(["follower_id", "followed_id"], [follower_id, followed_user.id]);

    if (created_row_id) {
      res.json(true);
    } else {
      res.json(false);
    }
  } catch (e) {
    console.log(e);
    res.json(false);
  }
};

exports.apiRemoveFollow = async (req, res) => {
  try {
    const follow = new Follow();
    const user = new User();

    const followed_user = await user.where("username", req.params.username).one().get();
    const removed_id = await follow.where("followed_id", followed_user.id).where("follower_id", req.apiUser.id).delete();

    if (removed_id) res.json(true);

    res.json(false);
  } catch (e) {
    console.log(e);
  }
};
