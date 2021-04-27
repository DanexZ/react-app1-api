const Post = require("../models/Post");
const User = require("../models/User");

exports.apiCreate = async (req, res) => {
  try {
    const post = new Post();

    post.validate(req.body);

    if (!post.errors.length) {
      const created_id = await post.create(["title", "body", "user_id", "created_at"], [post.title, post.body, post.user_id, post.created_at]);

      res.json({ created_id });
    } else {
      res.json({ errors: post.errors });
    }
  } catch (e) {
    res.status(500).send("Sorry, invalid user requested.");
  }
};

exports.apiUpdate = async (req, res) => {
  try {
    const post = new Post();

    const edited_id = await post.where("id", req.params.id).edit(["title", "body"], [req.body.title, req.body.body]);

    if (edited_id) {
      res.json(true);
    } else {
      res.json(false);
    }
  } catch (e) {
    res.json(false);
  }
};

exports.apiDelete = async (req, res) => {
  const post = new Post();

  const specyficPost = await post.where("id", req.params.id).one().get();

  if (specyficPost.user_id == req.apiUser.id) {
    const deleted_id = await post.where("id", req.params.id).delete();
    res.json("Success");
  } else {
    res.json("You do not have permission to perform that action.");
  }
};

exports.search = async (req, res) => {
  try {
    const searchTerm = req.body.searchTerm;
    const termLength = searchTerm.length;

    const post = new Post();
    const user = new User();

    const postsPromise = post.get();
    const usersPromise = user.get();

    const [posts, users] = await Promise.all([postsPromise, usersPromise]);

    const matchingPosts = [];

    posts.forEach((post) => {
      users.forEach((user) => {
        if (post.user_id == user.id) {
          post.author = user;
        }
      });

      if (post.title.substr(0, termLength) == searchTerm) matchingPosts.push(post);
    });

    res.json({ posts: matchingPosts });
  } catch (e) {
    res.json({ posts: [] });
  }
};

exports.reactApiViewSingle = async (req, res) => {
  try {
    const post = new Post();
    const user = new User();

    const specyficPost = await post.where("id", req.params.id).one().get();
    specyficPost.author = await user.where("id", specyficPost.user_id).one().get();

    res.json(specyficPost);
  } catch (e) {
    res.json(false);
  }
};
