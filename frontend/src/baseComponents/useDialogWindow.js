import { useTranslation } from "react-i18next";
import { useState, useCallback, useRef, useEffect } from "react";

/**
 * Custom hook for managing dialog window positioning, dragging, and resizing
 * @param {Object} options - Configuration options
 * @param {number} options.initialWidth - Initial width of the dialog
 * @param {number} options.initialHeight - Initial height of the dialog
 * @param {boolean} options.Movable - Whether the dialog can be dragged
 * @param {boolean} options.Resizable - Whether the dialog can be resized
 * @returns {Object} Window state and handlers
 */
export const useDialogWindow = ({
  initialWidth = 900,
  initialHeight = window.innerHeight * 0.8,
  Movable = true,
  Resizable = true,
} = {}) => {
  const { t } = useTranslation();
  const paperRef = useRef(null);
  const dragRef = useRef(null);
  const resizeRef = useRef(null);
  const beforeMaximize = useRef(null);

  /* ---------- WINDOW STATE ---------- */

  // Keep the window inside the viewport. Without this a dialog can be dragged
  // off the top or left edge with no way to bring it back except closing it -
  // and since these dialogs hold unsaved form data, closing is expensive.
  // BaseDialog used to compensate downstream with Math.max(0, x); the three
  // other dialogs built on this hook did not, so the fix belongs here.
  const EDGE = 8;

  const clampSize = (w, h) => ({
    width: Math.min(w, window.innerWidth - EDGE * 2),
    height: Math.min(h, window.innerHeight - EDGE * 2),
  });

  const clampPos = (x, y, w, h) => ({
    x: Math.max(0, Math.min(x, Math.max(0, window.innerWidth - w - EDGE))),
    y: Math.max(0, Math.min(y, Math.max(0, window.innerHeight - h - EDGE))),
  });

  const startSize = clampSize(initialWidth, initialHeight);

  const [pos, setPos] = useState(() =>
    clampPos(
      (window.innerWidth - startSize.width) / 2 - EDGE,
      (window.innerHeight - startSize.height) / 2 - EDGE,
      startSize.width,
      startSize.height,
    ),
  );
  const [size, setSize] = useState(startSize);

  // Mirrored so the drag handler can clamp against the current size without
  // being re-created on every resize.
  const sizeRef = useRef(startSize);
  useEffect(() => {
    sizeRef.current = size;
  }, [size]);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  /* ---------- DRAG LOGIC ---------- */

  const onPointerMove = useCallback((e) => {
    if (!dragRef.current) return;
    const { width, height } = sizeRef.current;
    setPos(
      clampPos(
        dragRef.current.x + (e.clientX - dragRef.current.startX),
        dragRef.current.y + (e.clientY - dragRef.current.startY),
        width,
        height,
      ),
    );
  }, []);

  const onPointerUp = useCallback(
    (e) => {
      if (!dragRef.current) return;

      if (e?.target?.releasePointerCapture && dragRef.current.pointerId) {
        try {
          e.target.releasePointerCapture(dragRef.current.pointerId);
        } catch (err) {
          // ignore
        }
      }

      dragRef.current = null;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    },
    [onPointerMove],
  );

  const onTitlePointerDown = useCallback(
    (e) => {
      if (!Movable || isMaximized || e.button !== 0) return;
      if (e.target.closest("button")) return;

      if (e.target.setPointerCapture) {
        e.target.setPointerCapture(e.pointerId);
      }

      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        x: pos.x,
        y: pos.y,
        pointerId: e.pointerId,
      };
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    },
    [Movable, isMaximized, pos.x, pos.y, onPointerMove, onPointerUp],
  );

  /* ---------- RESIZE LOGIC ---------- */

  const onResizePointerMove = useCallback((e) => {
    if (!resizeRef.current) return;

    e.preventDefault();

    const minWidth = 320;
    const minHeight = 200;
    const maxWidth = window.innerWidth - 16;
    const maxHeight = window.innerHeight - 16;

    const dx = e.clientX - resizeRef.current.startX;
    const dy = e.clientY - resizeRef.current.startY;

    let nextWidth = resizeRef.current.startWidth + dx;
    let nextHeight = resizeRef.current.startHeight + dy;

    nextWidth = Math.max(minWidth, Math.min(nextWidth, maxWidth));
    nextHeight = Math.max(minHeight, Math.min(nextHeight, maxHeight));

    setSize({ width: nextWidth, height: nextHeight });
  }, []);

  const onResizePointerUp = useCallback(
    (e) => {
      if (!resizeRef.current) return;

      if (e.target.releasePointerCapture && resizeRef.current.pointerId) {
        try {
          e.target.releasePointerCapture(resizeRef.current.pointerId);
        } catch (err) {
          // ignore
        }
      }

      resizeRef.current = null;
      window.removeEventListener("pointermove", onResizePointerMove);
      window.removeEventListener("pointerup", onResizePointerUp);
      if (document.body) document.body.style.userSelect = "";
    },
    [onResizePointerMove],
  );

  const onResizePointerDown = useCallback(
    (e) => {
      if (!Resizable || isMaximized || isMinimized || e.button !== 0) return;

      e.preventDefault();
      e.stopPropagation();

      if (e.target.setPointerCapture) {
        e.target.setPointerCapture(e.pointerId);
      }

      const paperEl = paperRef?.current;
      if (!paperEl) return;

      const rect = paperEl.getBoundingClientRect();

      resizeRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startWidth: rect.width,
        startHeight: rect.height,
        pointerId: e.pointerId,
      };

      window.addEventListener("pointermove", onResizePointerMove);
      window.addEventListener("pointerup", onResizePointerUp);
      if (document.body) document.body.style.userSelect = "none";
    },
    [
      Resizable,
      isMaximized,
      isMinimized,
      onResizePointerMove,
      onResizePointerUp,
    ],
  );

  /* ---------- CLEANUP ---------- */

  useEffect(() => {
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointermove", onResizePointerMove);
      window.removeEventListener("pointerup", onResizePointerUp);
      if (document.body) document.body.style.userSelect = "";
    };
  }, [onPointerMove, onPointerUp, onResizePointerMove, onResizePointerUp]);

  /* ---------- WINDOW CONTROLS ---------- */

  const toggleMaximize = useCallback(() => {
    if (isMaximized) {
      const restored = clampSize(
        beforeMaximize.current.size.width,
        beforeMaximize.current.size.height,
      );
      setSize(restored);
      setPos(
        clampPos(
          beforeMaximize.current.pos.x,
          beforeMaximize.current.pos.y,
          restored.width,
          restored.height,
        ),
      );
    } else {
      beforeMaximize.current = { pos, size };
      setPos({ x: 0, y: 0 });
      setSize({
        width: window.innerWidth - 16,
        height: window.innerHeight - 16,
      });
    }
    setIsMaximized(!isMaximized);
    setIsMinimized(false);
  }, [isMaximized, pos, size]);

  const toggleMinimize = useCallback(() => {
    setIsMinimized((v) => !v);
  }, []);

  return {
    paperRef,
    pos,
    size,
    isMaximized,
    isMinimized,
    onTitlePointerDown,
    onResizePointerDown,
    toggleMaximize,
    toggleMinimize,
  };
};
