Feature: Conversion of lists markdown

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
