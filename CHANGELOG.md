# Changelog

This project is following [Semantic Versioning](http://semver.org)

## [Unreleased][]

## [0.1.13][] - 2018-08-20

 - use the new apps structure
 - use @deskpro/apps-sdk@0.5.0
 - use @deskpro/apps-components@0.5.0

## [0.1.12][] - 2018-03-29

### Added

    - travis will atttach builds to Github PR's when enabled via s3 environment variables

### Fixed

    - authentication failure to detect valid access token

### Changed

    - upgrade to @deskpro/apps-sdk-react version 0.2.13
    - upgrade to @deskpro/apps-dpat version 0.10.4

## [0.1.11][] - 2018-02-09

 - default `process.env.NODE_ENV` to `production` when packaging the app for distribution with webpack  

## [0.1.10][] - 2017-12-14

### Changed

  - adjust ui styles 

## [0.1.9][] - 2017-12-13

### Fixed

  - remove obsolete semantic stylesheet import
  - remove hardcoded container widths

## [0.1.8][] - 2017-12-12

### Fixed

  - copy redirect url button broken
  - home screen not shown after successful authentication

## [0.1.7][] - 2017-11-24

### Changed

- upgrade @deskpro/apps-dpat to version 0.9.6

## [0.1.6][] - 2017-11-20

### Changed

- upgrade @deskpro/apps-dpat to version 0.9.4
- upgrade @deskpro/react-components to version 1.2.3

## [0.1.5][] - 2017-11-13

### Fixed

 - wrong deskpro manifest version causing install to fail


## [0.1.4][] - 2017-11-13

### Added

 - default application installer is now bundled with the app

## [0.1.3][] - 2017-11-08

### Changed

 - upgrade to the latest @deskpro/apps-sdk-react
 - upgrade dependencies

## [0.1.2][] - 2017-08-22

QA passed

## [0.1.2-beta.7][] - 2017-08-16

### Added
 - authentication via oauth

### Changed
 - update dependencies
 - starting project changelog
 
### Fixed 
 - no hover effect on `engagement score` rating stars

[Unreleased]: https://github.com/DeskproApps/mailchimp/compare/v0.1.13...HEAD
[0.1.13]: https://github.com/DeskproApps/mailchimp/compare/v0.1.12...v0.1.13
[0.1.12]: https://github.com/DeskproApps/mailchimp/compare/v0.1.11...v0.1.12
[0.1.11]: https://github.com/DeskproApps/mailchimp/compare/v0.1.10...v0.1.11
[0.1.10]: https://github.com/DeskproApps/mailchimp/compare/v0.1.9...v0.1.10
[0.1.9]: https://github.com/DeskproApps/mailchimp/compare/v0.1.8...v0.1.9
[0.1.8]: https://github.com/DeskproApps/mailchimp/compare/v0.1.7...v0.1.8
[0.1.7]: https://github.com/DeskproApps/mailchimp/compare/v0.1.6...v0.1.7
[0.1.6]: https://github.com/DeskproApps/mailchimp/compare/v0.1.5...v0.1.6
[0.1.5]: https://github.com/DeskproApps/mailchimp/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/DeskproApps/mailchimp/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/DeskproApps/mailchimp/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/DeskproApps/mailchimp/compare/v0.1.2-beta.7...v0.1.2
[0.1.2-beta.7]: https://github.com/DeskproApps/mailchimp/tree/v0.1.2-beta.7
