const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { sendResponse } = require("../utils/response");
const userSchema = require("../validators/userValidator");
const validateSchema = require("../utils/validate");
const userSchema2 = require("../validators/userSchema");
const db = require("../db/db");
const authMiddleware = require("../middlewares/authMiddleware");
const bcrypt = require("bcryptjs");

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
router.get("/", authMiddleware, async (req, res) => {
  const [rows] = await db.query("SELECT * FROM users");
  // return sendResponse(res, 200, "Users retrieved successfully", users);
  return sendResponse(res, 200, "Users retrieved successfully", rows);
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

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  // users = users.filter((user) => user.id !== id);
  await db.query("DELETE FROM users WHERE id = ?", [id]);

  sendResponse(res, 200, "User deleted successfully");
});

// with joi validations ----------------
// router.post("/", (req, res) => {
//   const { error, value } = userSchema.validate(req.body, {
//     abortEarly: false,
//     stripUnknown: true,
//   });

//   if (error) {
//     const messages = error.details.map((err) => err.message);
//     return sendResponse(res, 400, "Validation failed", { errors: messages });
//   }

//   const { email } = value;
//   const emailExists = users.some((u) => u.email === email);

//   if (emailExists) {
//     return sendResponse(res, 400, "User with this email already exists");
//   }

//   const newUser = { ...value, id: uuidv4() };
//   users.push(newUser);

//   return sendResponse(res, 200, "User added successfully", newUser);
// });

// router.patch("/:id", (req, res) => {
//   const { error, value } = userSchema.validate(req.body, {
//     abortEarly: false,
//     stripUnknown: true,
//   });

//   if (error) {
//     const messages = error.details.map((err) => err.message);
//     return sendResponse(res, 400, "Validation failed", { errors: messages });
//   }

//   const { id } = req.params;

//   const { first_name, last_name, email } = req.body;

//   if (email) {
//     const emailExists = users.some((u) => u.email === email && u.id !== id);
//     if (emailExists) {
//       return sendResponse(
//         res,
//         400,
//         "Another user with this email already exists"
//       );
//     }
//   }

//   const user = users.find((user) => user.id === id);

//   if (first_name) user.first_name = first_name;
//   if (last_name) user.last_name = last_name;
//   if (email) user.email = email;

//   sendResponse(res, 200, "User updated successfully");
// });

// with AJV validations ----------------
router.post("/", async (req, res) => {
  const { valid, errors } = validateSchema(userSchema2, req.body);

  if (!valid) {
    const messages = errors.map(
      (e) =>
        `${e.instancePath.replace("/", "") || e.params.missingProperty} ${
          e.message
        }`
    );
    return sendResponse(res, 400, "Validation failed", { errors: messages });
  }

  const [users] = await db.query("SELECT * FROM users");

  const emailExists = users.some((u) => u.email === req.body.email);
  if (emailExists) {
    return sendResponse(res, 400, "User with this email already exists");
  }

  // const newUser = { ...req.body, id: uuidv4() };

  // const { first_name, last_name, email, id, password } = newUser;
  const newUser = { ...req.body };

  const { first_name, last_name, email, password } = newUser;

  const hashedPassword = await bcrypt.hash(password, 10); // 10 salt rounds

  // users.push(newUser);

  await db.query(
    "INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)",
    [first_name, last_name, email, hashedPassword]
  );
  return sendResponse(res, 200, "User added successfully", newUser);
});

router.patch("/:id", async (req, res) => {
  const { valid, errors } = validateSchema(userSchema2, req.body);

  if (!valid) {
    const messages = errors.map(
      (e) =>
        `${e.instancePath.replace("/", "") || e.params.missingProperty} ${
          e.message
        }`
    );
    return sendResponse(res, 400, "Validation failed", { errors: messages });
  }

  const { id } = req.params;

  const { first_name, last_name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10); // 10 salt rounds

  if (email) {
    const [users] = await db.query("SELECT * FROM users");

    const emailExists = users.some((u) => u.email === email && u.id != id);
    if (emailExists) {
      return sendResponse(
        res,
        400,
        "Another user with this email already exists"
      );
    }
  }

  await db.query(
    "UPDATE users SET first_name = ?, last_name = ?, email = ?, password = ? WHERE id = ?",
    [first_name, last_name, email, hashedPassword, id]
  );

  // const user = users.find((user) => user.id === id);

  // if (first_name) user.first_name = first_name;
  // if (last_name) user.last_name = last_name;
  // if (email) user.email = email;

  sendResponse(res, 200, "User updated successfully");
});

module.exports = router;
