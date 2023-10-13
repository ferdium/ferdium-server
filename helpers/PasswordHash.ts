import User from 'App/Models/User';
import Hash from '@ioc:Adonis/Core/Hash';

export async function handleVerifyAndReHash(
  user: User,
  passwordToTest: string,
): Promise<boolean> {
  // Verify password
  const usesLegacyHasher = /^\$2[aby]/.test(user.password);
  let isMatchedPassword = false;

  isMatchedPassword = await (usesLegacyHasher
    ? Hash.use('legacy').verify(user.password, passwordToTest)
    : Hash.verify(user.password, passwordToTest));

  // TODO: For some reason this is not working (user can't login after re-hashing)
  // rehash user password
  // if (usesLegacyHasher && isMatchedPassword) {
  //   user.password = await Hash.make(passwordToTest);
  //   await user.save();
  // }

  return isMatchedPassword;
}
