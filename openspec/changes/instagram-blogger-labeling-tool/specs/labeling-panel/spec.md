## ADDED Requirements

### Requirement: SHEIN style selector
The system SHALL provide a radio button group to select whether the blogger matches SHEIN style.

#### Scenario: Default selection
- **WHEN** user navigates to an unlabeled blogger
- **THEN** the "No" option is selected by default

#### Scenario: Select yes
- **WHEN** user clicks the "Yes" option
- **THEN** system records the selection as "matches SHEIN style"

#### Scenario: Select no
- **WHEN** user clicks the "No" option
- **THEN** system records the selection as "does not match SHEIN style"

### Requirement: Reason selector
The system SHALL provide a dropdown to select the reason for the labeling decision.

#### Scenario: Display reasons
- **WHEN** user clicks the reason dropdown
- **THEN** system shows all available reason options including user-added custom options

#### Scenario: Select reason
- **WHEN** user selects a reason from the dropdown
- **THEN** system records the selected reason for this blogger

### Requirement: Navigation controls
The system SHALL provide buttons to navigate between bloggers.

#### Scenario: Previous button
- **WHEN** user clicks "Previous" button
- **THEN** system navigates to the previous blogger in the list

#### Scenario: Save and next button
- **WHEN** user clicks "Save and Next" button
- **THEN** system saves the current labels and navigates to the next blogger

#### Scenario: First blogger
- **WHEN** user is on the first blogger
- **THEN** the "Previous" button is disabled

#### Scenario: Last blogger
- **WHEN** user is on the last blogger
- **THEN** clicking "Save and Next" saves the label and stays on the last blogger

### Requirement: Progress display
The system SHALL show the current labeling progress in the header.

#### Scenario: Progress indicator
- **WHEN** user is labeling bloggers
- **THEN** system displays "X / Y" where X is labeled count and Y is total count
