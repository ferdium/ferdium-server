import { test } from '@japa/runner'
import User from '#app/Models/User'
import UserFactory from '#database/factories/UserFactory'

test.group('Dashboard / Account page', () => {
  test('redirects to /user/login when accessing /user/account as guest', async ({ client }) => {
    const response = await client.get('/user/account')

    response.assertRedirectsTo('/user/login') // Check if it redirects to the expected URL
  })

  test('returns a 200 opening the account route while logged in', async ({ client }) => {
    const user = await UserFactory.create()
    const response = await client.get('/user/account').loginAs(user)

    response.assertStatus(200)
    response.assertTextIncludes('Your Ferdium account')

    response.assertTextIncludes(user.email)
    response.assertTextIncludes(user.username)
    response.assertTextIncludes(user.lastname)
  })

  test('returns a validation error for all fields when missing', async ({ client }) => {
    const user = await UserFactory.create()
    const response = await client.post('/user/account').loginAs(user)

    response.assertTextIncludes(
      'value="required validation failed,required validation failed" placeholder="E-Mail"'
    )
    response.assertTextIncludes(
      'value="required validation failed,required validation failed" placeholder="Name"'
    )
    response.assertTextIncludes(
      'value="required validation failed,required validation failed" placeholder="Last Name"'
    )
  })

  test('returns a validation error for username when there is another user with same username', async ({
    client,
  }) => {
    const user = await UserFactory.create()
    const existingUser = await UserFactory.create()

    const response = await client.post('/user/account').loginAs(user).form({
      username: existingUser.username,
      email: user.email,
      lastname: user.lastname,
    })

    response.assertTextIncludes('value="unique validation failure" placeholder="Name"')
  })

  test('returns a validation error for email when there is another user with same email', async ({
    client,
  }) => {
    const user = await UserFactory.create()
    const existingUser = await UserFactory.create()

    const response = await client.post('/user/account').loginAs(user).form({
      username: user.username,
      email: existingUser.email,
      lastname: user.lastname,
    })

    response.assertTextIncludes('value="unique validation failure" placeholder="E-Mail"')
  })

  test('updates user data and ensures the data is persisted', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const response = await client.post('/user/account').loginAs(user).form({
      username: 'edited-username',
      email: 'edited-email',
      lastname: 'edited-lastname',
    })

    response.assertStatus(200)

    // Ensure updated data is displayed on account page
    response.assertTextIncludes('edited-username')
    response.assertTextIncludes('edited-email')
    response.assertTextIncludes('edited-lastname')

    // Ensure updated data is persisted in database
    const updatedUser = await User.findBy('id', user.id)
    assert.equal(updatedUser?.username, 'edited-username')
    assert.equal(updatedUser?.email, 'edited-email')
    assert.equal(updatedUser?.lastname, 'edited-lastname')
  })

  test('updates user password and ensures the user can still login', async ({ client }) => {
    const user = await UserFactory.create()
    const response = await client.post('/user/account').loginAs(user).form({
      username: user.username,
      email: user.email,
      lastname: user.lastname,
      password: 'modified-password-account-page',
    })

    response.assertStatus(200)

    const loginResponse = await client.post('/user/login').fields({
      mail: user.email,
      password: 'modified-password-account-page',
    })

    loginResponse.assertRedirectsTo('/user/account')
  })
})
