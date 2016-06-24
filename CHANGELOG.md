# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Fixed
- When using `~` on a controller and a route, it uses the correct root for the route now.


## [1.0.0]
No news :-)


## [1.0.0-rc.1]
### Added
- `Query` and `Body` parameters do optionally accept a factory function to create the instance.
- `registerControllersFromFolder` function that loads and registers controllers from a folder.
- `@Cookie` parameter decorator to parse cookies and load them into routes.
- Routes are ordered by segment count and then by wildcard count to support wildcard routes.
- Routes that start with a `~` ignore the route hierarchy and are registered from the root. 

### Changed
- Updated `typings` to 1.x version: `ambient` dependencies are new `global` dependencies.

### Fixed
- Double slashes are filtered during registration (`/api//foo` -> `/api/foo`).


## [0.6.1] - 2016-05-17
### Fixed
- `console.warn` for duplicated error handlers does not warn for default anymore.


## [0.6.0] - 2016-05-17
### Added
- isArray validator can now validate items with validators and multiple types.
- `@Controller` and all route decorators do optionally accept `RequestHandler` as middlewares.
- Example code for simple middleware.
- Example code for passportJS middleware.
- Aliases for query parameters.

### Changed
- Reworked the error-handler system. Errors are now bubbled until the default is hit.


## [0.5.0] - 2016-05-09
### Added
- Various example apps.
- Warning message (`console.warn`) if `@Body` is used without `body-parser` package.
- More validators (i.e. parametrized).

### Changed
- Validators are now factories.
- Validators have new names (*breaking*).

### Fixed
- `npm test` command not working.
- Removed *.spec files from coverage test.
- Already parsed values are not parsed again.
- Fixed this context in error handlers.


## [0.4.0] - 2016-04-22
### Added
- HTTP head as route annotation.
- Possibility to define multiple validators.
- Documentation.
- Code coverage reporting.
- `.gitattributes` to run a 3-way file level merge for `CHANGELOG.md`

### Fixed
- Routes had wrong `this` context set.
- Renamed const variables and exported validators to correct cases.

### Changed
- Removed coveralls from `package.json` and moved its installation to Travis configuration


## [0.3.0] - 2016-04-20
### Added
- `@Header` parameter description.

### Fixed
- Parameter parsing with undefined values.


## [0.2.1] - 2016-04-20
### Added
- First version of giuseppe.
- Adding base code and travis-CI.

[Unreleased]: https://github.com/smartive/giuseppe/compare/v1.0.0...master
[1.0.0]: https://github.com/smartive/giuseppe/compare/v1.0.0-rc.1...v1.0.0
[1.0.0-rc.1]: https://github.com/smartive/giuseppe/compare/v0.6.1...v1.0.0-rc.1
[0.6.1]: https://github.com/smartive/giuseppe/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/smartive/giuseppe/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/smartive/giuseppe/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/smartive/giuseppe/compare/v0.3.1...v0.4.0
[0.3.0]: https://github.com/smartive/giuseppe/compare/v0.2.0...v0.3.0
[0.2.1]: https://github.com/smartive/giuseppe/tree/v0.2.1
