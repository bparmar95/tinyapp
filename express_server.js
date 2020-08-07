const express = require("express");
const {emailChecker, userIDChecker} = require("./helpers")
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const app = express();
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}))
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString() {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < 6; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const urlsForUser = function(database, id) {
  newDatabase = {};
  for (let user in database) {
    if (database[user].userID === id) {
      newDatabase[user] = database[user];
    }
  }
  return newDatabase;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/urls", (req, res) => {
  console.log("name" ,req.session.user_id);
  let templateVars = { urls: urlsForUser(urlDatabase,req.session.user_id),
    user: users[req.session.user_id],
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase,
    user: users[req.session.user_id],
  };
  const newShortform = generateRandomString();
  urlDatabase[newShortform] = {longURL: req.body.longURL, userID: req.session.user_id};
  res.redirect(`/urls/${newShortform}`);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { urls: urlDatabase,
    user: users[req.session.user_id],
  };
  if (templateVars.user) {
    res.render("urls_new",templateVars);
  } else {
    res.redirect("/login")
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase); 
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, 
    user: users[req.session.user_id]};

    if (!req.session.user_id) {
      res.status(400).send("Error: User is not logged in. Please login to continue");
    } else if (req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
      res.status(400).send("Error: You do not have access to this URL");
    } else {
      res.render("urls_show", templateVars); 
    }
});

app.get("/u/:shortURL", (req, res) => {
  const url = urlDatabase[req.params.shortURL].longURL;
  res.redirect(url)
});

app.get("/register", (req, res) => {
  res.render("registration"); 
});

app.get("/login", (req, res) => {
  res.render("login"); 
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.session.user_id) {
    res.status(403).send("Cannot edit or delete URL if you are not logged in")
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
});

app.post("/urls/:shortURL", (req,res) => {
  if (!req.session.user_id) {
    res.status(403).send("Cannot edit URL if you are not logged in")
  } else {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls")
  }
})

app.post("/login", (req,res) => {
  if (!emailChecker(req.body.email,users)) {
    res.status(403).send("Error 403: that email isn't registered")
  } else if (emailChecker(req.body.email,users)) {
    for (let id in users) {
      if (users[id].email === req.body.email) {
        if (bcrypt.compareSync(req.body.password, users[id].password)) {
          console.log("h");
         const fullUser = userIDChecker(req.body.email,users)
          req.session.user_id = fullUser.id;
          res.redirect("/urls")
        } else {
          res.status(403).send("Error 403: Password doesn't match email");
        }
  }
 }
}
})

app.post("/logout", (req,res) => {
  req.session.user_id = null;
  res.redirect("/urls")
})
  
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Error 400: Missing username &/or password");
  } else if (emailChecker(req.body.email,users)) {
    res.status(400).send("Error 400: Email already exists");
  } else {
    const newID = generateRandomString();
    const pass = req.body.password;
    const hashedPassword = bcrypt.hashSync(pass,10);
    users[newID] = {
    id: newID,
    email: req.body.email,
    password: hashedPassword
  };
  console.log(users);
  req.session.user_id = newID
  res.redirect("/urls")
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
