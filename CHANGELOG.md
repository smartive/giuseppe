# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Added
- Various example apps
- Warning message (`console.warn`) if `@Body` is used without `body-parser` package.
- More validators (i.e. parametrized)

### Changed
- Validators are now factories.
- Validators have new names (*breaking*)

### Fixed
- `npm test` command not working.
- Removed *.spec files from coverage test.
- Already parsed values are not parsed again.

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

[Unreleased]: https://github.com/smartive/giuseppe/compare/v0.4.0...develop
[0.4.0]: https://github.com/smartive/giuseppe/compare/v0.4.0...v0.3.1
[0.3.0]: https://github.com/smartive/giuseppe/compare/v0.2.0...v0.3.0
[0.2.1]: https://github.com/smartive/giuseppe/tree/v0.2.1
