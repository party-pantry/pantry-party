# Testing Checklist
Best practices for unit, integration, and acceptance testing.

<!-- ## Unit Test Checklist
### TU-01: Each collection has a unit test.


For each collection, there should be associated unit tests that check that all the fundamental operations on the Collection operate correctly for reasonable input values.

If an operation on the Collection has a relationship to another Collection, make sure to test these relationships. (In other words, if an operation implicitly creates another document in another collection, or requires the existance of another document in another collection, then test that these relationships are correct.) -->

## Acceptance Test Checklist

### TA-01: Each Page has an isDisplayed() acceptance test.

We use [Playwrite](https://playwright.dev/) to test the user interface. For each page in the user interface, there should be an acceptance test that verifies that the page can be displayed successfully.

### TA-02: Each form has an acceptance test.

If a page has a form, there is an associated acceptance test to ensure that it behaves correctly.