import { useCallback, useState } from "react";

import Helper from "helper";

/**
 * Confirmation dialog for hook-based modules (useDataGrid and friends).
 *
 * Hooks cannot render, so this keeps the element returned by
 * `Helper.BaseCrudHelper.ShowConfirm` in state and hands it back to the
 * caller as `confirmDialog`. The caller renders `{confirmDialog}` anywhere
 * in its tree - it is a MUI Dialog, so its position does not matter.
 *
 * Usage:
 *   const { confirm, confirmDialog } = useConfirm();
 *   confirm(t("Are you sure you want to delete?"), async () => { ... });
 *
 * `Message` must be plain text - it is rendered as text, never as HTML.
 */
export default function useConfirm() {
  const [confirmDialog, setConfirmDialog] = useState(null);

  const hideConfirm = useCallback(() => setConfirmDialog(null), []);

  const confirm = useCallback((Message, ConfirmFunc) => {
    setConfirmDialog(
      Helper.BaseCrudHelper.ShowConfirm(
        Message,
        async () => {
          setConfirmDialog(null);
          ConfirmFunc && (await ConfirmFunc());
        },
        () => setConfirmDialog(null),
      ),
    );
  }, []);

  return { confirm, confirmDialog, hideConfirm };
}
