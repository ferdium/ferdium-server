import User from '#app/Models/User';
import hash from '@adonisjs/core/services/hash';

export async function handleVerifyAndReHash(
  user: User,
  passwordToTest: string,
): Promise<boolean> {
  // Verify password
  const usesLegacyHasher = /^\$2[aby]/.test(user.password);
  let isMatchedPassword = false;

  isMatchedPassword = await (usesLegacyHasher
    ? hash.use('legacy').verify(user.password, passwordToTest)
    : hash.verify(user.password, passwordToTest));

  // TODO: For some reason this is not working (user can't login after re-hashing)
  // rehash user password
  // if (usesLegacyHasher && isMatchedPassword) {
  //   user.password = await Hash.make(passwordToTest);
  //   await user.save();
  // }

  return isMatchedPassword;
}
