Feature: Conversion of Header markdown

  Scenario: Mix break line and carriage return

    Given the markdown has a mix of carriage return and breakline
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'paragraph'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "This is a paragraph, with a breakline and a carriage return"}'

  Scenario: Breaking a paragraph
    Given the markdown in GITHUB is :
      |'This is a paragraph, with a none breaking breakline                                                             |
      |'so that it fits in a 80 columnar size. But then we have to                                                      |
      |'use                                                                                                             |
      |''                                                                                                               |
      |'Double empty line, to really break the line                                                                     |
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'paragraph'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "This is a paragraph, with a none breaking breakline so that it fits in a 80 columnar size. But then we have to use"}'
    And the ADF chunk at content path [ 1 ] has type 'paragraph'
    And the ADF chunk at content path [ 1 ] contains '{"type": "text", "text": "Double empty line, to really break the line"}'

  Scenario: Breaking a header
    Given the markdown in GITHUB is :
      |'# This is a header, with a none breaking breakline                                                              |
      |'but since it's a header the rest is a paragraph                                                                 |
      |'   '                                                                                                            |
      |'And then another paragraph after an empty line                                                                  |
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'heading'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "This is a header, with a none breaking breakline"}'
    And the ADF chunk at content path [ 1 ] has type 'paragraph'
    And the ADF chunk at content path [ 1 ] contains '{"type": "text", "text": "but since it's a header the rest is a paragraph"}'
    And the ADF chunk at content path [ 2 ] has type 'paragraph'
    And the ADF chunk at content path [ 2 ] contains '{"type": "text", "text": "And then another paragraph after an empty line"}'

  Scenario: Breaking a ordered list
    Given the markdown in GITHUB is :
      |'1. This is a ordered list, with a none breaking breakline                                                       |
      |'so that it fits in a 80 columnar size                                                                           |
      |'   '                                                                                                            |
      |'An empty line then break everything                                                                         |
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'orderedList'
    And the ADF chunk at content path [ 0, 0, 0 ] contains '{"type": "text", "text": "This is a ordered list, with a none breaking breakline so that it fits in a 80 columnar size"}'
    And the ADF chunk at content path [ 1 ] has type 'paragraph'
    And the ADF chunk at content path [ 1 ] contains '{"type": "text", "text": "An empty line then break everything"}'

  Scenario: Breaking a unordered list
    Given the markdown in GITHUB is :
      |'- This is an unordered list, with a none breaking breakline                                                       |
      |'so that it fits in a 80 columnar size                                                                           |
      |'   '                                                                                                            |
      |'An empty line then break everything                                                                         |
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'bulletList'
    And the ADF chunk at content path [ 0, 0, 0 ] contains '{"type": "text", "text": "This is an unordered list, with a none breaking breakline so that it fits in a 80 columnar size"}'
    And the ADF chunk at content path [ 1 ] has type 'paragraph'
    And the ADF chunk at content path [ 1 ] contains '{"type": "text", "text": "An empty line then break everything"}'

  Scenario: Breaking inside an unclosed codeBlock
    Given the markdown in GITHUB is :
      |'```                                                                                                             |
      |' This is an code block, with a none breaking breakline                                                          |
      |'so that it fits in a 80 columnar size but inside a codeblock it's just another line                             |
      |'   '                                                                                                            |
      |'An empty line then break nothing inside a codeBloc                                                              |
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'codeBlock'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": " This is an code block, with a none breaking breakline\nso that it fits in a 80 columnar size but inside a codeblock it's just another line\n   \nAn empty line then break nothing inside a codeBloc" }'

  Scenario: Breaking inside a closed codeBlock
    Given the markdown in GITHUB is :
      |'```                                                                                                             |
      |' This is an code block, with a none breaking breakline                                                          |
      |'so that it fits in a 80 columnar size but inside a codeblock it's just another line                             |
      |'   '                                                                                                            |
      |'An empty line then break nothing inside a codeBloc                                                              |
      |'```                                                                                                             |
      |'Immediately after is a paragraph                                                                                |
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'codeBlock'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": " This is an code block, with a none breaking breakline\nso that it fits in a 80 columnar size but inside a codeblock it's just another line\n   \nAn empty line then break nothing inside a codeBloc"}'
    And the ADF chunk at content path [ 1 ] has type 'paragraph'
    And the ADF chunk at content path [ 1 ] contains '{"type": "text", "text": "Immediately after is a paragraph"}'

  Scenario: Breaking inside a quote block
    Given the markdown in GITHUB is :
      |'> this is a block quote, with a none breaking breakline                                                         |
      |'so that it fits in a 80 columnar size                                                                           |
      |'and any text in the line                                                                                        |
      |'   '                                                                                                            |
      |'An empty line breaks the quote block                                                                            |
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'blockquote'
    Then the ADF chunk at content path [ 0, 0 ] has type 'paragraph'
    And the ADF chunk at content path [ 0, 0 ] contains '{"type": "text", "text": "this is a block quote, with a none breaking breakline so that it fits in a 80 columnar size and any text in the line"}'
    And the ADF chunk at content path [ 1 ] has type 'paragraph'
    And the ADF chunk at content path [ 1 ] contains '{"type": "text", "text": "An empty line breaks the quote block"}'
