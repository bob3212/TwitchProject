//Helper functions for validation
const isEmpty = (string) => {
  if (string.trim() === "") return true;
  return false;
};

const isEmail = (email) => {
  const emailRegEx =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(emailRegEx)) return true;
  return false;
};

exports.validateSignup = (data) => {
  let errors = {};
  if (isEmpty(data.email)) {
    errors.email = "Email is required";
  } else if (!isEmail(data.email)) {
    errors.email = "Must be valid email address";
  }

  if (isEmpty(data.password)) errors.password = "Password is required";
  if (data.password !== data.confirmPassword)
    errors.confirmPassword = "Passwords don't match!";
  if (isEmpty(data.handle)) errors.handle = "Handle is required";

  console.log("valid?");

  return {
    errors,
    valid: Object.keys(errors).length ? false : true,
  };
};

exports.validateLogin = (data) => {
  let errors = {};

  if (isEmpty(data.email)) errors.email = "Email is required";
  if (isEmpty(data.password)) errors.password = "Password is required";

  return {
    errors,
    valid: Object.keys(errors).length ? false : true,
  };
};

exports.reduceUserDetails = (data) => {
  let userDetails = {};
  if (!isEmpty(data.bio.trim())) userDetails.bio = data.bio;
  if (!isEmpty(data.website.trim())) {
    if (data.website.trim().substring(0, 4) !== "http") {
      userDetails.website = `http://${data.website.trim()}`;
    } else {
      userDetails.website = data.website;
    }
  }
  if (!isEmpty(data.location.trim())) userDetails.location = data.location;

  return userDetails;
};
