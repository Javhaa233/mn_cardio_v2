import { createContext, useContext } from "react";

/**
 * Chat state, provided once per layout by Chat/ChatProvider.jsx.
 *
 * Kept in its own module so the provider file exports only a component - a
 * module that exports both a component and a plain value loses React Fast
 * Refresh for that file.
 */
export const ChatContext = createContext(null);

/**
 * Returns null outside a provider rather than throwing, so a component that is
 * merely *able* to open a chat (UserProfile, say) can be rendered in a layout
 * that has no chat dock without exploding.
 */
export function useChatContext() {
  return useContext(ChatContext);
}
