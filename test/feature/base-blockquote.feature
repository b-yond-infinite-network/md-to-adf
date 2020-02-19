Feature: Conversion of Blockquote markdown

  Scenario: Base blockquote - one liner with no enrichement
    Given the markdown in GITHUB is '> This is a simple blockquote'
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'blockquote'
    Then the ADF chunk at content path [ 0, 0 ] has type 'paragraph'
    And the ADF chunk at content path [ 0, 0 ] contains '{ "type": "text", "text": "This is a simple blockquote"}'

  Scenario: Base blockquote - multiline without line breaks
    Given the markdown in GITHUB is :
      |'> With some text                                                                                                |
      |'> and some other text                                                                                           |
      |'> that should be just one line                                                                                  |
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'blockquote'
    And the ADF chunk at content path [ 0, 0 ] has type 'paragraph'
    And the ADF chunk at content path [ 0, 0 ] contains '{"type": "text", "text": "With some text and some other text that should be just one line"}'

  Scenario: Base blockquote - multiline with one line break
    Given the markdown in GITHUB is :
      |'> With some text                                                                                                |
      |'> and some other text                                                                                           |
      |'                                                                                                                |
      |'> And another blockquote                                                                                        |
      |'> that should be just one line                                                                                  |
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'blockquote'
    And the ADF chunk at content path [ 0, 0 ] has type 'paragraph'
    And the ADF chunk at content path [ 0, 0 ] contains '{"type": "text", "text": "With some text and some other text"}'
    And the ADF chunk at content path [ 1 ] has type 'blockquote'
    And the ADF chunk at content path [ 1, 0 ] has type 'paragraph'
    And the ADF chunk at content path [ 1, 0 ] contains '{"type": "text", "text": "And another blockquote that should be just one line"}'

  Scenario: Base blockquote - multiline with emphasis
    Given the markdown in GITHUB is :
      |'> With some text in *italic*                                                                                    |
      |'> and some other text in **bold**                                                                               |
      |'> and some other text in ***bold italic***                                                                      |
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'blockquote'
    And the ADF chunk at content path [ 0, 0 ] has type 'paragraph'
    And the ADF chunk at content path [ 0, 0 ] contains '{"type": "text", "text": "With some text in "}'
    And the ADF chunk at content path [ 0, 0 ] contains '{"type": "text", "text": "italic", "marks": [{"type": "em"}]}'
    And the ADF chunk at content path [ 0, 0 ] contains '{"type": "text", "text": " and some other text in "}'
    And the ADF chunk at content path [ 0, 0 ] contains '{"type": "text", "text": "bold", "marks": [{"type": "strong"}]}'
    And the ADF chunk at content path [ 0, 0 ] contains '{"type": "text", "text": " and some other text in "}'
    And the ADF chunk at content path [ 0, 0 ] contains '{"type": "text", "text": "bold italic", "marks": [{"type": "strong"}, {"type": "em"}]}'

  Scenario: Base blockquote - multiline with emphasis and line breaks
    Given the markdown in GITHUB is :
      |'> With some text in *italic*                                                                                    |
      |'> and some other text in **bold**                                                                               |
      |'                                                                                                                |
      |'> New text in ***bold italic***                                                                                 |
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'blockquote'
    And the ADF chunk at content path [ 0, 0 ] has type 'paragraph'
    And the ADF chunk at content path [ 0, 0 ] contains '{"type": "text", "text": "With some text in "}'
    And the ADF chunk at content path [ 0, 0 ] contains '{"type": "text", "text": "italic", "marks": [{"type": "em"}]}'
    And the ADF chunk at content path [ 0, 0 ] contains '{"type": "text", "text": " and some other text in "}'
    And the ADF chunk at content path [ 0, 0 ] contains '{"type": "text", "text": "bold", "marks": [{"type": "strong"}]}'
    And the ADF chunk at content path [ 1 ] has type 'blockquote'
    And the ADF chunk at content path [ 1, 0 ] has type 'paragraph'
    And the ADF chunk at content path [ 1, 0 ] contains '{"type": "text", "text": "New text in "}'
    And the ADF chunk at content path [ 1, 0 ] contains '{"type": "text", "text": "bold italic", "marks": [{"type": "strong"}, {"type": "em"}]}'

  Scenario: Complex blockquote - blockquote with list inside (UNSUPPORTED BY JIRA FOR NOW -- non breaking test)
    Given the markdown in GITHUB is :
      |'> * this is a list                                                                                              |
      |'>   and some other text in **bold**                                                                             |
      |'                                                                                                                |
      |'> New text in ***bold italic***                                                                                 |
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'blockquote'
    And the ADF chunk at content path [ 0, 0 ] has type 'paragraph'
    And the ADF chunk at content path [ 0, 0 ] contains '{"type": "text", "text": " this is a list   and some other text in ", "marks": [{"type": "em"}]}'
    And the ADF chunk at content path [ 0, 0 ] contains '{"type": "text", "text": "bold", "marks": [{"type": "strong"}, {"type": "em"}]}'
    And the ADF chunk at content path [ 1 ] has type 'blockquote'
    And the ADF chunk at content path [ 1, 0 ] has type 'paragraph'
    And the ADF chunk at content path [ 1, 0 ] contains '{"type": "text", "text": "New text in "}'
    And the ADF chunk at content path [ 1, 0 ] contains '{"type": "text", "text": "bold italic", "marks": [{"type": "strong"}, {"type": "em"}]}'
