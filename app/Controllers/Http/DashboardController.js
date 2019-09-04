'use strict'

const {
  validateAll
} = use('Validator');

const crypto = require('crypto');

class DashboardController {
  async login({
    request,
    response,
    auth,
    session
  }) {
    const validation = await validateAll(request.all(), {
      mail: 'required|email',
      password: 'required',
    });
    if (validation.fails()) {
      session.withErrors({
        type: 'danger',
        message: 'Invalid mail or password'
      }).flashExcept(['password']);
      return response.redirect('back');
    }

    let {
      mail,
      password
    } = request.all()

    const hashedPassword = crypto.createHash('sha256').update(password).digest('base64');

    try {
      await auth.authenticator('session').attempt(mail, hashedPassword)
    } catch (error) {
      session.flash({
        type: 'danger',
        message: 'Invalid mail or password'
      })
      return response.redirect('back');
    }
    return response.redirect('/user/account');
  }

  async account({
    auth,
    view
  }) {
    try {
      await auth.check()
    } catch (error) {
      return response.redirect('/user/login');
    }

    return view.render('dashboard.account', {
      username: auth.user.username,
      email: auth.user.email
    });
  }

  async edit({
    auth,
    request,
    session,
    view,
    response
  }) {
    let validation = await validateAll(request.all(), {
      username: 'required',
      email: 'required'
    });
    if (validation.fails()) {
      session.withErrors(validation.messages()).flashExcept(['password']);
      return response.redirect('back');
    }

    // Check new username
    if (request.input('username') !== auth.user.username) {
      validation = await validateAll(request.all(), {
        username: 'required|unique:users,username',
        email: 'required'
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
        email: 'required|email|unique:users,email'
      });
      if (validation.fails()) {
        session.withErrors(validation.messages()).flashExcept(['password']);
        return response.redirect('back');
      }
    }

    // Update user account
    auth.user.username = request.input('username');
    auth.user.email = request.input('email');
    if (!!request.input('password')) {
      const hashedPassword = crypto.createHash('sha256').update(request.input('password')).digest('base64');
      auth.user.password = hashedPassword;
    }
    auth.user.save();

    return view.render('dashboard.account', {
      username: auth.user.username,
      email: auth.user.email,
      success: true
    });
  }

  async data({
    auth,
    view
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

  logout({
    auth,
    response
  }) {
    auth.authenticator('session').logout();
    return response.redirect('/user/login');
  }

  delete({
    auth,
    response
  }) {
    auth.user.delete();
    auth.authenticator('session').logout();
    return response.redirect('/user/login');
  }
}

module.exports = DashboardController
