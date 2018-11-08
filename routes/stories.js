const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const { ensureAuthenticated, ensureGuest } = require("../helpers/auth");

//Load Model
const Story = mongoose.model("stories");
const User = mongoose.model("users");

//Stories index
router.get("/", (req, res) => {
  Story.find({ status: "public" })
    .populate("user") //It is used to access user info from user model
    .sort({ date: "desc" })
    .then(stories => {
      res.render("stories/index", {
        stories: stories
      });
    });
});

//Show single story
router.get("/show/:id", (req, res) => {
  Story.findOne({
    _id: req.params.id
  })
    .populate("user")
    .populate("comment.commentUser")
    .then(story => {
      if (story.status == "public") {
        res.render("stories/show", { story: story });
      } else {
        if (req.user) {
          if ((req.user.id = story.user._id)) {
            res.render("stories/show", { story: story });
          } else {
            res.redirect("/stories");
          }
        } else {
          res.redirect("/stories");
        }
      }
    });
});

//List stories from a user
router.get("/user/:userId", (req, res) => {
  Story.find({ user: req.params.userId, status: "public" })
    .populate("user")
    .then(stories => {
      res.render("stories/index", {
        stories: stories
      });
    });
});

//Logged in user story
router.get("/my", ensureAuthenticated, (req, res) => {
  let myPage = true;
  Story.find({ user: req.user.id })
    .populate("user")
    .then(stories => {
      res.render("stories/index", {
        stories: stories,
        myPage
      });
    });
});

//Add story form
router.get("/add", ensureAuthenticated, (req, res) => {
  res.render("stories/add");
});

//Edit story form
router.get("/edit/:id", ensureAuthenticated, (req, res) => {
  Story.findOne({
    _id: req.params.id
  }).then(story => {
    if (story.user != req.user.id) {
      res.redirect("/stories");
    } else {
      res.render("stories/edit", { story: story });
    }
  });
});

//Process add story
router.post("/", (req, res) => {
  let allowComments;

  if (req.body.allowComments) {
    allowComments = true;
  } else {
    allowComments = false;
  }

  const newStory = {
    title: req.body.title,
    body: req.body.body,
    status: req.body.status,
    allowComments: allowComments,
    user: req.user.id
  };

  //Create your Story
  new Story(newStory).save().then(story => {
    res.redirect(`stories/show/${story.id}`);
  });
});

//Process Edit form
router.put("/:id", (req, res) => {
  Story.findOne({
    _id: req.params.id
  }).then(story => {
    let allowComments;

    if (req.body.allowComments) {
      allowComments = true;
    } else {
      allowComments = false;
    }

    //New value
    story.title = req.body.title;
    story.body = req.body.body;
    story.status = req.body.status;
    story.allowComments = allowComments;

    story.save().then(story => res.redirect("/dashboard"));
  });
});

//Delete story
router.delete("/:id", (req, res) => {
  Story.remove({ _id: req.params.id }).then(() => res.redirect("/dashboard"));
});

//Add comment
router.post("/comment/:id", (req, res) => {
  Story.findOne({
    _id: req.params.id
  }).then(story => {
    const newComment = {
      commentBody: req.body.commentBody,
      commentUser: req.user.id
    };

    //Add comments to arrray
    story.comment.unshift(newComment);

    story.save().then(story => {
      res.redirect(`/stories/show/${story.id}`);
    });
  });
});

module.exports = router;
