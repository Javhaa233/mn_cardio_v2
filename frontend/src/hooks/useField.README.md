# useField Hook Documentation

The `useField` hook is a unified field management hook that consolidates `useInput`, `useSelect`, and `useLocalSelect` into a single, configurable hook. It handles all field types and provides consistent validation, state management, and event handling.

## Features

✅ Unified API for all field types (text, select, date, checkbox, number, etc.)
✅ Redux integration for form state management
✅ Built-in validation with multiple rule types
✅ Data source loading for select fields
✅ Transform functions for value manipulation
✅ Immediate or on-blur validation
✅ Error handling and loading states

## Basic Usage

### Text Input

```javascript
import useField from 'hooks/useField';

const MyTextInput = ({ formName, fieldName }) => {
  const { value, onChange, onBlur, isValid, errorMessage } = useField({
    type: 'text',
    formName,
    fieldName,
    validation: [
      { type: 'required', message: 'Name is required' },
      { type: 'stringLength', minLength: 3, message: 'At least 3 characters' },
    ],
  });

  return (
    <TextField
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      error={!isValid}
      helperText={errorMessage}
    />
  );
};
```

### Select/Dropdown

```javascript
const MySelect = ({ formName, fieldName }) => {
  const { value, onChange, dataSource, loading } = useField({
    type: 'select',
    formName,
    fieldName,
    dataSource: [
      { id: 1, name: 'Option 1' },
      { id: 2, name: 'Option 2' },
    ],
    valueExpr: 'id',
    displayExpr: 'name',
    validation: [
      { type: 'required', message: 'Please select an option' },
    ],
  });

  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={loading}
    >
      {dataSource?.map(item => (
        <MenuItem key={item.id} value={item.id}>
          {item.name}
        </MenuItem>
      ))}
    </Select>
  );
};
```

### Number Input

```javascript
const MyNumberInput = ({ formName, fieldName }) => {
  const { value, onChange, isValid, errorMessage } = useField({
    type: 'number',
    formName,
    fieldName,
    defaultValue: 0,
    validation: [
      { type: 'numeric', message: 'Must be a number' },
      { type: 'range', min: 0, max: 100, message: 'Must be between 0 and 100' },
    ],
  });

  return (
    <TextField
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      error={!isValid}
      helperText={errorMessage}
    />
  );
};
```

### Checkbox

```javascript
const MyCheckbox = ({ formName, fieldName }) => {
  const { value, onChange } = useField({
    type: 'checkbox',
    formName,
    fieldName,
    defaultValue: false,
  });

  return (
    <Checkbox
      checked={value}
      onChange={(e) => onChange(e.target.checked)}
    />
  );
};
```

## Advanced Usage

### Async Data Source

```javascript
const MyAsyncSelect = ({ formName, fieldName }) => {
  const { value, onChange, dataSource, loading, error } = useField({
    type: 'select',
    formName,
    fieldName,
    dataSource: async () => {
      const response = await fetch('/api/options');
      return response.json();
    },
  });

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">Failed to load options</Alert>;

  return (
    <Select value={value} onChange={(e) => onChange(e.target.value)}>
      {dataSource?.map(item => (
        <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
      ))}
    </Select>
  );
};
```

### Value Transform

```javascript
const MyEmailInput = ({ formName, fieldName }) => {
  const { value, onChange, isValid } = useField({
    type: 'text',
    formName,
    fieldName,
    transform: (value) => value.toLowerCase().trim(),
    validation: [
      { type: 'required' },
      { type: 'email', message: 'Invalid email address' },
    ],
  });

  return (
    <TextField
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={!isValid}
    />
  );
};
```

### Custom Validation

```javascript
const MyPasswordInput = ({ formName, fieldName }) => {
  const { value, onChange, isValid, errors } = useField({
    type: 'text',
    formName,
    fieldName,
    validation: [
      { type: 'required', message: 'Password is required' },
      { type: 'stringLength', minLength: 8, message: 'At least 8 characters' },
      {
        type: 'custom',
        message: 'Must contain uppercase, lowercase, and number',
        validationCallback: (value) => {
          return /[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9]/.test(value);
        },
      },
    ],
    immediate: true, // Validate on every change
  });

  return (
    <TextField
      type="password"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={!isValid}
      helperText={errors.map(e => e.message).join(', ')}
    />
  );
};
```

### Pattern Validation

```javascript
const MyPhoneInput = ({ formName, fieldName }) => {
  const { value, onChange, isValid, errorMessage } = useField({
    type: 'text',
    formName,
    fieldName,
    validation: [
      {
        type: 'pattern',
        pattern: /^\d{4}-\d{4}$/,
        message: 'Phone must be in format: 1234-5678',
      },
    ],
  });

  return (
    <TextField
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="1234-5678"
      error={!isValid}
      helperText={errorMessage}
    />
  );
};
```

## API Reference

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | 'text' | Field type: 'text', 'select', 'number', 'checkbox', 'date', etc. |
| `formName` | string | required | Form name for Redux state |
| `fieldName` | string | required | Field name |
| `validation` | array | [] | Array of validation rules |
| `defaultValue` | any | undefined | Default value |
| `transform` | function | null | Transform function applied to value changes |
| `dataSource` | array\|function | null | Data source for select fields |
| `valueExpr` | string | 'id' | Property name for value in select items |
| `displayExpr` | string | 'name' | Property name for display in select items |
| `onChange` | function | null | Custom onChange handler |
| `onBlur` | function | null | Custom onBlur handler |
| `onFocus` | function | null | Custom onFocus handler |
| `immediate` | boolean | false | Validate immediately on change |

### Return Value

| Property | Type | Description |
|----------|------|-------------|
| `value` | any | Current field value from Redux store |
| `displayValue` | any | Display value (for select fields) |
| `dataSource` | array | Data source for select fields |
| `onChange` | function | Change handler |
| `onBlur` | function | Blur handler |
| `onFocus` | function | Focus handler |
| `validate` | function | Manual validation trigger |
| `isValid` | boolean | Validation state |
| `errors` | array | Array of broken rules |
| `errorMessage` | string | First error message |
| `validatorRef` | ref | Ref for validator instance |
| `loading` | boolean | Loading state (for async data sources) |
| `error` | any | Error state |
| `reset` | function | Reset field to default value |
| `getDisplayValue` | function | Get display value for a given value |

### Validation Rule Types

- **required**: Field must have a value
- **email**: Must be valid email format
- **pattern**: Must match regex pattern
- **numeric**: Must be a number
- **range**: Number must be within min/max range
- **stringLength**: String length must be within min/max
- **custom**: Custom validation function

## Migration Guide

### From useInput

```javascript
// Before
const { value, changeValue, validate } = useInput(props);

// After
const { value, onChange, validate } = useField({
  type: 'text',
  formName: props.formName,
  fieldName: props.fieldName,
  validation: props.validation,
});
```

### From useSelect

```javascript
// Before
const { value, changeValue, dataSource, loading } = useSelect(props);

// After
const { value, onChange, dataSource, loading } = useField({
  type: 'select',
  formName: props.formName,
  fieldName: props.fieldName,
  dataSource: props.dataSource,
  valueExpr: props.valueExpr,
  displayExpr: props.displayExpr,
});
```

### From useLocalSelect

```javascript
// Before
const { value, changeValue, dataSource } = useLocalSelect(props);

// After
const { value, onChange, dataSource } = useField({
  type: 'select',
  formName: props.formName,
  fieldName: props.fieldName,
  dataSource: props.options,
});
```

## Benefits Over Separate Hooks

✅ Single import instead of multiple
✅ Consistent API across all field types
✅ Reduced code duplication
✅ Easier to maintain
✅ Better TypeScript support (when migrated)
✅ Smaller bundle size

## Next Steps

1. Migrate existing controls to use `useField`
2. Add TypeScript types
3. Add more validation rule types as needed
4. Add field-level async validation
5. Add field dependencies (validate field based on another field's value)
