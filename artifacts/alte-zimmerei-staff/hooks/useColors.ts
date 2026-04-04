import colors from "@/constants/colors";

type DarkColors = typeof colors.dark & {
  radius: number;
  radiusSm: number;
  radiusLg: number;
  radiusXl: number;
  radiusFull: number;
};

export function useColors(): DarkColors {
  return {
    ...colors.dark,
    radius: colors.radius,
    radiusSm: colors.radiusSm,
    radiusLg: colors.radiusLg,
    radiusXl: colors.radiusXl,
    radiusFull: colors.radiusFull,
  };
}
