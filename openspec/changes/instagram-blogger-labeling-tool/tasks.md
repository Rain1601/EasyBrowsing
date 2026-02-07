## 1. Project Setup

- [x] 1.1 Initialize Next.js 14 project with App Router and TypeScript
- [x] 1.2 Install and configure Tailwind CSS
- [x] 1.3 Install shadcn/ui and add required components (Button, Select, Dialog, RadioGroup, Input)
- [x] 1.4 Install xlsx library for Excel processing
- [x] 1.5 Create project folder structure (components/, lib/, types/)

## 2. Type Definitions

- [x] 2.1 Create types/index.ts with Blogger, LabelingResult, and ReasonOption interfaces

## 3. Utility Functions

- [x] 3.1 Create lib/excel.ts with parseExcelFile() function to read Excel and extract column data
- [x] 3.2 Create lib/excel.ts with exportToExcel() function to generate and download Excel file
- [x] 3.3 Create lib/storage.ts with getCustomReasons() and saveCustomReasons() for localStorage

## 4. Excel Import Component

- [x] 4.1 Create components/ExcelImporter.tsx with file upload button
- [x] 4.2 Add column selection dialog showing all Excel column headers
- [x] 4.3 Implement link extraction from selected column
- [x] 4.4 Add validation for file format (.xlsx, .xls)
- [x] 4.5 Display import summary with count of valid links

## 5. Blogger List Component

- [x] 5.1 Create components/BloggerList.tsx with scrollable list layout
- [x] 5.2 Display blogger links with index numbers
- [x] 5.3 Add current selection highlight styling
- [x] 5.4 Add labeled/unlabeled status icons (checkmark vs empty circle)
- [x] 5.5 Implement click-to-navigate between bloggers

## 6. Labeling Panel Component

- [x] 6.1 Create components/LabelingPanel.tsx with panel layout
- [x] 6.2 Add "Open Instagram" button that opens link in new tab
- [x] 6.3 Add SHEIN style radio button group (Yes/No, default No)
- [x] 6.4 Integrate ReasonSelector component for reason dropdown
- [x] 6.5 Add Previous and Save & Next navigation buttons
- [x] 6.6 Implement button disable logic for first/last blogger

## 7. Reason Selector Component

- [x] 7.1 Create components/ReasonSelector.tsx with dropdown select
- [x] 7.2 Load default reason options on first use
- [x] 7.3 Add "+" button to trigger custom option dialog
- [x] 7.4 Implement add custom option dialog with input field
- [x] 7.5 Add validation for empty and duplicate options
- [x] 7.6 Persist custom options to localStorage on add

## 8. Excel Export Component

- [x] 8.1 Create components/ExcelExporter.tsx with export button
- [x] 8.2 Display labeled count in button text
- [x] 8.3 Generate Excel with columns: Blogger Link, Matches SHEIN Style, Reason
- [x] 8.4 Include all bloggers in export (empty cells for unlabeled)
- [x] 8.5 Trigger file download with timestamped filename

## 9. Main Page Integration

- [x] 9.1 Create app/page.tsx with two-column layout (left list, right panel)
- [x] 9.2 Add header with progress display (X/Y labeled)
- [x] 9.3 Add Import and Export buttons in header
- [x] 9.4 Implement application state (bloggers, currentIndex, results)
- [x] 9.5 Wire up all components with state and callbacks

## 10. Polish and Deploy

- [x] 10.1 Add loading states for Excel import/export
- [x] 10.2 Add error handling for invalid files
- [ ] 10.3 Test with sample Excel file containing Instagram links
- [ ] 10.4 Configure vercel.json if needed
- [ ] 10.5 Deploy to Vercel and verify functionality
