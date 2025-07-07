const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { sendResponse } = require("../utils/response");
const userSchema = require("../validators/userValidator");

const router = express.Router();

// Mock database
let users = [
  {
    first_name: "John",
    last_name: "Doe",
    email: "johndoe@example.com",
    id: "1",
  },
  {
    first_name: "Alice",
    last_name: "Smith",
    email: "alicesmith@example.com",
    id: "2",
  },
];

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Getting the list of users from the mock database
router.get("/", (req, res) => {
  return sendResponse(res, 200, "Users retrieved successfully", users);
});

// with manually validations ----------------

// router.post("/", (req, res) => {
//   const { first_name, email, last_name } = req.body;

//   // ✅ Basic validations
//   if (!first_name || !email) {
//     return sendResponse(res, 400, "First name and email are required");
//   }

//   if (!isValidEmail(email)) {
//     return sendResponse(res, 400, "Invalid email format");
//   }

//   const emailExists = users.some((u) => u.email === email);
//   if (emailExists) {
//     return sendResponse(res, 400, "User with this email already exists");
//   }

//   const newUser = {
//     id: uuidv4(),
//     first_name,
//     last_name: last_name || "", // optional fallback
//     email,
//   };

//   users.push(newUser);

//   return sendResponse(res, 200, "User added successfully", newUser);
// });

// router.patch("/:id", (req, res) => {
//   const { id } = req.params;

//   const { first_name, last_name, email } = req.body;

//   const user = users.find((user) => user.id === id);

//   if (first_name) user.first_name = first_name;
//   if (last_name) user.last_name = last_name;
//   if (email) user.email = email;

//   sendResponse(res, 200, "User updated successfully");
// });

router.delete("/:id", (req, res) => {
  const { id } = req.params;

  users = users.filter((user) => user.id !== id);

  sendResponse(res, 200, "User deleted successfully");
});

// with joi validations ----------------
router.post("/", (req, res) => {
  const { error, value } = userSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map((err) => err.message);
    return sendResponse(res, 400, "Validation failed", { errors: messages });
  }

  const { email } = value;
  const emailExists = users.some((u) => u.email === email);

  if (emailExists) {
    return sendResponse(res, 400, "User with this email already exists");
  }

  const newUser = { ...value, id: uuidv4() };
  users.push(newUser);

  return sendResponse(res, 201, "User added successfully", newUser);
});

router.patch("/:id", (req, res) => {
  const { error, value } = userSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map((err) => err.message);
    return sendResponse(res, 400, "Validation failed", { errors: messages });
  }

  const { id } = req.params;

  const { first_name, last_name, email } = req.body;

  if (email) {
    const emailExists = users.some((u) => u.email === email && u.id !== id);
    if (emailExists) {
      return sendResponse(
        res,
        400,
        "Another user with this email already exists"
      );
    }
  }

  const user = users.find((user) => user.id === id);

  if (first_name) user.first_name = first_name;
  if (last_name) user.last_name = last_name;
  if (email) user.email = email;

  sendResponse(res, 200, "User updated successfully");
});

module.exports = router;
