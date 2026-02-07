## ADDED Requirements

### Requirement: Add custom reason option
The system SHALL allow users to add new reason options to the dropdown.

#### Scenario: Add option button
- **WHEN** user clicks the "+" button next to the reason dropdown
- **THEN** system shows an input dialog to enter a new reason

#### Scenario: Submit new option
- **WHEN** user enters a reason text and clicks "Add"
- **THEN** system adds the new option to the dropdown and selects it

#### Scenario: Empty input
- **WHEN** user clicks "Add" without entering text
- **THEN** system shows an error "Please enter a reason"

#### Scenario: Duplicate option
- **WHEN** user enters a reason that already exists
- **THEN** system shows an error "This reason already exists"

### Requirement: Persist custom options
The system SHALL save custom reason options to localStorage so they persist across sessions.

#### Scenario: Save on add
- **WHEN** user adds a new custom option
- **THEN** system saves the updated options list to localStorage

#### Scenario: Load on startup
- **WHEN** user opens the application
- **THEN** system loads previously saved custom options from localStorage

### Requirement: Default reason options
The system SHALL provide default reason options that cannot be deleted.

#### Scenario: Default options
- **WHEN** application loads for the first time
- **THEN** system shows default options: "Style mismatch", "Low engagement", "Content quality", "Other"
