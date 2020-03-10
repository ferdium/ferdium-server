
const {
  validateAll,
} = use('Validator');

const Service = use('App/Models/Service');
const Workspace = use('App/Models/Workspace');

const crypto = require('crypto');
const uuid = require('uuid/v4');

class DashboardController {
  async login({
    request,
    response,
    auth,
    session,
  }) {
    const validation = await validateAll(request.all(), {
      mail: 'required|email',
      password: 'required',
    });
    if (validation.fails()) {
      session.withErrors({
        type: 'danger',
        message: 'Invalid mail or password',
      }).flashExcept(['password']);
      return response.redirect('back');
    }

    const {
      mail,
      password,
    } = request.all();

    const hashedPassword = crypto.createHash('sha256').update(password).digest('base64');

    try {
      await auth.authenticator('session').attempt(mail, hashedPassword);
    } catch (error) {
      session.flash({
        type: 'danger',
        message: 'Invalid mail or password',
      });
      return response.redirect('back');
    }
    return response.redirect('/user/account');
  }

  async account({
    auth,
    view,
    response,
  }) {
    try {
      await auth.check();
    } catch (error) {
      return response.redirect('/user/login');
    }

    return view.render('dashboard.account', {
      username: auth.user.username,
      email: auth.user.email,
    });
  }

  async edit({
    auth,
    request,
    session,
    view,
    response,
  }) {
    let validation = await validateAll(request.all(), {
      username: 'required',
      email: 'required',
    });
    if (validation.fails()) {
      session.withErrors(validation.messages()).flashExcept(['password']);
      return response.redirect('back');
    }

    // Check new username
    if (request.input('username') !== auth.user.username) {
      validation = await validateAll(request.all(), {
        username: 'required|unique:users,username',
        email: 'required',
      });
      if (validation.fails()) {
        session.withErrors(validation.messages()).flashExcept(['password']);
        return response.redirect('back');
      }
    }

    // Check new email
    if (request.input('email') !== auth.user.email) {
      validation = await validateAll(request.all(), {
        username: 'required',
        email: 'required|email|unique:users,email',
      });
      if (validation.fails()) {
        session.withErrors(validation.messages()).flashExcept(['password']);
        return response.redirect('back');
      }
    }

    // Update user account
    const { user } = auth;
    user.username = request.input('username');
    user.email = request.input('email');
    if (request.input('password')) {
      const hashedPassword = crypto.createHash('sha256').update(request.input('password')).digest('base64');
      user.password = hashedPassword;
    }
    user.save();

    return view.render('dashboard.account', {
      username: user.username,
      email: user.email,
      success: true,
    });
  }

  async data({
    auth,
    view,
  }) {
    const general = auth.user;
    const services = (await auth.user.services().fetch()).toJSON();
    const workspaces = (await auth.user.workspaces().fetch()).toJSON();

    return view.render('dashboard.data', {
      username: general.username,
      mail: general.email,
      created: general.created_at,
      updated: general.updated_at,
      services,
      workspaces,
    });
  }

  async export({
    auth,
    response,
  }) {
    const general = auth.user;
    const services = (await auth.user.services().fetch()).toJSON();
    const workspaces = (await auth.user.workspaces().fetch()).toJSON();

    const exportData = {
      username: general.username,
      mail: general.email,
      services,
      workspaces,
    };

    return response
      .header('Content-Type', 'application/force-download')
      .header('Content-disposition', 'attachment; filename=export.ferdi-data')
      .send(exportData);
  }

  async import({
    auth,
    request,
    session,
    response,
  }) {
    const validation = await validateAll(request.all(), {
      file: 'required',
    });
    if (validation.fails()) {
      session.withErrors(validation.messages()).flashExcept(['password']);
      return response.redirect('back');
    }

    let file;
    try {
      file = JSON.parse(request.input('file'));
    } catch (e) {
      session.flash({ type: 'danger', message: 'Invalid Ferdi account file' });
      return response.redirect('back');
    }

    if (!file || !file.services || !file.workspaces) {
      session.flash({ type: 'danger', message: 'Invalid Ferdi account file (2)' });
      return response.redirect('back');
    }

    const serviceIdTranslation = {};

    // Import services
    try {
      for (const service of file.services) {
        // Get new, unused uuid
        let serviceId;
        do {
          serviceId = uuid();
        } while ((await Service.query().where('serviceId', serviceId).fetch()).rows.length > 0); // eslint-disable-line no-await-in-loop

        await Service.create({ // eslint-disable-line no-await-in-loop
          userId: auth.user.id,
          serviceId,
          name: service.name,
          recipeId: service.recipeId,
          settings: JSON.stringify(service.settings),
        });

        serviceIdTranslation[service.id] = serviceId;
      }
    } catch (e) {
      const errorMessage = `Could not import your services into our system.\nError: ${e}`;
      return response.status(401).send(errorMessage);
    }

    // Import workspaces
    try {
      for (const workspace of file.workspaces) {
        let workspaceId;
        do {
          workspaceId = uuid();
        } while ((await Workspace.query().where('workspaceId', workspaceId).fetch()).rows.length > 0); // eslint-disable-line no-await-in-loop

        const services = workspace.services.map((service) => serviceIdTranslation[service]);

        await Workspace.create({ // eslint-disable-line no-await-in-loop
          userId: auth.user.id,
          workspaceId,
          name: workspace.name,
          order: workspace.order,
          services: JSON.stringify(services),
          data: JSON.stringify(workspace.data),
        });
      }
    } catch (e) {
      const errorMessage = `Could not import your workspaces into our system.\nError: ${e}`;
      return response.status(401).send(errorMessage);
    }

    return response.send('Your account has been imported.');
  }

  logout({
    auth,
    response,
  }) {
    auth.authenticator('session').logout();
    return response.redirect('/user/login');
  }

  delete({
    auth,
    response,
  }) {
    auth.user.delete();
    auth.authenticator('session').logout();
    return response.redirect('/user/login');
  }
}

module.exports = DashboardController;
