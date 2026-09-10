# Error Boundary Component

Error boundaries are React components that catch JavaScript errors anywhere in their child component tree, log those errors, and display a fallback UI instead of crashing the entire application.

## Usage

### Basic Usage

```jsx
import ErrorBoundary from 'components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

### With Custom Error Handler

```jsx
<ErrorBoundary
  onError={(error, errorInfo) => {
    // Log to error reporting service
    console.error('Error occurred:', error, errorInfo);
  }}
  onReset={() => {
    // Clean up or reset state when user clicks "Try Again"
    console.log('Resetting component');
  }}
>
  <YourComponent />
</ErrorBoundary>
```

### With Custom Fallback UI

```jsx
<ErrorBoundary
  fallback={(error, reset) => (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )}
>
  <YourComponent />
</ErrorBoundary>
```

### For Section-Level Errors

```jsx
<ErrorBoundary fullScreen={false} showHomeButton={false}>
  <DataGrid />
</ErrorBoundary>

<ErrorBoundary fullScreen={false} showHomeButton={false}>
  <FormSection />
</ErrorBoundary>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | node | required | Components to wrap with error boundary |
| `fallback` | function | null | Custom fallback render function `(error, reset) => ReactNode` |
| `onError` | function | null | Callback when error occurs `(error, errorInfo) => void` |
| `onReset` | function | null | Callback when reset button is clicked |
| `fullScreen` | boolean | false | Show full-screen error UI |
| `showDetails` | boolean | dev mode | Show error details (stack trace) |
| `showHomeButton` | boolean | true | Show "Go to Home" button |
| `title` | string | "Алдаа гарлаа" | Custom error title |
| `message` | string | default | Custom error message |

## Best Practices

1. **Wrap critical sections** - Wrap forms, data grids, and major features
2. **Don't overuse** - Don't wrap every single component; group related components
3. **Log errors** - Use `onError` prop to send errors to monitoring service
4. **Provide context** - Use custom messages for better UX
5. **Test error states** - Simulate errors in development to test boundaries

## Examples

### Wrapping Forms
```jsx
<ErrorBoundary
  fullScreen={false}
  message="Form could not be loaded. Please refresh and try again."
>
  <PatientForm />
</ErrorBoundary>
```

### Wrapping Data Grids
```jsx
<ErrorBoundary
  fullScreen={false}
  onError={(error) => logToMonitoring(error)}
>
  <IcdDataGrid />
</ErrorBoundary>
```

### Layout Level
```jsx
<ErrorBoundary fullScreen={true}>
  <AdminLayout>
    <Routes />
  </AdminLayout>
</ErrorBoundary>
```

## Error Fallback Component

For smaller inline errors, use the `ErrorFallback` component:

```jsx
import ErrorFallback from 'components/ErrorBoundary/ErrorFallback';

<ErrorBoundary
  fallback={(error, reset) => (
    <ErrorFallback error={error} onReset={reset} />
  )}
>
  <SmallSection />
</ErrorBoundary>
```
