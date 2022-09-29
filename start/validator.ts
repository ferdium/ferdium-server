/*
|--------------------------------------------------------------------------
| Preloaded File
|--------------------------------------------------------------------------
|
| Any code written inside this file will be executed during the application
| boot.
|
*/
import { validator } from '@ioc:Adonis/Core/Validator'

// The string must contain at least 1 lowercase alphabetical character
validator.rule('oneLowerCaseAtLeast', (value, _, options) => {
  const regex = new RegExp('(?=.*[a-z])')
  if (!regex.test(value)) {
    options.errorReporter.report(
      options.pointer,
      'oneLowerCaseAtLeast',
      'oneLowerCaseAtLeast validation failed',
      options.arrayExpressionPointer,
    )
  }
})

// The string must contain at least 1 uppercase alphabetical character
validator.rule('oneUpperCaseAtLeast', (value, _, options) => {
  const regex = new RegExp('(?=.*[A-Z])')
  if (!regex.test(value)) {
    options.errorReporter.report(
      options.pointer,
      'oneUpperCaseAtLeast',
      'The string must contain at least 1 uppercase alphabetical character',
      options.arrayExpressionPointer,
    )
  }
})

// The string must contain at least 1 numeric character
validator.rule('oneNumericAtLeast', (value, _, options) => {
  const regex = new RegExp('(?=.*[0-9])')
  if (!regex.test(value)) {
    options.errorReporter.report(
      options.pointer,
      'oneNumericAtLeast',
      'The string must contain at least 1 numeric character',
      options.arrayExpressionPointer,
    )
  }
})

// The string must contain at least one special character, but we are escaping reserved RegEx characters to avoid conflict
validator.rule('oneSpecialCharacterAtLeast', (value, _, options) => {
  const regex = new RegExp('(?=.*[!@#$%^&*])')
  if (!regex.test(value)) {
    options.errorReporter.report(
      options.pointer,
      'oneSpecialCharacterAtLeast',
      'The string must contain at least one special character',
      options.arrayExpressionPointer,
    )
  }
})

validator.rule('slugLike', (value, _, options) => {
  const regex1 = new RegExp(/\.{1,}/)
  const regex2 = new RegExp(/\/{1,}/)
  if (regex1.test(value) || regex2.test(value)) {
    options.errorReporter.report(
      options.pointer,
      'slugLike',
      'The string cannot contain "." or "/"',
      options.arrayExpressionPointer,
    )
  }
})
