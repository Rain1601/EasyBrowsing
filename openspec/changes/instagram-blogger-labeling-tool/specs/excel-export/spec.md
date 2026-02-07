## ADDED Requirements

### Requirement: Export labeled data
The system SHALL allow users to export all labeling results as an Excel file.

#### Scenario: Export button
- **WHEN** user clicks the "Export" button
- **THEN** system generates and downloads an Excel file

#### Scenario: Export file format
- **WHEN** export is triggered
- **THEN** system creates an .xlsx file with the name "labeling-results-{timestamp}.xlsx"

### Requirement: Export columns
The system SHALL include specific columns in the exported Excel file.

#### Scenario: Column structure
- **WHEN** Excel file is generated
- **THEN** file contains columns: "Blogger Link", "Matches SHEIN Style", "Reason"

#### Scenario: Blogger link column
- **WHEN** Excel file is generated
- **THEN** "Blogger Link" column contains the original Instagram profile URLs

#### Scenario: Style match column
- **WHEN** Excel file is generated
- **THEN** "Matches SHEIN Style" column contains "Yes" or "No" for each labeled blogger

#### Scenario: Reason column
- **WHEN** Excel file is generated
- **THEN** "Reason" column contains the selected reason for each labeled blogger

### Requirement: Export all bloggers
The system SHALL include all bloggers in the export, including unlabeled ones.

#### Scenario: Unlabeled bloggers
- **WHEN** some bloggers have not been labeled
- **THEN** exported file shows empty cells for "Matches SHEIN Style" and "Reason" columns for those bloggers

### Requirement: Export availability
The system SHALL enable the export button when at least one blogger has been labeled.

#### Scenario: No labels yet
- **WHEN** no bloggers have been labeled
- **THEN** export button shows "Export (0 labeled)" and is still clickable

#### Scenario: Partial labels
- **WHEN** some bloggers have been labeled
- **THEN** export button shows "Export (X labeled)" where X is the labeled count
