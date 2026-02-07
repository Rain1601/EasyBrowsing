## ADDED Requirements

### Requirement: Open Instagram profile in new tab
The system SHALL provide a button to open the current blogger's Instagram profile in a new browser tab.

#### Scenario: Open profile
- **WHEN** user clicks the "Open Instagram" button
- **THEN** system opens the blogger's Instagram URL in a new browser tab

#### Scenario: Profile URL display
- **WHEN** a blogger is selected from the list
- **THEN** system displays the Instagram URL in the labeling panel

### Requirement: Display blogger list
The system SHALL show a scrollable list of all imported blogger links in the left panel.

#### Scenario: List display
- **WHEN** Excel import is complete
- **THEN** system displays all blogger links in a vertical list with their index numbers

#### Scenario: Current blogger highlight
- **WHEN** user is labeling a specific blogger
- **THEN** system highlights that blogger in the list with a different background color

#### Scenario: Click to navigate
- **WHEN** user clicks on any blogger in the list
- **THEN** system navigates to that blogger for labeling

### Requirement: Show labeling status in list
The system SHALL indicate which bloggers have been labeled in the list.

#### Scenario: Labeled indicator
- **WHEN** a blogger has been labeled
- **THEN** system shows a checkmark icon next to that blogger in the list

#### Scenario: Unlabeled indicator
- **WHEN** a blogger has not been labeled yet
- **THEN** system shows an empty circle icon next to that blogger in the list
