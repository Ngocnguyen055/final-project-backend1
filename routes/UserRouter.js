const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../db/userModel.js");
const Photo = require("../db/photoModel.js");

// GET /user/list - Get list of all users
router.get("/list", async function (request, response) {
  try {
    const users = await User.find({}).select("_id first_name last_name");

    const usersWithCounts = await Promise.all(
      users.map(async (user) => {
        const userObj = JSON.parse(JSON.stringify(user));

        userObj.photo_count = await Photo.countDocuments({ user_id: user._id });

        const photosWithUserComments = await Photo.find({
          "comments.user_id": user._id,
        });
        let commentCount = 0;
        photosWithUserComments.forEach((photo) => {
          photo.comments.forEach((c) => {
            if (c.user_id.toString() === user._id.toString()) {
              commentCount++;
            }
          });
        });
        userObj.comment_count = commentCount;

        return userObj;
      })
    );

    response.status(200).send(usersWithCounts);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách user:", error);
    response.status(500).send("Internal Server Error");
  }
});

// GET /user/:id - Get user details
router.get("/:id", async function (request, response) {
  const id = request.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).send("ID không hợp lệ");
  }

  try {
    const user = await User.findById(id).select(
      "_id first_name last_name location description occupation"
    );

    if (!user) {
      return response.status(400).send("Không tìm thấy người dùng");
    }

    response.status(200).send(user);
  } catch (error) {
    console.error("Lỗi lấy chi tiết user:", error);
    response.status(500).send("Internal Server Error");
  }
});

module.exports = router;
