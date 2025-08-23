export const SideSwitchAnimationVariants = {
    hiddenRight: { opacity: 0, x: 50 },
    hiddenLeft: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
    exitRight: { opacity: 0, x: -50, transition: { duration: 0.2 } },
    exitLeft: { opacity: 0, x: 50, transition: { duration: 0.2 } },
};
