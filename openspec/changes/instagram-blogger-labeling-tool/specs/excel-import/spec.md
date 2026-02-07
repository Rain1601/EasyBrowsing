## ADDED Requirements

### Requirement: Upload Excel file
The system SHALL allow users to upload an Excel file (.xlsx or .xls format) via a file picker dialog.

#### Scenario: Successful file upload
- **WHEN** user clicks the "Import" button and selects a valid Excel file
- **THEN** system reads the file and displays a column selection dialog

#### Scenario: Invalid file format
- **WHEN** user selects a non-Excel file (e.g., .txt, .pdf)
- **THEN** system displays an error message "Please select a valid Excel file (.xlsx or .xls)"

### Requirement: Select link column
The system SHALL display all column headers from the uploaded Excel and allow users to select which column contains Instagram profile links.

#### Scenario: Column selection
- **WHEN** Excel file is loaded successfully
- **THEN** system displays a dropdown with all column names from the first row

#### Scenario: Confirm column selection
- **WHEN** user selects a column and clicks "Confirm"
- **THEN** system extracts all non-empty values from that column as blogger links

### Requirement: Parse blogger links
The system SHALL extract and validate Instagram profile links from the selected column.

#### Scenario: Valid Instagram links
- **WHEN** a cell contains a valid Instagram URL (e.g., https://instagram.com/username)
- **THEN** system adds it to the blogger list for labeling

#### Scenario: Empty cells
- **WHEN** a cell in the selected column is empty
- **THEN** system skips that row without error

### Requirement: Display import summary
The system SHALL show the number of valid blogger links found after import.

#### Scenario: Import complete
- **WHEN** column parsing is complete
- **THEN** system displays "Imported X blogger links" and closes the import dialog
