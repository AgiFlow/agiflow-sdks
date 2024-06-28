# Changelog for llm-mocks

## [0.1.0] - 2024-06-28

**Breaking Change**
- Use `vcrpy` for network mock instead of mocking vendor sdks' APIClients.  
- Wrap `vcr` to return mock response without recording prerequisite.  

## [0.0.4] - 2024-06-25

**Fixed**
- Fix data select from instance instead of from class

**Added**
- Add Litellm mock
- Add `RecycleSelectorStrategy` to select data incrementally from list

## [0.0.3] - 2024-06-25

**Breaking Change**
- Change mock data format to a list of data points to support chained API calls.  
- Add dependency injection from `SelectStrategy` class to `MockAPIClient` so you can decide which data point is return from data list when testing.  

## [0.0.2] - 2024-06-24

**Fixed**
- Fix link to documentation

## [0.0.1] - 2024-06-24

**Added**
- Initial release of llm-mocks.
- Introduced unit test mocks for OpenAI and Anthropic APIs.
- Provided comprehensive documentation for implementing mocks in your unit tests.
- Basic setup and configuration guide.


We look forward to your feedback and contributions to improve this library. Join our Discord community for support and discussions!
