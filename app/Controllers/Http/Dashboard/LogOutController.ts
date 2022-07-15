export default class LoginController {
  /**
   * Login a user
   */
  public async logout({ auth, response }) {
    auth.authenticator('session').logout();

    return response.redirect('/user/login');
  }
}
