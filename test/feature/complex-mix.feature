Feature: Complex formatting mix

  Scenario: Headers, List, emphasis, smiley, inline code, empty lines and code block
    Given the markdown in GITHUB is :
      |'# This *is **an** italic* **bold *header* **tag                                                                 |
      |'- Ability to group packets by time and detect duplicates per window                                             |
      |'- Ability to define a comparator function for packets                                                           |
      |':+1:                                                                                                            |
      |'  these correspond to two abilities in the `editcap` tool from Wireshark. For example:                          |
      |'  `editcap -D 100 -I 26 myfile.pcap`                                                                            |
      |'  where:                                                                                                        |
      |'  ```                                                                                                           |
      |'  -I <bytes to ignore>   ignore the specified number of bytes at the beginning                                  |
      |'  of the frame during MD5 hash calculation, unless the                                                          |
      |'  frame is too short, then the full frame is used.                                                              |
      |'  '                                                                                                             |
      |'  '                                                                                                             |
      |'  -D <dup window>        remove packet if duplicate; configurable <dup window>.                                 |
      |'  Valid <dup window> values are 0 to 1000000.                                                                   |
      |'  '                                                                                                             |
      |'  ```                                                                                                           |
      |'  '                                                                                                             |
      |'  `-D` and `-w` are ways to group duplicates.                                                                   |
      |'  '                                                                                                             |
      |'  ```scala                                                                                                      |
      |'  compare(p1: Node, p2: Node) = {                                                                               |
      |'  excludeTags(name: String, node: Node) = (node \\ "@name").text == name                                        |
      |'  p1.filter(excludeTags("ip.src")) == p2.filter(excludeTags("ip.src"))                                          |
      |'  } // must return Boolean                                                                                      |
      |'  ```                                                                                                           |
      |'# This *is **a second** italic* **bold *header* **tag                                                           |
      |'And a paragraph                                                                                                 |
      |'and more text inside the same paragraph                                                                         |
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
    And the ADF chunk at content path [ 1 ] has type 'bulletList'
    And the ADF chunk at content path [ 1, 0 ] has type 'listItem'
    And the ADF chunk at content path [ 1, 0, 0 ] has type 'paragraph'
    And the ADF chunk at content path [ 1, 0, 0 ] contains '{"type": "text", "text": "Ability to group packets by time and detect duplicates per window" }'
    And the ADF chunk at content path [ 2, 0 ] has type 'listItem'
    And the ADF chunk at content path [ 2, 0, 0 ] has type 'paragraph'
    And the ADF chunk at content path [ 2, 0, 0 ] contains '{"type": "text", "text": "Ability to define a comparator function for packets " }'
    And the ADF chunk at content path [ 2, 0, 0, 1 ] has type 'emoji'
    And the ADF chunk at content path [ 2, 0, 0, 1 ] has attribute '{ "shortName": "+1" }'
    And the ADF chunk at content path [ 2, 0, 0 ] contains '{"type": "text", "text": " these correspond to two abilities in the " }'
    And the ADF chunk at content path [ 2, 0, 0 ] contains '{"type": "text", "text": "editcap", "marks": [ { "type": "code" } ] }'
    And the ADF chunk at content path [ 2, 0, 0 ] contains '{"type": "text", "text": " tool from Wireshark. For example: " }'
    And the ADF chunk at content path [ 2, 0, 0 ] contains '{"type": "text", "text": "editcap -D 100 -I 26 myfile.pcap", "marks": [ { "type": "code" } ] }'
    And the ADF chunk at content path [ 2, 0, 0 ] contains '{"type": "text", "text": " where:" }'
    And the ADF chunk at content path [ 2, 0, 1 ] has type 'codeBlock'
    And the ADF chunk at content path [ 2, 0, 1 ] contains '{"type": "text", "text": "-I <bytes to ignore>   ignore the specified number of bytes at the beginning\nof the frame during MD5 hash calculation, unless the\nframe is too short, then the full frame is used.\n\n\n-D <dup window>        remove packet if duplicate; configurable <dup window>.\nValid <dup window> values are 0 to 1000000.\n" }'
    And the ADF chunk at content path [ 2, 0, 2 ] has type 'paragraph'
    And the ADF chunk at content path [ 2, 0, 2 ] contains '{"type": "text", "text": "-D", "marks": [ { "type": "code" } ] }'
    And the ADF chunk at content path [ 2, 0, 2 ] contains '{"type": "text", "text": " and " }'
    And the ADF chunk at content path [ 2, 0, 2 ] contains '{"type": "text", "text": "-w", "marks": [ { "type": "code" } ] }'
    And the ADF chunk at content path [ 2, 0, 2 ] contains '{"type": "text", "text": " are ways to group duplicates." }'
    And the ADF chunk at content path [ 2, 0, 3 ] has type 'codeBlock'
    And the ADF chunk at content path [ 2, 0, 3 ] contains '{"type": "text", "text": "compare(p1: Node, p2: Node) = {\nexcludeTags(name: String, node: Node) = (node \\ \"@name\").text == name\np1.filter(excludeTags(\"ip.src\")) == p2.filter(excludeTags(\"ip.src\"))\n} // must return Boolean" }'
    And the ADF chunk at content path [ 3 ] has type 'heading'
    And the ADF chunk at content path [ 3 ] contains '{"type": "text", "text": "This "}'
    And the ADF chunk at content path [ 3 ] contains '{"type": "text", "text": "is ", "marks": [ { "type": "em" } ] }'
    And the ADF chunk at content path [ 3 ] contains '{"type": "text", "text": "a second", "marks": [ { "type": "strong" }, { "type": "em" } ] }'
    And the ADF chunk at content path [ 4 ] has type 'paragraph'
    And the ADF chunk at content path [ 4 ] contains '{"type": "text", "text": "And a paragraph and more text inside the same paragraph" }'

  Scenario: Unfinished block with headers, List, emphasis, smiley, inline code, empty lines and code block with weird indent
    Given the markdown in GITHUB is :
      |'The following raw Github body                                                                                  |
      |'```text                                                                                                        |
      |'When we **try** something like this:                                                                           |
      |'  ```cucumber                                                                                                  |
      |'Scenario Outline: whatever Scenario                                                                            |
      |'    When some <variable> is also used with 'another_variable'                                                  |
      |'     Then ....                                                                                                 |
      |'     ....                                                                                                      |
      |'     Example Outline:                                                                                          |
      |'     \|   variable   \|                                                                                        |
      |'     \|     value1    \|                                                                                       |
      |'     \|     value2    \|                                                                                       |
      |'  ```                                                                                                          |
      |'It seem that the regexp priority in jest-cucumber is wrong when there's more than 1 entity in the sentence     |
      |'```                                                                                                            |
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'paragraph'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "The following raw Github body"}'
    And the ADF chunk at content path [ 1 ] has type 'codeBlock'
    And the ADF chunk at content path [ 1 ] contains '{"type": "text", "text": "When we **try** something like this:\n  ```cucumber\nScenario Outline: whatever Scenario\n    When some <variable> is also used with 'another_variable'\n     Then ....\n     ....\n     Example Outline:\n     |   variable   |\n     |     value1    |\n     |     value2    |"}'


  Scenario: Multiple block with empty lines and code block with weird indent
    Given the markdown in GITHUB is :
      |'The following raw Github body                                                                                  |
      |'                                                                                                        |
      |'When we **try** something like this:                                                                           |
      |'  ```cucumber                                                                                                  |
      |'Scenario Outline: whatever Scenario                                                                            |
      |'    When some <variable> is also used with 'another_variable'                                                  |
      |'     Then ....                                                                                                 |
      |'     ....                                                                                                      |
      |'     Example Outline:                                                                                          |
      |'     \|   variable   \|                                                                                        |
      |'     \|     value1    \|                                                                                       |
      |'     \|     value2    \|                                                                                       |
      |'  ```                                                                                                       |
      |'It seem that the regexp priority in jest-cucumber is wrong when there's more than 1 entity in the sentence     |
      |'                                                                                                          |
      |'                                                                                                               |
      |'Should be looking like this:                                                                                   |
      |'<img width="797" alt="Screen Shot 2020-01-13 at 5 45 11 PM" src="https://user-images.githubusercontent.com/662628/72298589-7fdef300-362c-11ea-81f4-bdb1ca679f58.png">|
      |'                                                                                                               |
      |'                                                                                                               |
      |'Being able to write scripts with flexible spacing, for example:                                                |
      |'                                                                                                               |
      |'```scala                                                                                                       |
      |'myVal = something.getAttribute(“blabla”)                                                                       |
      |'                 .ifElse(valIfTrue, valIfFalse)                                                                |
      |'                 .something(2)                                                                                 |
      |'```                                                                                                            |
      |'or this, when @lalala  will be done with her current pr ...                                                    |
      |'```scala                                                                                                       |
      |'enodeB(                                                                                                        |
      |'  myAttribute = “are spread”,                                                                                  |
      |'  onMany = lines,                                                                                              |
      |'  andSpacing = “is flexible”)                                                                                  |
      |'```                                                                                                            |
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'paragraph'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "The following raw Github body"}'
    And the ADF chunk at content path [ 1 ] has type 'paragraph'
    And the ADF chunk at content path [ 1 ] contains '{"type": "text", "text": "When we " }'
    And the ADF chunk at content path [ 1 ] contains '{"type": "text", "text": "try", "marks": [{"type": "strong"}]}'
    And the ADF chunk at content path [ 1 ] contains '{"type": "text", "text": " something like this:"}'
    And the ADF chunk at content path [ 2 ] has type 'codeBlock'
    And the ADF chunk at content path [ 2 ] contains '{"type": "text", "text": "Scenario Outline: whatever Scenario\n  When some <variable> is also used with 'another_variable'\n   Then ....\n   ....\n   Example Outline:\n   |   variable   |\n   |     value1    |\n   |     value2    |"}'
    And the ADF chunk at content path [ 3 ] has type 'paragraph'
    And the ADF chunk at content path [ 3 ] contains '{"type": "text", "text": "It seem that the regexp priority in jest-cucumber is wrong when there's more than 1 entity in the sentence"}'
    And the ADF chunk at content path [ 4 ] has type 'paragraph'
    And the ADF chunk at content path [ 4 ] contains '{"type": "text", "text": " "}'
    And the ADF chunk at content path [ 5 ] has type 'paragraph'
    And the ADF chunk at content path [ 5 ] contains '{"type": "text", "text": "Should be looking like this: <img width=\"797\" alt=\"Screen Shot 2020-01-13 at 5 45 11 PM\" src=\"https://user-images.githubusercontent.com/662628/72298589-7fdef300-362c-11ea-81f4-bdb1ca679f58.png\">"}'
    And the ADF chunk at content path [ 6 ] has type 'paragraph'
    And the ADF chunk at content path [ 6 ] contains '{"type": "text", "text": " "}'
    And the ADF chunk at content path [ 7 ] has type 'paragraph'
    And the ADF chunk at content path [ 7 ] contains '{"type": "text", "text": "Being able to write scripts with flexible spacing, for example:"}'
    And the ADF chunk at content path [ 8 ] has type 'codeBlock'
    And the ADF chunk at content path [ 8 ] contains '{"type": "text", "text": "myVal = something.getAttribute(“blabla”)\n                 .ifElse(valIfTrue, valIfFalse)\n                 .something(2)"}'
    And the ADF chunk at content path [ 9 ] has type 'paragraph'
    And the ADF chunk at content path [ 9 ] contains '{"type": "text", "text": "or this, when @lalala  will be done with her current pr ..."}'
    And the ADF chunk at content path [ 10 ] has type 'codeBlock'
    And the ADF chunk at content path [ 10 ] contains '{"type": "text", "text": "enodeB(\n  myAttribute = “are spread”,\n  onMany = lines,\n  andSpacing = “is flexible”)"}'
