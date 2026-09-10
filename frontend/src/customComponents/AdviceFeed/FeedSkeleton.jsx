import React from "react";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { colors } from "@/theme/colors";
import { radius, space, elevation } from "@/theme/tokens";

/**
 * A placeholder shaped like a real card - header, two body lines, a media
 * block, an action row.
 *
 * Not a spinner. A centred spinner on a feed reads as "broken"; a card-shaped
 * skeleton reads as "arriving", and because the geometry matches, the page does
 * not jump when the real content replaces it.
 */
export default function FeedSkeleton({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Box
          key={i}
          sx={{
            backgroundColor: colors.brand.surface,
            border: `1px solid ${colors.brand.hairline}`,
            borderRadius: radius.lg,
            boxShadow: elevation[1],
            mb: space[4],
            overflow: "hidden",
          }}
        >
          <Box sx={{ height: "3px", backgroundColor: colors.brand.hairline }} />
          <Box sx={{ p: space[4] }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: space[3] }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="38%" height={22} />
                <Skeleton variant="text" width="24%" height={16} />
              </Box>
            </Box>
            <Skeleton
              variant="rounded"
              width={120}
              height={22}
              sx={{ mt: space[3] }}
            />
            <Skeleton
              variant="text"
              width="100%"
              height={20}
              sx={{ mt: space[3] }}
            />
            <Skeleton variant="text" width="82%" height={20} />
            <Skeleton
              variant="rectangular"
              height={180}
              sx={{ mt: space[3], mx: `-${space[4]}` }}
            />
          </Box>
          <Box
            sx={{
              borderTop: `1px solid ${colors.brand.hairline}`,
              display: "flex",
              gap: space[4],
              px: space[4],
              py: space[3],
            }}
          >
            <Skeleton variant="text" width="20%" height={18} />
            <Skeleton variant="text" width="20%" height={18} />
            <Skeleton variant="text" width="20%" height={18} />
          </Box>
        </Box>
      ))}
    </>
  );
}
