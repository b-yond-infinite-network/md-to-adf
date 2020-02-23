Feature: Conversion of Emphasis markdown

  Scenario: Base markdown formatting - italic using star
  Given the markdown in GITHUB is 'this sentence contains *italic* using star'
  When we translate it in ADF
  Then the ADF chunk at content path [ 0 ] has type 'paragraph'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "this sentence contains " }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "italic", "marks": [ { "type": "em" } ] }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": " using star" }'

  Scenario: Base formatting - italic using underscore
  Given the markdown in GITHUB is 'this sentence contains _italic_ using underscore'
  When we translate it in ADF
  Then the ADF chunk at content path [ 0 ] has type 'paragraph'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "this sentence contains " }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "italic", "marks": [ { "type": "em" } ] }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": " using underscore" }'


  Scenario: Base formatting - bold using star
  Given the markdown in GITHUB is 'this sentence contains **bold** using star'
  When we translate it in ADF
  Then the ADF chunk at content path [ 0 ] has type 'paragraph'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "this sentence contains " }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "bold", "marks": [ { "type": "strong" } ] }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": " using star" }'

  Scenario: Base formatting - bold using underscore
  Given the markdown in GITHUB is 'this sentence contains __bold__ using underscore'
  When we translate it in ADF
  Then the ADF chunk at content path [ 0 ] has type 'paragraph'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "this sentence contains " }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "bold", "marks": [ { "type": "strong" } ] }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": " using underscore" }'


  Scenario: Base formatting - italic and bold using start
  Given the markdown in GITHUB is 'It's very easy to make some words **bold** and other words *italic* with Markdown.'
  When we translate it in ADF
  Then the ADF chunk at content path [ 0 ] has type 'paragraph'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "It's very easy to make some words " }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "bold", "marks": [ { "type": "strong" } ] }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": " and other words " }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "italic", "marks": [ { "type": "em" } ] }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": " with Markdown." }'

  Scenario: Base formatting - order of bold and italic doesn't change parsing with star
  Given the markdown in GITHUB is 'It's very easy to make some words *italic* and other words **bold** with Markdown.'
  When we translate it in ADF
  Then the ADF chunk at content path [ 0 ] has type 'paragraph'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "It's very easy to make some words " }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "italic", "marks": [ { "type": "em" } ] }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": " and other words " }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "bold", "marks": [ { "type": "strong" } ] }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": " with Markdown." }'

  Scenario: Base formatting - order of bold and italic doesn't change parsing with underscore
  Given the markdown in GITHUB is 'It's very easy to make some words _italic_ and other words __bold__ with Markdown.'
  When we translate it in ADF
  Then the ADF chunk at content path [ 0 ] has type 'paragraph'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "It's very easy to make some words " }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "italic", "marks": [ { "type": "em" } ] }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": " and other words " }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "bold", "marks": [ { "type": "strong" } ] }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": " with Markdown." }'


  Scenario: Base formatting - interwoven italic and bold work with star
  Given the markdown in GITHUB is 'It's very easy to make some words *italic and also **bold** with Markdown*.'
  When we translate it in ADF
  Then the ADF chunk at content path [ 0 ] has type 'paragraph'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "It's very easy to make some words " }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "italic and also ", "marks": [ { "type": "em" } ] }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "bold", "marks": [ {"type": "strong"}, {"type": "em"} ] }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": " with Markdown", "marks": [ { "type": "em" } ] }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "." }'

  Scenario: Base formatting - interwoven italic and bold work with underscore
  Given the markdown in GITHUB is 'It's very easy to make some words _italic and also __bold__ with Markdown_.'
  When we translate it in ADF
  Then the ADF chunk at content path [ 0 ] has type 'paragraph'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "It's very easy to make some words " }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "italic and also ", "marks": [ { "type": "em" } ] }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "bold", "marks": [ {"type": "strong"}, {"type": "em"} ] }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": " with Markdown", "marks": [ { "type": "em" } ] }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "." }'


  Scenario: Base formatting - interwoven bold and italic work with star
  Given the markdown in GITHUB is 'It's very easy to make some words **bold and also *italic* with Markdown**.'
  When we translate it in ADF
  Then the ADF chunk at content path [ 0 ] has type 'paragraph'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "It's very easy to make some words " }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "bold and also ", "marks": [ { "type": "strong" } ] }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "italic", "marks": [ {"type": "strong"}, {"type": "em"} ] }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": " with Markdown", "marks": [ { "type": "strong" } ] }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "." }'

  Scenario: Base formatting - interwoven bold and italic work with underscore
  Given the markdown in GITHUB is 'It's very easy to make some words __bold and also _italic_ with Markdown__.'
  When we translate it in ADF
  Then the ADF chunk at content path [ 0 ] has type 'paragraph'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "It's very easy to make some words " }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "bold and also ", "marks": [ { "type": "strong" } ] }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "italic", "marks": [ {"type": "strong"}, {"type": "em"} ] }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": " with Markdown", "marks": [ { "type": "strong" } ] }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "." }'


  Scenario: Base formatting - multiple interwoven bold and italic work with underscore
  Given the markdown in GITHUB is 'It's very __easy to make__ some words __bold and also _italic_ with__ _Markdown_.'
  When we translate it in ADF
  Then the ADF chunk at content path [ 0 ] has type 'paragraph'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "It's very " }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "easy to make", "marks": [ { "type": "strong" } ] }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": " some words " }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "bold and also ", "marks": [ { "type": "strong" } ] }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "italic", "marks": [ {"type": "strong"}, {"type": "em"} ] }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": " with", "marks": [ { "type": "strong" } ] }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": " " }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "Markdown", "marks": [ { "type": "em" } ] }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "." }'

  Scenario: Base formatting - multiple interwoven bold and italic work with star
  Given the markdown in GITHUB is 'It's very **easy to make** some words **bold and also *italic* with** *Markdown*.'
  When we translate it in ADF
  Then the ADF chunk at content path [ 0 ] has type 'paragraph'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "It's very " }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "easy to make", "marks": [ { "type": "strong" } ] }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": " some words " }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "bold and also ", "marks": [ { "type": "strong" } ] }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "italic", "marks": [ {"type": "strong"}, {"type": "em"} ] }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": " with", "marks": [ { "type": "strong" } ] }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": " " }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "Markdown", "marks": [ { "type": "em" } ] }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "." }'

  Scenario: Base formatting - multiple interwoven bold and italic work with star even when non-terminated correctly
  Given the markdown in GITHUB is 'It's very **easy to make** some words **bold and also *italic with** *Markdown.'
  When we translate it in ADF
  Then the ADF chunk at content path [ 0 ] has type 'paragraph'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "It's very " }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "easy to make", "marks": [ { "type": "strong" } ] }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": " some words " }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "bold and also ", "marks": [ { "type": "strong" } ] }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "italic with", "marks": [ {"type": "strong"}, {"type": "em"} ] }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": " ", "marks": [ { "type": "em" } ] }'
  And the ADF chunk at content path [ 0 ] contains '{ "type": "text", "text": "Markdown." }'

  Scenario: Base formatting - multimix of emphasis
  Given the markdown in GITHUB is 'This *is **an** italic* **bold *header* **tag'
  When we translate it in ADF
  Then the ADF chunk at content path [ 0 ] has type 'paragraph'
  And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "This "}'
  And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "is ", "marks": [ { "type": "em" } ] }'
  And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "an", "marks": [ { "type": "strong" }, { "type": "em" } ] }'
  And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": " italic", "marks": [ { "type": "em" } ] }'
  And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": " ", "marks": [ { "type": "strong" } ] }'
  And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "header", "marks": [ { "type": "strong" }, { "type": "em" } ] }'
  And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": " ", "marks": [ { "type": "strong" } ] }'
  And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "tag" }'


  Scenario: Base formatting - strikethrough (GH extension)
    Given the markdown in GITHUB is 'This is a block of text ~~strikedthrough~~'
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'paragraph'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "This is a block of text "}'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "strikedthrough", "marks": [ { "type": "strike" } ] }'


  Scenario: Base formatting - multimix of emphasis with strikethrough (GH extension)
    Given the markdown in GITHUB is 'This *is **an** italic and ~~strikedthrough~~* **bold and ~~strikedthrough~~ *header ~~bold/italic and strikedthrough~~* **tag'
    When we translate it in ADF
    Then the ADF chunk at content path [ 0 ] has type 'paragraph'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "This "}'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "is ", "marks": [ { "type": "em" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "an", "marks": [ { "type": "strong" }, { "type": "em" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": " italic and ", "marks": [ { "type": "em" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "strikedthrough", "marks": [ { "type": "strike" }, { "type": "em" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": " " }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "bold and ", "marks": [ { "type": "strong" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "strikedthrough", "marks": [ { "type": "strike" }, { "type": "strong" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": " ", "marks": [ { "type": "strong" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "header ", "marks": [ { "type": "strong" }, { "type": "em" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "bold/italic and strikedthrough", "marks": [ { "type": "strike" }, { "type": "strong" }, { "type": "em" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": " ", "marks": [ { "type": "strong" } ] }'
    And the ADF chunk at content path [ 0 ] contains '{"type": "text", "text": "tag" }'
