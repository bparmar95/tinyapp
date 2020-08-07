const emailChecker = function(email, user) {
  for (let id in user) {
    if (user[id].email === email) {
      return true;
    }
  }
  return false;
}


const userIDChecker = function(email,users) {
  if (emailChecker(email,users)) {
    for (let id in users) {
      if (users[id].email === email) {
        return users[id];
      }
  }
}
}



module.exports = {userIDChecker, emailChecker};