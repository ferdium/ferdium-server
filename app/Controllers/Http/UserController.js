'use strict'

const User = use('App/Models/User');
const {
  validateAll
} = use('Validator');
const atob = require('atob');

class UserController {

  // Register a new user
  async signup({
    request,
    response,
    auth,
    session
  }) {
    // Validate user input
    const validation = await validateAll(request.all(), {
      firstname: 'required',
      email: 'required|email|unique:users,email',
      password: 'required'
    });
    if (validation.fails()) {
      return response.status(401).send({
        "message": "Invalid POST arguments",
        "status": 401
      })
    }

    const data = request.only(['firstname', 'email', 'password']);

    // Create user in DB
    let user;
    try {
      user = await User.create({
        email: data.email,
        password: data.password,
        username: data.firstname
      });
    } catch (e) {
      return response.status(401).send({
        "message": "E-Mail Address already in use",
        "status": 401
      })
    }

    // Generate new auth token
    const token = await auth.generate(user)

    return response.send({
      "message": "Successfully created account",
      "token": token.token
    });
  }

  // Login using an existing user
  async login({
    request,
    response,
    auth
  }) {
    if (!request.header('Authorization')) {
      return response.status(401).send({
        "message": "Please provide authorization",
        "status": 401
      })
    }

    // Get auth data from auth token
    const authHeader = atob(request.header('Authorization').replace('Basic ', '')).split(':');

    // Check if user with email exists
    let user = (await User.query().where('email', authHeader[0]).first());
    if (!user || !user.email) {
      return response.status(401).send({
        "message": "User credentials not valid (Invalid mail)",
        "code": "invalid-credentials",
        "status": 401
      });
    }

    // Try to login
    let token;
    try {
      token = await auth.attempt(user.email, authHeader[1])
    } catch (e) {
      return response.status(401).send({
        "message": "User credentials not valid",
        "code": "invalid-credentials",
        "status": 401
      });
    }

    return response.send({
      "message": "Successfully logged in",
      "token": token.token
    });
  }

  // Return information about the current user
  async me({
    request,
    response,
    auth,
    session
  }) {
    try {
      await auth.getUser()
    } catch (error) {
      response.send('Missing or invalid api token')
    }

    return response.send({
      accountType: "individual",
      beta: false,
      donor: {},
      email: auth.user.email,
      emailValidated: true,
      features: {},
      firstname: "Franz",
      id: "2acd2aa0-0869-4a91-adab-f700ac256dbe",
      isPremium: true,
      isSubscriptionOwner: true,
      lastname: "Franz",
      locale: "en-US"
    });
  }
}

module.exports = UserController
