const User = require("../models/User");
const Post = require("../models/Post");
const Follow = require("../models/Follow");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// how long a token lasts before expiring
const tokenLasts = "365d";

exports.apiGetPostsByUsername = async (req, res) => {
  try {
    const post = new Post();
    const user = new User();

    const specyficUser = await user.where("username", req.params.username).one().get();
    const posts = await post.where("user_id", specyficUser.id).get();

    posts.forEach((post) => {
      post.author = specyficUser;
    });

    //res.header("Cache-Control", "max-age=10").json(posts)
    res.json(posts);
  } catch (e) {
    res.status(500).send("Sorry, invalid user requested.");
  }
};

exports.checkToken = (req, res) => {
  try {
    req.apiUser = jwt.verify(req.body.token, process.env.JWTSECRET);
    res.json(true);
  } catch (e) {
    res.json(false);
  }
};

exports.apiMustBeLoggedIn = (req, res, next) => {
  try {
    req.apiUser = jwt.verify(req.body.token, process.env.JWTSECRET);
    console.log(req.apiUser);
    next();
  } catch (e) {
    res.status(500).send("Sorry, you must provide a valid token.");
  }
};

exports.doesUsernameExist = async (req, res) => {
  const user = new User();

  const specyficUser = await user.where("username", req.body.username).one().get();

  res.json(specyficUser);
};

exports.doesEmailExist = async (req, res) => {
  const user = new User();

  const specyficUser = await user.where("email", req.body.email).one().get();

  res.json(specyficUser);
};

exports.sharedProfileData = async (req, res, next) => {
  let viewer_id;
  try {
    viewer = jwt.verify(req.body.token, process.env.JWTSECRET);
    viewer_id = viewer.id;

    const post = new Post();
    const follow = new Follow();

    const postsPromise = post.where("user_id", req.profileUser.id).get();
    const followsPromise = follow.get();

    const [posts, follows] = await Promise.all([postsPromise, followsPromise]);

    let followerCount = 0;
    let followingCount = 0;
    let isFollowing = false;

    follows.forEach((follow) => {
      if (follow.follower_id == req.profileUser.id) followingCount++;
      if (follow.followed_id == req.profileUser.id) followerCount++;
      if (follow.followed_id == req.profileUser.id && follow.follower_id == viewer_id) isFollowing = true;
    });

    req.isFollowing = isFollowing;
    req.postCount = posts.length;
    req.followerCount = followerCount;
    req.followingCount = followingCount;

    next();
  } catch (e) {
    viewer_id = 0;
    console.log(e);
  }
};

exports.apiLogin = async (req, res) => {
  let errors = [];
  const user = new User();

  const specyficUser = await user.where("username", req.body.username).one().get();

  if (specyficUser) {
    if (!bcrypt.compareSync(req.body.password, specyficUser.password)) {
      errors.push("Błędne hasło");
    } else {
      specyficUser.token = jwt.sign({ id: specyficUser.id, username: specyficUser.username, avatar: specyficUser.avatar }, process.env.JWTSECRET, { expiresIn: tokenLasts });
    }
  } else {
    errors.push("Nie ma takiego użytkownika");
  }

  res.json({
    user: specyficUser,
    errors
  });
};

exports.apiRegister = async (req, res) => {
  const user = new User();

  const salt = bcrypt.genSaltSync(10);
  const hashPassword = bcrypt.hashSync(req.body.password, salt);

  const created_id = await user.create(["username", "email", "password", "avatar"], [req.body.username, req.body.email, hashPassword, "https://gravatar.com/avatar/placeholder?s=128"]);

  if (created_id) {
    res.json({
      id: created_id,
      token: jwt.sign({ id: created_id, username: req.body.username }, process.env.JWTSECRET, { expiresIn: tokenLasts }),
      username: req.body.username,
      avatar: "https://gravatar.com/avatar/placeholder?s=128"
    });
  } else {
    res.status(500).send(false);
  }
};

exports.apiGetHomeFeed = async (req, res) => {
  try {
    const post = new Post();
    const user = new User();
    const follow = new Follow();

    const usersPromise = user.get();
    const postsPromise = post.get();
    const followingPromise = follow.where("follower_id", req.apiUser.id).get();

    const [users, posts, following] = await Promise.all([usersPromise, postsPromise, followingPromise]);

    const relevantPosts = [];

    following.forEach((follow) => {
      posts.forEach((post) => {
        if (post.user_id == follow.followed_id) {
          users.forEach((user) => {
            if (post.user_id == user.id) {
              post.author = user;
            }
          });

          relevantPosts.push(post);
        }
      });
    });

    res.json(relevantPosts);
  } catch (e) {
    res.status(500).send("Error");
  }
};

exports.ifUserExists = async (req, res, next) => {
  const user = new User();

  const specyficUser = await user.where("username", req.params.username).one().get();

  if (specyficUser) {
    req.profileUser = specyficUser;
    next();
  } else {
    res.json(false);
  }
};

exports.profileBasicData = (req, res) => {
  res.json({
    profileUsername: req.profileUser.username,
    profileAvatar: req.profileUser.avatar,
    isFollowing: req.isFollowing,
    counts: { postCount: req.postCount, followerCount: req.followerCount, followingCount: req.followingCount }
  });
};

exports.profileFollowers = async (req, res) => {
  try {
    const followed_id = req.profileUser.id;

    const user = new User();
    const follow = new Follow();

    const usersPromise = user.get();
    const followersPromise = follow.where("followed_id", followed_id).get();

    const [users, followers] = await Promise.all([usersPromise, followersPromise]);

    for (let i = 0; i < followers.length; i++) {
      for (let m = 0; m < users.length; m++) {
        if (users[m].id == followers[i].follower_id) {
          followers[i] = users[m];
        }
      }
    }

    res.json(followers);
  } catch (e) {
    res.status(500).send("Error");
  }
};

exports.profileFollowing = async (req, res) => {
  try {
    const follower_id = req.profileUser.id;

    const user = new User();
    const follow = new Follow();

    const usersPromise = user.get();
    const followingPromise = follow.where("follower_id", follower_id).get();

    const [users, following] = await Promise.all([usersPromise, followingPromise]);

    for (let i = 0; i < following.length; i++) {
      for (let m = 0; m < users.length; m++) {
        if (users[m].id == following[i].followed_id) {
          following[i] = users[m];
        }
      }
    }

    res.json(following);
  } catch (e) {
    res.status(500).send("Error");
  }
};
