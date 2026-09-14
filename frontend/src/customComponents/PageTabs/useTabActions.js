import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Helper from "helper";
import {
  closeAllTabs,
  closeTab,
  nextActiveKey,
} from "store/reducers/system/tabs";

/**
 * Closing a tab, with the unsaved-changes guard.
 *
 * A hook rather than something the host owns, because two places close tabs -
 * the strip under the top bar and the tab menu inside it - and they sit in
 * different parts of the tree. Duplicating the guard would eventually mean one
 * of them forgets to ask.
 *
 * Returns `confirm`, which the caller must render: the app's confirm dialog is
 * an element the caller mounts and unmounts, not an imperative call.
 */
export default function useTabActions(homePath) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const items = useSelector((s) => s.tabs.items);
  const activeKey = useSelector((s) => s.tabs.activeKey);

  const [confirm, setConfirm] = useState(null);

  const doClose = useCallback(
    (tab) => {
      const index = items.findIndex((s) => s.key === tab.key);
      if (index === -1) return;
      const wasActive = tab.key === activeKey;
      // Same helper the reducer uses, so the navigation target and the new
      // activeKey can never disagree for a render.
      const successorKey = nextActiveKey(items, index);

      dispatch(closeTab(tab.key));

      if (!wasActive) return;
      const target = items.find((s) => s.key === successorKey);
      // A push, not a replace: Back after a close reopens what you closed.
      navigate(target ? target.url : homePath);
    },
    [items, activeKey, dispatch, navigate, homePath],
  );

  const requestClose = useCallback(
    (tab) => {
      if (!tab || !tab.dirty) {
        tab && doClose(tab);
        return;
      }
      setConfirm(
        Helper.BaseCrudHelper.ShowConfirm(
          t("Хадгалагдаагүй өөрчлөлт байна. Энэ цонхыг хаах уу?"),
          () => {
            setConfirm(null);
            doClose(tab);
          },
          () => setConfirm(null),
        ),
      );
    },
    [doClose, t],
  );

  const requestCloseAll = useCallback(() => {
    const finish = () => {
      dispatch(closeAllTabs());
      navigate(homePath);
    };
    if (!items.some((s) => s.dirty)) {
      finish();
      return;
    }
    // One confirm for the whole set, not one dialog per dirty tab.
    setConfirm(
      Helper.BaseCrudHelper.ShowConfirm(
        t("Хадгалагдаагүй өөрчлөлттэй цонх байна. Бүгдийг хаах уу?"),
        () => {
          setConfirm(null);
          finish();
        },
        () => setConfirm(null),
      ),
    );
  }, [items, dispatch, navigate, homePath, t]);

  // Close several at once - "close others", "close to the right". One confirm
  // for the set if any of them has unsaved changes. If the page being viewed is
  // among them, land on `keepKey` (the tab the action was invoked on).
  const requestCloseMany = useCallback(
    (toClose, keepKey) => {
      if (!toClose || toClose.length === 0) return;
      const finish = () => {
        const closingActive = toClose.some((tab) => tab.key === activeKey);
        toClose.forEach((tab) => dispatch(closeTab(tab.key)));
        if (!closingActive) return;
        const keep = items.find((s) => s.key === keepKey);
        navigate(keep ? keep.url : homePath);
      };
      if (!toClose.some((s) => s.dirty)) {
        finish();
        return;
      }
      setConfirm(
        Helper.BaseCrudHelper.ShowConfirm(
          t("Хадгалагдаагүй өөрчлөлттэй цонх байна. Хаах уу?"),
          () => {
            setConfirm(null);
            finish();
          },
          () => setConfirm(null),
        ),
      );
    },
    [items, activeKey, dispatch, navigate, homePath, t],
  );

  return { requestClose, requestCloseAll, requestCloseMany, confirm };
}
