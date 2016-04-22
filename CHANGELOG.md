# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Added
- [#9] Possibility to define multiple validators. via [#24]
- Documentation
- Code coverage reporting. via [#26]

### Fixed
- [#17] Routes had wrong `this` context set. via [#21]
- [#18] Renamed const variables and exported validators to correct cases. via [#21]

## [0.3.0] - 2016-04-20
### Added
- `@Header` parameter description.

### Fixed
- Parameter parsing with undefined values.

## [0.2.1] - 2016-04-20
### Added
- First version of giuseppe.
- Adding base code and travis-CI.

[Unreleased]: https://github.com/smartive/giuseppe/compare/v0.3.0...develop
[0.3.0]: https://github.com/smartive/giuseppe/compare/v0.2.0...v0.3.0
[0.2.1]: https://github.com/smartive/giuseppe/tree/v0.2.1

[#17]: https://github.com/smartive/giuseppe/issues/17
[#18]: https://github.com/smartive/giuseppe/issues/18
[#9]: https://github.com/smartive/giuseppe/issues/9

[#21]: https://github.com/smartive/giuseppe/pull/21
[#24]: https://github.com/smartive/giuseppe/pull/24
[#26]: https://github.com/smartive/giuseppe/pull/26