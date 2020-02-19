Feature: Conversion of inline code markdown

  Scenario: Base formatting - Inline code in a paragraph
    Given the markdown in GITHUB is 'Test with `inline code` and an end sentence'
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'paragraph'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "Test with "}'
    And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "inline code", "marks": [ { "type": "code" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": " and an end sentence"}'

  Scenario: Base formatting - Multiple inline code in a paragraph
    Given the markdown in GITHUB is 'Test with `inline code` and `another one` in a sentence'
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'paragraph'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "Test with "}'
    And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "inline code", "marks": [ { "type": "code" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": " and "}'
    And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "another one", "marks": [ { "type": "code" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": " in a sentence"}'

  Scenario: Base formatting - Inline code in a unordered list
    Given the markdown in GITHUB is '* Test with `inline code` and `another one` in a unordered list'
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'bulletList'
    And the ADF chunk at content path [ 0, 0 ] has type 'listItem'
    And the ADF chunk at content path [ 0, 0, 0 ] contains '{"type": "text", "text": "Test with "}'
    And the ADF chunk at content path [ 0, 0, 0 ] contains '{ "type": "text", "text": "inline code", "marks": [ { "type": "code" } ] }'
    And the ADF chunk at content path [ 0, 0, 0 ] contains '{"type": "text", "text": " and "}'
    And the ADF chunk at content path [ 0, 0, 0 ] contains '{ "type": "text", "text": "another one", "marks": [ { "type": "code" } ] }'
    And the ADF chunk at content path [ 0, 0, 0 ] contains '{ "type": "text", "text": " in a unordered list"}'

  Scenario: Base formatting - Inline code in a ordered list
    Given the markdown in GITHUB is '1. Test with `inline code` and `another one` in a ordered list'
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'orderedList'
    And the ADF chunk at content path [ 0, 0 ] has type 'listItem'
    And the ADF chunk at content path [ 0, 0, 0 ] contains '{"type": "text", "text": "Test with "}'
    And the ADF chunk at content path [ 0, 0, 0 ] contains '{ "type": "text", "text": "inline code", "marks": [ { "type": "code" } ] }'
    And the ADF chunk at content path [ 0, 0, 0 ] contains '{"type": "text", "text": " and "}'
    And the ADF chunk at content path [ 0, 0, 0 ] contains '{ "type": "text", "text": "another one", "marks": [ { "type": "code" } ] }'
    And the ADF chunk at content path [ 0, 0, 0 ] contains '{ "type": "text", "text": " in a ordered list"}'

  Scenario: Base formatting - Inline code in a blockquote
    Given the markdown in GITHUB is '> Test with `inline code` and `another one` in a block quote'
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'blockquote'
    And the ADF chunk at content path [ 0, 0 ] has type 'paragraph'
    And the ADF chunk at content path [ 0, 0 ] contains '{"type": "text", "text": "Test with "}'
    And the ADF chunk at content path [ 0, 0 ] contains '{ "type": "text", "text": "inline code", "marks": [ { "type": "code" } ] }'
    And the ADF chunk at content path [ 0, 0 ] contains '{"type": "text", "text": " and "}'
    And the ADF chunk at content path [ 0, 0 ] contains '{ "type": "text", "text": "another one", "marks": [ { "type": "code" } ] }'
    And the ADF chunk at content path [ 0, 0 ] contains '{ "type": "text", "text": " in a block quote"}'
