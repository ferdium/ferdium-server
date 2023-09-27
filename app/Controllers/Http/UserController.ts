import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { schema, rules } from '@ioc:Adonis/Core/Validator';
import User from 'App/Models/User';
import { connectWithFranz, isRegistrationEnabled } from '../../../config/app';
import Hash from '@ioc:Adonis/Core/Hash';
import crypto from 'node:crypto';
import { v4 as uuid } from 'uuid';
import Workspace from 'App/Models/Workspace';
import Service from 'App/Models/Service';
import fetch from 'node-fetch';

const newPostSchema = schema.create({
  firstname: schema.string(),
  lastname: schema.string(),
  email: schema.string([
    rules.email(),
    rules.unique({ table: 'users', column: 'email' }),
  ]),
  password: schema.string([rules.minLength(8)]),
});

const franzImportSchema = schema.create({
  email: schema.string([
    rules.email(),
    rules.unique({ table: 'users', column: 'email' }),
  ]),
  password: schema.string([rules.minLength(8)]),
});

// // TODO: This whole controller needs to be changed such that it can support importing from both Franz and Ferdi
const franzRequest = (route, method, auth) =>
  new Promise((resolve, reject) => {
    const base = 'https://api.franzinfra.com/v1/';
    const user =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Franz/5.3.0-beta.1 Chrome/69.0.3497.128 Electron/4.2.4 Safari/537.36';

    try {
      fetch(base + route, {
        method,
        headers: {
          Authorization: `Bearer ${auth}`,
          'User-Agent': user,
        },
      })
        .then(data => data.json())
        .then(json => resolve(json));
    } catch {
      reject();
    }
  });

export default class UsersController {
  // Register a new user
  public async signup({ request, response, auth }: HttpContextContract) {
    if (isRegistrationEnabled === 'false') {
      return response.status(401).send({
        message: 'Registration is disabled on this server',
        status: 401,
      });
    }

    // Validate user input
    let data;
    try {
      data = await request.validate({ schema: newPostSchema });
    } catch (error) {
      return response.status(401).send({
        message: 'Invalid POST arguments',
        messages: error.messages,
        status: 401,
      });
    }

    // Create user in DB
    let user;
    try {
      user = await User.create({
        email: data.email,
        password: data.password,
        username: data.firstname,
        lastname: data.lastname,
      });
    } catch {
      return response.status(401).send({
        message: 'E-Mail address already in use',
        status: 401,
      });
    }

    // Generate new auth token
    const token = await auth.use('jwt').generate(user);

    return response.send({
      message: 'Successfully created account',
      token: token.accessToken,
    });
  }

  // Login using an existing user
  public async login({ request, response, auth }: HttpContextContract) {
    if (!request.header('Authorization')) {
      return response.status(401).send({
        message: 'Please provide authorization',
        status: 401,
      });
    }

    // Get auth data from auth token
    const authHeader = atob(
      request.header('Authorization')!.replace('Basic ', ''),
    ).split(':');

    // Check if user with email exists
    const user = await User.query().where('email', authHeader[0]).first();
    if (!user?.email) {
      return response.status(401).send({
        message: 'User credentials not valid (Invalid mail)',
        code: 'invalid-credentials',
        status: 401,
      });
    }

    // Verify password
    if (!(await Hash.verify(user.password, authHeader[1]))) {
      return response.status(401).send({
        message: 'User credentials not valid',
        code: 'invalid-credentials',
        status: 401,
      });
    }

    // Generate token
    const token = await auth.use('jwt').generate(user);

    return response.send({
      message: 'Successfully logged in',
      token: token.accessToken,
    });
  }

  // Return information about the current user
  public async me({ response, auth }: HttpContextContract) {
    if (auth.user === undefined) {
      return response.send('Missing or invalid api token');
    }

    const settings =
      typeof auth.user.settings === 'string'
        ? JSON.parse(auth.user.settings)
        : auth.user.settings;

    return response.send({
      accountType: 'individual',
      beta: false,
      donor: {},
      email: auth.user.email,
      emailValidated: true,
      features: {},
      firstname: auth.user.username,
      id: '82c1cf9d-ab58-4da2-b55e-aaa41d2142d8',
      isPremium: true,
      isSubscriptionOwner: true,
      lastname: auth.user.lastname,
      locale: 'en-US',
      ...settings,
    });
  }

  public async updateMe({ request, response, auth }: HttpContextContract) {
    if (auth.user === undefined) {
      return response.send('Missing or invalid api token');
    }

    let settings = auth.user.settings || {};
    if (typeof settings === 'string') {
      settings = JSON.parse(settings);
    }

    const newSettings = {
      ...settings,
      ...request.all(),
    };

    auth.user.settings = JSON.stringify(newSettings);
    await auth.user.save();

    return response.send({
      data: {
        accountType: 'individual',
        beta: false,
        donor: {},
        email: auth.user.email,
        emailValidated: true,
        features: {},
        firstname: auth.user.username,
        id: '82c1cf9d-ab58-4da2-b55e-aaa41d2142d8',
        isPremium: true,
        isSubscriptionOwner: true,
        lastname: auth.user.lastname,
        locale: 'en-US',
        ...newSettings,
      },
      status: ['data-updated'],
    });
  }

  public async import({ request, response, view }: HttpContextContract) {
    if (isRegistrationEnabled === 'false') {
      return response.status(401).send({
        message: 'Registration is disabled on this server',
        status: 401,
      });
    }

    if (connectWithFranz === 'false') {
      return response.send(
        'We could not import your Franz account data.\n\nIf you are the server owner, please set CONNECT_WITH_FRANZ to true to enable account imports.',
      );
    }

    // Validate user input
    let data;
    try {
      data = await request.validate({ schema: franzImportSchema });
    } catch (error) {
      return view.render('others.message', {
        heading: 'Error while importing',
        text: error.messages,
      });
    }

    const { email, password } = data;

    const hashedPassword = crypto
      .createHash('sha256')
      .update(password)
      .digest('base64');

    const base = 'https://api.franzinfra.com/v1/';
    const userAgent =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Franz/5.3.0-beta.1 Chrome/69.0.3497.128 Electron/4.2.4 Safari/537.36';

    // Try to get an authentication token
    let token;
    try {
      const basicToken = btoa(`${email}:${hashedPassword}`);
      const loginBody = {
        isZendeskLogin: false,
      };

      const rawResponse = await fetch(`${base}auth/login`, {
        method: 'POST',
        body: JSON.stringify(loginBody),
        headers: {
          Authorization: `Basic ${basicToken}`,
          'User-Agent': userAgent,
          'Content-Type': 'application/json',
          accept: '*/*',
          'x-franz-source': 'Web',
        },
      });
      const content = await rawResponse.json();

      if (!content.message || content.message !== 'Successfully logged in') {
        const errorMessage =
          'Could not login into Franz with your supplied credentials. Please check and try again';
        return response.status(401).send(errorMessage);
      }

      token = content.token;
    } catch (error) {
      return response.status(401).send({
        message: 'Cannot login to Franz',
        error: error,
      });
    }

    // Get user information
    let userInf = false;
    try {
      userInf = await franzRequest('me', 'GET', token);
    } catch (error) {
      const errorMessage = `Could not get your user info from Franz. Please check your credentials or try again later.\nError: ${error}`;
      return response.status(401).send(errorMessage);
    }
    if (!userInf) {
      const errorMessage =
        'Could not get your user info from Franz. Please check your credentials or try again later';
      return response.status(401).send(errorMessage);
    }

    // Create user in DB
    let user;
    try {
      user = await User.create({
        email: userInf.email,
        password: hashedPassword,
        username: userInf.firstname,
        lastname: userInf.lastname,
      });
    } catch (error) {
      const errorMessage = `Could not create your user in our system.\nError: ${error}`;
      return response.status(401).send(errorMessage);
    }

    const serviceIdTranslation = {};

    // Import services
    try {
      const services = await franzRequest('me/services', 'GET', token);

      for (const service of services) {
        // Get new, unused uuid
        let serviceId;
        do {
          serviceId = uuid();
        } while (
          // eslint-disable-next-line no-await-in-loop, unicorn/no-await-expression-member
          (await Service.query().where('serviceId', serviceId)).length > 0
        );

        // eslint-disable-next-line no-await-in-loop
        await Service.create({
          userId: user.id,
          serviceId,
          name: service.name,
          recipeId: service.recipeId,
          settings: JSON.stringify(service),
        });

        serviceIdTranslation[service.id] = serviceId;
      }
    } catch (error) {
      const errorMessage = `Could not import your services into our system.\nError: ${error}`;
      return response.status(401).send(errorMessage);
    }

    // Import workspaces
    try {
      const workspaces = await franzRequest('workspace', 'GET', token);

      for (const workspace of workspaces) {
        let workspaceId;
        do {
          workspaceId = uuid();
        } while (
          // eslint-disable-next-line unicorn/no-await-expression-member, no-await-in-loop
          (await Workspace.query().where('workspaceId', workspaceId)).length > 0
        );

        const services = workspace.services.map(
          service => serviceIdTranslation[service],
        );

        // eslint-disable-next-line no-await-in-loop
        await Workspace.create({
          userId: user.id,
          workspaceId,
          name: workspace.name,
          order: workspace.order,
          services: JSON.stringify(services),
          data: JSON.stringify({}),
        });
      }
    } catch (error) {
      const errorMessage = `Could not import your workspaces into our system.\nError: ${error}`;
      return response.status(401).send(errorMessage);
    }

    return response.send(
      'Your account has been imported. You can now use your Franz/Ferdi account in Ferdium.',
    );
  }
}
