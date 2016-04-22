# Validators

This section documentates the provided default validator functions for parameters.
A parameter can be validated through those functions and if a validation function returns
`false` a runtime exception is thrown.

| Name               | Description                                                                   |
| ------------------ | ----------------------------------------------------------------------------- |
| isStringValidator  | Checks if the value is not null nor undefined and has `String` as constructor |
| isNumberValidator  | Checks if the value is not null nor undefined and has `Number` as constructor |