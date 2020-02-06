Feature: Conversion of Header markdown

  Scenario: Base formatting - Header 1
    Given the markdown in GITHUB is '# This is an header tag'
    When we translate it in ADF
    Then the 1st ADF chunk has type 'heading'
    And the 1st ADF has '{ "level": 1 }' as attribute
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "This is an header tag"}'

  Scenario: Base formatting - Header 2
    Given the markdown in GITHUB is '## This is an header2 tag'
    When we translate it in ADF
    Then the 1st ADF chunk has type 'heading'
    And the 1st ADF has '{ "level": 2 }' as attribute
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "This is an header2 tag"}'

  Scenario: Base formatting - Header 3
    Given the markdown in GITHUB is '### This is an header3 tag'
    When we translate it in ADF
    Then the 1st ADF chunk has type 'heading'
    And the 1st ADF has '{ "level": 3 }' as attribute
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "This is an header3 tag"}'

  Scenario: Base formatting - Header 4
    Given the markdown in GITHUB is '#### This is an header4 tag'
    When we translate it in ADF
    Then the 1st ADF chunk has type 'heading'
    And the 1st ADF has '{ "level": 4 }' as attribute
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "This is an header4 tag"}'

  Scenario: Base formatting - Header 5
    Given the markdown in GITHUB is '##### This is an header5 tag'
    When we translate it in ADF
    Then the 1st ADF chunk has type 'heading'
    And the 1st ADF has '{ "level": 5 }' as attribute
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "This is an header5 tag"}'

  Scenario: Base formatting - Header 6
    Given the markdown in GITHUB is '###### This is an header6 tag'
    When we translate it in ADF
    Then the 1st ADF chunk has type 'heading'
    And the 1st ADF has '{ "level": 6 }' as attribute
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "This is an header6 tag"}'

  Scenario: Base formatting - Header stop at 6, 7 doesn't exist
    Given the markdown in GITHUB is '####### This is not an header7 tag, it's a paragraph'
    When we translate it in ADF
    Then the 1st ADF chunk has type 'paragraph'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "####### This is not an header7 tag, it's a paragraph"}'


  Scenario: Base formatting - Header 1 with multimix emphasis
    Given the markdown in GITHUB is '# This *is **an** italic* **bold *header* **tag'
    When we translate it in ADF
    Then the 1st ADF chunk has type 'heading'
    And the 1st ADF has '{ "level": 1 }' as attribute
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "This "}'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "is ", "marks": [ { "type": "em" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "an", "marks": [ { "type": "strong" }, { "type": "em" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": " italic", "marks": [ { "type": "em" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": " ", "marks": [ { "type": "strong" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "header", "marks": [ { "type": "strong" }, { "type": "em" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": " ", "marks": [ { "type": "strong" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "tag" }'

  Scenario: Base formatting - Header 1 followed by paragraph
    Given the markdown in GITHUB is :
      |# This *is **an** italic* **bold *header* **tag                                                                   |
      |And a paragraph                                                                                                   |
      |And more text inside the same paragraph                                                                           |
    When we translate it in ADF
    Then the 1st ADF chunk has type 'heading'
    And the 1st ADF has '{ "level": 1 }' as attribute
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "This "}'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "is ", "marks": [ { "type": "em" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "an", "marks": [ { "type": "strong" }, { "type": "em" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": " italic", "marks": [ { "type": "em" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": " ", "marks": [ { "type": "strong" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "header", "marks": [ { "type": "strong" }, { "type": "em" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": " ", "marks": [ { "type": "strong" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "tag" }'
    And the ADF chunk at content path [ 1 ] has type 'paragraph'
    And the ADF chunk at content path [ 1 ] contains '{"type": "text", "text": "And a paragraph"}'
    And the ADF chunk at content path [ 2 ] has type 'paragraph'
    And the ADF chunk at content path [ 2 ] contains '{"type": "text", "text": "And more text inside the same paragraph"}'
