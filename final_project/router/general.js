const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password must be provided." });
    }

    if (isValid(username)) {
      return res.status(409).json({ message: "User already exists!" });
    }

    users.push({ username: username, password: password });
    return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        const response = await axios.get('http://localhost:5000/');
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(200).send(JSON.stringify(books, null, 4));
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;

    const getBook = new Promise((resolve, reject) => {
        if (books[isbn]) {
            resolve(books[isbn]);
        } else {
            reject({ status: 404, message: "Book not found" });
        }
    });

    getBook
        .then((book) => {
            return res.status(200).json(book);
        })
        .catch((err) => {
            return res.status(err.status || 500).json({ message: err.message });
        });
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;

    const getBooksByAuthor = new Promise((resolve, reject) => {
      const bookKeys = Object.keys(books);
      const matchingBooks = [];
  
      bookKeys.forEach((key) => {
        if (books[key].author.toLowerCase() === author.toLowerCase()) {
          matchingBooks.push(books[key]);
        }
      });
  
      if (matchingBooks.length > 0) {
        resolve(matchingBooks);
      } else {
        reject({ status: 404, message: "No books found by this author" });
      }
    });
  
    getBooksByAuthor
      .then((result) => {
        return res.status(200).json(result);
      })
      .catch((err) => {
        return res.status(err.status || 500).json({ message: err.message });
      });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    const bookKeys = Object.keys(books);
    const matchingBooks = [];
  
    bookKeys.forEach((key) => {
        if (books[key].title.toLowerCase() === title.toLowerCase()) {
            matchingBooks.push(books[key]);
        }
    });

    if (matchingBooks.length > 0) {
        return res.status(200).json(matchingBooks);
    } else {
        return res.status(404).json({ message: "No books not found by this title." });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;