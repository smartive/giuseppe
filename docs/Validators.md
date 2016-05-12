# Validators

This section documentates the provided default validator factories for parameters.
A parameter (or basically anything) can be validated through those 
validators and if a validation function returns `false` a runtime exception is thrown.

Those factories provide the possiblity to configure the validator.
The specific options are described in the JSDoc and below.

| Name      | Description                                                                                                  | Options |
| --------- | ------------------------------------------------------------------------------------------------------------ | ------- |
| isString  | Checks if the value is not null nor undefined,<br>has `String` as constructor and meets certain requirements | `allowEmpty`: an empty string ('') validates to `true`<br>`min`: minimum length of the string<br>`max`: maximum length of the string |
| isNumber  | Checks if the value is not null nor undefined,<br>has `Number` as constructor and meets certain requirements | `min`: minimum value of the number (x <= min)<br>`max`: maximum value of the number (x >= max)<br>`multipleOf`: The number must be a multiple of this value (x module multipleOf = 0) |
| isArray   | Checks if the value is not null nor undefined,<br>has `Array` as constructor and meets certain requirements  | `min`: minimum item count in the array<br>`max`: maximum item count in the array<br>`type`: A constructor function(s) to validate the types of the items (multiple possible with an array of functions)<br>`validator`: validator(s) for the items - they are logically ANDed and must all evaluate to `true` (multiple possible with an array) |