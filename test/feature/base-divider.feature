Feature: Conversion of Header markdown

  Scenario: Base formatting - Asterisk
    Given the markdown in GITHUB is '***'
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'rule'

  Scenario: Base formatting - Underline
    Given the markdown in GITHUB is '___'
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'rule'

  Scenario: Base formatting - Dashes
    Given the markdown in GITHUB is '---'
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'rule'


  Scenario: Header 1 followed by paragraph with divider
    Given the markdown in GITHUB is :
      |# This *is **an** italic* **bold *header* **tag                                                                   |
      |***************                                                                                                   |
      |And a paragraph                                                                                                   |
      |---------------------------------------                                                                           |
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'heading'
    And the ADF chunk at content path [ 0 ] has attribute '{ "level": 1 }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "This "}'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "is ", "marks": [ { "type": "em" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "an", "marks": [ { "type": "strong" }, { "type": "em" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": " italic", "marks": [ { "type": "em" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": " ", "marks": [ { "type": "strong" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "header", "marks": [ { "type": "strong" }, { "type": "em" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": " ", "marks": [ { "type": "strong" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "tag" }'
    And the ADF chunk at content path [ 1 ] has type 'rule'
    And the ADF chunk at content path [ 2 ] has type 'paragraph'
    And the ADF chunk at content path [ 2 ] contains '{"type": "text", "text": "And a paragraph"}'
    And the ADF chunk at content path [ 3 ] has type 'rule'

  Scenario: Header 1 followed by paragraph with divider and spacing
    Given the markdown in GITHUB is :
      |# This *is **an** italic* **bold *header* **tag                                                                   |
      |                                                                                                                  |
      |***************                                                                                                   |
      |And a paragraph                                                                                                   |
      |                                                                                                                  |
      |---------------------------------------                                                                           |
      |                                                                                                                  |
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'heading'
    And the ADF chunk at content path [ 0 ] has attribute '{ "level": 1 }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "This "}'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "is ", "marks": [ { "type": "em" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "an", "marks": [ { "type": "strong" }, { "type": "em" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": " italic", "marks": [ { "type": "em" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": " ", "marks": [ { "type": "strong" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "header", "marks": [ { "type": "strong" }, { "type": "em" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": " ", "marks": [ { "type": "strong" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "tag" }'
    And the ADF chunk at content path [ 1 ] has type 'rule'
    And the ADF chunk at content path [ 2 ] has type 'paragraph'
    And the ADF chunk at content path [ 2 ] contains '{"type": "text", "text": "And a paragraph"}'
    And the ADF chunk at content path [ 3 ] has type 'rule'

  Scenario: Header 1 followed by paragraph with divider and breaking lines
    Given the markdown in GITHUB is :
      |# This *is **an** italic* **bold *header* **tag                                                                   |
      |                                                                                                                  |
      |                                                                                                                  |
      |***************                                                                                                   |
      |And a paragraph                                                                                                   |
      |                                                                                                                  |
      |                                                                                                                  |
      |---------------------------------------                                                                           |
      |                                                                                                                  |
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'heading'
    And the ADF chunk at content path [ 0 ] has attribute '{ "level": 1 }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "This "}'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "is ", "marks": [ { "type": "em" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "an", "marks": [ { "type": "strong" }, { "type": "em" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": " italic", "marks": [ { "type": "em" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": " ", "marks": [ { "type": "strong" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "header", "marks": [ { "type": "strong" }, { "type": "em" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": " ", "marks": [ { "type": "strong" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "tag" }'
    And the ADF chunk at content path [ 1 ] has type 'paragraph'
    And the ADF chunk at content path [ 1 ] contains '{"type": "text", "text": " "}'
    And the ADF chunk at content path [ 2 ] has type 'rule'
    And the ADF chunk at content path [ 3 ] has type 'paragraph'
    And the ADF chunk at content path [ 3 ] contains '{"type": "text", "text": "And a paragraph"}'
    And the ADF chunk at content path [ 4 ] has type 'paragraph'
    And the ADF chunk at content path [ 4 ] contains '{"type": "text", "text": " "}'
    And the ADF chunk at content path [ 5 ] has type 'rule'
