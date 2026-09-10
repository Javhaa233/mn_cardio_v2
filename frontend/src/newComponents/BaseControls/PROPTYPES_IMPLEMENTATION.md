# PropTypes Implementation Guide

This guide shows how to add PropTypes to all base controls using the shared propTypes.js definitions.

## Quick Reference

All controls should import from the shared propTypes file:

```javascript
import PropTypes from 'prop-types';
import { ConfigPropType, FormNamePropType, BaseTextInputProps } from './propTypes';
```

## Implementation Examples

### Text-based Controls (BaseTextBox, BaseTextArea, BasePassword)

```javascript
import PropTypes from 'prop-types';
import { BaseTextInputProps } from './propTypes';

const BaseTextBox = ({ Config, formName, ...props }) => {
  // Component logic...
};

BaseTextBox.propTypes = BaseTextInputProps;

BaseTextBox.defaultProps = {
  disabled: false,
  readOnly: false,
  autoFocus: false,
};

export default BaseTextBox;
```

### Select Controls (BaseSelectBox, BaseLookup)

```javascript
import PropTypes from 'prop-types';
import { BaseSelectProps } from './propTypes';

const BaseSelectBox = ({ Config, formName, dataSource, ...props }) => {
  // Component logic...
};

BaseSelectBox.propTypes = {
  ...BaseSelectProps,
  // Add component-specific props
  clearButton: PropTypes.bool,
  selectAllButton: PropTypes.bool,
};

BaseSelectBox.defaultProps = {
  multiple: false,
  searchEnabled: true,
  clearButton: true,
};

export default BaseSelectBox;
```

### Date/Time Controls (BaseDateBox, BaseTimeBox, BaseDateTimeBox)

```javascript
import PropTypes from 'prop-types';
import { BaseDateTimeProps } from './propTypes';

const BaseDateBox = ({ Config, formName, ...props }) => {
  // Component logic...
};

BaseDateBox.propTypes = BaseDateTimeProps;

BaseDateBox.defaultProps = {
  format: 'YYYY-MM-DD',
  showCalendarButton: true,
  showTime: false,
};

export default BaseDateBox;
```

### Checkbox/Radio Controls (BaseCheckBox, BaseRadioBox)

```javascript
import PropTypes from 'prop-types';
import { BaseCheckboxRadioProps } from './propTypes';

const BaseCheckBox = ({ Config, formName, ...props }) => {
  // Component logic...
};

BaseCheckBox.propTypes = BaseCheckboxRadioProps;

BaseCheckBox.defaultProps = {
  checkedValue: true,
  uncheckedValue: false,
};

export default BaseCheckBox;
```

### Number Controls (BaseNumberBox)

```javascript
import PropTypes from 'prop-types';
import { BaseNumberProps } from './propTypes';

const BaseNumberBox = ({ Config, formName, ...props }) => {
  // Component logic...
};

BaseNumberBox.propTypes = BaseNumberProps;

BaseNumberBox.defaultProps = {
  step: 1,
  showSpinButtons: true,
};

export default BaseNumberBox;
```

### File Upload Controls (BaseFileUploader, BaseSingleImage)

```javascript
import PropTypes from 'prop-types';
import { BaseFileUploadProps } from './propTypes';

const BaseFileUploader = ({ Config, formName, ...props }) => {
  // Component logic...
};

BaseFileUploader.propTypes = BaseFileUploadProps;

BaseFileUploader.defaultProps = {
  multiple: false,
  maxFileSize: 100, // 100MB (the component expects MB, not bytes)
  allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp', 'doc', 'docx', 'pdf', 'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v'], // Common image, document, and video formats
};

export default BaseFileUploader;
```

### Grid Lookup Controls (BaseLookupGrid, BaseLookupGridMulti)

```javascript
import PropTypes from 'prop-types';
import { BaseSelectProps } from './propTypes';

const BaseLookupGrid = ({ Config, formName, ...props }) => {
  // Component logic...
};

BaseLookupGrid.propTypes = {
  ...BaseSelectProps,
  columns: PropTypes.arrayOf(PropTypes.shape({
    dataField: PropTypes.string,
    caption: PropTypes.string,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    visible: PropTypes.bool,
  })),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  paginate: PropTypes.bool,
  pageSize: PropTypes.number,
};

BaseLookupGrid.defaultProps = {
  paginate: true,
  pageSize: 10,
  height: 400,
};

export default BaseLookupGrid;
```

## Control-Specific PropTypes

### BaseField (Factory Component)

```javascript
import PropTypes from 'prop-types';
import { ConfigPropType, FormNamePropType } from './propTypes';

BaseField.propTypes = {
  Config: ConfigPropType.isRequired,
  formName: FormNamePropType,
  index: PropTypes.number,
};
```

### BaseHtmlEditor

```javascript
import PropTypes from 'prop-types';
import { ConfigPropType, FormNamePropType } from './propTypes';

BaseHtmlEditor.propTypes = {
  Config: ConfigPropType.isRequired,
  formName: FormNamePropType,
  value: PropTypes.string,
  onChange: PropTypes.func,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  toolbar: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ])),
};

BaseHtmlEditor.defaultProps = {
  height: 300,
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'image'],
  ],
};
```

## Checklist for Each Control

When adding PropTypes to a control, ensure:

- [ ] Import PropTypes and shared prop types
- [ ] Add `.propTypes` definition
- [ ] Add `.defaultProps` definition
- [ ] Document any custom props specific to that control
- [ ] Test the control still works correctly
- [ ] Check console for prop type warnings in development

## Validation in Development

PropTypes only run in development mode. To test:

1. Run `npm start` or `npm run dev`
2. Open browser console
3. Look for PropTypes warnings (yellow)
4. Fix any invalid prop usages

## Benefits

✅ Type safety without TypeScript
✅ Automatic documentation
✅ Runtime validation in development
✅ Better IDE autocomplete
✅ Catch bugs early
✅ Consistent API across controls

## Next Steps

1. Apply PropTypes to all controls in `BaseControls/`
2. Apply to form components in `customComponents/Forms/`
3. Apply to base components in `baseComponents/`
4. Consider migrating to TypeScript for compile-time checking
