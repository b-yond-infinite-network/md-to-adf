Feature: Conversion of Codeblock markdown

  Scenario: Base formatting - Code block at the root level
    Given the markdown in GITHUB is :
      |```Javascript                                                                                                   |
      |const testCode = 'this code is good'                                                                            |
      |if( itmustDoSomething good ) console.log( 'yeah' )                                                              |
      |```                                                                                                             |
      |Some paragraph in between                                                                                       |
      |```Python                                                                                                       |
      |const thisCode = 'this code is better'                                                                          |
      |```                                                                                                             |
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'codeBlock'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "const testCode = 'this code is good'\nif( itmustDoSomething good ) console.log( 'yeah' )"}'
    And the ADF chunk at content path [ 1 ] has type 'paragraph'
    And the ADF chunk at content path [ 1 ] contains '{"type": "text", "text": "Some paragraph in between"}'
    And the ADF chunk at content path [ 2 ] has type 'codeBlock'
    And the ADF chunk at content path [ 2 ] contains '{"type": "text", "text": "const thisCode = 'this code is better'"}'

  Scenario: Base formatting - Code block inside an unordered list starting with a header
    Given the markdown in GITHUB is :
      |'# With some heading                                                                                            |
      |'* ```Javascript                                                                                                |
      |'const thisCode = 'this code is so good'                                                                        |
      |'const youshould = 'have more'                                                                                  |
      |'```                                                                                                            |
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'heading'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "With some heading"}'
    And the ADF chunk at content path [ 1 ] has type 'bulletList'
    And the ADF chunk at content path [ 1, 0 ] has type 'listItem'
    And the ADF chunk at content path [ 1, 0, 0 ] has type 'paragraph'
    And the ADF chunk at content path [ 1, 0, 0 ] contains '{"type": "text", "text": " "}'
    And the ADF chunk at content path [ 1, 0, 1 ] has type 'codeBlock'
    And the ADF chunk at content path [ 1, 0, 1 ] contains '{"text": "const thisCode = 'this code is so good'\nconst youshould = 'have more'", "type": "text"}'

  Scenario: Base formatting - Unordered list level 1
    Given the markdown in GITHUB is '* This is an unordered list of level 1'
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'bulletList'

  Scenario: Base formatting - Ordered list level 1
    Given the markdown in GITHUB is '1. This is an ordered list of level 1'
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'orderedList'

  Scenario: Formatting - Simple unordered list
    Given the markdown in GITHUB the same than in the markdown file named 'simple-unordered-list'
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'bulletList'
    And the ADF document content has all the object defined in json file named 'simple-unordered-list'

  Scenario: Formatting - Complex unordered list
    Given the markdown in GITHUB the same than in the markdown file named 'complex-unordered-list'
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'bulletList'
    And the ADF document content has all the object defined in json file named 'complex-unordered-list'

  Scenario: Formatting - Simple ordered list
    Given the markdown in GITHUB the same than in the markdown file named 'simple-ordered-list'
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'orderedList'
    And the ADF document content has all the object defined in json file named 'simple-ordered-list'

  Scenario: Formatting - Complex ordered list
    Given the markdown in GITHUB the same than in the markdown file named 'complex-ordered-list'
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'orderedList'
    And the ADF document content has all the object defined in json file named 'complex-ordered-list'

  Scenario: Formatting - Mix unordered/ordered list multilevel
    Given the markdown in GITHUB the same than in the markdown file named 'mix-lists'
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'bulletList'
    And the ADF document content has all the object defined in json file named 'mix-lists'


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


  Scenario: Base formatting - Link in a paragraph
    Given the markdown in GITHUB is 'Test with paragraph and a link [TitleOfLink](urltogoto)'
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'paragraph'
    And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "Test with paragraph and a link "}'
    And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "TitleOfLink", "marks": [ { "type": "link", "attrs": { "href": "urltogoto" } } ] }'

  Scenario: Base formatting - Link in a paragraph with a title
    Given the markdown in GITHUB is 'Test with paragraph and a link [TitleOfLink](urltogoto "mytitle")'
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'paragraph'
    And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "Test with paragraph and a link "}'
    And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "TitleOfLink", "marks": [ { "type": "link", "attrs": { "href": "urltogoto", "title": "mytitle" } } ] }'


  Scenario: Base formatting - Emoji in a paragraph
    Given the markdown in GITHUB is 'Test with paragraph and an :smile: emoji'
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'paragraph'
    And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "Test with paragraph and an "}'
    And the ADF chunk at content path [ 0 ] contains '{ "type": "emoji", "attrs": { "shortName": "smile" } }'
    And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": " emoji"}'
