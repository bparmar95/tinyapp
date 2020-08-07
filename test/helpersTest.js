const { assert } = require('chai');

const { userIDChecker } = require('../helpers.js');

const testUsers = {
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
};

describe('userIDChecker', function() {
  it('should return a user with valid email', function() {
    const user = userIDChecker("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert(user.id === expectedOutput,"returns the wrong user email")
  });
});

describe('userIDChecker', function() {
  it('should return a user with valid email', function() {
    const user = userIDChecker("user2@example.com", testUsers)
    const expectedOutput = "user2RandomID";
    assert(user.id === expectedOutput,"returns the wrong user email")
  });
});

describe('userIDChecker', function() {
  it('should return a user with valid email', function() {
    const user = userIDChecker("use2@example.com", testUsers)
    const expectedOutput = undefined;
    assert(user === expectedOutput,"returns the wrong user email")
  });
});