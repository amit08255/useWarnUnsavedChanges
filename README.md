# useWarnUnsavedChanges

Simple hook to warn unsaved changes when changing page in NextJS

```tsx
import * as React from 'react';

const FormInput = () => {
  const [isDirty, setIsDirty] = React.useState(false);
  const [value, setValue] = React.useState('');

  useWarnUnsavedChanges({
        shouldPreventLeaving: isDirty,
        message: 'There are some changes you made which are not saved. Are you sure you want to discard these changes?',
    });

  const onValueUpdate = (e) => {
    setValue(e.target.value);
    setIsDirty(true);
  };

  return (
    <input type="text" value={value} onChange={onValueUpdate} />
  );
}
```

### Options

* `shouldPreventLeaving`: It is `boolean` type value. It indicates if page has unsaved data.
* `message`: It is `string` type. It is optional. It indicates message to display on warning.
* `confirmationDialog`: It is of function type `(msg: string) => Promise<boolean>` and indicates popup to be displayed.
