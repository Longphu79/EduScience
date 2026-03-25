import { useCallback, useEffect, useRef } from "react";

export const BROWSER_BACK_SENTINEL = "__BROWSER_BACK__";

export default function useQuizNavigationGuard({
    enabled = false,
    onRequestLeave,
}) {
    const browserGuardInstalledRef = useRef(false);

    const handleBeforeUnload = useCallback(
        (event) => {
            if (!enabled) return;
            event.preventDefault();
            event.returnValue = "";
        },
        [enabled],
    );

    useEffect(() => {
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [handleBeforeUnload]);

    useEffect(() => {
        if (!enabled) {
            browserGuardInstalledRef.current = false;
            return;
        }

        if (!browserGuardInstalledRef.current) {
            window.history.pushState(
                { quizGuard: true },
                "",
                window.location.href,
            );
            browserGuardInstalledRef.current = true;
        }

        const handlePopState = () => {
            if (!enabled) return;

            window.history.pushState(
                { quizGuard: true },
                "",
                window.location.href,
            );
            onRequestLeave?.(BROWSER_BACK_SENTINEL);
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, [enabled, onRequestLeave]);
}
