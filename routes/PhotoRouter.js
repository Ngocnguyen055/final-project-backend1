const express = require("express");
const router = express.Router();
const Photo = require("../db/photoModel.js");
const User = require("../db/userModel");

// GET /photosOfUser/:id - Get all photos of a user
router.get("/photosOfUser/:id", async (request, response) => {
  const id = request.params.id;
  const photos = await Photo.find({ user_id: id });

  if (!photos || photos.length === 0) {
    return response.status(400).send("Không tìm thấy ảnh cho user này");
  }

  const photosJSON = JSON.parse(JSON.stringify(photos));

  for (let i = 0; i < photosJSON.length; i++) {
    let photo = photosJSON[i];
    delete photo.__v;

    for (let j = 0; j < photo.comments.length; j++) {
      let comment = photo.comments[j];

      const commentUser = await User.findById(
        comment.user_id,
        "_id first_name last_name"
      );

      comment.user = commentUser;
      delete comment.user_id;
    }
  }

  response.status(200).send(photosJSON);
});

module.exports = router;
