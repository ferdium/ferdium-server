'use strict'

const User = use('App/Models/User');
const Service = use('App/Models/Service');
const Workspace = use('App/Models/Workspace');
const {
  validateAll
} = use('Validator');

const atob = require('atob');
const btoa = require('btoa');
const fetch = require('node-fetch');
const uuid = require('uuid/v4');
const crypto = require('crypto');

const franzRequest = async (route, method, auth) => {
  return new Promise(async (resolve, reject) => {
    const base = 'https://api.franzinfra.com/v1/';
    const user = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Ferdi/5.3.0-beta.1 Chrome/69.0.3497.128 Electron/4.2.4 Safari/537.36';

    try {
      const rawResponse = await fetch(base + route, {
        method,
        headers: {
          'Authorization': 'Bearer ' + auth,
          'User-Agent': user
        },
      });
      const content = await rawResponse.json();

      resolve(content);
    } catch (e) {
      reject();
    }
  })
}

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
        "messages": validation.messages(),
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



  async import({
    request,
    response
  }) {
    // Validate user input
    const validation = await validateAll(request.all(), {
      email: 'required|email|unique:users,email',
      password: 'required'
    });
    if (validation.fails()) {
      let errorMessage = "There was an error while trying to import your account:\n";
      for (const message of validation.messages()) {
        if (message.validation == 'required') {
          errorMessage += '- Please make sure to supply your ' + message.field + '\n'
        } else if (message.validation == 'unique') {
          errorMessage += '- There is already a user with this email.\n'
        } else {
          errorMessage += message.message + '\n';
        }
      }
      return response.status(401).send(errorMessage)
    }

    const {
      email,
      password
    } = request.all()

    const hashedPassword = crypto.createHash('sha256').update(password).digest('base64');

    const base = 'https://api.franzinfra.com/v1/';
    const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Ferdi/5.3.0-beta.1 Chrome/69.0.3497.128 Electron/4.2.4 Safari/537.36';

    // Try to get an authentication token
    let token;
    try {
      const basicToken = btoa(email + ':' + hashedPassword)

      const rawResponse = await fetch(base + 'auth/login', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + basicToken,
          'User-Agent': userAgent
        },
      });
      const content = await rawResponse.json();

      if (!content.message || content.message !== 'Successfully logged in') {
        const errorMessage = 'Could not login into Franz with your supplied credentials. Please check and try again';
        return response.status(401).send(errorMessage)
      }

      token = content.token;
    } catch (e) {
      return response.status(401).send({
        "message": "Cannot login to Franz",
        "error": e
      })
    }

    // Get user information
    let userInf;
    try {
      userInf = await franzRequest('me', 'GET', token)
    } catch (e) {
      const errorMessage = 'Could not get your user info from Franz. Please check your credentials or try again later.\nError: ' + e;
      return response.status(401).send(errorMessage)
    }

    // Create user in DB
    let user;
    try {
      user = await User.create({
        email: userInf.email,
        password: hashedPassword,
        username: userInf.firstname
      });
    } catch (e) {
      const errorMessage = 'Could not create your user in our system.\nError: ' + e;
      return response.status(401).send(errorMessage)
    }

    let serviceIdTranslation = {};

    // Import services
    try {
      const services = await franzRequest('me/services', 'GET', token)

      for (const service of services) {
        // Get new, unused uuid
        let serviceId;
        do {
          serviceId = uuid();
        } while ((await Service.query().where('serviceId', serviceId).fetch()).rows.length > 0)

        await Service.create({
          userId: user.id,
          serviceId,
          name: service.name,
          recipeId: service.recipeId,
          settings: JSON.stringify(service)
        });

        serviceIdTranslation[service.id] = serviceId;
      }
    } catch (e) {
      const errorMessage = 'Could not import your services into our system.\nError: ' + e;
      return response.status(401).send(errorMessage)
    }

    // Import workspaces
    try {
      const workspaces = await franzRequest('workspace', 'GET', token)

      for (const workspace of workspaces) {
        let workspaceId;
        do {
          workspaceId = uuid();
        } while ((await Workspace.query().where('workspaceId', workspaceId).fetch()).rows.length > 0)

        const services = workspace.services.map(service => serviceIdTranslation[service])

        await Workspace.create({
          userId: auth.user.id,
          workspaceId,
          name: workspace.name,
          order: workspace.order,
          services: JSON.stringify(services),
          data: JSON.stringify({})
        });
      }
    } catch (e) {
      const errorMessage = 'Could not import your workspaces into our system.\nError: ' + e;
      return response.status(401).send(errorMessage)
    }

    return response.send('Your account has been imported. You can now use your Franz account in Ferdi.')
  }
}

module.exports = UserController
