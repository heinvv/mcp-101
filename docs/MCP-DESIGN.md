I would like to start a small test MCP project for me to study MCP development.

Language: JS/TS

Goal: Add two helpers inside my Cursor AI tool to help me write better accessible code: 

1: Remind me to add an `aria-label` attribute to a `nav` element.
2: Remind me to add the correct `aria` label to a `nav` dropdown button.

Deployment: I would like to deploy this in a free deployment environment, like render.com.

Interaction: as a user I would like to add the interaction type that I request in a parameter for the MCP.

---

Questions: 

 Technical Architecture:
  1. Do you want this as a single MCP server with two tools, or two separate
  MCP servers?

Please explain what you mean by two tools. 

  2. Should the MCP server analyze code in real-time as you type, or only when
  explicitly invoked?

This is what I meant by 'interaction type'. I would like both options, that can be activated with a parameter.

  3. Do you want the reminders to appear as VS Code/Cursor notifications,
  inline suggestions, or diagnostic messages?

        Please suggest best practices. I am still learning here. But I would like multiple options, that can be activated or deactivated.


  Functionality Scope:
  4. For the nav element reminder - should it check for missing aria-label OR
  aria-labelledby, or specifically just aria-label?

        Please study accessiblity documentation about best practices for this.

  5. For the dropdown button - what constitutes a "dropdown button"? Should it
  look for specific patterns like button + aria-expanded, or certain class
  names?

        patterns with button + aria-expanded indeed. Follow best practices for accessible dropdowns inside menus.

  6. Should the tool also suggest appropriate label text, or just remind that
  the attribute is missing? 

  Suggest indeed.

  Integration & Deployment:
  7. How do you envision the "interaction type parameter"? Do you mean the user
   can specify whether they want nav-related checks, button-related checks, or
  both?

        See answers above.

  8. For deployment on render.com - do you want this as a web service that
  Cursor connects to, or a standalone server?

        Please advise.
        But I would like a standalone MCP server, that I can reference inside my Cursor MCP settings.

  9. Should this work with any codebase, or do you have specific file
  types/frameworks in mind (React, vanilla HTML, etc.)?

  Let's start with Vanilla HTML and CSS.

  User Experience:
  10. Do you want the tool to scan entire files, selected text, or work on the
  current cursor position?

        Let's start with the active file.
        But please advise.


  11. Should it provide fix suggestions or just highlight issues?

        Both, with an option to activate or deactivate one of these types.

  12. Any specific accessibility standards you want to follow (WCAG 2.1, etc.)?

  Very general for now.

  These details will help me create a comprehensive design plan for your MCP
  project.


